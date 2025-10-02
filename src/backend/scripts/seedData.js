const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const logger = require("../config/logger");

// Configuration
const CSV_FILE_PATH = path.join(
  __dirname,
  "../../NEET_FULL_DATABASE_EXPORT_20250930_085153.csv"
);
const BATCH_SIZE = 100; // Process questions in batches
const SUBJECT_COLORS = {
  Chemistry: "#10B981",
  Physics: "#3B82F6",
  Botany: "#22C55E",
  Zoology: "#F59E0B",
};

class DataSeeder {
  constructor() {
    this.questions = [];
    this.subjects = new Map();
    this.chapters = new Map();
    this.processedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  async connectDatabase() {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/mockify_neet",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      console.log("✅ Connected to MongoDB");
      logger.info("Connected to MongoDB for data seeding");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      logger.error("MongoDB connection failed", error);
      process.exit(1);
    }
  }

  async clearExistingData() {
    try {
      console.log("🧹 Clearing existing data...");

      await Promise.all([
        Question.deleteMany({}),
        Chapter.deleteMany({}),
        Subject.deleteMany({}),
      ]);

      console.log("✅ Existing data cleared");
      logger.info("Existing data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing data:", error.message);
      logger.error("Error clearing existing data", error);
      throw error;
    }
  }

  parseCSVRow(row) {
    try {
      // Handle BOM issue - find the actual subject key
      const keys = Object.keys(row);
      const subjectKey =
        keys.find((k) => k.includes("subject_name")) || "subject_name";

      // Clean and validate the row data with more lenient validation
      const subjectName = row[subjectKey]?.toString().trim();
      const chapterName = row.chapter_name?.toString().trim();
      const questionText = row.question_text?.toString().trim();
      const correctAnswer = row.correct_answer?.toString().trim();

      // More lenient validation - check if fields exist and have content
      if (
        !subjectName ||
        subjectName === "" ||
        subjectName === "undefined" ||
        !chapterName ||
        chapterName === "" ||
        chapterName === "undefined" ||
        !questionText ||
        questionText === "" ||
        questionText === "undefined"
      ) {
        throw new Error(
          `Missing required fields: subject=${!!subjectName}, chapter=${!!chapterName}, question=${!!questionText}`
        );
      }

      // Parse options - be more flexible with empty options
      const options = [];
      for (let i = 1; i <= 4; i++) {
        const optionText = row[`option_${i}_text`]?.toString().trim();
        if (optionText && optionText !== "" && optionText !== "undefined") {
          options.push({
            text: optionText,
            isCorrect: optionText === correctAnswer,
          });
        }
      }

      // If no valid options found, create generic ones based on correct answer
      if (options.length === 0) {
        // Create 4 generic options with one being correct
        const correctAnswerText = correctAnswer || "Option A";
        options.push(
          { text: correctAnswerText, isCorrect: true },
          { text: "Option B", isCorrect: false },
          { text: "Option C", isCorrect: false },
          { text: "Option D", isCorrect: false }
        );
      } else if (options.length < 2) {
        // Ensure we have at least 2 options
        while (options.length < 4) {
          options.push({
            text: `Option ${String.fromCharCode(65 + options.length)}`,
            isCorrect: false,
          });
        }
      }

      // Ensure we have a correct answer - if not found in options, make first option correct
      const hasCorrectOption = options.some((opt) => opt.isCorrect);
      if (!hasCorrectOption && options.length > 0) {
        options[0].isCorrect = true;
      }

      // Use the correct answer from the first correct option if correctAnswer is empty
      const finalCorrectAnswer =
        correctAnswer && correctAnswer !== "" && correctAnswer !== "undefined"
          ? correctAnswer
          : options.find((opt) => opt.isCorrect)?.text ||
            options[0]?.text ||
            "Option A";

      // Parse subtopic tags
      let subtopicTags = [];
      if (row.subtopic_tags) {
        subtopicTags = row.subtopic_tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      // Determine difficulty (you can enhance this logic)
      const difficulty = this.determineDifficulty(questionText, subjectName);

      return {
        subjectName,
        chapterName,
        questionNumberForChapter:
          parseInt(row.question_number_for_chapter) || 1,
        questionText,
        options,
        correctAnswer: finalCorrectAnswer,
        subtopicTags,
        difficulty,
        isActive: true,
      };
    } catch (error) {
      this.errorCount++;
      logger.warn(`Error parsing CSV row: ${error.message}`, {
        subject: row.subject_name,
        chapter: row.chapter_name,
        question: row.question_text?.substring(0, 50) + "...",
      });
      return null;
    }
  }

  determineDifficulty(questionText, subject) {
    // Simple heuristic - you can make this more sophisticated
    const text = questionText.toLowerCase();

    // Keywords that might indicate difficulty
    const hardKeywords = [
      "calculate",
      "determine",
      "derive",
      "prove",
      "analyze",
      "evaluate",
    ];
    const easyKeywords = [
      "identify",
      "what is",
      "which is",
      "name the",
      "define",
    ];

    if (hardKeywords.some((keyword) => text.includes(keyword))) {
      return "hard";
    } else if (easyKeywords.some((keyword) => text.includes(keyword))) {
      return "easy";
    }

    return "medium"; // Default
  }

  async readCSVFile() {
    return new Promise((resolve, reject) => {
      console.log("📖 Reading CSV file...");

      if (!fs.existsSync(CSV_FILE_PATH)) {
        reject(new Error(`CSV file not found: ${CSV_FILE_PATH}`));
        return;
      }

      const questions = [];
      let rowCount = 0;

      // Use a more flexible CSV parsing approach
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(
          csv({
            separator: ",",
            skipEmptyLines: true,
            skipLinesWithError: true,
            strict: false, // Allow malformed CSV
            quote: '"',
            escape: '"',
          })
        )
        .on("data", (row) => {
          rowCount++;

          // Debug first few rows to understand structure
          if (rowCount <= 3) {
            console.log(`Row ${rowCount} keys:`, Object.keys(row));
          }

          const questionData = this.parseCSVRow(row);

          if (questionData) {
            questions.push(questionData);

            // Track subjects and chapters
            this.trackSubjectAndChapter(
              questionData.subjectName,
              questionData.chapterName
            );
          }

          // Show progress
          if (rowCount % 1000 === 0) {
            console.log(
              `📊 Processed ${rowCount} rows, Valid: ${questions.length}, Errors: ${this.errorCount}`
            );
          }
        })
        .on("end", () => {
          console.log(
            `✅ CSV reading completed. Total rows: ${rowCount}, Valid questions: ${questions.length}, Errors: ${this.errorCount}`
          );
          resolve(questions);
        })
        .on("error", (error) => {
          console.error("❌ Error reading CSV:", error.message);
          console.log(
            `Processed ${rowCount} rows before error, Valid: ${questions.length}`
          );
          // Don't reject, return what we have
          resolve(questions);
        });
    });
  }

  trackSubjectAndChapter(subjectName, chapterName) {
    // Track unique subjects
    if (!this.subjects.has(subjectName)) {
      this.subjects.set(subjectName, {
        name: subjectName,
        displayName: subjectName,
        color: SUBJECT_COLORS[subjectName] || "#6B7280",
        icon: this.getSubjectIcon(subjectName),
        isActive: true,
        order: Array.from(this.subjects.keys()).length,
      });
    }

    // Track unique chapters
    const chapterKey = `${subjectName}::${chapterName}`;
    if (!this.chapters.has(chapterKey)) {
      this.chapters.set(chapterKey, {
        name: chapterName,
        subjectName,
        displayName: chapterName,
        isActive: true,
        order: Array.from(this.chapters.keys()).filter((key) =>
          key.startsWith(subjectName)
        ).length,
      });
    }
  }

  getSubjectIcon(subjectName) {
    const icons = {
      Chemistry: "🧪",
      Physics: "⚛️",
      Botany: "🌱",
      Zoology: "🔬",
    };
    return icons[subjectName] || "📚";
  }

  async seedSubjects() {
    try {
      console.log("📝 Seeding subjects...");

      const subjectDocs = Array.from(this.subjects.values());
      await Subject.insertMany(subjectDocs);

      console.log(`✅ ${subjectDocs.length} subjects seeded`);
      logger.info(`${subjectDocs.length} subjects seeded successfully`);
    } catch (error) {
      console.error("❌ Error seeding subjects:", error.message);
      logger.error("Error seeding subjects", error);
      throw error;
    }
  }

  async seedChapters() {
    try {
      console.log("📚 Seeding chapters...");

      const chapterDocs = Array.from(this.chapters.values());
      await Chapter.insertMany(chapterDocs);

      console.log(`✅ ${chapterDocs.length} chapters seeded`);
      logger.info(`${chapterDocs.length} chapters seeded successfully`);
    } catch (error) {
      console.error("❌ Error seeding chapters:", error.message);
      logger.error("Error seeding chapters", error);
      throw error;
    }
  }

  async seedQuestions(questions) {
    try {
      console.log("❓ Seeding questions...");

      const totalQuestions = questions.length;
      let insertedCount = 0;

      // Process in batches to avoid memory issues
      for (let i = 0; i < totalQuestions; i += BATCH_SIZE) {
        const batch = questions.slice(i, i + BATCH_SIZE);

        try {
          await Question.insertMany(batch, { ordered: false });
          insertedCount += batch.length;

          console.log(
            `📊 Progress: ${insertedCount}/${totalQuestions} questions seeded`
          );
        } catch (error) {
          // Handle duplicate key errors or validation errors
          if (error.writeErrors) {
            const successfulInserts = batch.length - error.writeErrors.length;
            insertedCount += successfulInserts;
            console.log(
              `⚠️  Batch had ${error.writeErrors.length} errors, ${successfulInserts} successful`
            );
          } else {
            throw error;
          }
        }
      }

      console.log(`✅ ${insertedCount} questions seeded successfully`);
      logger.info(`${insertedCount} questions seeded successfully`);

      return insertedCount;
    } catch (error) {
      console.error("❌ Error seeding questions:", error.message);
      logger.error("Error seeding questions", error);
      throw error;
    }
  }

  async updateStatistics() {
    try {
      console.log("📊 Updating statistics...");

      // Update subject statistics
      const subjects = await Subject.find({ isActive: true });
      for (const subject of subjects) {
        const [questionCount, chapterCount] = await Promise.all([
          Question.countDocuments({
            subjectName: subject.name,
            isActive: true,
          }),
          Chapter.countDocuments({ subjectName: subject.name, isActive: true }),
        ]);

        subject.statistics.totalQuestions = questionCount;
        subject.statistics.totalChapters = chapterCount;
        await subject.save();
      }

      // Update chapter statistics and subtopics
      const chapters = await Chapter.find({ isActive: true });
      for (const chapter of chapters) {
        await chapter.updateSubtopics();
      }

      console.log("✅ Statistics updated");
      logger.info("Statistics updated successfully");
    } catch (error) {
      console.error("❌ Error updating statistics:", error.message);
      logger.error("Error updating statistics", error);
      throw error;
    }
  }

  async run() {
    try {
      console.log("🚀 Starting data seeding process...");

      await this.connectDatabase();

      // Optional: Clear existing data (comment out if you want to preserve existing data)
      await this.clearExistingData();

      // Read and parse CSV data
      const questions = await this.readCSVFile();

      // Seed data in order: subjects -> chapters -> questions
      await this.seedSubjects();
      await this.seedChapters();
      const insertedQuestions = await this.seedQuestions(questions);

      // Update statistics
      await this.updateStatistics();

      // Display summary
      const endTime = Date.now();
      const duration = (endTime - this.startTime) / 1000;

      console.log("\n🎉 Data seeding completed successfully!");
      console.log("📈 Summary:");
      console.log(`   • Subjects: ${this.subjects.size}`);
      console.log(`   • Chapters: ${this.chapters.size}`);
      console.log(`   • Questions: ${insertedQuestions}`);
      console.log(`   • Errors: ${this.errorCount}`);
      console.log(`   • Duration: ${duration.toFixed(2)} seconds`);

      logger.info("Data seeding completed successfully", {
        subjects: this.subjects.size,
        chapters: this.chapters.size,
        questions: insertedQuestions,
        errors: this.errorCount,
        duration: duration,
      });
    } catch (error) {
      console.error("💥 Data seeding failed:", error.message);
      logger.error("Data seeding failed", error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log("👋 Database connection closed");
    }
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const seeder = new DataSeeder();
  seeder.run();
}

module.exports = DataSeeder;
