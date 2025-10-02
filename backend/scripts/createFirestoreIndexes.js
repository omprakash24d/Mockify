const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-account.json"); // You'll need to add this file

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "mockifyneet",
  });
}

const db = admin.firestore();

async function createIndexes() {
  console.log("Creating Firestore composite indexes...");

  try {
    // The indexes that are commonly needed based on the error
    const indexes = [
      {
        collectionGroup: "questions",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "subject_id", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "chapter_id", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "difficulty", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "subject_id", order: "ASCENDING" },
          { fieldPath: "difficulty", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
    ];

    console.log(
      "Note: Firebase Admin SDK cannot create indexes programmatically."
    );
    console.log(
      "Please create these indexes manually in the Firebase Console:"
    );
    console.log(
      "Go to: https://console.firebase.google.com/project/mockifyneet/firestore/indexes"
    );
    console.log("");

    indexes.forEach((index, i) => {
      console.log(`Index ${i + 1}:`);
      console.log(`Collection Group: ${index.collectionGroup}`);
      console.log("Fields:");
      index.fields.forEach((field) => {
        console.log(`  - ${field.fieldPath}: ${field.order}`);
      });
      console.log("");
    });

    console.log("Alternatively, you can use the Firebase CLI:");
    console.log("1. Install Firebase CLI: npm install -g firebase-tools");
    console.log("2. Login: firebase login");
    console.log("3. Create firestore.indexes.json with the above indexes");
    console.log("4. Deploy: firebase deploy --only firestore:indexes");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Alternative: Create a firestore.indexes.json file for Firebase CLI
function createIndexesConfig() {
  const indexesConfig = {
    indexes: [
      {
        collectionGroup: "questions",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "subject_id", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "chapter_id", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "difficulty", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
      {
        collectionGroup: "questions",
        queryScope: "COLLECTION",
        fields: [
          { fieldPath: "is_active", order: "ASCENDING" },
          { fieldPath: "subject_id", order: "ASCENDING" },
          { fieldPath: "difficulty", order: "ASCENDING" },
          { fieldPath: "q_num", order: "ASCENDING" },
        ],
      },
    ],
    fieldOverrides: [],
  };

  const fs = require("fs");
  const path = require("path");

  const configPath = path.join(__dirname, "../../firestore.indexes.json");
  fs.writeFileSync(configPath, JSON.stringify(indexesConfig, null, 2));

  console.log("Created firestore.indexes.json");
  console.log(
    "To deploy indexes, run: firebase deploy --only firestore:indexes"
  );
}

if (require.main === module) {
  createIndexes();
  createIndexesConfig();
}

module.exports = { createIndexes, createIndexesConfig };
