const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

// Firebase configuration
let db;
let auth;

const initializeFirebase = () => {
  try {
    // Initialize Firebase Admin SDK using service account file
    const serviceAccountPath =
      process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ||
      path.join(
        __dirname,
        "..",
        "mockifyneet-firebase-adminsdk-fbsvc-bd57857713.json"
      );

    const app = initializeApp({
      credential: cert(require(serviceAccountPath)),
      projectId: process.env.FIREBASE_PROJECT_ID || "mockifyneet",
    });

    db = getFirestore(app);
    auth = getAuth(app);

    console.log("🔥 Firebase initialized successfully");
    console.log(
      `📋 Project ID: ${process.env.FIREBASE_PROJECT_ID || "mockifyneet"}`
    );
    return { db, auth };
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    console.log("⚠️  Falling back to MongoDB only");
    return { db: null, auth: null };
  }
};

module.exports = {
  initializeFirebase,
  getFirestore: () => db,
  getAuth: () => auth,
};
