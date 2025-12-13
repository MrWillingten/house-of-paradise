# Email Sending Functionality - N1 Travels Auth Service

## Overview

The auth service now includes professional email sending functionality with beautiful, responsive HTML templates for verification codes. This implementation supports both production SMTP providers (like Gmail) and development testing via Ethereal Email.

## Features

- **Beautiful HTML Email Templates**: Professional, responsive design with travel/booking theme
- **Dual Configuration Options**:
  - Production: Real SMTP (Gmail, SendGrid, Mailgun, etc.)
  - Development: Ethereal Email (automatic test email account)
- **Two Email Types**:
  - Email Verification (for new user registration)
  - Password Reset (for forgot password flow)
- **Automatic Fallback**: If email sending fails, codes are logged to console
- **Professional Design**: Modern, Airbnb/Booking.com-level email design

## Email Template Design

The email templates include:
- N1 Travels branding with gradient header
- Large, easy-to-copy 6-character verification code
- 15-minute expiry notice
- Security tips section
- Responsive layout (mobile-friendly)
- Social media icons and footer links
- Professional color scheme (blues/teals for travel theme)
- Both HTML and plain text versions

## Configuration

### Option 1: Gmail SMTP (Production)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Copy the 16-character password
3. **Update `.env` file**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM="N1 Travels <your-email@gmail.com>"
```

### Option 2: Other SMTP Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM="N1 Travels <noreply@yourdomain.com>"
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your-mailgun-password
EMAIL_FROM="N1 Travels <noreply@yourdomain.com>"
```

### Option 3: Ethereal Email (Development/Testing)

**No configuration needed!** Simply comment out or remove the SMTP environment variables:

```env
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=
# SMTP_PASS=
# EMAIL_FROM=
```

When the server starts, it will:
1. Automatically create a temporary Ethereal Email account
2. Print test credentials to the console
3. Provide preview URLs for each sent email

**Console Output Example:**
```
📧 Creating Ethereal test email account...
✅ Ethereal Email transporter is ready
📧 Test email credentials:
   User: test.account@ethereal.email
   Pass: test_password_123
   View emails at: https://ethereal.email/
```

When an email is sent, you'll see:
```
🔗 Preview URL: https://ethereal.email/message/abc123xyz
```

Click the preview URL to view the beautiful HTML email in your browser!

## How It Works

### Email Flow

1. **Registration Flow**:
   ```
   POST /api/auth/register
   → User created (unverified)
   → Verification code generated
   → Email sent with beautiful HTML template
   → User receives email with 6-character code
   ```

2. **Password Reset Flow**:
   ```
   POST /api/auth/forgot-password
   → Password reset code generated
   → Email sent with beautiful HTML template
   → User receives email with 6-character code
   → User submits code + new password
   ```

### Code Structure

**Files:**
- `server.js` - Main server with email sending logic
- `emailTemplates.js` - HTML and plain text email templates
- `.env` - Email configuration

**Key Functions:**

1. **`createEmailTransporter()`**:
   - Called on server startup
   - Auto-detects configuration (SMTP vs Ethereal)
   - Verifies connection
   - Sets up global transporter

2. **`sendVerificationCode(email, code, type, userName)`**:
   - Generates beautiful HTML email
   - Sends email via configured transporter
   - Logs success/failure
   - Provides preview URLs for Ethereal
   - Falls back to console logging on error

3. **`generateVerificationEmailHTML(code, type, userName)`**:
   - Creates responsive HTML email
   - Includes N1 Travels branding
   - Customizes content based on email type
   - Inline CSS for email client compatibility

## Testing

### Test Registration Email

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "email": "test@example.com",
    "name": "Test User",
    "requiresVerification": true
  }
}
```

**Check Logs:**
```bash
docker logs auth-service --tail 20
```

You should see:
```
✅ Email sent successfully!
📧 To: test@example.com
📋 Subject: ✈️ Verify Your Email - Welcome to N1 Travels
🆔 Message ID: <...>
🔗 Preview URL: https://ethereal.email/message/... (if using Ethereal)
```

### Test Password Reset Email

```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset code has been sent."
}
```

## Email Preview

### Verification Email Design

```
┌─────────────────────────────────────────┐
│  ✈️ N1 Travels                          │
│  WORLD'S #1 BOOKING PLATFORM            │
│  📧                                     │
└─────────────────────────────────────────┘
│                                         │
│  Hello Test User,                       │
│                                         │
│  Thank you for joining N1 Travels -     │
│  the world's #1 travel booking platform.│
│  To get started, please verify your     │
│  email address.                         │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  YOUR VERIFICATION CODE           │ │
│  │                                   │ │
│  │      ABC123                       │ │
│  │                                   │ │
│  │  Click to select and copy         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⏱️ This code will expire in 15 minutes│
│                                         │
│  🔒 Security Tips:                      │
│  • Never share this code with anyone    │
│  • N1 Travels will never ask for code   │
│  • If you didn't request, ignore email  │
│                                         │
│  After verification, access thousands   │
│  of amazing travel destinations!        │
│                                         │
└─────────────────────────────────────────┘
│  Help Center | Contact Us | Privacy    │
│  f  t  in  ig                          │
│  © 2025 N1 Travels. All rights reserved│
│  🔒 Secure | ✓ Verified | 🌍 Global    │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Issue: Emails not sending with Gmail

**Solution:**
1. Verify 2FA is enabled on Google account
2. Generate a NEW App Password (old ones may expire)
3. Use the App Password, NOT your regular Gmail password
4. Check SMTP_PORT is 587 and SMTP_SECURE is false

### Issue: "Invalid login" error

**Solution:**
- Double-check SMTP credentials in .env
- Ensure no extra spaces in credentials
- Verify account allows SMTP access

### Issue: Want to test without real email

**Solution:**
- Use Ethereal Email (automatic)
- Comment out all SMTP variables in .env
- Restart server
- View emails at preview URLs in console logs

### Issue: Emails going to spam

**Solution:**
- For production, use a professional email service (SendGrid, Mailgun)
- Set up SPF, DKIM, and DMARC records for your domain
- Use a verified sender domain

## Production Recommendations

1. **Use Professional Email Service**:
   - SendGrid (99% delivery rate)
   - Mailgun (developer-friendly)
   - AWS SES (cost-effective)
   - Don't use Gmail for production (daily limits)

2. **Domain Verification**:
   - Verify your sending domain
   - Set up SPF records
   - Configure DKIM signing
   - Add DMARC policy

3. **Monitoring**:
   - Track email delivery rates
   - Monitor bounce rates
   - Set up error alerts
   - Log all email attempts

4. **Security**:
   - Store SMTP credentials in secrets manager
   - Rotate credentials regularly
   - Use environment-specific configurations
   - Never commit credentials to git

## Files Overview

### server.js (Updated Sections)

- **Lines 10-11**: Import nodemailer and email templates
- **Lines 141-197**: Email transporter configuration
- **Lines 199-276**: Enhanced sendVerificationCode function
- Automatic Ethereal fallback
- Beautiful logging with emojis
- Preview URLs for testing

### emailTemplates.js (New File)

- **generateVerificationEmailHTML()**: Creates responsive HTML email
- **generateVerificationEmailText()**: Creates plain text version
- Inline CSS for email client compatibility
- Responsive design (mobile-friendly)
- Professional N1 Travels branding

### .env (Updated)

- Comprehensive documentation
- Two configuration options
- Current configuration uses Gmail
- Easy to switch between production/development

## Email Types

### 1. Email Verification

**Triggered by:** User registration
**Subject:** ✈️ Verify Your Email - Welcome to N1 Travels
**Content:**
- Welcome message
- 6-character verification code
- 15-minute expiry notice
- Security tips
- Call-to-action to complete verification

### 2. Password Reset

**Triggered by:** Forgot password request
**Subject:** 🔐 Reset Your Password - N1 Travels
**Content:**
- Password reset notification
- 6-character verification code
- 15-minute expiry notice
- Security warnings
- Instructions for next steps

## Next Steps (Future Enhancements)

1. **Email Templates**:
   - Welcome email after verification
   - Booking confirmation emails
   - Payment receipt emails
   - Newsletter templates

2. **Features**:
   - Email template customization per user
   - Multi-language support
   - Email preferences management
   - Unsubscribe functionality

3. **Advanced**:
   - Email queue with retry logic
   - Bulk email sending
   - A/B testing for email content
   - Analytics and open tracking

## Support

For issues or questions:
- Check Docker logs: `docker logs auth-service`
- Review .env configuration
- Test with Ethereal Email first
- Consult nodemailer documentation: https://nodemailer.com/

---

**Status:** ✅ Fully Implemented and Tested
**Last Updated:** 2025-12-07
**Version:** 1.0.0
