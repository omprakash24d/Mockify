const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const enhancedLogger = require("./backend/config/logger");
const {
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} = require("./backend/middleware/errorHandler");
const {
  sanitizeRequest,
  sanitizeResponse,
  securityLogger,
  secureHeaders,
  createRateLimiter,
} = require("./backend/middleware/security");
const {
  responseHandler,
  validateResponse,
  addRequestId,
} = require("./backend/utils/responseUtils");
const hybridDataService = require("./backend/services/hybridDataService");
const questionRoutes = require("./backend/routes/questions");
const optimizedQuestionRoutes = require("./backend/routes/optimized-questions");
const subjectRoutes = require("./backend/routes/subjects");
const chapterRoutes = require("./backend/routes/chapters");
const analyticsRoutes = require("./backend/routes/analytics");
const adminRoutes = require("./backend/routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware with development-friendly CSP
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  // Development mode: more permissive CSP for frontend communication
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          "style-src": ["'self'", "'unsafe-inline'", "https:"],
          "font-src": ["'self'", "https:", "data:"],
          "img-src": ["'self'", "data:", "https:"],
          "connect-src": [
            "'self'",
            "http://localhost:5173",
            "http://localhost:5174",
            "ws://localhost:*",
            "https:",
          ],
          "worker-src": ["'self'", "blob:"],
          "object-src": ["'none'"],
        },
      },
    })
  );
}
app.use(compression());
app.use(secureHeaders);
app.use(addRequestId);
app.use(sanitizeRequest);
app.use(sanitizeResponse);
app.use(securityLogger);

// Rate limiting with enhanced error handling
if (process.env.NODE_ENV === "production") {
  const generalLimiter = createRateLimiter(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    "Too many requests from this IP, please try again later."
  );
  app.use("/api/", generalLimiter);

  // Stricter rate limiting for admin endpoints
  const adminLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // Much lower limit for admin
    "Too many admin requests, please try again later."
  );
  app.use("/api/admin", adminLimiter);
} else {
  // Development mode: no rate limiting
  enhancedLogger.info("Rate limiting disabled in development mode");
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Response utilities
app.use(responseHandler);
app.use(validateResponse);

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => enhancedLogger.info(message.trim()) },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/questions", questionRoutes);
app.use("/api/optimized-questions", optimizedQuestionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler - must be last route
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Setup global error handlers
handleUnhandledRejection();
handleUncaughtException();

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mockify_neet")
  .then(async () => {
    enhancedLogger.info("Connected to MongoDB successfully");
    console.log("✅ Connected to MongoDB");

    // Initialize hybrid data service
    try {
      await hybridDataService.initialize();
      enhancedLogger.info("HybridDataService initialized successfully");
      console.log("✅ HybridDataService initialized");
    } catch (error) {
      logger.warn("HybridDataService initialization failed:", error.message);
      console.log(
        "⚠️ HybridDataService initialization failed, continuing with MongoDB only"
      );
    }
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  enhancedLogger.info("Received SIGINT. Shutting down gracefully...");
  console.log("\n⏹️  Shutting down server...");

  await mongoose.connection.close();
  enhancedLogger.info("MongoDB connection closed.");
  console.log("✅ MongoDB connection closed");

  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  enhancedLogger.info(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
