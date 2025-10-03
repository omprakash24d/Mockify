const logger = require("../config/logger");
const {
  DatabaseError,
  TimeoutError,
  ExternalServiceError,
} = require("../errors/CustomErrors");

/**
 * Database operation wrapper with error handling and retry logic
 */
class DatabaseErrorHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.timeoutMs = options.timeoutMs || 30000;
  }

  /**
   * Wrap database operations with error handling and retry logic
   */
  async executeWithRetry(operation, context = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        // Execute operation with timeout
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise(),
        ]);

        const duration = Date.now() - startTime;

        // Log successful operation
        logger.logDatabaseOperation(
          context.operation || "unknown",
          context.collection || "unknown",
          context.data || {},
          duration
        );

        return result;
      } catch (error) {
        lastError = error;

        // Log the attempt
        logger.warn(
          `Database operation failed (attempt ${attempt}/${this.maxRetries})`,
          {
            operation: context.operation,
            collection: context.collection,
            error: error.message,
            attempt,
            willRetry: attempt < this.maxRetries,
          }
        );

        // Check if error is retryable
        if (!this.isRetryableError(error) || attempt === this.maxRetries) {
          break;
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }

    // All retries failed, throw appropriate error
    throw this.createDatabaseError(lastError, context);
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError("Database operation timed out"));
      }, this.timeoutMs);
    });
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    // Network errors, timeout errors, and temporary MongoDB errors are retryable
    const retryableErrors = [
      "MongoNetworkError",
      "MongoTimeoutError",
      "MongoServerSelectionError",
      "ECONNRESET",
      "ENOTFOUND",
      "ETIMEDOUT",
    ];

    return retryableErrors.some(
      (errorType) =>
        error.name === errorType ||
        error.code === errorType ||
        error.message.includes(errorType)
    );
  }

  /**
   * Create appropriate database error based on the original error
   */
  createDatabaseError(error, context) {
    if (error instanceof TimeoutError) {
      return error;
    }

    // Connection errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoServerSelectionError"
    ) {
      return new DatabaseError("Database connection failed", context.operation);
    }

    // Timeout errors
    if (error.name === "MongoTimeoutError") {
      return new TimeoutError(
        "Database operation timed out",
        context.operation
      );
    }

    // Generic database error
    return new DatabaseError(
      process.env.NODE_ENV === "production"
        ? "Database operation failed"
        : error.message,
      context.operation
    );
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Database connection health checker
 */
class DatabaseHealthChecker {
  constructor(mongoose) {
    this.mongoose = mongoose;
    this.isHealthy = false;
    this.lastCheck = null;
    this.checkInterval = 30000; // 30 seconds
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    this.checkHealth();
    setInterval(() => this.checkHealth(), this.checkInterval);
  }

  /**
   * Check database health
   */
  async checkHealth() {
    try {
      const startTime = Date.now();

      // Ping database
      await this.mongoose.connection.db.admin().ping();

      const duration = Date.now() - startTime;
      this.isHealthy = true;
      this.lastCheck = new Date();

      logger.debug("Database health check passed", {
        duration: `${duration}ms`,
        readyState: this.mongoose.connection.readyState,
      });
    } catch (error) {
      this.isHealthy = false;
      this.lastCheck = new Date();

      logger.error("Database health check failed", {
        error: error.message,
        readyState: this.mongoose.connection.readyState,
      });
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck,
      readyState: this.mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(),
    };
  }

  /**
   * Get readable connection state
   */
  getReadyStateText() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[this.mongoose.connection.readyState] || "unknown";
  }
}

/**
 * Firebase error handler
 */
class FirebaseErrorHandler {
  static handleFirebaseError(error, operation = "unknown") {
    logger.error("Firebase operation failed", {
      operation,
      error: error.message,
      code: error.code,
    });

    // Map Firebase errors to custom errors
    switch (error.code) {
      case "permission-denied":
        throw new ExternalServiceError("Firebase", "Permission denied");

      case "unavailable":
        throw new ExternalServiceError(
          "Firebase",
          "Service temporarily unavailable"
        );

      case "deadline-exceeded":
        throw new TimeoutError("Firebase operation timed out", operation);

      case "resource-exhausted":
        throw new ExternalServiceError("Firebase", "Resource quota exceeded");

      default:
        throw new ExternalServiceError("Firebase", "Firebase operation failed");
    }
  }
}

/**
 * Transaction wrapper with proper error handling
 */
class TransactionHandler {
  constructor(mongoose) {
    this.mongoose = mongoose;
  }

  /**
   * Execute operations within a transaction
   */
  async executeTransaction(operations, options = {}) {
    const session = await this.mongoose.startSession();

    try {
      const result = await session.withTransaction(
        async () => {
          const results = [];

          for (const operation of operations) {
            const result = await operation(session);
            results.push(result);
          }

          return results;
        },
        {
          readPreference: "primary",
          readConcern: { level: "local" },
          writeConcern: { w: "majority" },
          ...options,
        }
      );

      logger.info("Transaction completed successfully", {
        operationCount: operations.length,
      });

      return result;
    } catch (error) {
      logger.error("Transaction failed", {
        error: error.message,
        operationCount: operations.length,
      });

      throw new DatabaseError("Transaction failed", "transaction");
    } finally {
      await session.endSession();
    }
  }
}

// Create singleton instances
const dbErrorHandler = new DatabaseErrorHandler();

module.exports = {
  DatabaseErrorHandler,
  DatabaseHealthChecker,
  FirebaseErrorHandler,
  TransactionHandler,
  dbErrorHandler,
};
