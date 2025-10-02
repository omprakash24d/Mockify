const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const logger = require("./backend/config/logger");
const errorHandler = require("./backend/middleware/errorHandler");
const hybridDataService = require("./backend/services/hybridDataService");
const questionRoutes = require("./backend/routes/questions");
const optimizedQuestionRoutes = require("./backend/routes/optimized-questions");
const subjectRoutes = require("./backend/routes/subjects");
const chapterRoutes = require("./backend/routes/chapters");
const analyticsRoutes = require("./backend/routes/analytics");
const adminRoutes = require("./backend/routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - disabled in development
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
      error: "Too many requests from this IP, please try again later.",
    },
  });
  app.use("/api/", limiter);
} else {
  // Development mode: no rate limiting
  logger.info("Rate limiting disabled in development mode");
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

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mockify_neet")
  .then(async () => {
    logger.info("Connected to MongoDB successfully");
    console.log("✅ Connected to MongoDB");

    // Initialize hybrid data service
    try {
      await hybridDataService.initialize();
      logger.info("HybridDataService initialized successfully");
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
  logger.info("Received SIGINT. Shutting down gracefully...");
  console.log("\n⏹️  Shutting down server...");

  await mongoose.connection.close();
  logger.info("MongoDB connection closed.");
  console.log("✅ MongoDB connection closed");

  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
