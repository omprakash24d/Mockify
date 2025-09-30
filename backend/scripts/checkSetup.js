const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");

async function checkSetup() {
  try {
    console.log("🔍 Checking NEET Backend Setup...\n");

    // Test database connection
    console.log("📡 Testing database connection...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mockify_neet",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        ssl: true,
        sslValidate: false,
      }
    );
    console.log("✅ Database connected successfully");

    // Check collections
    console.log("\n📊 Checking data collections...");

    const [subjectCount, chapterCount, questionCount] = await Promise.all([
      Subject.countDocuments(),
      Chapter.countDocuments(),
      Question.countDocuments(),
    ]);

    console.log(`📚 Subjects: ${subjectCount}`);
    console.log(`📖 Chapters: ${chapterCount}`);
    console.log(`❓ Questions: ${questionCount}`);

    if (questionCount === 0) {
      console.log("\n⚠️  No questions found. Run: npm run seed");
    } else {
      console.log("\n✅ Data appears to be seeded correctly");

      // Sample data check
      const sampleQuestion = await Question.findOne().limit(1);
      if (sampleQuestion) {
        console.log(`\n🔍 Sample question from ${sampleQuestion.subjectName}:`);
        console.log(`   Chapter: ${sampleQuestion.chapterName}`);
        console.log(`   Difficulty: ${sampleQuestion.difficulty}`);
        console.log(`   Options: ${sampleQuestion.options.length}`);
      }
    }

    // Check indexes
    console.log("\n🗂️  Checking database indexes...");
    const indexes = await Question.collection.getIndexes();
    console.log(`   Question indexes: ${Object.keys(indexes).length}`);

    console.log("\n🎉 Backend setup check completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Start backend: npm run dev");
    console.log("   2. Start frontend: npm run dev (in project root)");
    console.log("   3. Visit: http://localhost:5173/neet");
  } catch (error) {
    console.error("\n❌ Setup check failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Check MongoDB connection string in .env");
    console.log("   2. Ensure MongoDB is running");
    console.log("   3. Run: npm install");
    console.log("   4. Run: npm run seed (if no data)");
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Connection closed");
  }
}

checkSetup();
