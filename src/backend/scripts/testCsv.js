const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_FILE_PATH = path.join(
  __dirname,
  "../../NEET_FULL_DATABASE_EXPORT_20250930_085153.csv"
);

console.log("Testing first 5 rows with detailed field analysis:");

let rowCount = 0;

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on("data", (row) => {
    rowCount++;

    if (rowCount <= 5) {
      console.log(`\n=== ROW ${rowCount} ===`);
      console.log("Keys:", Object.keys(row));
      console.log("Values:");

      const subjectName = row.subject_name?.trim();
      const chapterName = row.chapter_name?.trim();
      const questionText = row.question_text?.trim();
      const correctAnswer = row.correct_answer?.trim();

      console.log(
        `  subject_name: "${subjectName}" (length: ${
          subjectName?.length
        }, exists: ${!!subjectName})`
      );
      console.log(
        `  chapter_name: "${chapterName}" (length: ${
          chapterName?.length
        }, exists: ${!!chapterName})`
      );
      console.log(
        `  question_text: "${questionText}" (length: ${
          questionText?.length
        }, exists: ${!!questionText})`
      );
      console.log(
        `  correct_answer: "${correctAnswer}" (length: ${
          correctAnswer?.length
        }, exists: ${!!correctAnswer})`
      );

      // Check validation logic
      const valid = subjectName && chapterName && questionText && correctAnswer;
      console.log(`  Valid: ${valid}`);

      if (!valid) {
        console.log("  FAILED VALIDATION BECAUSE:");
        if (!subjectName) console.log("    - Missing subject_name");
        if (!chapterName) console.log("    - Missing chapter_name");
        if (!questionText) console.log("    - Missing question_text");
        if (!correctAnswer) console.log("    - Missing correct_answer");
      }
    }

    if (rowCount >= 5) {
      process.exit(0);
    }
  })
  .on("error", (error) => {
    console.error("CSV parsing error:", error);
  });
