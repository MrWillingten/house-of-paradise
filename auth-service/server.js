const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const axios = require('axios');
const {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generateWelcomeEmail,
  generateUnlockEmail,
  generateVerificationEmailText,
  generatePasswordResetEmailText
} = require('./utils/emailTemplates');
require('dotenv').config();

// Production URLs from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';

// Logo path for CID embedding in emails
// CID (Content-ID) embedding is the professional way to embed images in emails
// It works with Gmail, Outlook, Apple Mail, and all major email clients
const LOGO_PATH = path.join(__dirname, 'assets', 'hop-logo.png');

// Helper function to get logo attachment for email
// Using contentDisposition: 'inline' hides it from showing as a separate attachment
function getLogoAttachment() {
  if (fs.existsSync(LOGO_PATH)) {
    return {
      filename: 'logo.png',
      path: LOGO_PATH,
      cid: 'hop-logo-cid', // Content-ID for referencing in HTML with src="cid:hop-logo-cid"
      contentDisposition: 'inline', // This prevents it from showing as a separate attachment
      contentType: 'image/png'
    };
  }
  return null;
}

const app = express();

// Trust proxy - required for Render/Heroku/etc behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

// Serve static files from uploads directory
app.use('/uploads/profile-images', express.static(path.join(__dirname, 'uploads/profile-images')));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many verification attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/authdb';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  passwordHistory: [{
    password: String,
    changedAt: Date
  }],
  // Phone number fields
  phone: {
    type: String
  },
  phoneCountryCode: {
    type: String
  },
  // Two-factor authentication fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  // SECURITY FIX: Store backup codes as hashed objects with metadata
  backupCodes: [{
    hash: { type: String, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    usedAt: Date
  }],
  // Track when backup codes were last generated (for 30-day regeneration limit)
  backupCodesGeneratedAt: {
    type: Date
  },
  // Account status fields
  disabled: {
    type: Boolean,
    default: false
  },
  disabledAt: {
    type: Date
  },
  unlockCode: {
    type: String
  },
  unlockCodeExpiry: {
    type: Date
  },
  // Temporary verification fields
  emailChangeCode: {
    type: String
  },
  emailChangeCodeExpiry: {
    type: Date
  },
  phoneVerificationCode: {
    type: String
  },
  phoneVerificationExpiry: {
    type: Date
  },
  tempEmail: {
    type: String
  },
  tempPhone: {
    type: String
  },
  tempPhoneCountry: {
    type: String
  },
  temp2FASecret: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Verification Code Schema
const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for query performance (no automatic deletion to prevent race conditions)
verificationCodeSchema.index({ expiresAt: 1 });
verificationCodeSchema.index({ email: 1, type: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

// SECURITY: Failed Login Attempts Tracking (Per-Account Rate Limiting)
const failedLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  ipAddresses: [String] // Track IPs for security monitoring
});

const FailedLogin = mongoose.model('FailedLogin', failedLoginSchema);

// SECURITY: Refresh Token Schema for Token Rotation
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  revoked: {
    type: Boolean,
    default: false
  }
});

// Auto-cleanup expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

// SECURITY: Token Blacklist Schema for Logout
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    enum: ['logout', 'security', 'password_change', 'account_disabled'],
    default: 'logout'
  }
});

// Auto-cleanup expired blacklisted tokens
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

// Multer Configuration for Profile Image Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads/profile-images');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper Functions
// SECURITY FIX: Use crypto.randomBytes instead of Math.random() for cryptographic operations
function generateVerificationCode() {
  // Generate 6-character alphanumeric code using crypto for security
  // Using 4 random bytes provides sufficient entropy
  const bytes = require('crypto').randomBytes(4);
  // Convert to base36 (0-9, a-z) and take first 6 characters
  let code = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(bytes[i % 4] % characters.length);
  }
  return code;
}

function generateNumericCode() {
  // Generate 6-digit numeric code using crypto.randomInt for security
  const crypto = require('crypto');
  return crypto.randomInt(100000, 1000000).toString();
}

function generateBackupCodes() {
  // Generate 10 backup codes using crypto.randomBytes
  // Each code is 8 characters hex (32 bits entropy)
  const crypto = require('crypto');
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// SECURITY FIX: Hash verification codes before storing in database
function hashVerificationCode(code) {
  // Use SHA-256 for one-way hashing of verification codes
  // This prevents exposure if database is compromised
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
}

function verifyHashedCode(inputCode, hashedCode) {
  // Hash the input code and compare with stored hash
  const inputHash = hashVerificationCode(inputCode);
  return inputHash === hashedCode;
}

// SECURITY FIX: Prevent timing attacks with consistent delay
async function timingSafeDelay(minMs = 200, maxMs = 400) {
  // Add random delay to prevent timing-based user enumeration
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// SECURITY FIX: Per-account rate limiting functions
async function checkAccountLockout(email) {
  const record = await FailedLogin.findOne({ email });

  if (!record) return { locked: false };

  // Check if account is currently locked
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((record.lockedUntil - new Date()) / 1000 / 60);
    return {
      locked: true,
      remainingTime: remainingMinutes,
      attempts: record.attempts
    };
  }

  return { locked: false, attempts: record.attempts || 0 };
}

async function recordFailedAttempt(email, ipAddress) {
  let record = await FailedLogin.findOne({ email });

  if (!record) {
    record = new FailedLogin({ email, ipAddresses: [] });
  }

  // Reset if last attempt was > 15 minutes ago
  if (record.lastAttempt < new Date(Date.now() - 15 * 60 * 1000)) {
    record.attempts = 0;
    record.lockedUntil = undefined;
  }

  record.attempts++;
  record.lastAttempt = new Date();

  // Track unique IP addresses
  if (ipAddress && !record.ipAddresses.includes(ipAddress)) {
    record.ipAddresses.push(ipAddress);
  }

  // Lock after 5 failed attempts for 15 minutes
  if (record.attempts >= 5) {
    record.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    // TODO: Send security alert email
    console.log(`SECURITY ALERT: Account ${email} locked due to failed login attempts`);
  }

  await record.save();

  // Progressive delays based on attempts
  const delays = [0, 1000, 2000, 5000, 10000];
  const delay = delays[Math.min(record.attempts - 1, delays.length - 1)];
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return record.attempts;
}

async function resetFailedAttempts(email) {
  await FailedLogin.findOneAndDelete({ email });
}

// SECURITY FIX: Email normalization to prevent duplicate accounts
function normalizeEmail(email) {
  if (!email) return email;

  const [localPart, domain] = email.toLowerCase().trim().split('@');

  if (!localPart || !domain) return email.toLowerCase().trim();

  // Gmail: Remove dots and plus-addressing
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanLocal = localPart.split('+')[0].replace(/\./g, '');
    return `${cleanLocal}@gmail.com`;
  }

  // Outlook/Hotmail: Remove plus-addressing only
  if (domain.endsWith('outlook.com') || domain.endsWith('hotmail.com') || domain.endsWith('live.com')) {
    const cleanLocal = localPart.split('+')[0];
    return `${cleanLocal}@${domain}`;
  }

  // Yahoo: Remove plus-addressing
  if (domain.endsWith('yahoo.com') || domain.endsWith('ymail.com')) {
    const cleanLocal = localPart.split('+')[0];
    return `${cleanLocal}@${domain}`;
  }

  // For other providers, just lowercase and trim
  return email.toLowerCase().trim();
}

// SECURITY FIX: Check if password has been compromised in data breaches
async function isPasswordCompromised(password) {
  const crypto = require('crypto');
  const axios = require('axios');

  try {
    // Create SHA-1 hash of password
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    // Query HIBP API with k-anonymity (only send first 5 chars)
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      timeout: 3000,
      headers: {
        'User-Agent': 'House-of-Paradise-Travel-Booking'
      }
    });

    // Parse response to check if our suffix is in the list
    const hashes = response.data.split('\n');
    const found = hashes.some(line => {
      const hashSuffix = line.split(':')[0];
      return hashSuffix === suffix;
    });

    return found;
  } catch (error) {
    // If API fails (network issues, timeout), don't block registration
    // Log error but allow password to be used
    console.error('HIBP API error:', error.message);
    return false; // Fail open for availability
  }
}

// SECURITY: Refresh Token Management Functions
async function generateRefreshToken(userId, ipAddress, userAgent) {
  const crypto = require('crypto');

  // Generate cryptographically secure random token
  const token = crypto.randomBytes(64).toString('hex');

  // Store refresh token in database with 30-day expiry
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await RefreshToken.create({
    token,
    userId,
    expiresAt,
    ipAddress,
    userAgent
  });

  return token;
}

async function verifyRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!refreshToken) {
    return null;
  }

  // Update last used timestamp
  refreshToken.lastUsed = new Date();
  await refreshToken.save();

  return refreshToken;
}

async function revokeRefreshToken(token) {
  await RefreshToken.updateOne(
    { token },
    { revoked: true }
  );
}

async function revokeAllUserRefreshTokens(userId) {
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { revoked: true }
  );
}

// SECURITY: Token Blacklist Management Functions
async function blacklistToken(token, userId, expiresAt, reason = 'logout') {
  try {
    await TokenBlacklist.create({
      token,
      userId,
      expiresAt,
      reason
    });
    return true;
  } catch (error) {
    // If token already blacklisted (duplicate key error), that's ok
    if (error.code === 11000) {
      return true;
    }
    console.error('Error blacklisting token:', error);
    return false;
  }
}

async function isTokenBlacklisted(token) {
  const blacklisted = await TokenBlacklist.findOne({ token });
  return !!blacklisted;
}

async function blacklistAllUserTokens(userId, reason = 'security') {
  // This is used when password changes, account disabled, etc.
  // We can't blacklist tokens we don't know about, but we can revoke all refresh tokens
  // and blacklist any new access tokens generated from those refresh tokens will fail
  await revokeAllUserRefreshTokens(userId);
  return true;
}

function validateDisplayName(name) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }

  if (name.trim().length > 50) {
    errors.push('Display name must not exceed 50 characters');
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.push('Display name can only contain letters and spaces');
  }

  return errors;
}

function validatePhoneNumber(phone) {
  // Basic phone number validation (digits, spaces, dashes, parentheses, plus sign)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }

  // Check if there are enough digits (at least 7)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

async function sendSMSCode(phone, countryCode, code) {
  // Termii SMS Integration
  const TERMII_API_KEY = process.env.TERMII_API_KEY;
  const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'N-Alert';

  // Format phone number: remove leading zero and add country code without +
  let formattedPhone = phone.startsWith('0') ? phone.slice(1) : phone;
  const countryCodeClean = countryCode.replace('+', '');
  formattedPhone = countryCodeClean + formattedPhone;

  // If no API key configured, fall back to console logging (development mode)
  if (!TERMII_API_KEY) {
    console.log('=====================================================');
    console.log('SMS Verification Code (Termii not configured)');
    console.log(`Phone: ${countryCode} ${phone}`);
    console.log(`Code: ${code}`);
    console.log('Set TERMII_API_KEY in .env to enable real SMS');
    console.log('=====================================================');
    return true;
  }

  try {
    const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
      to: formattedPhone,
      from: TERMII_SENDER_ID,
      sms: `Your House of Paradise verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`,
      type: 'plain',
      channel: 'generic',
      api_key: TERMII_API_KEY
    });

    console.log('Termii SMS sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Termii SMS error:', error.response?.data || error.message);
    // Fall back to console logging if SMS fails
    console.log('=====================================================');
    console.log('SMS FALLBACK - Termii failed, showing code in logs:');
    console.log(`Phone: ${countryCode} ${phone}`);
    console.log(`Code: ${code}`);
    console.log('=====================================================');
    return true; // Return true to not block the flow during testing
  }
}

// Configure email transporter
let transporter;

async function createEmailTransporter() {
  try {
    // Check if we have SMTP credentials
    const hasSmtpCredentials = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (hasSmtpCredentials) {
      // Use configured SMTP (Gmail or other provider)
      console.log('📧 Configuring email with SMTP...');
      console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
      console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
      console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
      console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);

      // Remove spaces from app password (Gmail app passwords are shown with spaces but should be used without)
      const smtpPass = process.env.SMTP_PASS.replace(/\s/g, '');

      // Try SSL connection first (port 465), fallback to TLS (port 587)
      const useSSL = process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true';

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: useSSL, // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPass
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 30000,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      await transporter.verify();
      console.log('✅ SMTP Email transporter is ready');
    } else {
      // Use Ethereal email for testing (creates a test account)
      console.log('📧 Creating Ethereal test email account...');
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('✅ Ethereal Email transporter is ready');
      console.log('📧 Test email credentials:');
      console.log(`   User: ${testAccount.user}`);
      console.log(`   Pass: ${testAccount.pass}`);
      console.log('   View emails at: https://ethereal.email/');
    }
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message);
    // Fallback to console logging if email setup fails
    transporter = null;
  }
}

// Initialize email transporter when server starts
createEmailTransporter();

async function sendVerificationCode(email, code, type, userName = null) {
  try {
    // Determine email subject - Premium HoP branding
    const subject = '✨ Verify Your Email - House of Paradise';

    // If userName not provided, try to get it from the database
    let displayName = userName;
    if (!displayName) {
      try {
        const user = await User.findOne({ email });
        displayName = user ? user.name : 'Traveler';
      } catch (err) {
        displayName = 'Traveler';
      }
    }

    // Generate premium HoP email content
    const htmlContent = generateVerificationEmail(code, displayName);
    const textContent = generateVerificationEmailText(code, displayName);

    // If transporter is available, send actual email
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"House of Paradise" <noreply@houseofparadise.com>',
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      // Add logo attachment for CID embedding (works with Gmail and all email clients)
      const logoAttachment = getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments = [logoAttachment];
      }

      const info = await transporter.sendMail(mailOptions);

      console.log('=====================================================');
      console.log('✅ HoP Verification Email sent successfully!');
      console.log(`📧 To: ${email}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🆔 Message ID: ${info.messageId}`);
      console.log(`📤 Response: ${info.response || 'No response'}`);
      console.log(`✉️ Accepted: ${JSON.stringify(info.accepted)}`);

      // If using Ethereal, provide preview URL
      if (info.messageId && process.env.SMTP_HOST !== 'smtp.gmail.com') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`🔗 Preview URL: ${previewUrl}`);
        }
      }
      console.log('=====================================================');

      return true;
    } else {
      // Fallback to console logging if email is not configured
      console.log('=====================================================');
      console.log('⚠️  Email transporter not available - showing in console');
      console.log(`📧 To: ${email}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🔑 Verification Code: ${code}`);
      console.log('⏰ This code will expire in 10 minutes');
      console.log('=====================================================');
      return true;
    }
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));

    // Fallback to console logging on error
    console.log('=====================================================');
    console.log('⚠️  Email sending failed - showing in console');
    console.log(`📧 Verification Code for ${email}`);
    console.log(`🔑 Code: ${code}`);
    console.log('⏰ This code will expire in 10 minutes');
    console.log('=====================================================');

    return false;
  }
}

// Send password reset link via email
async function sendPasswordResetLink(email, resetLink) {
  try {
    const subject = '🔐 Reset Your Password - House of Paradise';

    // Get user name
    let displayName = 'Traveler';
    try {
      const user = await User.findOne({ email });
      displayName = user ? user.name : 'Traveler';
    } catch (err) {
      displayName = 'Traveler';
    }

    // Generate premium HoP email content
    const htmlContent = generatePasswordResetEmail(resetLink, displayName);
    const textContent = generatePasswordResetEmailText(resetLink, displayName);

    // If transporter is available, send actual email
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"House of Paradise" <noreply@houseofparadise.com>',
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      // Add logo attachment for CID embedding (works with Gmail and all email clients)
      const logoAttachment = getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments = [logoAttachment];
      }

      const info = await transporter.sendMail(mailOptions);

      console.log('=====================================================');
      console.log('✅ HoP Password Reset Email sent successfully!');
      console.log(`📧 To: ${email}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🆔 Message ID: ${info.messageId}`);
      console.log(`📤 Response: ${info.response || 'No response'}`);
      console.log(`✉️ Accepted: ${JSON.stringify(info.accepted)}`);
      console.log(`❌ Rejected: ${JSON.stringify(info.rejected)}`);

      // If using Ethereal, provide preview URL
      if (info.messageId && process.env.SMTP_HOST !== 'smtp.gmail.com') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`🔗 Preview URL: ${previewUrl}`);
        }
      }
      console.log('=====================================================');

      return true;
    } else {
      // Fallback to console logging if email is not configured
      console.log('=====================================================');
      console.log('⚠️  Email transporter not available - showing in console');
      console.log(`📧 To: ${email}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🔗 Reset Link: ${resetLink}`);
      console.log('⏰ This link will expire in 1 hour');
      console.log('=====================================================');
      return true;
    }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);

    // Fallback to console logging on error
    console.log('=====================================================');
    console.log('⚠️  Email sending failed - showing in console');
    console.log(`📧 Password reset link for ${email}`);
    console.log(`🔗 Link: ${resetLink}`);
    console.log('⏰ This link will expire in 1 hour');
    console.log('=====================================================');

    return false;
  }
}

function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
}

async function isPasswordReused(userId, newPassword) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.passwordHistory || user.passwordHistory.length === 0) {
      return false;
    }

    // Check against last 3 passwords in history
    for (const historyEntry of user.passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, historyEntry.password);
      if (isMatch) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking password reuse:', error);
    return false;
  }
}

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // SECURITY FIX: Check if token is blacklisted (logout, security reasons)
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password -passwordHistory');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account is disabled
    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled. Please enable your account to continue.',
        accountDisabled: true
      });
    }

    req.user = user;
    req.token = token; // Store token for logout endpoint
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// Routes

// 1. POST /api/auth/register - Create unverified user
app.post('/api/auth/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      let { email, password, name } = req.body;

      // SECURITY FIX: Normalize email to prevent duplicate accounts
      email = normalizeEmail(email);

      // Validate password strength
      const passwordErrors = validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet requirements',
          errors: passwordErrors
        });
      }

      // SECURITY FIX: Check if password has been compromised in data breaches
      const isCompromised = await isPasswordCompromised(password);
      if (isCompromised) {
        return res.status(400).json({
          success: false,
          message: 'This password has been exposed in a data breach and cannot be used. Please choose a different password.',
          compromised: true
        });
      }

      // SECURITY FIX: Check if user already exists (prevent enumeration)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Add timing delay to prevent enumeration via timing attacks
        await timingSafeDelay(200, 400);
        return res.status(400).json({
          success: false,
          message: 'Registration failed. Please check your information and try again.'
        });
      }

      // Hash password with 12 rounds
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user (unverified)
      const user = new User({
        email,
        password: hashedPassword,
        name,
        isVerified: false,
        passwordHistory: []
      });

      await user.save();

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // SECURITY FIX: Hash verification code before storing
      const hashedCode = hashVerificationCode(code);

      // Save verification code (hashed)
      await VerificationCode.create({
        email,
        code: hashedCode,
        type: 'email_verification',
        expiresAt,
        attempts: 0,
        maxAttempts: 5
      });

      // Send verification code (plain text via email)
      sendVerificationCode(email, code, 'email_verification');

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        data: {
          email: user.email,
          name: user.name,
          requiresVerification: true
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }
);

// 2. POST /api/auth/verify-email - Verify code and mark user verified
app.post('/api/auth/verify-email',
  verificationLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('code').trim().notEmpty().withMessage('Verification code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, code } = req.body;

      // Find verification code
      const verification = await VerificationCode.findOne({
        email,
        type: 'email_verification',
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (!verification) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Check if max attempts exceeded
      if (verification.attempts >= verification.maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new code.'
        });
      }

      // SECURITY FIX: Verify hashed code instead of plain text
      if (!verifyHashedCode(code, verification.code)) {
        verification.attempts += 1;
        await verification.save();

        return res.status(400).json({
          success: false,
          message: 'Invalid verification code',
          attemptsRemaining: verification.maxAttempts - verification.attempts
        });
      }

      // Mark user as verified
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isVerified = true;
      user.updatedAt = new Date();
      await user.save();

      // Delete verification code
      await VerificationCode.deleteMany({ email, type: 'email_verification' });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: error.message
      });
    }
  }
);

// 3. POST /api/auth/resend-code - Resend verification code
app.post('/api/auth/resend-code',
  verificationLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('type').isIn(['email_verification', 'password_reset']).withMessage('Invalid code type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, type } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old verification codes for this email and type
      await VerificationCode.deleteMany({ email, type });

      // Generate new verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // SECURITY FIX: Hash verification code before storing
      const hashedCode = hashVerificationCode(code);

      // Save verification code (hashed)
      await VerificationCode.create({
        email,
        code: hashedCode,
        type,
        expiresAt,
        attempts: 0,
        maxAttempts: 5
      });

      // Send verification code
      sendVerificationCode(email, code, type);

      res.json({
        success: true,
        message: 'Verification code sent successfully'
      });

    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification code',
        error: error.message
      });
    }
  }
);

// 4. POST /api/auth/login - Check verified status and login (with 2FA support)
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      let { email, password } = req.body;

      // SECURITY FIX: Normalize email for consistent lookup
      email = normalizeEmail(email);

      const ipAddress = req.ip || req.connection.remoteAddress;

      // SECURITY FIX: Check if account is locked due to failed attempts
      const lockoutStatus = await checkAccountLockout(email);
      if (lockoutStatus.locked) {
        return res.status(429).json({
          success: false,
          message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${lockoutStatus.remainingTime} minutes.`,
          lockedUntil: lockoutStatus.remainingTime
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        // SECURITY FIX: Record failed attempt even for non-existent users
        await recordFailedAttempt(email, ipAddress);
        await timingSafeDelay(300, 500);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is disabled
      if (user.disabled) {
        return res.status(403).json({
          success: false,
          message: 'Account is disabled. Please enable your account to log in.',
          accountDisabled: true
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Email not verified. Please verify your email before logging in.',
          requiresVerification: true
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // SECURITY FIX: Record failed attempt and apply progressive delay
        await recordFailedAttempt(email, ipAddress);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // SECURITY FIX: Reset failed attempts on successful login
      await resetFailedAttempts(email);

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        return res.json({
          success: true,
          requiresTwoFactor: true,
          userId: user._id,
          message: 'Please enter your two-factor authentication code'
        });
      }

      // SECURITY FIX: Generate short-lived access token (15min) instead of 24h
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      // SECURITY FIX: Generate long-lived refresh token (30 days)
      const userAgent = req.headers['user-agent'];
      const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            profileImage: user.profileImage ? `${API_GATEWAY_URL}${user.profileImage}` : null,
            phone: user.phone,
            phoneCountryCode: user.phoneCountryCode
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
);

// SECURITY: POST /api/auth/refresh - Refresh access token using refresh token
app.post('/api/auth/refresh',
  authLimiter,
  [
    body('refreshToken').trim().notEmpty().withMessage('Refresh token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { refreshToken: oldRefreshToken } = req.body;

      // Verify and retrieve refresh token from database
      const refreshTokenDoc = await verifyRefreshToken(oldRefreshToken);
      if (!refreshTokenDoc) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      const user = refreshTokenDoc.userId;

      // Check if user account is still active
      if (user.disabled) {
        return res.status(403).json({
          success: false,
          message: 'Account is disabled'
        });
      }

      // Generate new short-lived access token
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      // SECURITY: Token rotation - revoke old refresh token and issue new one
      await revokeRefreshToken(oldRefreshToken);

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const newRefreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900 // 15 minutes in seconds
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  }
);

// SECURITY: POST /api/auth/logout - Blacklist access token and revoke refresh token
app.post('/api/auth/logout',
  verifyToken, // Requires authentication
  [
    body('refreshToken').optional().trim().notEmpty().withMessage('Invalid refresh token format')
  ],
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.token; // Retrieved from verifyToken middleware

      // Decode access token to get expiry
      const decoded = jwt.decode(accessToken);
      const expiresAt = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date

      // Blacklist the access token
      await blacklistToken(accessToken, req.user._id, expiresAt, 'logout');

      // Revoke the refresh token if provided
      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
);

// 5. POST /api/auth/forgot-password - Send password reset link
app.post('/api/auth/forgot-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // SECURITY FIX: Prevent user enumeration - same message whether user exists or not
      const genericMessage = 'If an account exists with this email, you will receive a password reset link shortly.';

      // Check if user exists
      const user = await User.findOne({ email });

      if (!user) {
        // User doesn't exist - add timing delay and return generic message
        await timingSafeDelay(300, 600);
        return res.json({
          success: true,
          message: genericMessage
        });
      }

      // Delete old password reset tokens for this user
      await VerificationCode.deleteMany({ email, type: 'password_reset' });

      // Generate reset token using JWT (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // SECURITY FIX: Hash reset token before storing in database
      const hashedToken = hashVerificationCode(resetToken);

      // Save reset token to database for verification
      // Database expiration is 5 minutes longer than JWT to prevent race conditions
      const expiresAt = new Date(Date.now() + (65 * 60 * 1000)); // 1 hour 5 minutes (safety buffer)
      await VerificationCode.create({
        email,
        code: hashedToken,
        type: 'password_reset',
        expiresAt,
        attempts: 0,
        maxAttempts: 5
      });

      // Create reset link
      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Send reset link via email
      console.log(`Password Reset Link for ${email}:`);
      console.log(resetLink);
      console.log(`Token expires in 1 hour`);

      // Send password reset email (await to catch errors)
      try {
        const emailResult = await sendPasswordResetLink(email, resetLink);
        if (!emailResult) {
          console.error('⚠️ Password reset email may not have been delivered');
        }
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError.message);
        // Don't fail the request - user still gets generic success message for security
      }

      // Add slight delay for consistency
      await timingSafeDelay(100, 200);

      res.json({
        success: true,
        message: genericMessage
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: error.message
      });
    }
  }
);

// 6. POST /api/auth/reset-password - Verify token and reset password
app.post('/api/auth/reset-password',
  authLimiter,
  [
    body('token').trim().notEmpty().withMessage('Reset token is required'),
    body('newPassword').notEmpty().withMessage('New password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { token, newPassword } = req.body;

      // Verify and decode JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset link. Please request a new password reset.'
        });
      }

      // Check token type
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reset token type.'
        });
      }

      // Validate password strength
      const passwordErrors = validatePasswordStrength(newPassword);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet requirements',
          errors: passwordErrors
        });
      }

      // SECURITY FIX: Hash the token to compare with stored hash
      const hashedToken = hashVerificationCode(token);

      // Verify token exists in database and not expired
      const verification = await VerificationCode.findOne({
        email: decoded.email,
        code: hashedToken,
        type: 'password_reset',
        expiresAt: { $gt: new Date() }
      });

      if (!verification) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset link. Please request a new password reset.'
        });
      }

      // Find user
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if password is in history (last 3 passwords)
      const isReused = await isPasswordReused(user._id, newPassword);
      if (isReused) {
        return res.status(400).json({
          success: false,
          message: 'You cannot reuse one of your last 3 passwords. Please choose a different password.'
        });
      }

      // Hash new password with 12 rounds
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Add current password to history
      if (user.password) {
        user.passwordHistory.push({
          password: user.password,
          changedAt: new Date()
        });

        // Keep only last 3 passwords in history
        if (user.passwordHistory.length > 3) {
          user.passwordHistory = user.passwordHistory.slice(-3);
        }
      }

      // Update password
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();

      // Delete verification code
      await VerificationCode.deleteMany({ email: decoded.email, type: 'password_reset' });

      res.json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: error.message
      });
    }
  }
);

// 7. GET /api/auth/verify - Verify JWT token
app.get('/api/auth/verify', verifyToken, async (req, res) => {
  try {
    // Construct full image URL if profile image exists
    let imageUrl = null;
    if (req.user.profileImage) {
      imageUrl = `${req.protocol}://${req.get('host')}${req.user.profileImage}`;
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          isVerified: req.user.isVerified,
          profileImage: req.user.profileImage,
          imageUrl: imageUrl
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
});

// 8. GET /api/auth/profile - Get user profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    // Construct full image URL if profile image exists
    let imageUrl = null;
    if (req.user.profileImage) {
      imageUrl = `${req.protocol}://${req.get('host')}${req.user.profileImage}`;
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          isVerified: req.user.isVerified,
          profileImage: req.user.profileImage,
          imageUrl: imageUrl,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
});

// 9. POST /api/auth/upload-profile-image - Upload profile image
app.post('/api/auth/upload-profile-image', verifyToken, (req, res) => {
  upload.single('profileImage')(req, res, async function (err) {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select an image file.'
        });
      }

      // Delete old profile image if exists
      if (req.user.profileImage) {
        const oldImagePath = path.join(__dirname, req.user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user record with new profile image path
      const imagePath = `/uploads/profile-images/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          profileImage: imagePath,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password -passwordHistory');

      if (!user) {
        // If user not found, delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Construct full image URL (use API Gateway URL in production)
      const imageUrl = `${API_GATEWAY_URL}${imagePath}`;

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImage: imagePath,
          imageUrl: imageUrl,
          filename: req.file.filename
        }
      });

    } catch (error) {
      console.error('Profile image upload error:', error);
      // Clean up uploaded file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        error: error.message
      });
    }
  });
});

// 10. DELETE /api/auth/delete-profile-image - Delete profile image
app.delete('/api/auth/delete-profile-image', verifyToken, async (req, res) => {
  try {
    // Check if user has a profile image
    if (!req.user.profileImage) {
      return res.status(400).json({
        success: false,
        message: 'No profile image to delete'
      });
    }

    // Delete file from filesystem
    const imagePath = path.join(__dirname, req.user.profileImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove profileImage field from user document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { profileImage: 1 },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password -passwordHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image',
      error: error.message
    });
  }
});

// ============= NEW ACCOUNT MANAGEMENT ENDPOINTS =============

// 11. PUT /api/auth/update-display-name - Update display name
app.put('/api/auth/update-display-name',
  verifyToken,
  [
    body('displayName').trim().notEmpty().withMessage('Display name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { displayName } = req.body;

      // Validate display name
      const validationErrors = validateDisplayName(displayName);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Display name validation failed',
          errors: validationErrors
        });
      }

      // Update user name
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          name: displayName.trim(),
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password -passwordHistory -twoFactorSecret -backupCodes');

      res.json({
        success: true,
        message: 'Display name updated successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Update display name error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update display name',
        error: error.message
      });
    }
  }
);

// 12. POST /api/auth/request-email-change - Request email change
app.post('/api/auth/request-email-change',
  verifyToken,
  authLimiter,
  [
    body('newEmail').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { newEmail, password } = req.body;

      // Verify current password
      const user = await User.findById(req.user._id);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // SECURITY FIX: Check if new email already exists (prevent enumeration)
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        await timingSafeDelay(200, 400);
        return res.status(400).json({
          success: false,
          message: 'Unable to update email. Please try a different email address.'
        });
      }

      // Generate 6-digit verification code
      const code = generateNumericCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // SECURITY FIX: Hash email change code before storing
      const hashedCode = hashVerificationCode(code);

      // Store temporarily (hashed)
      user.emailChangeCode = hashedCode;
      user.emailChangeCodeExpiry = expiresAt;
      user.tempEmail = newEmail;
      await user.save();

      // Send code to NEW email (plain text)
      await sendVerificationCode(newEmail, code, 'email_verification');

      res.json({
        success: true,
        message: 'Verification code sent to new email address'
      });

    } catch (error) {
      console.error('Request email change error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request email change',
        error: error.message
      });
    }
  }
);

// 13. POST /api/auth/verify-email-change - Verify email change
app.post('/api/auth/verify-email-change',
  verifyToken,
  verificationLimiter,
  [
    body('code').trim().notEmpty().withMessage('Verification code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { code } = req.body;

      const user = await User.findById(req.user._id);

      // Check if code exists and not expired
      if (!user.emailChangeCode || !user.emailChangeCodeExpiry) {
        return res.status(400).json({
          success: false,
          message: 'No email change request found'
        });
      }

      if (new Date() > user.emailChangeCodeExpiry) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }

      // SECURITY FIX: Verify hashed code
      if (!verifyHashedCode(code, user.emailChangeCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Update email
      user.email = user.tempEmail;
      user.emailChangeCode = undefined;
      user.emailChangeCodeExpiry = undefined;
      user.tempEmail = undefined;
      user.updatedAt = new Date();
      await user.save();

      const userResponse = await User.findById(user._id).select('-password -passwordHistory -twoFactorSecret -backupCodes');

      res.json({
        success: true,
        message: 'Email updated successfully',
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Verify email change error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email change',
        error: error.message
      });
    }
  }
);

// 14. POST /api/auth/add-phone - Add phone number
app.post('/api/auth/add-phone',
  verifyToken,
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('countryCode').trim().notEmpty().withMessage('Country code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { phone, countryCode } = req.body;

      // Validate phone number format
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Generate 6-digit SMS code
      const code = generateNumericCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // SECURITY FIX: Hash phone verification code before storing
      const hashedCode = hashVerificationCode(code);

      // Store temporarily (hashed)
      const user = await User.findById(req.user._id);
      user.phoneVerificationCode = hashedCode;
      user.phoneVerificationExpiry = expiresAt;
      user.tempPhone = phone;
      user.tempPhoneCountry = countryCode;
      await user.save();

      // Send SMS (placeholder for now) - plain text
      await sendSMSCode(phone, countryCode, code);

      res.json({
        success: true,
        message: 'Verification code sent via SMS'
      });

    } catch (error) {
      console.error('Add phone error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add phone number',
        error: error.message
      });
    }
  }
);

// 15. POST /api/auth/verify-phone - Verify phone number
app.post('/api/auth/verify-phone',
  verifyToken,
  verificationLimiter,
  [
    body('code').trim().notEmpty().withMessage('Verification code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { code } = req.body;

      const user = await User.findById(req.user._id);

      // Check if code exists and not expired
      if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
        return res.status(400).json({
          success: false,
          message: 'No phone verification request found'
        });
      }

      if (new Date() > user.phoneVerificationExpiry) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }

      // SECURITY FIX: Verify hashed code
      if (!verifyHashedCode(code, user.phoneVerificationCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Update phone
      user.phone = user.tempPhone;
      user.phoneCountryCode = user.tempPhoneCountry;
      user.phoneVerificationCode = undefined;
      user.phoneVerificationExpiry = undefined;
      user.tempPhone = undefined;
      user.tempPhoneCountry = undefined;
      user.updatedAt = new Date();
      await user.save();

      const userResponse = await User.findById(user._id).select('-password -passwordHistory -twoFactorSecret -backupCodes');

      res.json({
        success: true,
        message: 'Phone number verified successfully',
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Verify phone error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify phone number',
        error: error.message
      });
    }
  }
);

// 16. DELETE /api/auth/remove-phone - Remove phone number
app.delete('/api/auth/remove-phone',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Remove phone number
      user.phone = undefined;
      user.phoneCountryCode = undefined;
      user.updatedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Phone number removed successfully'
      });

    } catch (error) {
      console.error('Remove phone error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove phone number',
        error: error.message
      });
    }
  }
);

// 17. POST /api/auth/change-password - Change password
app.post('/api/auth/change-password',
  verifyToken,
  authLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').notEmpty().withMessage('New password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Validate new password strength
      const passwordErrors = validatePasswordStrength(newPassword);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'New password does not meet requirements',
          errors: passwordErrors
        });
      }

      // SECURITY FIX: Check if password has been compromised
      const isCompromised = await isPasswordCompromised(newPassword);
      if (isCompromised) {
        return res.status(400).json({
          success: false,
          message: 'This password has been exposed in a data breach and cannot be used. Please choose a different password.',
          compromised: true
        });
      }

      // Check if password is in history
      const isReused = await isPasswordReused(user._id, newPassword);
      if (isReused) {
        return res.status(400).json({
          success: false,
          message: 'You cannot reuse one of your last 3 passwords'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Add current password to history
      user.passwordHistory.push({
        password: user.password,
        changedAt: new Date()
      });

      // Keep only last 3 passwords
      if (user.passwordHistory.length > 3) {
        user.passwordHistory = user.passwordHistory.slice(-3);
      }

      // Update password
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }
);

// 18. POST /api/auth/enable-2fa - Enable two-factor authentication
app.post('/api/auth/enable-2fa',
  verifyToken,
  async (req, res) => {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `HoP Travel (${req.user.email})`,
        issuer: 'House of Paradise',
        length: 32
      });

      // Generate QR code data URL (for fallback)
      const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

      // Store secret temporarily (not saved until verified)
      const user = await User.findById(req.user._id);
      user.temp2FASecret = secret.base32;
      await user.save();

      res.json({
        success: true,
        message: '2FA setup initiated',
        data: {
          otpauthUrl: secret.otpauth_url,  // Raw URI for QRCodeSVG
          qrCodeDataUrl: qrCodeDataUrl,     // Base64 data URL for fallback
          secret: secret.base32
        }
      });

    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable 2FA',
        error: error.message
      });
    }
  }
);

// 19. POST /api/auth/verify-2fa-setup - Verify and complete 2FA setup
app.post('/api/auth/verify-2fa-setup',
  verifyToken,
  verificationLimiter,
  [
    body('code').trim().notEmpty().withMessage('Verification code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { code } = req.body;

      const user = await User.findById(req.user._id);

      if (!user.temp2FASecret) {
        return res.status(400).json({
          success: false,
          message: 'No 2FA setup in progress'
        });
      }

      // Verify code against temporary secret
      // Use window 2 (±60 seconds) to allow for time sync issues and manual entry delay
      console.log('2FA Setup Verification:', {
        receivedCode: code,
        codeLength: code.length,
        secretExists: !!user.temp2FASecret,
        secretLength: user.temp2FASecret?.length
      });

      const verified = speakeasy.totp.verify({
        secret: user.temp2FASecret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow ±60 seconds tolerance
      });

      console.log('2FA Verification result:', verified);

      if (!verified) {
        // Generate what the current valid code should be for debugging
        const expectedCode = speakeasy.totp({
          secret: user.temp2FASecret,
          encoding: 'base32'
        });
        console.log('Expected TOTP code:', expectedCode, 'Received:', code);

        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please ensure you enter the 6-digit code from your authenticator app.'
        });
      }

      // Generate backup codes (plain text)
      const backupCodes = generateBackupCodes();

      // SECURITY FIX: Hash backup codes before storing
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(async (code) => ({
          hash: await bcrypt.hash(code, 10),
          used: false,
          createdAt: new Date()
        }))
      );

      // Save secret and enable 2FA
      user.twoFactorSecret = user.temp2FASecret;
      user.twoFactorEnabled = true;
      user.backupCodes = hashedBackupCodes; // Store hashed
      user.backupCodesGeneratedAt = new Date(); // Track generation time
      user.temp2FASecret = undefined;
      user.updatedAt = new Date();
      await user.save();

      // Return plain codes only once for user to save
      res.json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          backupCodes: backupCodes // Return plain text only once
        }
      });

    } catch (error) {
      console.error('Verify 2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify 2FA setup',
        error: error.message
      });
    }
  }
);

// 20. POST /api/auth/verify-2fa-login - Verify 2FA during login
app.post('/api/auth/verify-2fa-login',
  authLimiter,
  [
    body('userId').trim().notEmpty().withMessage('User ID is required'),
    body('code').trim().notEmpty().withMessage('Verification code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { userId, code } = req.body;

      const user = await User.findById(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request'
        });
      }

      // Verify TOTP code
      // Use window 2 (±60 seconds) to allow for time sync issues
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow ±60 seconds tolerance
      });

      let usedBackupCode = false;

      // If TOTP fails, check backup codes
      if (!verified) {
        // SECURITY FIX: Verify backup code using bcrypt
        let backupCodeFound = false;
        let backupCodeIndex = -1;

        for (let i = 0; i < user.backupCodes.length; i++) {
          const backupCode = user.backupCodes[i];

          // Skip already used codes
          if (backupCode.used) continue;

          // Compare hashed backup code
          const isValid = await bcrypt.compare(code.toUpperCase(), backupCode.hash);
          if (isValid) {
            backupCodeFound = true;
            backupCodeIndex = i;
            break;
          }
        }

        if (!backupCodeFound) {
          return res.status(400).json({
            success: false,
            message: 'Invalid verification code'
          });
        }

        // Mark backup code as used (don't delete, keep for audit trail)
        user.backupCodes[backupCodeIndex].used = true;
        user.backupCodes[backupCodeIndex].usedAt = new Date();
        await user.save();
        usedBackupCode = true;
      }

      // SECURITY FIX: Generate short-lived access token (15min) instead of 24h
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      // SECURITY FIX: Generate long-lived refresh token (30 days)
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            profileImage: user.profileImage ? `${API_GATEWAY_URL}${user.profileImage}` : null,
            phone: user.phone,
            phoneCountryCode: user.phoneCountryCode
          },
          usedBackupCode: usedBackupCode
        }
      });

    } catch (error) {
      console.error('Verify 2FA login error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify 2FA',
        error: error.message
      });
    }
  }
);

// 21. GET /api/auth/backup-codes - Get backup codes info
app.get('/api/auth/backup-codes',
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message: '2FA is not enabled'
        });
      }

      // SECURITY FIX: Return metadata about backup codes, not the codes themselves
      // Backup codes are only shown once during setup or regeneration
      const backupCodeInfo = user.backupCodes.map((code, index) => ({
        index: index + 1,
        used: code.used,
        createdAt: code.createdAt,
        usedAt: code.usedAt || null
      }));

      // Calculate next regeneration date (30 days from last generation)
      const generatedAt = user.backupCodesGeneratedAt || user.backupCodes[0]?.createdAt;
      const nextRegenerationDate = generatedAt
        ? new Date(generatedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null;
      const canRegenerate = !nextRegenerationDate || new Date() >= nextRegenerationDate;

      res.json({
        success: true,
        message: 'Backup codes are only shown once during 2FA setup or regeneration. Store them securely.',
        data: {
          totalCodes: user.backupCodes.length,
          usedCodes: user.backupCodes.filter(c => c.used).length,
          availableCodes: user.backupCodes.filter(c => !c.used).length,
          codes: backupCodeInfo,
          generatedAt: generatedAt || null,
          nextRegenerationDate: nextRegenerationDate,
          canRegenerate: canRegenerate
        }
      });

    } catch (error) {
      console.error('Get backup codes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve backup codes',
        error: error.message
      });
    }
  }
);

// 21b. POST /api/auth/regenerate-backup-codes - Regenerate backup codes (once every 30 days)
app.post('/api/auth/regenerate-backup-codes',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required for security verification')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;
      const user = await User.findById(req.user._id);

      // Check if 2FA is enabled
      if (!user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message: '2FA is not enabled. Enable 2FA first to get backup codes.'
        });
      }

      // Verify password for security
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Check 30-day cooldown period
      const generatedAt = user.backupCodesGeneratedAt || user.backupCodes[0]?.createdAt;
      if (generatedAt) {
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const timeSinceGeneration = Date.now() - new Date(generatedAt).getTime();

        if (timeSinceGeneration < thirtyDaysInMs) {
          const daysRemaining = Math.ceil((thirtyDaysInMs - timeSinceGeneration) / (24 * 60 * 60 * 1000));
          const nextRegenerationDate = new Date(new Date(generatedAt).getTime() + thirtyDaysInMs);

          return res.status(429).json({
            success: false,
            message: `Backup codes can only be regenerated once every 30 days. Please wait ${daysRemaining} more day(s).`,
            data: {
              daysRemaining: daysRemaining,
              nextRegenerationDate: nextRegenerationDate
            }
          });
        }
      }

      // Generate new backup codes (plain text)
      const backupCodes = generateBackupCodes();

      // Hash backup codes before storing
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(async (code) => ({
          hash: await bcrypt.hash(code, 10),
          used: false,
          createdAt: new Date()
        }))
      );

      // Update user with new backup codes
      user.backupCodes = hashedBackupCodes;
      user.backupCodesGeneratedAt = new Date();
      user.updatedAt = new Date();
      await user.save();

      // Calculate next regeneration date
      const nextRegenerationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      res.json({
        success: true,
        message: 'Backup codes regenerated successfully. Save these codes securely - they will only be shown once!',
        data: {
          backupCodes: backupCodes, // Return plain text only once
          generatedAt: new Date(),
          nextRegenerationDate: nextRegenerationDate
        }
      });

    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate backup codes',
        error: error.message
      });
    }
  }
);

// 22. POST /api/auth/disable-2fa - Disable two-factor authentication
app.post('/api/auth/disable-2fa',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Disable 2FA
      user.twoFactorSecret = undefined;
      user.twoFactorEnabled = false;
      user.backupCodes = [];
      user.updatedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });

    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA',
        error: error.message
      });
    }
  }
);

// 23. POST /api/auth/disable-account - Disable account and kick user out
app.post('/api/auth/disable-account',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Disable account
      user.disabled = true;
      user.disabledAt = new Date();
      user.updatedAt = new Date();
      await user.save();

      // Revoke all refresh tokens for this user (kicks them out)
      await revokeAllUserRefreshTokens(user._id);

      res.json({
        success: true,
        message: 'Account disabled successfully',
        kickOut: true // Signal frontend to clear tokens and redirect
      });

    } catch (error) {
      console.error('Disable account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disable account',
        error: error.message
      });
    }
  }
);

// 24. POST /api/auth/request-unlock - Request account unlock (sends email code)
app.post('/api/auth/request-unlock',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      let { email } = req.body;
      email = normalizeEmail(email);

      // Find user
      const user = await User.findOne({ email });

      // Always return success to prevent email enumeration
      if (!user || !user.disabled) {
        // Add delay to prevent timing attacks
        await timingSafeDelay(300, 500);
        return res.json({
          success: true,
          message: 'If this email exists and the account is disabled, you will receive an unlock code.'
        });
      }

      // Generate 6-digit unlock code
      const unlockCode = generateNumericCode();
      const hashedCode = hashVerificationCode(unlockCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store unlock code in user document
      user.unlockCode = hashedCode;
      user.unlockCodeExpiry = expiresAt;
      await user.save();

      // Send premium HoP unlock email
      try {
        const emailHTML = generateUnlockEmail(unlockCode, user.name || 'Traveler');

        // Build mail options with CID embedded logo
        const unlockMailOptions = {
          from: process.env.EMAIL_FROM || '"House of Paradise" <noreply@houseofparadise.com>',
          to: email,
          subject: '🔓 Unlock Your Account - House of Paradise',
          html: emailHTML,
          text: `Your House of Paradise account unlock code is: ${unlockCode}. This code expires in 15 minutes.`
        };

        // Add logo attachment for CID embedding
        const logoAttachment = getLogoAttachment();
        if (logoAttachment) {
          unlockMailOptions.attachments = [logoAttachment];
        }

        await transporter.sendMail(unlockMailOptions);

        console.log('=====================================================');
        console.log('✅ HoP Account Unlock Email sent successfully!');
        console.log(`📧 To: ${email}`);
        console.log('=====================================================');
      } catch (emailError) {
        console.error('Failed to send unlock email:', emailError);
        // Don't expose email errors to user
      }

      res.json({
        success: true,
        message: 'If this email exists and the account is disabled, you will receive an unlock code.'
      });

    } catch (error) {
      console.error('Request unlock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process unlock request',
        error: error.message
      });
    }
  }
);

// 25. POST /api/auth/verify-unlock - Verify unlock code and enable account
app.post('/api/auth/verify-unlock',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      let { email, code } = req.body;
      email = normalizeEmail(email);

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        await timingSafeDelay(300, 500);
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired unlock code'
        });
      }

      // Check if account is disabled
      if (!user.disabled) {
        return res.status(400).json({
          success: false,
          message: 'Account is not disabled'
        });
      }

      // Check if unlock code exists and not expired
      if (!user.unlockCode || !user.unlockCodeExpiry) {
        return res.status(400).json({
          success: false,
          message: 'No unlock request found. Please request a new unlock code.'
        });
      }

      if (new Date() > user.unlockCodeExpiry) {
        // Clear expired code
        user.unlockCode = undefined;
        user.unlockCodeExpiry = undefined;
        await user.save();

        return res.status(400).json({
          success: false,
          message: 'Unlock code has expired. Please request a new one.'
        });
      }

      // Verify the code
      if (!verifyHashedCode(code, user.unlockCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid unlock code'
        });
      }

      // Enable account
      user.disabled = false;
      user.disabledAt = undefined;
      user.unlockCode = undefined;
      user.unlockCodeExpiry = undefined;
      user.updatedAt = new Date();
      await user.save();

      // Generate new tokens
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Account unlocked successfully! Welcome back.',
        data: {
          accessToken,
          refreshToken,
          expiresIn: 900,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            profileImage: user.profileImage ? `${API_GATEWAY_URL}${user.profileImage}` : null,
            phone: user.phone,
            phoneCountryCode: user.phoneCountryCode
          }
        }
      });

    } catch (error) {
      console.error('Verify unlock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify unlock code',
        error: error.message
      });
    }
  }
);

// 25. DELETE /api/auth/delete-account - Permanently delete account
app.delete('/api/auth/delete-account',
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { password } = req.body;

      const user = await User.findById(req.user._id);

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Delete profile image if exists
      if (user.profileImage) {
        const imagePath = path.join(__dirname, user.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete user account
      await User.findByIdAndDelete(req.user._id);

      res.json({
        success: true,
        message: 'Account permanently deleted'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error.message
      });
    }
  }
);

// ==================== ADMIN ROUTES ====================

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

// Get all users (admin only)
app.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -passwordHistory -twoFactorSecret -backupCodes');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user (admin only)
app.get('/api/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordHistory -twoFactorSecret -backupCodes');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user role (admin only)
app.patch('/api/admin/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -passwordHistory -twoFactorSecret -backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// Update user credentials (admin only)
app.patch('/api/admin/users/:id/credentials', verifyToken, isAdmin, async (req, res) => {
  try {
    const { password, email } = req.body;
    const updates = {};

    if (password) {
      updates.password = await bcrypt.hash(password, 12);
    }
    if (email) {
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password -passwordHistory -twoFactorSecret -backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user credentials'
    });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get admin stats (admin only)
app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const disabledUsers = await User.countDocuments({ disabled: true });
    const twoFactorEnabled = await User.countDocuments({ twoFactorEnabled: true });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        disabledUsers,
        twoFactorEnabled,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
