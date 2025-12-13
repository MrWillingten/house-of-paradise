const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Email Service for sending verification codes
 *
 * For production, configure with real SMTP credentials
 * For development, uses Ethereal (fake SMTP for testing)
 */

// Logo path for CID embedding
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'hop-logo.png');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.logoAttachment = null;
  }

  /**
   * Get the logo attachment for CID embedding
   * CID (Content-ID) embedding is the professional way to embed images in emails
   * It works with Gmail, Outlook, Apple Mail, and all major email clients
   */
  getLogoAttachment() {
    if (!this.logoAttachment) {
      // Check if logo file exists
      if (fs.existsSync(LOGO_PATH)) {
        this.logoAttachment = {
          filename: 'hop-logo.png',
          path: LOGO_PATH,
          cid: 'hop-logo-cid' // Content-ID for referencing in HTML
        };
      }
    }
    return this.logoAttachment;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // For production: Use real SMTP credentials from environment
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log('✅ Email service initialized with production SMTP');
      } else {
        // For development: Use Ethereal (test email service)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('⚠️  Email service initialized with Ethereal (test mode)');
        console.log(`   Preview emails at: https://ethereal.email`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Send verification code email
   * Uses CID embedding for the logo to work with Gmail and all email clients
   */
  async sendVerificationCode(email, code, userName = 'User') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Build email options with CID embedded logo
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"House of Paradise" <noreply@houseofparadise.com>',
        to: email,
        subject: '✉️ Verify Your Email - House of Paradise',
        html: this.getVerificationEmailTemplate(code, userName),
        text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      };

      // Add logo attachment for CID embedding
      const logoAttachment = this.getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments = [logoAttachment];
      }

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Verification email sent to ${email}`);

      // For development with Ethereal, log preview URL
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      // DEVELOPMENT HELPER: Log code to console for easy access
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📬 VERIFICATION CODE FOR: ${email}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`\n   🔑 CODE: ${code}\n`);
      console.log(`${'='.repeat(80)}\n`);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  /**
   * Email template for verification code
   */
  getVerificationEmailTemplate(code, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px;
            border-radius: 16px;
            color: white;
            text-align: center;
          }
          .code-box {
            background: white;
            color: #047857;
            padding: 20px;
            border-radius: 12px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.9;
          }
          .warning {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Logo embedded via CID - works in Gmail and all email clients -->
          <img src="cid:hop-logo-cid" alt="House of Paradise" style="width: 100px; height: 100px; border-radius: 14px; margin-bottom: 16px;" />
          <h1 style="margin-top: 0;">Welcome to House of Paradise!</h1>
          <p>Hi ${userName},</p>
          <p>Please verify your email address to complete your registration.</p>

          <div class="code-box">${code}</div>

          <p>Enter this code in the verification page to activate your account.</p>

          <div class="warning">
            ⚠️ This code will expire in <strong>10 minutes</strong>.<br/>
            For your security, do not share this code with anyone.
          </div>

          <div class="footer">
            <p>If you didn't create an account with House of Paradise, please ignore this email.</p>
            <p>© ${new Date().getFullYear()} House of Paradise. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send password reset email with custom HoP theme
   * Uses CID embedding for the logo to work with Gmail and all email clients
   */
  async sendPasswordResetEmail(email, resetUrl, userName = 'User') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Build email options with CID embedded logo
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"House of Paradise" <noreply@houseofparadise.com>',
        to: email,
        subject: '🔐 Reset Your Password - House of Paradise',
        html: this.getPasswordResetTemplate(resetUrl, userName),
        text: `Hi ${userName},\n\nWe received a request to reset your password for your House of Paradise account.\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email and your password will remain unchanged.\n\nBest regards,\nHouse of Paradise Team`,
      };

      // Add logo attachment for CID embedding
      const logoAttachment = this.getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments = [logoAttachment];
      }

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Password reset email sent to ${email}`);

      // For development with Ethereal, log preview URL
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      // DEVELOPMENT HELPER: Log reset URL to console
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔐 PASSWORD RESET FOR: ${email}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`\n   🔗 RESET URL: ${resetUrl}\n`);
      console.log(`${'='.repeat(80)}\n`);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  /**
   * Custom HTML template for password reset email - HoP Theme
   */
  getPasswordResetTemplate(resetUrl, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 50px 40px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 800;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
            transition: all 0.3s ease;
          }
          .reset-button:hover {
            box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5);
            transform: translateY(-2px);
          }
          .info-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .info-box p {
            margin: 8px 0;
            color: #047857;
            font-size: 14px;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #fbbf24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning-box p {
            margin: 5px 0;
            color: #92400e;
            font-size: 14px;
          }
          .footer {
            background: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
          }
          .footer a {
            color: #10b981;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <!-- Logo embedded via CID - works in Gmail and all email clients -->
            <img src="cid:hop-logo-cid" alt="House of Paradise" style="width: 120px; height: 120px; border-radius: 16px; margin-bottom: 16px;" />
            <h1 style="margin-top: 0;">House of Paradise</h1>
            <p>Password Reset Request</p>
          </div>

          <div class="content">
            <p class="greeting">Hi <strong>${userName}</strong>,</p>

            <p class="message">
              We received a request to reset the password for your House of Paradise account.
              Click the button below to choose a new password:
            </p>

            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">
                🔐 Reset My Password
              </a>
            </div>

            <div class="info-box">
              <p><strong>📋 What you'll need:</strong></p>
              <p>• Your old password (or something close to it)</p>
              <p>• A new secure password</p>
              <p>• Confirmation of the new password</p>
            </div>

            <div class="warning-box">
              <p><strong>⏰ Important:</strong></p>
              <p>• This link expires in <strong>1 hour</strong></p>
              <p>• You have up to <strong>5 attempts</strong> to verify your old password</p>
              <p>• Don't worry - we accept close approximations of your old password!</p>
            </div>

            <p class="message">
              If you didn't request this password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </p>

            <p class="message" style="font-size: 14px; color: #9ca3af;">
              <strong>Can't click the button?</strong> Copy and paste this URL into your browser:<br/>
              <span style="color: #10b981; word-break: break-all;">${resetUrl}</span>
            </p>
          </div>

          <div class="footer">
            <p>This is an automated message from House of Paradise</p>
            <p>Need help? Contact us at support@houseofparadise.com</p>
            <p style="margin-top: 20px;">© 2024 House of Paradise. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generic send email method
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"TravelHub" <noreply@travelhub.com>',
        to,
        subject,
        html,
        text: text || '', // Optional plain text fallback
      });

      console.log(`📧 Email sent to ${to}: ${subject}`);

      // For development with Ethereal, log preview URL
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
