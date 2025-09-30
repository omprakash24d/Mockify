const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_FILE_PATH = path.join(
  __dirname,
  "../../NEET_FULL_DATABASE_EXPORT_20250930_085153.csv"
);

console.log("Raw CSV parsing test:");

let rowCount = 0;

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on("data", (row) => {
    rowCount++;

    if (rowCount <= 3) {
      console.log(`\n=== RAW ROW ${rowCount} ===`);
      console.log("Raw row object:", row);

      // Check raw field values
      console.log("\nIndividual field values:");
      Object.keys(row).forEach((key) => {
        console.log(`  ${key}: "${row[key]}" (type: ${typeof row[key]})`);
      });

      // Test our logic
      console.log("\nField validation:");
      const subjectName = row.subject_name;
      const chapterName = row.chapter_name;
      const questionText = row.question_text;
      const correctAnswer = row.correct_answer;

      console.log(
        `subject_name: "${subjectName}" (truthiness: ${!!subjectName})`
      );
      console.log(
        `chapter_name: "${chapterName}" (truthiness: ${!!chapterName})`
      );
      console.log(
        `question_text: "${questionText}" (truthiness: ${!!questionText})`
      );
      console.log(
        `correct_answer: "${correctAnswer}" (truthiness: ${!!correctAnswer})`
      );
    }

    if (rowCount >= 3) {
      process.exit(0);
    }
  })
  .on("error", (error) => {
    console.error("CSV parsing error:", error);
  });
