const crypto = require('crypto');

// UUID v4 replacement using Node.js crypto (built-in, no dependencies)
const generateUuid = () => {
  return crypto.randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

/**
 * ============================================================================
 * ENHANCED XSS PROTECTION - MODERN BEST PRACTICES
 * ============================================================================
 *
 * Implements advanced XSS protection beyond basic sanitization:
 * 1. CSP Nonce Generation (cryptographic random tokens)
 * 2. Lightweight HTML Sanitization (for JSON API)
 * 3. Secure Cookie Configuration (HttpOnly, Secure, SameSite)
 * 4. Context-Aware Output Encoding
 *
 * Note: This is optimized for a JSON API Gateway. DOMPurify is overkill
 * since we don't render HTML - we return JSON. For full HTML sanitization,
 * integrate DOMPurify in the frontend (React) where HTML is actually rendered.
 *
 * References:
 * - OWASP XSS Prevention Cheat Sheet
 * - Google CSP Evaluator Best Practices
 * - Modern browser security standards
 */

// ==================== CSP NONCE GENERATION ====================

/**
 * CSP Nonce Middleware
 *
 * Generates a cryptographically secure random nonce for each request.
 * This nonce is used in Content-Security-Policy header to whitelist
 * specific inline scripts while blocking all others.
 *
 * Benefits:
 * - Allows legitimate inline scripts with correct nonce
 * - Blocks injected XSS payloads that lack the nonce
 * - More secure than 'unsafe-inline' directive
 *
 * Usage in HTML:
 * <script nonce="<%= cspNonce %>">
 *   // Your legitimate inline script
 * </script>
 */
const generateCspNonce = (req, res, next) => {
  // Generate cryptographically secure random nonce (128-bit)
  const nonce = generateUuid().replace(/-/g, '');

  // Store nonce in res.locals for template access
  res.locals.cspNonce = nonce;

  // Store in request for middleware chain
  req.cspNonce = nonce;

  next();
};

/**
 * Strict CSP Configuration with Nonces
 *
 * This configuration replaces 'unsafe-inline' with nonce-based whitelisting,
 * providing much stronger XSS protection.
 */
const getStrictCspDirectives = (nonce) => ({
  defaultSrc: ["'self'"],

  // Scripts: Only allow scripts with correct nonce (no 'unsafe-inline')
  scriptSrc: [
    "'self'",
    `'nonce-${nonce}'`,
    // For React development (remove in production):
    process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null
  ].filter(Boolean),

  // Styles: Nonce-based for inline styles
  styleSrc: [
    "'self'",
    `'nonce-${nonce}'`,
    // Allow inline styles with hash (for CSS-in-JS libraries)
    "'unsafe-hashes'",
    "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='" // Empty style hash
  ],

  // Images: Allow self, data URIs, and HTTPS
  imgSrc: ["'self'", "data:", "https:"],

  // AJAX/WebSocket connections: Only to self
  connectSrc: ["'self'"],

  // Fonts: Only self-hosted
  fontSrc: ["'self'"],

  // Objects/Embeds: Blocked completely
  objectSrc: ["'none'"],

  // Media: Only self-hosted
  mediaSrc: ["'self'"],

  // Frames: Blocked completely (prevents clickjacking)
  frameSrc: ["'none'"],

  // Base URI: Only self (prevents base tag injection)
  baseUri: ["'self'"],

  // Form actions: Only self (prevents form hijacking)
  formAction: ["'self'"],

  // Frame ancestors: Only self (additional clickjacking protection)
  frameAncestors: ["'self'"],

  // Upgrade insecure requests (HTTP → HTTPS)
  upgradeInsecureRequests: [],

  // Block all mixed content
  blockAllMixedContent: []
});

// ==================== LIGHTWEIGHT HTML SANITIZATION ====================

/**
 * Lightweight HTML Sanitizer
 *
 * Simple regex-based HTML tag removal for JSON API.
 * For full HTML parsing, use DOMPurify in the frontend (React).
 *
 * This is sufficient for an API that returns JSON, where HTML
 * should generally not be present in user input.
 */
const sanitizeHtmlSimple = (input) => {
  if (typeof input !== 'string') return input;

  return input
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:[^"']*/gi, '')
    // Trim whitespace
    .trim();
};

/**
 * Sanitize HTML Content Middleware
 *
 * Automatically sanitizes potential HTML content in request body.
 * Lightweight approach suitable for JSON API.
 */
const sanitizeHtmlContent = (req, res, next) => {
  // Fields that may contain user text (customize based on your app)
  const textFields = ['description', 'bio', 'content', 'message', 'comment', 'name', 'title'];

  if (req.body) {
    textFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        const original = req.body[field];
        req.body[field] = sanitizeHtmlSimple(req.body[field]);

        // Log if content was modified
        if (req.body[field] !== original) {
          console.warn(`⚠️  Sanitized potential HTML in field '${field}' from ${req.ip}`);
        }
      }
    });
  }

  next();
};

/**
 * Utility: Sanitize HTML String
 *
 * Use this function to manually sanitize strings in your code.
 *
 * @param {string} dirty - Untrusted input
 * @returns {string} - Sanitized output
 */
const sanitizeHtml = (dirty) => {
  return sanitizeHtmlSimple(dirty);
};

// ==================== SECURE COOKIE CONFIGURATION ====================

/**
 * Secure Cookie Configuration
 *
 * Implements all three critical cookie security attributes:
 * 1. HttpOnly - Prevents JavaScript access (XSS protection)
 * 2. Secure - Only sent over HTTPS (MITM protection)
 * 3. SameSite - Prevents CSRF attacks
 */
const secureCookieConfig = {
  httpOnly: true,           // Prevent JavaScript access
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'strict',       // Strict CSRF protection
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined
};

/**
 * Secure Cookie Middleware
 *
 * Wraps res.cookie() to automatically apply security attributes
 * to all cookies set by the application.
 */
const applySecureCookies = (req, res, next) => {
  const originalCookie = res.cookie.bind(res);

  res.cookie = function(name, value, options = {}) {
    // Merge with secure defaults
    const secureOptions = {
      ...secureCookieConfig,
      ...options
    };

    // Log cookie creation in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🍪 Setting secure cookie: ${name} (HttpOnly: ${secureOptions.httpOnly}, Secure: ${secureOptions.secure}, SameSite: ${secureOptions.sameSite})`);
    }

    return originalCookie(name, value, secureOptions);
  };

  next();
};

// ==================== CONTEXT-AWARE OUTPUT ENCODING ====================

/**
 * Context-Aware Encoding Utilities
 *
 * Different contexts require different encoding strategies:
 * - HTML context: Encode <, >, &, ", '
 * - JavaScript context: Different encoding
 * - URL context: URL encoding
 * - CSS context: CSS escape sequences
 */

const encodingUtils = {
  /**
   * HTML Context Encoding
   * Encodes characters that have special meaning in HTML
   */
  encodeHtml: (str) => {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return String(str).replace(/[&<>"'\/]/g, (char) => htmlEntities[char]);
  },

  /**
   * JavaScript Context Encoding
   * Encodes for safe use within <script> tags or event handlers
   */
  encodeJavaScript: (str) => {
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\x3C')
      .replace(/>/g, '\\x3E');
  },

  /**
   * URL Context Encoding
   * Encodes for safe use in URLs
   */
  encodeUrl: (str) => {
    return encodeURIComponent(String(str));
  },

  /**
   * CSS Context Encoding
   * Encodes for safe use in CSS
   */
  encodeCss: (str) => {
    return String(str).replace(/[^a-zA-Z0-9]/g, (char) => {
      return '\\' + char.charCodeAt(0).toString(16).padStart(6, '0');
    });
  }
};

// ==================== XSS TESTING UTILITIES ====================

/**
 * XSS Test Payloads
 *
 * Common XSS attack vectors for testing your defenses.
 * Use these in your test suite to verify protection is working.
 */
const xssTestPayloads = [
  // Basic script injection
  '<script>alert("XSS")</script>',
  '<script>alert(String.fromCharCode(88,83,83))</script>',

  // Event handler injection
  '<img src=x onerror=alert("XSS")>',
  '<body onload=alert("XSS")>',
  '<svg onload=alert("XSS")>',

  // JavaScript: URL
  '<a href="javascript:alert(\'XSS\')">Click</a>',

  // Data: URL
  '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>',

  // Encoded attacks
  '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">',

  // Mutation XSS (mXSS)
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',

  // Template injection
  '{{constructor.constructor("alert(1)")()}}',

  // SQL + XSS combo
  "' OR 1=1--<script>alert('XSS')</script>"
];

/**
 * Test XSS Protection
 *
 * Utility function to test if a string contains potential XSS
 * (for testing purposes only)
 */
const containsXss = (input) => {
  const sanitized = sanitizeHtmlSimple(input);
  return input !== sanitized;
};

// ==================== EXPORTS ====================

module.exports = {
  // CSP Nonce
  generateCspNonce,
  getStrictCspDirectives,

  // HTML Sanitization
  sanitizeHtmlContent,
  sanitizeHtml,

  // Secure Cookies
  applySecureCookies,
  secureCookieConfig,

  // Encoding Utilities
  encodingUtils,

  // Testing
  xssTestPayloads,
  containsXss
};
