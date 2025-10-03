/**
 * Custom Error Classes for Better Error Handling
 * Provides specific error types with proper HTTP status codes and error messages
 */

class BaseError extends Error {
  constructor(
    message,
    statusCode = 500,
    errorCode = "INTERNAL_ERROR",
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    };
  }
}

class ValidationError extends BaseError {
  constructor(message = "Validation failed", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

class DatabaseError extends BaseError {
  constructor(message = "Database operation failed", operation = null) {
    super(message, 500, "DATABASE_ERROR");
    this.operation = operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
    };
  }
}

class NotFoundError extends BaseError {
  constructor(resource = "Resource", identifier = null) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    this.resource = resource;
    this.identifier = identifier;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      identifier: this.identifier,
    };
  }
}

class AuthenticationError extends BaseError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

class AuthorizationError extends BaseError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

class ConflictError extends BaseError {
  constructor(message = "Resource conflict", resource = null) {
    super(message, 409, "CONFLICT_ERROR");
    this.resource = resource;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
    };
  }
}

class RateLimitError extends BaseError {
  constructor(message = "Rate limit exceeded", retryAfter = null) {
    super(message, 429, "RATE_LIMIT_ERROR");
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

class ExternalServiceError extends BaseError {
  constructor(
    service = "External service",
    message = "External service error"
  ) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR");
    this.service = service;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
    };
  }
}

class TimeoutError extends BaseError {
  constructor(message = "Operation timed out", operation = null) {
    super(message, 408, "TIMEOUT_ERROR");
    this.operation = operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
    };
  }
}

class BusinessLogicError extends BaseError {
  constructor(message = "Business logic error", context = null) {
    super(message, 422, "BUSINESS_LOGIC_ERROR");
    this.context = context;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      context: this.context,
    };
  }
}

// Error factory for creating appropriate error types
class ErrorFactory {
  static createError(type, ...args) {
    const errorTypes = {
      validation: ValidationError,
      database: DatabaseError,
      notFound: NotFoundError,
      authentication: AuthenticationError,
      authorization: AuthorizationError,
      conflict: ConflictError,
      rateLimit: RateLimitError,
      externalService: ExternalServiceError,
      timeout: TimeoutError,
      businessLogic: BusinessLogicError,
    };

    const ErrorClass = errorTypes[type] || BaseError;
    return new ErrorClass(...args);
  }

  static fromMongooseError(error) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
      return new ValidationError(error.message, details);
    }

    if (error.name === "CastError") {
      return new ValidationError(`Invalid ${error.path}: ${error.value}`);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new ConflictError(`${field} already exists`, field);
    }

    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      return new DatabaseError("Database connection error", "connection");
    }

    return new DatabaseError(error.message, "unknown");
  }

  static fromJWTError(error) {
    if (error.name === "JsonWebTokenError") {
      return new AuthenticationError("Invalid token");
    }

    if (error.name === "TokenExpiredError") {
      return new AuthenticationError("Token expired");
    }

    if (error.name === "NotBeforeError") {
      return new AuthenticationError("Token not active");
    }

    return new AuthenticationError("Token validation failed");
  }
}

module.exports = {
  BaseError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  TimeoutError,
  BusinessLogicError,
  ErrorFactory,
};
