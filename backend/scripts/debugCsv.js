const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_FILE_PATH = path.join(
  __dirname,
  "../../NEET_FULL_DATABASE_EXPORT_20250930_085153.csv"
);

console.log("CSV File Path:", CSV_FILE_PATH);
console.log("File exists:", fs.existsSync(CSV_FILE_PATH));

if (fs.existsSync(CSV_FILE_PATH)) {
  const stats = fs.statSync(CSV_FILE_PATH);
  console.log("File size:", stats.size, "bytes");
}

let rowCount = 0;
let validRows = 0;
let errorCount = 0;
const errors = [];

console.log("\n--- Starting CSV Debug ---");

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on("data", (row) => {
    rowCount++;

    // Debug first few rows
    if (rowCount <= 3) {
      console.log(`\nRow ${rowCount}:`, JSON.stringify(row, null, 2));
    }

    // Check for required fields
    const subjectName = row.subject_name?.trim();
    const chapterName = row.chapter_name?.trim();
    const questionText = row.question_text?.trim();
    const correctAnswer = row.correct_answer?.trim();

    if (!subjectName || !chapterName || !questionText || !correctAnswer) {
      errorCount++;
      if (errors.length < 10) {
        // Store first 10 errors
        errors.push({
          row: rowCount,
          missing: {
            subject: !subjectName,
            chapter: !chapterName,
            question: !questionText,
            answer: !correctAnswer,
          },
          actualValues: {
            subject: subjectName,
            chapter: chapterName,
            question: questionText
              ? questionText.substring(0, 50) + "..."
              : questionText,
            answer: correctAnswer,
          },
          data: row,
        });
      }
    } else {
      validRows++;
    }

    // Show progress every 1000 rows
    if (rowCount % 1000 === 0) {
      console.log(
        `Processed ${rowCount} rows, ${validRows} valid, ${errorCount} errors`
      );
    }
  })
  .on("end", () => {
    console.log("\n--- CSV Debug Complete ---");
    console.log(`Total rows: ${rowCount}`);
    console.log(`Valid rows: ${validRows}`);
    console.log(`Error rows: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n--- First few errors ---");
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1} (Row ${error.row}):`);
        console.log("Missing fields:", error.missing);
        console.log("Sample data:", JSON.stringify(error.data, null, 2));
        console.log("---");
      });
    }
  })
  .on("error", (error) => {
    console.error("CSV parsing error:", error);
  });
