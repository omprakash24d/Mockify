const winston = require("winston");
const path = require("path");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format for better readability and debugging
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  winston.format.json()
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: "HH:mm:ss.SSS",
  }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      logMessage += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return logMessage;
  })
);

/**
 * File rotation configuration
 */
const fileOptions = {
  maxsize: 10485760, // 10MB
  maxFiles: 5,
  tailable: true,
};

/**
 * Create logger instance with enhanced configuration
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: {
    service: "mockify-backend",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Error log - only errors
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      ...fileOptions,
    }),

    // Combined log - all levels
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      ...fileOptions,
    }),

    // Warn log - warnings and above
    new winston.transports.File({
      filename: path.join(logsDir, "warn.log"),
      level: "warn",
      ...fileOptions,
    }),

    // Debug log - debug level and above (only in development)
    ...(process.env.NODE_ENV === "development"
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, "debug.log"),
            level: "debug",
            ...fileOptions,
          }),
        ]
      : []),
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      ...fileOptions,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      ...fileOptions,
    }),
  ],

  exitOnError: false,
});

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || "debug",
    })
  );
}

/**
 * Enhanced logging methods with context
 */
const enhancedLogger = {
  // Basic winston methods
  info: (...args) => logger.info(...args),
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
  debug: (...args) => logger.debug(...args),
  verbose: (...args) => logger.verbose(...args),

  // Enhanced custom methods

  // Request logging
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      responseTime: `${responseTime}ms`,
      statusCode: res.statusCode,
      contentLength: res.get("Content-Length") || 0,
      userId: req.user?.id || null,
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request - Client Error", logData);
    } else if (res.statusCode >= 500) {
      logger.error("HTTP Request - Server Error", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  },

  // Database operation logging
  logDatabaseOperation: (operation, collection, data, duration) => {
    logger.debug("Database Operation", {
      operation,
      collection,
      duration: `${duration}ms`,
      data: process.env.NODE_ENV === "development" ? data : "[REDACTED]",
    });
  },

  // Authentication logging
  logAuth: (action, userId, ip, success = true, reason = null) => {
    const logData = {
      action,
      userId,
      ip,
      success,
      reason,
    };

    if (success) {
      logger.info("Authentication", logData);
    } else {
      logger.warn("Authentication Failed", logData);
    }
  },

  // Security event logging
  logSecurityEvent: (event, details, severity = "medium") => {
    const logMethod =
      severity === "high" ? "error" : severity === "medium" ? "warn" : "info";

    logger[logMethod]("Security Event", {
      event,
      severity,
      details,
    });
  },

  // Performance logging
  logPerformance: (operation, duration, metadata = {}) => {
    const level = duration > 5000 ? "warn" : duration > 1000 ? "info" : "debug";

    logger[level]("Performance", {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  },

  // Business logic logging
  logBusinessEvent: (event, context, success = true) => {
    logger.info("Business Event", {
      event,
      success,
      context,
    });
  },
};

// Create a startup log entry
logger.info("Logger initialized", {
  logLevel: process.env.LOG_LEVEL || "info",
  logsDirectory: logsDir,
  environment: process.env.NODE_ENV || "development",
});

module.exports = enhancedLogger;
