const logger = require("../config/logger");
const {
  BaseError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  ErrorFactory,
} = require("../errors/CustomErrors");

/**
 * Enhanced Error Handler Middleware
 * Provides comprehensive error handling with proper logging and user-friendly responses
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert known error types to custom errors
  if (!err.isOperational) {
    if (
      err.name === "ValidationError" ||
      err.name === "CastError" ||
      err.code === 11000
    ) {
      error = ErrorFactory.fromMongooseError(err);
    } else if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      error = ErrorFactory.fromJWTError(err);
    } else if (err.status === 429) {
      error = ErrorFactory.createError(
        "rateLimit",
        "Too many requests, please try again later"
      );
    } else if (err.type === "entity.parse.failed") {
      error = ErrorFactory.createError("validation", "Invalid JSON payload");
    } else if (err.type === "entity.too.large") {
      error = ErrorFactory.createError("validation", "Payload too large");
    } else {
      // Convert unknown errors to generic BaseError
      error = new BaseError(
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message || err.toString() || "Unknown error",
        500,
        "INTERNAL_ERROR",
        false
      );
    }
  }

  // Log error with different levels based on severity
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || null,
    },
    timestamp: new Date().toISOString(),
  };

  // Log based on error type and severity
  if (error.statusCode >= 500) {
    logger.error("Server Error", logData);
  } else if (error.statusCode >= 400) {
    logger.warn("Client Error", logData);
  } else {
    logger.info("Request Error", logData);
  }

  // Prepare response based on environment
  const response = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      timestamp: error.timestamp,
    },
  };

  // Add additional error details for specific error types
  if (error instanceof ValidationError && error.details) {
    response.error.details = error.details;
  }

  // Add debug information in development
  if (process.env.NODE_ENV === "development") {
    response.error.stack = error.stack;
    response.error.isOperational = error.isOperational;

    // Add request context in development
    response.debug = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    };
  }

  // Security: Don't expose sensitive information in production
  if (process.env.NODE_ENV === "production") {
    // Generic message for non-operational errors
    if (!error.isOperational) {
      response.error.message = "Internal server error";
      response.error.errorCode = "INTERNAL_ERROR";
    }

    // Remove sensitive details
    delete response.error.stack;
  }

  // Set appropriate headers
  res.set({
    "Content-Type": "application/json",
    "X-Error-Code": error.errorCode,
  });

  // Send response
  res.status(error.statusCode || 500).json(response);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch and forward errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * Should be placed after all routes
 */
const notFoundHandler = (req, res, next) => {
  const error = ErrorFactory.createError(
    "notFound",
    "Route",
    `${req.method} ${req.originalUrl}`
  );
  next(error);
};

/**
 * Unhandled Promise Rejection handler
 */
const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", {
      promise,
      reason: reason.stack || reason,
    });

    // In production, you might want to exit the process
    if (process.env.NODE_ENV === "production") {
      logger.error("Shutting down due to unhandled promise rejection");
      process.exit(1);
    }
  });
};

/**
 * Uncaught Exception handler
 */
const handleUncaughtException = () => {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", {
      error: error.message,
      stack: error.stack,
    });

    // Exit the process for uncaught exceptions
    logger.error("Shutting down due to uncaught exception");
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
};
