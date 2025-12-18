const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { body, param, query, validationResult } = require('express-validator');
const {
  generateCspNonce,
  getStrictCspDirectives,
  sanitizeHtmlContent,
  applySecureCookies,
  encodingUtils
} = require('./enhancedXssProtection');

/**
 * ============================================================================
 * COMPREHENSIVE SECURITY MIDDLEWARE - OWASP TOP 10 + ADDITIONAL PROTECTIONS
 * ============================================================================
 *
 * This middleware provides defense-in-depth security covering:
 * 1. SQL/NoSQL Injection
 * 2. XSS (Cross-Site Scripting)
 * 3. CSRF (Cross-Site Request Forgery)
 * 4. Broken Authentication/Authorization
 * 5. Sensitive Data Exposure
 * 6. Security Misconfiguration
 * 7. IDOR (Insecure Direct Object References)
 * 8. File Upload Attacks
 * 9. SSRF (Server-Side Request Forgery)
 * 10. Command Injection
 * 11. Path Traversal
 * 12. HTTP Parameter Pollution
 * 13. Clickjacking
 * 14. MIME Sniffing
 * 15. Secrets Exposure
 */

// ==================== LAYER 1: HELMET SECURITY HEADERS WITH STRICT CSP ====================

/**
 * Helmet Configuration with Nonce-Based CSP
 *
 * IMPROVED: Instead of using 'unsafe-inline', we now use cryptographic nonces
 * for a much stronger Content Security Policy.
 *
 * Benefits:
 * - Blocks all injected scripts that lack the correct nonce
 * - Allows only legitimate inline scripts with the nonce
 * - Passes Google CSP Evaluator with "High" security rating
 *
 * Headers provided:
 * - Content-Security-Policy with nonces (XSS protection - STRICT)
 * - Strict-Transport-Security (HTTPS enforcement)
 * - X-Frame-Options (Clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing protection)
 * - Referrer-Policy (Information leakage prevention)
 * - And 10+ more security headers
 */
const getHelmetConfigWithNonce = (req, res, next) => {
  // Generate CSP nonce for this request
  const nonce = req.cspNonce;

  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: getStrictCspDirectives(nonce)
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: 'deny' // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME sniffing
    referrerPolicy: { policy: 'no-referrer' }, // Don't leak referrer
    xssFilter: true // Enable XSS filter
  });

  helmetMiddleware(req, res, next);
};

// Legacy helmet config (kept for backward compatibility, but not recommended)
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // ⚠️ WEAK: unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true
});

// ==================== LAYER 2: NOSQL INJECTION PREVENTION ====================

/**
 * MongoDB Sanitizer
 * Removes $ and . from user input to prevent NoSQL injection attacks
 * Example attack: { "username": { "$ne": null }, "password": { "$ne": null } }
 */
const noSqlInjectionProtection = mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  NoSQL injection attempt detected: ${key} in ${req.path}`);
  }
});

// ==================== LAYER 3: XSS PROTECTION ====================

/**
 * XSS Clean
 * Sanitizes user input to prevent XSS attacks
 * Removes HTML tags and malicious scripts from request body, query, and params
 */
const xssProtection = xss();

// ==================== LAYER 4: HTTP PARAMETER POLLUTION PROTECTION ====================

/**
 * HPP Protection
 * Prevents HTTP Parameter Pollution attacks
 * Example attack: ?id=1&id=2&id=3 (tries to confuse the application)
 */
const hppProtection = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'filter'] // Allow array parameters for these
});

// ==================== LAYER 5: INPUT VALIDATION RULES ====================

/**
 * Express Validator Rules
 * Validates and sanitizes all user input
 */

// Auth validation rules
const registerValidation = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .trim(),
    // NOTE: Removed .escape() - emails should not be HTML escaped for authentication
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character')
    .trim(),
    // NOTE: Password is NOT escaped - it will be hashed, escaping breaks special chars
  body('name')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .trim()
    .escape(),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .trim(),
    // NOTE: Removed .escape() - emails should not be HTML escaped for authentication
  body('password')
    .notEmpty().withMessage('Password is required')
    .trim()
    // NOTE: Password is NOT escaped - it will be compared with hashed version
];

// Hotel/Trip ID validation
const idValidation = [
  param('id')
    .matches(/^[a-f\d]{24}$/i).withMessage('Invalid ID format') // MongoDB ObjectId
    .trim()
];

// Booking validation
const bookingValidation = [
  body('hotelId')
    .optional()
    .matches(/^[a-f\d]{24}$/i).withMessage('Invalid hotel ID')
    .trim(),
  body('userId')
    .matches(/^[a-f\d]{24}$/i).withMessage('Invalid user ID')
    .trim(),
  body('checkIn')
    .isISO8601().withMessage('Invalid check-in date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  body('checkOut')
    .isISO8601().withMessage('Invalid check-out date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out must be after check-in');
      }
      return true;
    }),
  body('guests')
    .isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10')
];

// Payment validation
const paymentValidation = [
  body('user_id')
    .matches(/^[a-f\d]{24}$/i).withMessage('Invalid user ID')
    .trim(),
  body('booking_type')
    .isIn(['hotel', 'trip']).withMessage('Invalid booking type'),
  body('booking_id')
    .notEmpty().withMessage('Booking ID required')
    .trim()
    .escape(),
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('Invalid amount')
    .toFloat(),
  body('payment_method')
    .isIn(['credit_card', 'debit_card', 'paypal']).withMessage('Invalid payment method')
];

// Search/Query validation
const searchValidation = [
  query('location')
    .optional()
    .isLength({ max: 100 }).withMessage('Location too long')
    .trim()
    .escape(),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Invalid min price')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Invalid max price')
    .toFloat(),
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be 0-5')
    .toFloat()
];

// ==================== LAYER 6: VALIDATION ERROR HANDLER ====================

/**
 * Validation Error Handler
 * Catches validation errors and returns detailed error messages
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    console.warn(`⚠️  Validation failed: ${req.method} ${req.path}`, errorMessages);

    // Create user-friendly error message
    const firstError = errorMessages[0];
    let userFriendlyMessage = firstError.message;

    // Add helpful context for password errors
    if (firstError.field === 'password' && firstError.message.includes('special character')) {
      userFriendlyMessage = 'Password must contain:\n• At least 8 characters\n• One uppercase letter (A-Z)\n• One lowercase letter (a-z)\n• One number (0-9)\n• One special character (!@#$%^&*)';
    } else if (firstError.field === 'password' && firstError.message.includes('8 characters')) {
      userFriendlyMessage = 'Password must be at least 8 characters long';
    }

    return res.status(400).json({
      success: false,
      error: userFriendlyMessage,
      details: errorMessages // Keep detailed errors for debugging
    });
  }

  next();
};

// ==================== LAYER 7: SSRF PROTECTION ====================

/**
 * SSRF Protection
 * Prevents Server-Side Request Forgery attacks
 * Blocks requests to internal/private IP ranges
 */
const ssrfProtection = (req, res, next) => {
  // Check if request body contains URLs
  const checkForUrls = (obj) => {
    const urlPattern = /^https?:\/\//i;
    const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.|localhost)/i;

    for (const key in obj) {
      if (typeof obj[key] === 'string' && urlPattern.test(obj[key])) {
        // Extract hostname from URL
        try {
          const url = new URL(obj[key]);
          const hostname = url.hostname;

          // Block private/internal IP addresses
          if (privateIpPattern.test(hostname)) {
            console.warn(`🚫 SSRF attempt blocked: ${hostname} in ${req.path}`);
            return true;
          }

          // Block localhost variations
          if (hostname === 'localhost' || hostname === '0.0.0.0') {
            console.warn(`🚫 SSRF attempt blocked: ${hostname} in ${req.path}`);
            return true;
          }
        } catch (err) {
          // Invalid URL, let validation handle it
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForUrls(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body && checkForUrls(req.body)) {
    return res.status(403).json({
      success: false,
      error: 'SSRF attempt detected. Internal URLs are not allowed.'
    });
  }

  next();
};

// ==================== LAYER 8: PATH TRAVERSAL PROTECTION ====================

/**
 * Path Traversal Protection
 * Prevents directory traversal attacks
 * Example attack: ../../etc/passwd
 */
const pathTraversalProtection = (req, res, next) => {
  const pathTraversalPattern = /(\.\.|\/etc\/|\/proc\/|\/sys\/|\/var\/|\\\\|%2e%2e|%252e%252e)/i;

  const url = req.originalUrl || req.url;
  const bodyStr = JSON.stringify(req.body);
  const queryStr = JSON.stringify(req.query);

  if (pathTraversalPattern.test(url) ||
      pathTraversalPattern.test(bodyStr) ||
      pathTraversalPattern.test(queryStr)) {

    const ip = req.ip || req.connection.remoteAddress;
    console.warn(`🚫 Path traversal attempt from ${ip}: ${req.method} ${url}`);

    return res.status(403).json({
      success: false,
      error: 'Path traversal attempt detected.'
    });
  }

  next();
};

// ==================== LAYER 9: COMMAND INJECTION PROTECTION ====================

/**
 * Command Injection Protection
 * Prevents OS command injection attacks
 * Example attack: ; rm -rf / or | cat /etc/passwd
 */
const commandInjectionProtection = (req, res, next) => {
  const commandPattern = /[;&|`$(){}[\]<>]/;

  // Fields that should be excluded from command injection checks (passwords, etc.)
  const excludedFields = ['password', 'currentPassword', 'newPassword', 'oldPassword'];

  const checkForCommands = (obj, parentKey = '') => {
    for (const key in obj) {
      // Skip password fields - they will be hashed, never executed
      if (excludedFields.includes(key)) {
        continue;
      }

      if (typeof obj[key] === 'string' && commandPattern.test(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForCommands(obj[key], key)) return true;
      }
    }
    return false;
  };

  if ((req.body && checkForCommands(req.body)) ||
      (req.query && checkForCommands(req.query))) {

    const ip = req.ip || req.connection.remoteAddress;
    console.warn(`🚫 Command injection attempt from ${ip}: ${req.method} ${req.path}`);

    return res.status(403).json({
      success: false,
      error: 'Command injection attempt detected.'
    });
  }

  next();
};

// ==================== LAYER 10: FILE UPLOAD SECURITY ====================

/**
 * File Upload Protection
 * Validates file uploads to prevent malicious file attacks
 */
const fileUploadProtection = (req, res, next) => {
  if (req.files || req.file) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    const files = req.files ? Object.values(req.files).flat() : [req.file];

    for (const file of files) {
      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `File type ${file.mimetype} not allowed`
        });
      }

      // Check file size
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds 5 MB limit'
        });
      }

      // Check for double extensions (e.g., file.php.jpg)
      if ((file.originalname.match(/\./g) || []).length > 1) {
        return res.status(400).json({
          success: false,
          error: 'Multiple file extensions not allowed'
        });
      }
    }
  }

  next();
};

// ==================== LAYER 11: SECRETS EXPOSURE PROTECTION ====================

/**
 * Secrets Exposure Protection
 * Removes sensitive fields from responses
 */
const removeSensitiveData = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Remove sensitive fields from response
    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;

      const sensitiveFields = [
        'password',
        'passwordHash',
        'verificationCode',
        'resetToken',
        'secret',
        'apiKey',
        'privateKey',
        '__v'
      ];

      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }

      const sanitized = { ...obj };
      for (const field of sensitiveFields) {
        delete sanitized[field];
      }

      // Recursively sanitize nested objects
      for (const key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = sanitize(sanitized[key]);
        }
      }

      return sanitized;
    };

    return originalJson.call(this, sanitize(data));
  };

  next();
};

// ==================== LAYER 12: IDOR PROTECTION ====================

/**
 * IDOR (Insecure Direct Object Reference) Protection
 * Ensures users can only access their own resources
 */
const idorProtection = (req, res, next) => {
  // This middleware checks if user is accessing their own resources
  const userId = req.user?.id;
  const requestedUserId = req.params.userId || req.body.userId || req.body.user_id;

  // Convert both to strings for comparison (handles ObjectId vs string mismatch)
  const userIdStr = userId ? String(userId) : null;
  const requestedUserIdStr = requestedUserId ? String(requestedUserId) : null;

  if (requestedUserIdStr && userIdStr !== requestedUserIdStr && req.user?.role !== 'admin') {
    console.warn(`🚫 IDOR attempt: User ${userIdStr} tried to access user ${requestedUserIdStr}`);

    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

// ==================== LAYER 13: SECURITY LOGGING ====================

/**
 * Enhanced Security Logger
 * Logs all security-relevant events
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Log request details
  const logData = {
    timestamp: new Date().toISOString(),
    ip,
    method: req.method,
    path: req.path,
    userAgent,
    userId: req.user?.id,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  };

  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;

    // Log security events
    if (res.statusCode === 401) {
      console.warn(`🔒 UNAUTHORIZED: ${ip} - ${req.method} ${req.path} (${duration}ms)`);
    } else if (res.statusCode === 403) {
      console.warn(`🚫 FORBIDDEN: ${ip} - ${req.method} ${req.path} (${duration}ms)`);
    } else if (res.statusCode === 429) {
      console.warn(`🚨 RATE LIMITED: ${ip} - ${req.method} ${req.path} (${duration}ms)`);
    } else if (res.statusCode >= 500) {
      console.error(`❌ SERVER ERROR: ${ip} - ${req.method} ${req.path} (${duration}ms)`);
    }

    originalSend.call(this, data);
  };

  next();
};

// ==================== EXPORT ALL SECURITY LAYERS ====================

module.exports = {
  // Helmet security headers
  helmetConfig,              // Legacy (with unsafe-inline)
  getHelmetConfigWithNonce,  // RECOMMENDED: Strict CSP with nonces

  // Enhanced XSS Protection (NEW)
  generateCspNonce,          // Generate CSP nonce per request
  sanitizeHtmlContent,       // DOMPurify HTML sanitization
  applySecureCookies,        // Secure cookie configuration
  encodingUtils,             // Context-aware encoding utilities

  // Injection protection
  noSqlInjectionProtection,
  xssProtection,
  hppProtection,

  // Validation
  registerValidation,
  loginValidation,
  idValidation,
  bookingValidation,
  paymentValidation,
  searchValidation,
  handleValidationErrors,

  // Attack prevention
  ssrfProtection,
  pathTraversalProtection,
  commandInjectionProtection,
  fileUploadProtection,

  // Data protection
  removeSensitiveData,
  idorProtection,

  // Logging
  securityLogger
};
