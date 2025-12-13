# 🔐 Multi-Factor Authentication (MFA) System

## Overview

Your TravelHub application now has a complete **Email-based MFA verification system** similar to Booking.com's registration flow.

---

## ✨ Features Implemented

### 📧 Email Verification
- **6-character alphanumeric codes** (A-Z, 2-9, no confusing 0/O/I/1)
- **10-minute expiration** for security
- **Beautiful HTML email templates** with gradient design
- **Automatic code cleanup** when expired
- **Test email service** (Ethereal) for development
- **Production-ready SMTP** support

### 🛡️ Security Features

**Rate Limiting:**
- ✅ **Send code:** 5 requests per 15 minutes (prevents spam)
- ✅ **Verify code:** 10 attempts per 15 minutes (prevents brute force)
- ✅ **Per-code attempts:** Maximum 5 incorrect attempts
- ✅ **Auth routes:** 20 requests per 15 minutes

**Protection Mechanisms:**
- ✅ Blocks login for unverified users
- ✅ Tracks failed verification attempts
- ✅ Auto-expires codes after 10 minutes
- ✅ Prevents code reuse after verification
- ✅ Input validation (email format, code format)
- ✅ Password hashing with bcrypt
- ✅ Secure database storage

---

## 🎯 User Flow

### Registration Process:

```
User                    System                  Email
  |                       |                       |
  |--1. Fill Form-------->|                       |
  |   (name, email, pwd)  |                       |
  |                       |                       |
  |<--2. Success----------|                       |
  |   "Check your email"  |                       |
  |                       |                       |
  |                       |--3. Send Code-------->|
  |                       |   (6-char)            |
  |                       |                       |
  |<------------------4. Receive Email------------|
  |   Code: ABC123        |                       |
  |                       |                       |
  |--5. Enter Code------->|                       |
  |   ABC123              |                       |
  |                       |                       |
  |                    6. Verify                  |
  |                    - Check code               |
  |                    - Track attempts           |
  |                    - Validate expiry          |
  |                       |                       |
  |<--7. Success----------|                       |
  |   + JWT Token         |                       |
  |   + User Data         |                       |
  |                       |                       |
  |--8. Auto Redirect---->|                       |
  |   to Homepage         |                       |
```

### Resend Code Flow:

```
User clicks "Resend Code"
  → System generates new code
  → Old code invalidated
  → New email sent
  → 60-second cooldown starts
  → User enters new code
```

---

## 🖥️ Frontend Components

### 1. **VerifyEmail.js** - Beautiful verification page

**Features:**
- 6 separate input boxes (one per character)
- Auto-focus to next box on input
- Auto-submit when all 6 filled
- Paste support (Ctrl+V)
- Backspace navigation
- Real-time validation
- Attempt counter display
- Resend button with cooldown timer
- Success animation
- Error messages

**Visual Design:**
- Purple gradient background
- White card with shadow
- Mail icon
- Large code input boxes
- Color-coded feedback
- Smooth animations

### 2. **Updated Login.js**

**Changes:**
- Registration now redirects to `/verify-email`
- Passes email and name in navigation state
- Handles `requiresVerification` error
- Auto-redirects unverified users to verification page

---

## 🔧 Backend Implementation

### Auth Service Endpoints

#### POST `/api/auth/register`
Register new user and send verification code.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "requiresVerification": true,
    "previewUrl": "https://ethereal.email/..." // Dev only
  }
}
```

#### POST `/api/auth/verify-email`
Verify email with code.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "ABC123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isVerified": true
    }
  }
}
```

**Error Response (Wrong Code):**
```json
{
  "success": false,
  "error": "Invalid verification code. 4 attempts remaining.",
  "attemptsRemaining": 4
}
```

#### POST `/api/auth/resend-code`
Resend verification code.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent! Please check your email.",
  "previewUrl": "https://ethereal.email/..." // Dev only
}
```

#### POST `/api/auth/login`
Login (blocks unverified users).

**Error for Unverified:**
```json
{
  "success": false,
  "error": "Email not verified. Please verify your email first.",
  "requiresVerification": true
}
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean (default: false),
  createdAt: Date
}
```

### VerificationCodes Collection
```javascript
{
  email: String (indexed, required),
  code: String (6-char, required),
  attempts: Number (default: 0),
  maxAttempts: Number (default: 5),
  expiresAt: Date (required, auto-delete),
  createdAt: Date
}
```

---

## 🧪 Testing the System

### Manual Test (Frontend):

1. **Go to:** http://localhost:3000
2. **Click:** "Sign Up" on login page
3. **Fill form:**
   - Name: Your Name
   - Email: your@email.com
   - Password: test123
4. **Submit:** You'll be redirected to verification page
5. **Get code:**
   ```bash
   docker logs auth-service 2>&1 | grep "Verification code sent" | tail -1
   ```
6. **Enter code:** Type the 6-character code
7. **Success:** Auto-redirected to homepage

### Automated Test:

```bash
node scripts/test-mfa.js
```

### Test Scenarios:

**✅ Happy Path:**
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'

# Get code from logs
docker logs auth-service 2>&1 | grep "Verification code sent" | tail -1

# Verify
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"ABC123"}'
```

**❌ Wrong Code Test:**
```bash
# Try wrong code
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"WRONG1"}'

# Response shows attempts remaining
```

**🔄 Resend Code Test:**
```bash
curl -X POST http://localhost:8080/api/auth/resend-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🚀 Production Setup

### Email Configuration

Add to `auth-service/.env`:

```env
# SMTP Configuration (Example: Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

EMAIL_FROM="TravelHub <noreply@travelhub.com>"
FRONTEND_URL=https://your-domain.com
```

### Supported Email Providers:

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate at: myaccount.google.com/apppasswords
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

---

## 🎨 Frontend UI Features

### Verification Page

**Modern Design:**
- Purple gradient background (matches TravelHub branding)
- Clean white card with shadows
- Mail icon indicator
- 6 large input boxes for code
- Auto-focus and navigation
- Paste support
- Visual feedback (filled state)

**User Experience:**
- Auto-submit when complete
- Clear error messages
- Attempts counter
- Resend button with countdown
- Success animation
- Auto-redirect on success

**Helpful Info:**
- Email address display
- Expiry time notice
- Spam folder reminder
- Dev mode email preview link

---

## 🔒 Security Best Practices

### Implemented Protections:

1. **Code Security:**
   - Random 6-character generation
   - Removed confusing characters (0, O, I, 1)
   - Uppercase only for consistency
   - Short expiration (10 min)

2. **Attempt Limiting:**
   - Max 5 tries per code
   - Rate limit on verification endpoint
   - Rate limit on resend endpoint
   - Attempt counter persisted in DB

3. **Email Security:**
   - Validation of email format
   - Unique email constraint
   - Cleanup of old codes
   - No sensitive data in emails

4. **Database Security:**
   - Codes indexed for fast lookup
   - Auto-deletion of expired codes
   - Separate collection for codes
   - Passwords always hashed

5. **API Security:**
   - Rate limiting middleware
   - Input validation
   - Error handling
   - Logged operations

---

## 📝 API Integration Examples

### React Component Example:

```javascript
import { authService } from '../services/api';

// Register
const handleRegister = async () => {
  const response = await authService.register({
    email: 'user@example.com',
    password: 'password',
    name: 'User Name'
  });

  if (response.data.success) {
    navigate('/verify-email', {
      state: {
        email: 'user@example.com',
        name: 'User Name'
      }
    });
  }
};

// Verify
const handleVerify = async (code) => {
  const response = await authService.verifyEmail({
    email: 'user@example.com',
    code: code
  });

  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    navigate('/');
  }
};

// Resend
const handleResend = async () => {
  const response = await authService.resendCode({
    email: 'user@example.com'
  });
};
```

---

## 🐛 Troubleshooting

### Issue: Email not received

**Solutions:**
1. Check spam/junk folder
2. Verify SMTP credentials in `.env`
3. Check auth-service logs: `docker logs auth-service`
4. In dev mode, use preview URL from response
5. Try resend code button

### Issue: Code expired

**Solutions:**
1. Click "Resend Code" button
2. New code generated instantly
3. Old code invalidated
4. 10-minute timer resets

### Issue: Too many attempts

**Solutions:**
1. Request new code via "Resend Code"
2. Attempts counter resets
3. Wait for rate limit cooldown (15 min)

### Issue: Rate limit exceeded

**Solutions:**
1. Wait for cooldown period (15 minutes)
2. Check if too many requests from same IP
3. Verify rate limiter configuration

---

## 🎯 Test Results

### ✅ All Tests Passed:

1. **Registration:** ✅
   - User created as unverified
   - Code generated and stored
   - Email sent successfully

2. **Code Generation:** ✅
   - 6 characters alphanumeric
   - Random and unique
   - No confusing characters

3. **Email Delivery:** ✅
   - Beautiful HTML template
   - Includes code and instructions
   - Preview URLs in dev mode

4. **Verification:** ✅
   - Correct code → Success + Token
   - Wrong code → Error + Attempts counter
   - Expired code → Error + Resend option

5. **Attempt Tracking:** ✅
   - Counts failed attempts
   - Shows remaining attempts
   - Blocks after 5 failures

6. **Resend Functionality:** ✅
   - Generates new code
   - Invalidates old code
   - Resets attempt counter
   - Rate limited (5 per 15 min)

7. **Login Protection:** ✅
   - Blocks unverified users
   - Shows verification required message
   - Redirects to verification page

---

## 📱 Frontend User Experience

### Registration Flow:

1. User clicks "Sign Up" on `/login`
2. Fills form (name, email, password)
3. Submits form
4. **Redirected to `/verify-email`**
5. Sees beautiful verification page
6. Email received with code
7. Enters 6-digit code
8. Auto-submits when complete
9. Success message + animation
10. Auto-redirect to homepage

### Verification Page Features:

**Input Experience:**
- 6 large boxes for each digit
- Auto-advances to next box
- Backspace goes to previous
- Paste entire code support
- Visual feedback (color change when filled)
- Mobile-friendly design

**Helper Features:**
- Email address shown
- Expiry time displayed
- Attempts remaining counter
- Resend button (60s cooldown on frontend)
- Helpful tips (check spam, etc.)

---

## 🔧 Configuration

### Environment Variables

Add to `auth-service/.env`:

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB
MONGO_URI=mongodb://mongo:27017/authdb

# Email SMTP (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM="TravelHub <noreply@travelhub.com>"

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Development vs Production

**Development (Current):**
- Uses Ethereal email (fake SMTP)
- Preview URLs provided in API responses
- Codes logged to console
- No real emails sent

**Production (With SMTP config):**
- Real emails sent via configured SMTP
- No preview URLs
- Codes not logged
- Secure delivery

---

## 📊 Monitoring

### Check Logs:

```bash
# Auth service logs (includes verification codes in dev)
docker logs auth-service --follow

# API gateway logs (request tracking)
docker logs api-gateway --follow
```

### Database Queries:

```bash
# Check unverified users
docker exec mongodb mongosh authdb --eval "db.users.find({isVerified: false})"

# Check verification codes
docker exec mongodb mongosh authdb --eval "db.verificationcodes.find()"

# Count verified users
docker exec mongodb mongosh authdb --eval "db.users.countDocuments({isVerified: true})"
```

---

## 🎨 Email Template

Users receive a beautiful email with:
- TravelHub branding (purple gradient)
- Large, clear verification code
- Expiry warning (10 minutes)
- Security notice
- Professional styling
- Mobile-responsive design

---

## 🚀 How to Use

### For Users (Frontend):

1. Visit http://localhost:3000
2. Click "Login" in navbar
3. Switch to "Sign Up" tab
4. Fill registration form
5. Click "Sign Up"
6. Enter verification code from email
7. Click "Verify Email"
8. Start using TravelHub!

### For Testing (Development):

1. Register a user
2. Check logs for code:
   ```bash
   docker logs auth-service 2>&1 | grep "Verification code sent" | tail -1
   ```
3. Use code in verification page
4. Or click email preview URL (Ethereal)

---

## ✅ Checklist

- [x] Email service with Nodemailer
- [x] Verification code generation (6-char alphanumeric)
- [x] Database schema for codes
- [x] Rate limiting (send + verify)
- [x] Attempt tracking (max 5 per code)
- [x] Code expiration (10 minutes)
- [x] Beautiful email templates
- [x] Frontend verification page
- [x] Auto-focus input boxes
- [x] Paste support
- [x] Resend functionality
- [x] Cooldown timer
- [x] Login blocking for unverified
- [x] Success animations
- [x] Error handling
- [x] Security validations
- [x] Production SMTP support
- [ ] Google OAuth (Future enhancement)

---

## 🔮 Future Enhancements

### Google OAuth Integration (Mentioned):
- Add Google Sign-In button
- OAuth 2.0 flow
- Auto-verification for Google accounts
- Link Google to existing accounts

### Additional MFA Options:
- SMS verification
- Authenticator app (TOTP)
- Backup codes
- Remember device option

---

## 📞 Support

For issues:
1. Check this documentation
2. Review `docker logs auth-service`
3. Test with `scripts/test-mfa.js`
4. Verify email configuration
5. Check rate limit status

---

**System Status:** ✅ FULLY OPERATIONAL

The MFA system is production-ready and follows industry best practices!
