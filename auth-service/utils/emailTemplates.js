/**
 * House of Paradise - Premium Email Templates
 *
 * Emerald Luxury Design System
 * Colors: #10b981 (Primary), #059669 (Secondary), #047857 (Accent)
 */

// Import embedded SVG logo (works in all email clients without external hosting)
const { HOP_LOGO_DATA_URI, HOP_LOGO_DATA_URI_SMALL } = require('./hopLogo');

const HOP_COLORS = {
  primary: '#10b981',
  secondary: '#059669',
  accent: '#047857',
  dark: '#064e3b',
  light: '#d1fae5',
  lightest: '#ecfdf5',
  white: '#ffffff',
  textDark: '#1f2937',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  gold: '#fbbf24',
  error: '#ef4444',
  errorLight: '#fee2e2'
};

/**
 * Generate the premium HoP email header with CID embedded logo
 * Uses CID (Content-ID) embedding which works in Gmail, Outlook, and all major email clients
 */
function generateHeader(title, subtitle = '') {
  return `
    <div style="background: linear-gradient(135deg, ${HOP_COLORS.primary} 0%, ${HOP_COLORS.secondary} 50%, ${HOP_COLORS.accent} 100%); padding: 50px 40px; text-align: center; border-radius: 20px 20px 0 0;">
      <!-- HoP Logo embedded via CID - works in Gmail and all email clients -->
      <div style="margin-bottom: 24px;">
        <img src="cid:hop-logo-cid" alt="House of Paradise" width="200" height="200" style="display: block; margin: 0 auto; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);" />
      </div>

      <h1 style="color: ${HOP_COLORS.white}; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${title}</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">${subtitle}</p>` : ''}
    </div>
  `;
}

/**
 * Generate premium footer with logo
 * Uses CID reference for the logo - must be used with email that includes logo attachment
 */
function generateFooter() {
  const year = new Date().getFullYear();
  return `
    <div style="background: ${HOP_COLORS.lightest}; padding: 40px; border-radius: 0 0 20px 20px; text-align: center; border-top: 1px solid ${HOP_COLORS.light};">
      <!-- Footer Logo embedded via CID -->
      <div style="margin-bottom: 20px;">
        <img src="cid:hop-logo-cid" alt="House of Paradise" width="60" height="60" style="display: block; margin: 0 auto; opacity: 0.8; border-radius: 10px;" />
      </div>

      <div style="margin-bottom: 20px;">
        <a href="#" style="color: ${HOP_COLORS.secondary}; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 16px;">Help Center</a>
        <a href="#" style="color: ${HOP_COLORS.secondary}; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 16px;">Privacy Policy</a>
        <a href="#" style="color: ${HOP_COLORS.secondary}; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 16px;">Terms of Service</a>
      </div>

      <p style="color: ${HOP_COLORS.textMuted}; font-size: 13px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        This email was sent by House of Paradise
      </p>
      <p style="color: ${HOP_COLORS.textLight}; font-size: 12px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        &copy; ${year} House of Paradise. All rights reserved.
      </p>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid ${HOP_COLORS.light};">
        <span style="display: inline-block; background: ${HOP_COLORS.light}; color: ${HOP_COLORS.accent}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          🔒 Secure &nbsp;|&nbsp; ✓ Verified &nbsp;|&nbsp; 🌍 Global
        </span>
      </div>
    </div>
  `;
}

/**
 * Generate premium button
 */
function generateButton(text, url, icon = '') {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${HOP_COLORS.primary} 0%, ${HOP_COLORS.secondary} 100%); color: ${HOP_COLORS.white}; padding: 18px 48px; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4); letter-spacing: 0.3px;">
        ${icon ? icon + ' ' : ''}${text}
      </a>
    </div>
  `;
}

/**
 * Generate info box
 */
function generateInfoBox(content, type = 'info') {
  const styles = {
    info: {
      bg: `linear-gradient(135deg, ${HOP_COLORS.lightest} 0%, ${HOP_COLORS.light} 100%)`,
      border: HOP_COLORS.primary,
      text: HOP_COLORS.accent
    },
    warning: {
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '#fbbf24',
      text: '#92400e'
    },
    success: {
      bg: `linear-gradient(135deg, ${HOP_COLORS.lightest} 0%, ${HOP_COLORS.light} 100%)`,
      border: HOP_COLORS.primary,
      text: HOP_COLORS.accent
    }
  };

  const style = styles[type] || styles.info;

  return `
    <div style="background: ${style.bg}; border-left: 4px solid ${style.border}; padding: 20px 24px; border-radius: 12px; margin: 24px 0;">
      <div style="color: ${style.text}; font-size: 14px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Generate verification code box
 */
function generateCodeBox(code) {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, ${HOP_COLORS.lightest} 0%, ${HOP_COLORS.light} 100%); border: 3px solid ${HOP_COLORS.primary}; border-radius: 16px; padding: 24px 48px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);">
        <p style="color: ${HOP_COLORS.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your Verification Code</p>
        <p style="color: ${HOP_COLORS.accent}; font-size: 42px; font-weight: 800; letter-spacing: 12px; margin: 0; font-family: 'SF Mono', 'Courier New', monospace;">${code}</p>
      </div>
    </div>
  `;
}

/**
 * Base email wrapper
 */
function wrapEmail(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>House of Paradise</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background: ${HOP_COLORS.white}; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td>
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email Verification Template
 */
function generateVerificationEmail(code, userName = 'Traveler') {
  const content = `
    ${generateHeader('Verify Your Email', 'Welcome to House of Paradise')}

    <div style="padding: 40px;">
      <p style="color: ${HOP_COLORS.textDark}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hello ${userName}! 👋
      </p>
      <p style="color: ${HOP_COLORS.textMuted}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Thank you for joining <strong style="color: ${HOP_COLORS.primary};">House of Paradise</strong> - your gateway to extraordinary travel experiences. To get started, please verify your email address using the code below.
      </p>

      ${generateCodeBox(code)}

      ${generateInfoBox(`
        <strong>⏱️ This code expires in 10 minutes</strong><br><br>
        <strong>🔒 Security Tips:</strong><br>
        • Never share this code with anyone<br>
        • House of Paradise will never ask for this code via phone<br>
        • If you didn't create an account, please ignore this email
      `, 'warning')}

      <div style="background: linear-gradient(135deg, ${HOP_COLORS.lightest} 0%, ${HOP_COLORS.light} 100%); border-radius: 16px; padding: 24px; margin-top: 32px; text-align: center;">
        <p style="color: ${HOP_COLORS.accent}; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          🌴 What awaits you at House of Paradise:
        </p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="33%" style="text-align: center; padding: 12px;">
              <div style="font-size: 28px; margin-bottom: 8px;">🏨</div>
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 13px; font-weight: 500;">15,000+ Hotels</div>
            </td>
            <td width="33%" style="text-align: center; padding: 12px;">
              <div style="font-size: 28px; margin-bottom: 8px;">🌍</div>
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 13px; font-weight: 500;">101 Countries</div>
            </td>
            <td width="33%" style="text-align: center; padding: 12px;">
              <div style="font-size: 28px; margin-bottom: 8px;">💎</div>
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 13px; font-weight: 500;">Loyalty Rewards</div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    ${generateFooter()}
  `;

  return wrapEmail(content);
}

/**
 * Password Reset Email Template
 */
function generatePasswordResetEmail(resetUrl, userName = 'Traveler') {
  const content = `
    ${generateHeader('Reset Your Password', 'Account Security')}

    <div style="padding: 40px;">
      <p style="color: ${HOP_COLORS.textDark}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hello ${userName},
      </p>
      <p style="color: ${HOP_COLORS.textMuted}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        We received a request to reset the password for your <strong style="color: ${HOP_COLORS.primary};">House of Paradise</strong> account. Click the button below to create a new password.
      </p>

      ${generateButton('Reset My Password', resetUrl, '🔐')}

      ${generateInfoBox(`
        <strong>⏰ Important Security Information:</strong><br><br>
        • This link will expire in <strong>1 hour</strong><br>
        • You can only use this link once<br>
        • If you didn't request this reset, please ignore this email<br>
        • Your password will remain unchanged until you create a new one
      `, 'warning')}

      <div style="background: ${HOP_COLORS.lightest}; border-radius: 12px; padding: 20px; margin-top: 24px;">
        <p style="color: ${HOP_COLORS.textMuted}; font-size: 14px; margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>🔗 Can't click the button?</strong> Copy and paste this link into your browser:
        </p>
        <p style="background: ${HOP_COLORS.white}; border: 1px solid ${HOP_COLORS.light}; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 12px; color: ${HOP_COLORS.primary}; margin: 0; font-family: 'SF Mono', 'Courier New', monospace;">
          ${resetUrl}
        </p>
      </div>

      <div style="border-top: 1px solid ${HOP_COLORS.light}; margin-top: 32px; padding-top: 24px;">
        <p style="color: ${HOP_COLORS.textMuted}; font-size: 14px; line-height: 1.7; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong style="color: ${HOP_COLORS.textDark};">🛡️ Keeping your account secure</strong><br>
          If you didn't request this password reset, someone may be trying to access your account. Consider enabling two-factor authentication for added security.
        </p>
      </div>
    </div>

    ${generateFooter()}
  `;

  return wrapEmail(content);
}

/**
 * Welcome Email Template (after verification)
 */
function generateWelcomeEmail(userName = 'Traveler') {
  const content = `
    ${generateHeader('Welcome to Paradise! 🎉', 'Your journey begins now')}

    <div style="padding: 40px;">
      <p style="color: ${HOP_COLORS.textDark}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Congratulations, ${userName}! 🌟
      </p>
      <p style="color: ${HOP_COLORS.textMuted}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Your email has been verified and your <strong style="color: ${HOP_COLORS.primary};">House of Paradise</strong> account is now active. You've just unlocked access to extraordinary travel experiences around the world.
      </p>

      ${generateInfoBox(`
        <strong>🎁 Your Welcome Bonus:</strong><br><br>
        <span style="font-size: 24px; font-weight: 800; color: ${HOP_COLORS.primary};">500 Paradise Points</span><br>
        <span style="font-size: 13px;">Start earning more with every booking!</span>
      `, 'success')}

      ${generateButton('Start Exploring', 'http://localhost:3000/hotels', '✈️')}

      <div style="background: linear-gradient(135deg, ${HOP_COLORS.lightest} 0%, ${HOP_COLORS.light} 100%); border-radius: 16px; padding: 28px; margin-top: 32px;">
        <p style="color: ${HOP_COLORS.accent}; font-size: 16px; font-weight: 700; margin: 0 0 20px 0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          🏆 Your Member Benefits
        </p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="background: ${HOP_COLORS.white}; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 32px; margin-bottom: 12px;">💰</div>
                <div style="color: ${HOP_COLORS.textDark}; font-size: 14px; font-weight: 600;">Earn Points</div>
                <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; margin-top: 4px;">$1 = 10 Points</div>
              </div>
            </td>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="background: ${HOP_COLORS.white}; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 32px; margin-bottom: 12px;">🏷️</div>
                <div style="color: ${HOP_COLORS.textDark}; font-size: 14px; font-weight: 600;">Member Discounts</div>
                <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; margin-top: 4px;">Up to 20% off</div>
              </div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="background: ${HOP_COLORS.white}; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 32px; margin-bottom: 12px;">⚡</div>
                <div style="color: ${HOP_COLORS.textDark}; font-size: 14px; font-weight: 600;">Priority Support</div>
                <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; margin-top: 4px;">24/7 Assistance</div>
              </div>
            </td>
            <td width="50%" style="padding: 12px; vertical-align: top;">
              <div style="background: ${HOP_COLORS.white}; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 32px; margin-bottom: 12px;">🎯</div>
                <div style="color: ${HOP_COLORS.textDark}; font-size: 14px; font-weight: 600;">Exclusive Deals</div>
                <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; margin-top: 4px;">Members Only</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    ${generateFooter()}
  `;

  return wrapEmail(content);
}

/**
 * Booking Confirmation Email Template
 */
function generateBookingConfirmationEmail(booking, userName = 'Traveler') {
  const content = `
    ${generateHeader('Booking Confirmed! ✅', `Confirmation #${booking.id}`)}

    <div style="padding: 40px;">
      <p style="color: ${HOP_COLORS.textDark}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Great news, ${userName}! 🎉
      </p>
      <p style="color: ${HOP_COLORS.textMuted}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Your booking at <strong style="color: ${HOP_COLORS.primary};">${booking.hotelName || 'Paradise Hotel'}</strong> has been confirmed. Get ready for an amazing stay!
      </p>

      <div style="background: ${HOP_COLORS.lightest}; border-radius: 16px; padding: 28px; margin: 24px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="50%" style="padding: 12px 0; border-bottom: 1px solid ${HOP_COLORS.light};">
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Check-in</div>
              <div style="color: ${HOP_COLORS.textDark}; font-size: 16px; font-weight: 600;">${booking.checkIn || 'TBD'}</div>
            </td>
            <td width="50%" style="padding: 12px 0; border-bottom: 1px solid ${HOP_COLORS.light}; text-align: right;">
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Check-out</div>
              <div style="color: ${HOP_COLORS.textDark}; font-size: 16px; font-weight: 600;">${booking.checkOut || 'TBD'}</div>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 12px 0;">
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Guests</div>
              <div style="color: ${HOP_COLORS.textDark}; font-size: 16px; font-weight: 600;">${booking.guests || 2} guests</div>
            </td>
            <td width="50%" style="padding: 12px 0; text-align: right;">
              <div style="color: ${HOP_COLORS.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total</div>
              <div style="color: ${HOP_COLORS.primary}; font-size: 20px; font-weight: 700;">$${booking.total || '0.00'}</div>
            </td>
          </tr>
        </table>
      </div>

      ${booking.pointsEarned ? generateInfoBox(`
        <strong>🎁 You earned ${booking.pointsEarned} Paradise Points!</strong><br>
        Keep booking to unlock more rewards and tier benefits.
      `, 'success') : ''}

      ${generateButton('View Booking Details', `http://localhost:3000/bookings`, '📋')}
    </div>

    ${generateFooter()}
  `;

  return wrapEmail(content);
}

/**
 * Account Unlock Email Template
 */
function generateUnlockEmail(code, userName = 'Traveler') {
  const content = `
    ${generateHeader('Unlock Your Account', 'Account Recovery')}

    <div style="padding: 40px;">
      <p style="color: ${HOP_COLORS.textDark}; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hello ${userName},
      </p>
      <p style="color: ${HOP_COLORS.textMuted}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        You've requested to unlock your <strong style="color: ${HOP_COLORS.primary};">House of Paradise</strong> account. Use the code below to regain access.
      </p>

      ${generateCodeBox(code)}

      ${generateInfoBox(`
        <strong>⏱️ This code expires in 15 minutes</strong><br><br>
        If you didn't request to unlock your account, please contact our support team immediately.
      `, 'warning')}
    </div>

    ${generateFooter()}
  `;

  return wrapEmail(content);
}

/**
 * Plain text email generators
 */
function generateVerificationEmailText(code, userName = 'Traveler') {
  return `
HOUSE OF PARADISE
=================

Hello ${userName}!

Thank you for joining House of Paradise - your gateway to extraordinary travel experiences.

YOUR VERIFICATION CODE: ${code}

This code will expire in 10 minutes.

SECURITY TIPS:
- Never share this code with anyone
- House of Paradise will never ask for this code via phone
- If you didn't create an account, please ignore this email

---

What awaits you at House of Paradise:
- 15,000+ Hotels
- 101 Countries
- Loyalty Rewards

---

© ${new Date().getFullYear()} House of Paradise. All rights reserved.
Secure | Verified | Global
  `.trim();
}

function generatePasswordResetEmailText(resetUrl, userName = 'Traveler') {
  return `
HOUSE OF PARADISE
=================

Hello ${userName},

We received a request to reset the password for your House of Paradise account.

Click this link to reset your password:
${resetUrl}

IMPORTANT:
- This link will expire in 1 hour
- You can only use this link once
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

If you didn't request this password reset, someone may be trying to access your account.

---

© ${new Date().getFullYear()} House of Paradise. All rights reserved.
Secure | Verified | Global
  `.trim();
}

module.exports = {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generateWelcomeEmail,
  generateBookingConfirmationEmail,
  generateUnlockEmail,
  generateVerificationEmailText,
  generatePasswordResetEmailText,
  HOP_COLORS
};
