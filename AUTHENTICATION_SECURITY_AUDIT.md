# Authentication System Security Audit & Overhaul Plan

**Date:** December 10, 2025
**Application:** House of Paradise - Travel Booking Microservices
**Audit Performed By:** Comprehensive Security Analysis

---

## Executive Summary

This document contains a comprehensive security audit of the authentication system and a detailed implementation plan for overhauling it to meet modern security standards based on OWASP, NIST SP 800-63B, and industry best practices.

### Current State Assessment

**Strengths:**
- JWT-based authentication implemented
- TOTP-based 2FA with backup codes
- Email and phone verification flows
- Password strength validation
- Rate limiting infrastructure
- Secure headers with Helmet
- Recent fixes addressed critical issues (password reset expiration, 2FA response structure)

**Critical Vulnerabilities Found:**
1. **Weak cryptographic randomness** - Using Math.random() instead of crypto.randomBytes()
2. **Backup codes stored in plain text** - Database compromise exposes 2FA recovery
3. **Verification codes stored in plain text** - Email/phone codes not hashed
4. **No token revocation mechanism** - Logout doesn't invalidate tokens
5. **User enumeration possible** - Error messages and timing reveal account existence
6. **Insufficient rate limiting** - No per-account limits, allows distributed attacks
7. **Wide 2FA window** - TOTP window: 2 (±120s) instead of standard window: 1 (±30s)

---

## Part 1: Security Research Findings

### 1.1 Modern Authentication Standards (2025)

#### NIST SP 800-63B Guidelines
- **Password Requirements:**
  - Minimum 8 characters (12+ recommended)
  - Maximum 64+ characters minimum
  - NO forced composition rules (uppercase/numbers optional)
  - Check against breached password databases (Have I Been Pwned)
  - No forced expiration policies
  - Allow spaces and all printable characters

#### OWASP Authentication Best Practices
- **Account Enumeration Prevention:**
  - Consistent response times (prevent timing attacks)
  - Generic error messages
  - Same messaging whether account exists or not

- **Rate Limiting:**
  - Multi-layer approach: Per-IP + Per-Account + Global
  - Progressive delays after failures
  - Account lockout after 5-10 attempts (15-30 min temporary)

- **Session Management:**
  - Short-lived access tokens (15min-1hr)
  - Long-lived refresh tokens (30 days)
  - Token rotation on refresh
  - Secure revocation mechanism

#### Industry Best Practices (Auth0, Okta, AWS Cognito)
- **MFA Security:**
  - TOTP window: 1 (±30 seconds) standard
  - Backup codes hashed like passwords
  - Recovery flow via email
  - WebAuthn preferred over TOTP

- **Email Security:**
  - Email change requires verification of BOTH old and new
  - Notifications sent for all security events
  - Rate limit email-based operations separately

---

## Part 2: Current System Analysis

### 2.1 Critical Security Issues

#### Issue #1: Weak Cryptographic Randomness
**Location:** `auth-service/server.js` Lines 235-239, 247-254

**Current Code:**
```javascript
// Verification codes
function generateVerificationCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Backup codes
const code = Math.random().toString(36).substring(2, 10).toUpperCase();
```

**Risk:** Math.random() is NOT cryptographically secure. Predictable for attackers.

**Fix:**
```javascript
const crypto = require('crypto');

function generateVerificationCode() {
  // 6 characters from 36-char alphabet = ~31 bits entropy
  // Using crypto.randomBytes for security
  const buffer = crypto.randomBytes(4);
  const code = buffer.toString('base36').substring(0, 6).toUpperCase();
  return code;
}

function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // 8 characters hex = 32 bits entropy per code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}
```

#### Issue #2: Backup Codes Not Hashed
**Location:** `auth-service/server.js` Lines 1972-1976, 2124

**Current:** Backup codes stored in plain text array
**Risk:** Database breach exposes all backup codes, defeats 2FA

**Fix:**
```javascript
// Store backup codes hashed
async function storeBackupCodes(user, codes) {
  const hashedCodes = await Promise.all(
    codes.map(async code => ({
      hash: await bcrypt.hash(code, 10),
      used: false,
      createdAt: new Date()
    }))
  );
  user.backupCodes = hashedCodes;
  await user.save();
  return codes; // Return plain codes only once for user to save
}

// Verify backup code
async function verifyBackupCode(user, code) {
  for (let i = 0; i < user.backupCodes.length; i++) {
    const backupCode = user.backupCodes[i];
    if (backupCode.used) continue;

    const isValid = await bcrypt.compare(code, backupCode.hash);
    if (isValid) {
      user.backupCodes[i].used = true;
      user.backupCodes[i].usedAt = new Date();
      await user.save();

      // Notify user of backup code usage
      await sendSecurityAlert(user.email, 'backup_code_used');
      return true;
    }
  }
  return false;
}
```

#### Issue #3: Verification Codes Not Hashed
**Location:** `auth-service/server.js` Lines 725, 798

**Current:** Email verification codes stored plain text
**Risk:** Database leak exposes active verification codes

**Fix:**
```javascript
// Hash verification code before storage
const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

await VerificationCode.create({
  email: email,
  code: hashedCode, // Store hashed
  type: 'email_verification',
  expiresAt: new Date(Date.now() + 15 * 60 * 1000)
});

// Verify by hashing input and comparing
const hashedInput = crypto.createHash('sha256').update(inputCode.toUpperCase()).digest('hex');
const verification = await VerificationCode.findOne({
  email: email,
  code: hashedInput,
  type: 'email_verification',
  expiresAt: { $gt: new Date() }
});
```

#### Issue #4: No Token Revocation
**Current:** JWT stored in localStorage, logout only clears client-side
**Risk:** Stolen tokens valid for full 24 hours

**Fix:** Implement refresh token system with blacklist

```javascript
// Refresh token schema
const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  revoked: { type: Boolean, default: false }
});

// Token blacklist for logout
const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true }
});

// Auto-cleanup expired entries
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

#### Issue #5: User Enumeration Vulnerability
**Location:** Multiple endpoints

**Examples:**
- Registration: Returns "Email already registered" vs other errors
- Forgot password: Returns 404 for non-existent user vs 200
- 2FA login: Returns different messages for invalid user vs invalid code

**Fix:** Consistent generic messages and timing

```javascript
// BAD - Reveals user existence
if (!user) {
  return res.status(404).json({ error: "User not found" });
}

// GOOD - Generic message
const message = "If this email exists, you will receive a reset link";
if (!user) {
  await sleep(200); // Prevent timing attack
  return res.json({ message });
}
// ... send email
return res.json({ message }); // Same response
```

#### Issue #6: Insufficient Rate Limiting
**Current:** Only IP-based limiting (50 requests/15min)
**Issue:** Distributed attacks bypass, no account-level protection

**Fix:** Multi-layer rate limiting

```javascript
// Per-account failed login tracking
const failedLoginSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  attempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastAttempt: { type: Date, default: Date.now }
});

// Check account lockout
async function checkAccountLockout(email) {
  const record = await FailedLogin.findOne({ email });

  if (!record) return { locked: false };

  if (record.lockedUntil && record.lockedUntil > new Date()) {
    return {
      locked: true,
      remainingTime: Math.ceil((record.lockedUntil - new Date()) / 1000 / 60)
    };
  }

  return { locked: false };
}

// Record failed attempt
async function recordFailedAttempt(email) {
  const record = await FailedLogin.findOne({ email }) || new FailedLogin({ email });

  // Reset if last attempt was > 15 minutes ago
  if (record.lastAttempt < new Date(Date.now() - 15 * 60 * 1000)) {
    record.attempts = 0;
  }

  record.attempts++;
  record.lastAttempt = new Date();

  // Lock after 5 failed attempts for 15 minutes
  if (record.attempts >= 5) {
    record.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await sendSecurityAlert(email, 'account_locked');
  }

  await record.save();

  // Progressive delays
  const delays = [0, 1000, 2000, 5000, 10000];
  const delay = delays[Math.min(record.attempts - 1, delays.length - 1)];
  await sleep(delay);
}
```

#### Issue #7: Wide 2FA TOTP Window
**Location:** `auth-service/server.js` Line 1956, 2048

**Current:** `window: 2` means ±120 seconds (4 minutes total)
**Standard:** `window: 1` means ±30 seconds (1 minute total)

**Fix:**
```javascript
// Before
const verified = speakeasy.totp.verify({
  secret: user.temp2FASecret,
  encoding: 'base32',
  token: code,
  window: 2 // TOO WIDE
});

// After
const verified = speakeasy.totp.verify({
  secret: user.temp2FASecret,
  encoding: 'base32',
  token: code,
  window: 1 // Standard ±30 seconds
});
```

---

### 2.2 High Priority Issues

#### Issue #8: No Email Normalization
**Risk:** Duplicate accounts via email variations

**Fix:**
```javascript
function normalizeEmail(email) {
  const [localPart, domain] = email.toLowerCase().trim().split('@');

  // Gmail: Remove dots and plus-addressing
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanLocal = localPart.split('+')[0].replace(/\./g, '');
    return `${cleanLocal}@gmail.com`;
  }

  // Outlook: Remove plus-addressing only
  if (domain.endsWith('outlook.com') || domain.endsWith('hotmail.com')) {
    const cleanLocal = localPart.split('+')[0];
    return `${cleanLocal}@${domain}`;
  }

  return email.toLowerCase().trim();
}
```

#### Issue #9: No Compromised Password Checking
**Fix:** Integrate Have I Been Pwned API

```javascript
async function isPasswordCompromised(password) {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  try {
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      timeout: 3000
    });

    const hashes = response.data.split('\n');
    return hashes.some(line => line.startsWith(suffix));
  } catch (error) {
    // If API fails, don't block registration but log error
    console.error('HIBP API error:', error.message);
    return false;
  }
}
```

#### Issue #10: Email Change Flow Incomplete
**Current:** Only verifies current email
**Should:** Verify both old and new, notify both

**Enhanced Flow:**
1. User requests change (requires password)
2. Send code to CURRENT email → verify
3. Send confirmation link to NEW email → click
4. Change email
5. Send notification to OLD email (security alert)

---

### 2.3 Medium Priority Issues

#### Issue #11: No Audit Logging
**Fix:** Comprehensive security event logging

```javascript
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  action: {
    type: String,
    enum: [
      'register', 'login_success', 'login_failed', 'logout',
      'password_changed', 'password_reset_requested', 'password_reset_completed',
      'email_change_requested', 'email_changed',
      '2fa_enabled', '2fa_disabled', '2fa_backup_code_used',
      'account_locked', 'account_unlocked',
      'suspicious_activity_detected'
    ]
  },
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
});
```

#### Issue #12: No Session Management UI
Users should be able to:
- View active sessions (device, location, last activity)
- Revoke individual sessions
- See login history
- Logout all devices

#### Issue #13: Password History Limited
**Current:** Only tracks last 3 passwords
**Recommended:** Track last 5-10 passwords

---

## Part 3: Implementation Plan

### Phase 1: Critical Security Fixes (Priority P0)

**Estimated Time:** 4-6 hours

1. **Replace Math.random() with crypto.randomBytes()**
   - Update generateVerificationCode()
   - Update generateBackupCodes()
   - Update any other random generation

2. **Hash verification codes**
   - Update VerificationCode storage
   - Update verification logic
   - Hash email, phone, and 2FA verification codes

3. **Hash 2FA backup codes**
   - Update backup code generation
   - Update backup code verification
   - Add usage tracking and notifications

4. **Reduce TOTP window to 1**
   - Update all speakeasy.totp.verify() calls
   - Test 2FA with reduced window

5. **Prevent user enumeration**
   - Update error messages to be generic
   - Add consistent timing delays
   - Test with timing analysis

### Phase 2: Authentication Infrastructure (Priority P1)

**Estimated Time:** 8-10 hours

6. **Implement refresh token system**
   - Create RefreshToken model
   - Update login to return access + refresh tokens
   - Create /refresh endpoint
   - Implement token rotation

7. **Add token blacklist**
   - Create TokenBlacklist model
   - Update logout to blacklist tokens
   - Add middleware to check blacklist

8. **Implement per-account rate limiting**
   - Create FailedLogin model
   - Add account lockout logic
   - Add progressive delays
   - Send notifications on lockout

9. **Add email normalization**
   - Create normalizeEmail() function
   - Apply to registration, login, password reset
   - Update unique index on User.email

10. **Add compromised password checking**
    - Integrate HIBP API
    - Check on registration and password change
    - Add user-friendly error messages

### Phase 3: Enhanced Security Features (Priority P2)

**Estimated Time:** 6-8 hours

11. **Implement comprehensive audit logging**
    - Create AuditLog model
    - Add logging middleware
    - Log all security events
    - Set up monitoring queries

12. **Enhance email change flow**
    - Add new email verification step
    - Add notifications to both emails
    - Add confirmation before finalization

13. **Add security event notifications**
    - Password changed
    - Email changed
    - 2FA enabled/disabled
    - New device login
    - Account locked
    - Backup code used

14. **Implement session management**
    - Track active sessions with device info
    - Create session list endpoint
    - Create session revocation endpoint
    - Add "logout all devices" feature

### Phase 4: Frontend Improvements (Priority P2)

**Estimated Time:** 4-6 hours

15. **Improve error handling**
    - Consistent error display
    - User-friendly messages
    - No information leakage

16. **Add security indicators**
    - Password strength meter improvements
    - Compromised password warnings
    - Account security score

17. **Session management UI**
    - Active sessions page
    - Device/location information
    - Revoke session buttons

18. **Better 2FA UX**
    - Clear instructions
    - QR code with logo
    - Backup code download/print
    - Recovery flow

### Phase 5: Testing & Documentation (Priority P1)

**Estimated Time:** 8-10 hours

19. **Comprehensive testing**
    - Unit tests for security functions
    - Integration tests for auth flows
    - Security testing (enumeration, brute force, etc.)
    - UX testing for all scenarios

20. **Documentation**
    - Security architecture document
    - API documentation updates
    - User guides for 2FA, password reset, etc.
    - Admin security monitoring guide

---

## Part 4: Testing Strategy

### Security Testing Checklist

#### Registration Flow
- [ ] Test with valid email/password
- [ ] Test with existing email (no enumeration)
- [ ] Test with invalid email formats
- [ ] Test with weak passwords
- [ ] Test with compromised passwords
- [ ] Test rate limiting (registration spam)
- [ ] Test email verification expiration
- [ ] Test verification code brute force protection

#### Login Flow
- [ ] Test successful login
- [ ] Test wrong password (consistent timing)
- [ ] Test non-existent email (consistent timing)
- [ ] Test account lockout after 5 failures
- [ ] Test lockout expiration
- [ ] Test 2FA required flow
- [ ] Test 2FA with wrong code
- [ ] Test backup code usage
- [ ] Test IP-based rate limiting
- [ ] Test distributed attack from multiple IPs

#### Password Reset Flow
- [ ] Test with valid email
- [ ] Test with non-existent email (no enumeration)
- [ ] Test token expiration
- [ ] Test token reuse (should fail)
- [ ] Test token tampering
- [ ] Test password history enforcement
- [ ] Test compromised password rejection
- [ ] Test rate limiting

#### 2FA Flow
- [ ] Test QR code generation
- [ ] Test TOTP verification with correct code
- [ ] Test TOTP verification with expired code
- [ ] Test TOTP verification with wrong code
- [ ] Test backup code usage
- [ ] Test backup code reuse (should fail)
- [ ] Test 2FA disable with password
- [ ] Test 2FA rate limiting

#### Email Change Flow
- [ ] Test complete flow (current email verification)
- [ ] Test with wrong verification code
- [ ] Test with expired verification code
- [ ] Test notification to old email
- [ ] Test with email already in use

#### Security Testing
- [ ] Attempt SQL/NoSQL injection
- [ ] Attempt XSS attacks
- [ ] Attempt CSRF attacks
- [ ] Test timing attacks for user enumeration
- [ ] Test token forgery
- [ ] Test session fixation
- [ ] Test concurrent session limits
- [ ] Test privilege escalation attempts

---

## Part 5: Success Metrics

### Security Metrics
- **Zero** user enumeration vulnerabilities
- **Zero** weak cryptographic operations (Math.random)
- **100%** of sensitive tokens hashed in database
- **<100ms** difference in response times (prevent timing attacks)
- **5 attempts** max before account lockout
- **15 minutes** lockout duration
- **<1%** false positive rate on compromised password checks

### UX Metrics
- **<2 clicks** for most authentication operations
- **<30 seconds** to complete 2FA setup
- **Clear error messages** that don't leak information
- **Visual indicators** for account security status

---

## Part 6: Rollout Strategy

### Pre-Deployment
1. Test all changes in development environment
2. Run security penetration tests
3. Review code with security checklist
4. Backup production database

### Deployment
1. Deploy Phase 1 (critical fixes) first
2. Monitor for 24 hours
3. Deploy Phase 2 (infrastructure)
4. Monitor for 48 hours
5. Deploy Phase 3 & 4 together
6. Full security audit after deployment

### Post-Deployment
1. Monitor authentication metrics
2. Check for anomalies in logs
3. User feedback collection
4. Security incident response plan ready

---

## Conclusion

This authentication overhaul addresses **7 critical vulnerabilities**, **13 high-priority issues**, and **5 medium-priority improvements**. The implementation will bring the system up to modern security standards (OWASP, NIST SP 800-63B) while maintaining good user experience.

**Total Estimated Time:** 30-40 hours for complete implementation and testing

**Risk Mitigation:** Phased rollout with monitoring at each stage ensures stability while improving security.

**Next Steps:** Begin Phase 1 implementation immediately, focusing on critical security fixes that can be deployed independently.
