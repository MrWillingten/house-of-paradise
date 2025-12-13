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

// ==================== LAYER 1: UX-FRIENDLY RATE LIMITING ====================

// Global limiter - generous for normal users, blocks attacks
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 300, // Max 300 requests per minute per IP (was 100) - allows smooth browsing
  message: {
    success: false,
    error: 'You\'re browsing too quickly! Please wait a moment and try again.',
    retryAfter: 60 // Tell user when they can retry
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for health checks and authenticated users
    return req.path === '/health' || req.headers.authorization;
  },
  // Custom handler for better UX
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'You\'re browsing too quickly! Please wait a moment and try again.',
      retryAfter: 60,
      tip: 'Try refreshing in a minute or logging in for unlimited access.'
    });
  }
});

// Burst protection - allows normal clicking, blocks bots
const burstLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 second window
  max: 50, // Max 50 requests per 10 seconds (was 20) - allows rapid browsing
  message: {
    success: false,
    error: 'Slow down! You\'re clicking too fast.',
    retryAfter: 10
  },
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: true, // Don't penalize failed requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Slow down! You\'re clicking too fast.',
      retryAfter: 10,
      tip: 'Wait a few seconds before trying again.'
    });
  }
});

// Auth endpoint protection (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts per 15 minutes (increased for testing/development)
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public browsing limiter - VERY generous for normal users
const browseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute (was 120) - ultra-generous for smooth UX
  message: {
    success: false,
    error: 'You\'re browsing very actively! Take a quick break.',
    retryAfter: 60
  },
  skip: (req) => {
    // No limit for authenticated users
    return !!req.headers.authorization;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'You\'re browsing very actively! Take a quick break.',
      retryAfter: 60,
      tip: 'Log in for unlimited browsing, or wait a minute.'
    });
  }
});

// Payment protection (prevents payment spam)
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 payment requests per minute
  message: {
    success: false,
    error: 'Payment rate limit exceeded. Please wait before retrying.'
  }
});

// ==================== LAYER 2: SLOWDOWN MIDDLEWARE ====================

const slowDown = require('express-slow-down');

// Gradually slow down ONLY suspicious behavior (errors, failures)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1000, // Allow 1000 requests per 15 min at full speed (was 200) - VERY generous
  delayMs: (used, req) => {
    const delayAfter = 1000;
    return (used - delayAfter) * 25; // Each extra request adds 25ms delay (was 50ms)
  },
  maxDelayMs: 2000, // Max 2 second delay (was 3s)

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
      'https://travel-booking-microservices.vercel.app',
      'https://hop-api-gateway.onrender.com',
      'https://houseofparadise.com',
      'https://www.houseofparadise.com',
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
