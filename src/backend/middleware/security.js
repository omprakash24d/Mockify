const logger = require("../config/logger");
const {
  AuthenticationError,
  AuthorizationError,
} = require("../errors/CustomErrors");

/**
 * Security middleware to protect sensitive information and prevent attacks
 */

/**
 * Rate limiting with custom error responses
 */
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require("express-rate-limit");

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        statusCode: 429,
        errorCode: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      logger.logSecurityEvent(
        "rate_limit_exceeded",
        {
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          url: req.originalUrl,
          method: req.method,
        },
        "medium"
      );

      res.status(429).json({
        success: false,
        error: {
          message,
          statusCode: 429,
          errorCode: "RATE_LIMIT_EXCEEDED",
          timestamp: new Date().toISOString(),
        },
      });
    },
  });
};

/**
 * Request sanitization middleware
 */
const sanitizeRequest = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj
        .replace(/[<>]/g, "") // Remove angle brackets
        .replace(/javascript:/gi, "") // Remove javascript protocol
        .replace(/on\w+=/gi, "") // Remove event handlers
        .trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip potentially dangerous keys
        if (!key.startsWith("__") && !key.includes("..")) {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Response sanitization middleware
 */
const sanitizeResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Remove sensitive fields from responses with circular reference protection
    const sanitizeData = (obj, visited = new WeakSet()) => {
      // Handle null/undefined
      if (obj === null || obj === undefined) {
        return obj;
      }

      // Handle primitives
      if (typeof obj !== "object") {
        return obj;
      }

      // Handle circular references
      if (visited.has(obj)) {
        return "[Circular Reference]";
      }

      visited.add(obj);

      if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeData(item, visited));
      }

      // Convert MongoDB documents to plain objects and handle ObjectIds
      const plainObj = obj.toObject ? obj.toObject() : obj;
      const sanitized = { ...plainObj };

      // Convert ObjectId buffers to strings - handle various ObjectId formats
      if (sanitized._id) {
        if (typeof sanitized._id === "string") {
          sanitized.id = sanitized._id;
        } else if (
          sanitized._id.toString &&
          typeof sanitized._id.toString === "function"
        ) {
          sanitized.id = sanitized._id.toString();
        } else if (sanitized._id.buffer) {
          // Handle buffer-based ObjectIds by converting to hex string
          const buffer = sanitized._id.buffer;
          sanitized.id = Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } else {
          // Fallback for other ObjectId formats
          sanitized.id = String(sanitized._id);
        }
        // Keep the original _id as well for MongoDB operations
      }

      // Remove sensitive fields
      delete sanitized.password;
      delete sanitized.__v;
      delete sanitized.refreshToken;
      delete sanitized.resetToken;

      // Handle ObjectId conversion for nested objects BEFORE recursive sanitization
      const convertObjectId = (obj) => {
        if (!obj || !obj._id) return obj;

        const converted = { ...obj };

        if (typeof obj._id === "string") {
          converted.id = obj._id;
        } else if (obj._id.toString && typeof obj._id.toString === "function") {
          converted.id = obj._id.toString();
        } else if (obj._id.buffer) {
          const buffer = obj._id.buffer;
          converted.id = Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } else {
          converted.id = String(obj._id);
        }

        return converted;
      };

      // Convert ObjectIds in arrays before recursive sanitization
      if (Array.isArray(sanitized.options)) {
        sanitized.options = sanitized.options.map(convertObjectId);
      }

      // Recursively sanitize nested objects
      for (const [key, value] of Object.entries(sanitized)) {
        if (value && typeof value === "object") {
          sanitized[key] = sanitizeData(value, visited);
        }
      }

      return sanitized;
    };

    const sanitizedData = sanitizeData(data);
    return originalJson.call(this, sanitizedData);
  };

  next();
};

/**
 * Request logging middleware for security monitoring
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // XSS
    /on\w+=/i, // Event handlers
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(requestString)
  );

  if (isSuspicious) {
    logger.logSecurityEvent(
      "suspicious_request",
      {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
      },
      "high"
    );
  }

  // Override response to capture status code
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    // Log request with security context
    logger.logRequest(req, res, duration);

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Admin authentication middleware
 */
const requireAdmin = (req, res, next) => {
  // Development mode bypass - remove in production
  if (process.env.NODE_ENV === "development") {
    logger.logAuth(
      "admin_access_granted",
      "dev-admin",
      req.ip,
      true,
      "Development mode"
    );
    req.user = { id: "dev-admin", role: "admin" };
    return next();
  }

  // Production authentication logic
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.logAuth(
      "admin_access_denied",
      null,
      req.ip,
      false,
      "No authorization header"
    );
    throw new AuthenticationError("Authentication required");
  }

  // Placeholder admin check - replace with actual JWT verification
  if (authHeader !== "Bearer admin-token") {
    logger.logAuth(
      "admin_access_denied",
      null,
      req.ip,
      false,
      "Invalid admin token"
    );
    throw new AuthorizationError("Admin access required");
  }

  logger.logAuth("admin_access_granted", "admin", req.ip, true);
  req.user = { id: "admin", role: "admin" };
  next();
};

/**
 * Input size validation middleware
 */
const validateInputSize = (maxSize = 1024 * 1024) => {
  // 1MB default
  return (req, res, next) => {
    if (!req.body) {
      return next(); // Skip validation for requests without body
    }

    const requestSize = JSON.stringify(req.body).length;

    if (requestSize > maxSize) {
      logger.logSecurityEvent(
        "large_request_blocked",
        {
          ip: req.ip,
          size: requestSize,
          maxSize,
          url: req.originalUrl,
        },
        "medium"
      );

      throw new ValidationError("Request payload too large");
    }

    next();
  };
};

/**
 * CORS security enhancement
 */
const secureHeaders = (req, res, next) => {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // Remove server information
  res.removeHeader("X-Powered-By");

  next();
};

/**
 * IP whitelist middleware (for admin endpoints)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No restrictions if no IPs specified
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      logger.logSecurityEvent(
        "ip_blocked",
        {
          ip: clientIP,
          allowedIPs,
          url: req.originalUrl,
        },
        "high"
      );

      throw new AuthorizationError("Access denied from this IP address");
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  sanitizeRequest,
  sanitizeResponse,
  securityLogger,
  requireAdmin,
  validateInputSize,
  secureHeaders,
  ipWhitelist,
};
