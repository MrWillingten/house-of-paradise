/**
 * Email Templates - Redesigned to Match App Design System
 * Clean, modern templates with emerald green color scheme
 */

/**
 * Generate verification email HTML
 * @param {string} code - 6-character verification code
 * @param {string} type - 'email_verification' or 'password_reset'
 * @param {string} userName - User's name (optional)
 * @returns {string} HTML email content
 */
function generateVerificationEmailHTML(code, type, userName = 'User') {
  const isPasswordReset = type === 'password_reset';
  const title = isPasswordReset ? 'Reset Your Password' : 'Verify Your Email';
  const heading = isPasswordReset ? 'Password Reset Request' : 'Verify Your Email';
  const message = isPasswordReset
    ? 'We received a request to reset your password. Use the verification code below to complete the process.'
    : 'Welcome! To complete your registration and secure your account, please verify your email address using the code below.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
            padding: 40px 20px;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 48px 40px;
            text-align: center;
            position: relative;
        }

        .icon-container {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .icon-svg {
            width: 40px;
            height: 40px;
            color: white;
        }

        .header-title {
            color: white;
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 12px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.5px;
        }

        .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            padding: 10px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            color: #065f46;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            border: 2px solid rgba(16, 185, 129, 0.4);
            margin-top: 8px;
        }

        .shield-icon {
            width: 18px;
            height: 18px;
        }

        .content {
            padding: 48px 40px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
        }

        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
            font-weight: 500;
        }

        .code-container {
            background: white;
            border: 3px solid #10b981;
            border-radius: 16px;
            padding: 40px 32px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        .code-label {
            font-size: 13px;
            font-weight: 700;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 20px;
        }

        .verification-code {
            font-size: 56px;
            font-weight: 800;
            color: #10b981;
            letter-spacing: 12px;
            font-family: 'Courier New', 'Courier', monospace;
            margin: 20px 0;
            user-select: all;
            -webkit-user-select: all;
            -moz-user-select: all;
            text-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
            padding: 20px;
            border-radius: 12px;
        }

        .code-hint {
            font-size: 14px;
            color: #6b7280;
            margin-top: 16px;
            font-weight: 500;
        }

        .expiry-notice {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #fbbf24;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 32px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .warning-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .expiry-notice p {
            font-size: 14px;
            color: #92400e;
            margin: 0;
            font-weight: 600;
        }

        .security-tips {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 28px;
            margin-top: 32px;
        }

        .security-tips-header {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
        }

        .lock-icon {
            width: 20px;
            height: 20px;
        }

        .security-tips ul {
            margin: 0;
            padding-left: 24px;
            color: #4b5563;
            font-size: 14px;
            font-weight: 500;
        }

        .security-tips li {
            margin-bottom: 10px;
            line-height: 1.6;
        }

        .footer {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
            line-height: 1.6;
            font-weight: 500;
        }

        .footer-links {
            margin: 20px 0;
        }

        .footer-link {
            color: #10b981;
            text-decoration: none;
            font-size: 14px;
            margin: 0 12px;
            font-weight: 600;
            border-bottom: 2px solid transparent;
            transition: border-color 0.2s ease;
        }

        .divider {
            color: #d1d5db;
            margin: 0 8px;
            font-weight: 400;
        }

        .trust-badges {
            margin-top: 28px;
            padding-top: 28px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
        }

        .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-icon {
            width: 14px;
            height: 14px;
        }

        .copyright {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 24px;
            font-weight: 500;
        }

        @media only screen and (max-width: 600px) {
            body {
                padding: 20px 10px;
            }

            .content {
                padding: 32px 24px;
            }

            .header {
                padding: 36px 24px;
            }

            .header-title {
                font-size: 26px;
            }

            .greeting {
                font-size: 20px;
            }

            .message {
                font-size: 15px;
            }

            .verification-code {
                font-size: 42px;
                letter-spacing: 8px;
            }

            .footer {
                padding: 32px 24px;
            }

            .footer-link {
                display: block;
                margin: 12px 0;
            }

            .divider {
                display: none;
            }

            .trust-badges {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="icon-container">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    ${isPasswordReset
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>'
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>'
                    }
                </svg>
            </div>
            <h1 class="header-title">${heading}</h1>
            <div class="security-badge">
                <svg class="shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span>Secure Verification</span>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hello ${userName},</h2>
            <p class="message">${message}</p>

            <!-- Verification Code Box -->
            <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">${code}</div>
                <div class="code-hint">Click to select and copy</div>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>This code will expire in 15 minutes. Please use it soon to ${isPasswordReset ? 'reset your password' : 'verify your account'}.</p>
            </div>

            <!-- Security Tips -->
            <div class="security-tips">
                <div class="security-tips-header">
                    <svg class="lock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span>Security Tips</span>
                </div>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or email</li>
                    <li>If you didn't request this code, please ignore this email</li>
                    <li>Your account security is important to us</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                ${isPasswordReset
                    ? 'Once you reset your password, you can continue securely accessing your account.'
                    : 'After verification, you\'ll have full access to all features and services.'
                }
            </p>

            <div class="footer-links">
                <a href="#" class="footer-link">Help Center</a>
                <span class="divider">•</span>
                <a href="#" class="footer-link">Contact Support</a>
                <span class="divider">•</span>
                <a href="#" class="footer-link">Privacy Policy</a>
            </div>

            <div class="trust-badges">
                <div class="trust-badge">
                    <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span>Secure</span>
                </div>
                <div class="trust-badge">
                    <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Verified</span>
                </div>
                <div class="trust-badge">
                    <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span>Fast</span>
                </div>
            </div>

            <p class="copyright">
                © ${new Date().getFullYear()} All rights reserved.<br>
                This email was sent because you requested ${isPasswordReset ? 'a password reset' : 'account verification'}.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of verification email
 * @param {string} code - 6-character verification code
 * @param {string} type - 'email_verification' or 'password_reset'
 * @param {string} userName - User's name (optional)
 * @returns {string} Plain text email content
 */
function generateVerificationEmailText(code, type, userName = 'User') {
  const isPasswordReset = type === 'password_reset';
  const title = isPasswordReset ? 'PASSWORD RESET REQUEST' : 'EMAIL VERIFICATION';
  const message = isPasswordReset
    ? 'We received a request to reset your password. Use the verification code below to complete the process.'
    : 'Welcome! To complete your registration and secure your account, please verify your email address using the code below.';

  return `
${title}
=========================================

Hello ${userName},

${message}

YOUR VERIFICATION CODE:
-----------------------
${code}
-----------------------

IMPORTANT: This code will expire in 15 minutes.

SECURITY TIPS:
- Never share this code with anyone
- We will never ask for this code via phone or email
- If you didn't request this code, please ignore this email
- Your account security is important to us

${isPasswordReset
  ? 'Once you reset your password, you can continue securely accessing your account.'
  : 'After verification, you\'ll have full access to all features and services.'
}

Need help? Contact our support team.

© ${new Date().getFullYear()} All rights reserved.
This email was sent because you requested ${isPasswordReset ? 'a password reset' : 'account verification'}.

SECURE | VERIFIED | FAST
  `.trim();
}

module.exports = {
  generateVerificationEmailHTML,
  generateVerificationEmailText
};
