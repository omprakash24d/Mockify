const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_FILE_PATH = path.join(
  __dirname,
  "../../NEET_FULL_DATABASE_EXPORT_20250930_085153.csv"
);

console.log("Key analysis test:");

let rowCount = 0;

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on("data", (row) => {
    rowCount++;

    if (rowCount === 1) {
      console.log("All keys in the row:");
      Object.keys(row).forEach((key, index) => {
        console.log(
          `  ${index}: "${key}" (char codes: [${key
            .split("")
            .map((c) => c.charCodeAt(0))
            .join(", ")}])`
        );
      });

      console.log("\nTesting field access:");
      console.log(`row.subject_name: "${row.subject_name}"`);
      console.log(`row['subject_name']: "${row["subject_name"]}"`);

      // Check for invisible characters
      const keys = Object.keys(row);
      const subjectKey = keys.find((k) => k.includes("subject"));
      console.log(`\nFound subject key: "${subjectKey}"`);
      if (subjectKey) {
        console.log(`Value: "${row[subjectKey]}"`);
      }

      process.exit(0);
    }
  })
  .on("error", (error) => {
    console.error("CSV parsing error:", error);
  });
