const mongoose = require("mongoose");
require("dotenv").config();

const logger = require("../config/logger");

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database connection...");

    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/mockify_neet";

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Get database instance
    const db = mongoose.connection.db;

    // Create collections
    console.log("📋 Creating collections...");
    await db.createCollection("questions");
    await db.createCollection("subjects");
    await db.createCollection("chapters");

    // Create indexes
    console.log("🗂️  Creating indexes...");

    // Questions indexes
    await db
      .collection("questions")
      .createIndex({ subjectName: 1, chapterName: 1 });
    await db.collection("questions").createIndex({ subtopicTags: 1 });
    await db.collection("questions").createIndex({ difficulty: 1 });
    await db.collection("questions").createIndex({ isActive: 1 });
    await db.collection("questions").createIndex({ createdAt: -1 });
    await db.collection("questions").createIndex({
      questionText: "text",
      subtopicTags: "text",
      subjectName: "text",
      chapterName: "text",
    });

    // Subjects indexes
    await db.collection("subjects").createIndex({ name: 1 }, { unique: true });
    await db.collection("subjects").createIndex({ order: 1 });
    await db.collection("subjects").createIndex({ isActive: 1 });

    // Chapters indexes
    await db
      .collection("chapters")
      .createIndex({ subjectName: 1, name: 1 }, { unique: true });
    await db.collection("chapters").createIndex({ subjectName: 1, order: 1 });
    await db.collection("chapters").createIndex({ isActive: 1 });

    console.log("✅ Database setup completed successfully!");
    logger.info("Database setup completed successfully");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    logger.error("Database setup failed", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
