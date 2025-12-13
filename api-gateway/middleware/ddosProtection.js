const rateLimit = require('express-rate-limit');

/**
 * Multi-Layer DDoS Protection System
 *
 * Implements multiple defense layers:
 * 1. Aggressive rate limiting per IP
 * 2. Slowdown middleware for suspicious activity
 * 3. Request size limits
 * 4. Connection throttling
 * 5. Pattern-based attack detection
 */

// ==================== LAYER 1: VERY LENIENT RATE LIMITING ====================
// Configured for smooth user experience - only blocks obvious attacks

// Global limiter - VERY generous for normal users
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // 1000 requests per minute - extremely generous
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for health checks and authenticated users
    return req.path === '/health' || req.headers.authorization;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment.',
      retryAfter: 60
    });
  }
});

// Burst protection - VERY lenient
const burstLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 second window
  max: 200, // 200 requests per 10 seconds - allows very rapid clicking
  message: {
    success: false,
    error: 'Slow down a bit!',
    retryAfter: 10
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Slow down a bit!',
      retryAfter: 10
    });
  }
});

// Auth endpoint protection - more lenient for testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public browsing limiter - essentially unlimited for normal use
const browseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // 2000 requests per minute - practically unlimited
  message: {
    success: false,
    error: 'Too many requests.',
    retryAfter: 60
  },
  skip: (req) => {
    // No limit for authenticated users
    return !!req.headers.authorization;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests.',
      retryAfter: 60
    });
  }
});

// Payment protection - slightly more lenient
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 payment requests per minute
  message: {
    success: false,
    error: 'Payment rate limit exceeded. Please wait before retrying.'
  }
});

// ==================== LAYER 2: SLOWDOWN MIDDLEWARE ====================

const slowDown = require('express-slow-down');

// Gradually slow down ONLY after extreme usage - very lenient
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5000, // Allow 5000 requests per 15 min at full speed - extremely generous
  delayMs: (used, req) => {
    const delayAfter = 5000;
    return (used - delayAfter) * 10; // Each extra request adds only 10ms delay
  },
  maxDelayMs: 1000, // Max 1 second delay

  // CRITICAL: Only slow down failed requests, NEVER successful browsing
  skipSuccessfulRequests: true, // Don't penalize normal browsing
  skipFailedRequests: false, // Slow down suspicious failed requests

  // Skip for authenticated users entirely
  skip: (req) => !!req.headers.authorization
});

// ==================== LAYER 3: REQUEST SIZE LIMITS ====================

const requestSizeLimit = (req, res, next) => {
  // Limit request body size to prevent memory exhaustion
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10 MB max

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request body too large. Maximum 10 MB allowed.'
    });
  }

  next();
};

// ==================== LAYER 4: SUSPICIOUS PATTERN DETECTION ====================

// Track suspicious IPs
const suspiciousIPs = new Map();
const bannedIPs = new Set();

// Clean up old records every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.lastSeen > 30 * 60 * 1000) {
      suspiciousIPs.delete(ip);
    }
  }
}, 30 * 60 * 1000);

const suspiciousActivityDetector = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const cleanIP = ip.replace(/^::ffff:/, '');

  // Whitelist localhost and private IPs (development)
  const isLocalhost = (
    cleanIP === '127.0.0.1' ||
    cleanIP === 'localhost' ||
    cleanIP === '::1' ||
    cleanIP.startsWith('192.168.') ||
    cleanIP.startsWith('10.') ||
    cleanIP.startsWith('172.1') || // 172.16-31.x.x
    cleanIP.startsWith('172.2') ||
    cleanIP.startsWith('172.3')
  );

  // Skip all checks for local IPs
  if (isLocalhost) {
    return next();
  }

  // Check if IP is banned
  if (bannedIPs.has(ip)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Your IP has been temporarily blocked due to suspicious activity.'
    });
  }

  // Track request patterns
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, {
      requests: 0,
      errors: 0,
      lastSeen: Date.now(),
      patterns: []
    });
  }

  const ipData = suspiciousIPs.get(ip);
  ipData.requests++;
  ipData.lastSeen = Date.now();

  // Detect attack patterns
  const suspiciousPatterns = [
    // SQL injection attempts
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    // XSS attempts
    /<script|javascript:|onerror=|onload=/i,
    // Path traversal
    /\.\.\//,
    // Command injection
    /;|\||&|\$\(/,
  ];

  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      ipData.errors++;
      ipData.patterns.push({ pattern: pattern.toString(), time: Date.now() });

      // Ban IP after 10 suspicious requests (was 5) - more forgiving
      if (ipData.errors >= 10) {
        bannedIPs.add(ip);
        console.warn(`🚫 BANNED IP ${ip} - Suspicious activity detected (${ipData.errors} attempts)`);

        // Auto-unban after 30 minutes (was 1 hour) - shorter ban for better UX
        setTimeout(() => {
          bannedIPs.delete(ip);
          suspiciousIPs.delete(ip); // Also clear the suspicious record
          console.log(`✅ UNBANNED IP ${ip} - Temporary ban expired`);
        }, 30 * 60 * 1000);

        return res.status(403).json({
          success: false,
          error: 'Your IP has been temporarily blocked due to suspicious activity.',
          retryAfter: 1800, // 30 minutes in seconds
          tip: 'If you believe this is a mistake, please contact support or try again in 30 minutes.'
        });
      }

      console.warn(`⚠️  Suspicious request from ${ip}: ${pattern.toString()}`);
    }
  }

  next();
};

// ==================== LAYER 5: CONNECTION LIMITS ====================

// Prevent too many concurrent connections from same IP
const connectionLimiter = (() => {
  const connections = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const current = connections.get(ip) || 0;

    // Max 50 concurrent connections per IP
    if (current >= 50) {
      return res.status(429).json({
        success: false,
        error: 'Too many concurrent connections from your IP.'
      });
    }

    connections.set(ip, current + 1);

    // Cleanup on response finish
    res.on('finish', () => {
      const count = connections.get(ip);
      if (count <= 1) {
        connections.delete(ip);
      } else {
        connections.set(ip, count - 1);
      }
    });

    next();
  };
})();

// ==================== LAYER 6: REQUEST VALIDATION ====================

const requestValidator = (req, res, next) => {
  // Validate essential headers
  const userAgent = req.headers['user-agent'];
  const host = req.headers['host'];

  // Block requests with no user-agent (likely bots)
  if (!userAgent || userAgent.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request headers.'
    });
  }

  // Block requests with suspicious/missing host header
  if (!host) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request.'
    });
  }

  next();
};

// ==================== LAYER 7: CORS PROTECTION ====================

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // Remove trailing slash for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Whitelist of allowed origins (update for production)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:8082',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8082',
      // Production domains
      'https://house-of-paradise.vercel.app',
      'https://hop-api-gateway.onrender.com',
    ];

    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      // Log suspicious origin
      console.warn(`⚠️  Blocked CORS request from: ${origin}`);
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
};

// ==================== MONITORING & LOGGING ====================

// Log attack attempts
const securityLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const originalSend = res.send;

  res.send = function(data) {
    // Log if rate limited
    if (res.statusCode === 429) {
      console.warn(`🚨 RATE LIMITED: ${ip} - ${req.method} ${req.path}`);
    }
    // Log if forbidden
    else if (res.statusCode === 403) {
      console.warn(`🚫 FORBIDDEN: ${ip} - ${req.method} ${req.path}`);
    }

    originalSend.call(this, data);
  };

  next();
};

// ==================== EXPORT ALL PROTECTION LAYERS ====================

module.exports = {
  // Rate limiters
  globalLimiter,
  burstLimiter,
  authLimiter,
  browseLimiter,
  paymentLimiter,

  // Additional protection
  speedLimiter,
  requestSizeLimit,
  suspiciousActivityDetector,
  connectionLimiter,
  requestValidator,
  corsOptions,
  securityLogger,

  // Utility functions
  getBannedIPs: () => Array.from(bannedIPs),
  getSuspiciousIPs: () => Array.from(suspiciousIPs.entries()),
  unbanIP: (ip) => {
    bannedIPs.delete(ip);
    suspiciousIPs.delete(ip);
    console.log(`✅ Manually unbanned IP: ${ip}`);
  }
};
