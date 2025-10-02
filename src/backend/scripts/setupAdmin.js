const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(
  __dirname,
  "mockifyneet-firebase-adminsdk-fbsvc-bd57857713.json"
);

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "mockifyneet",
  });

  console.log("✅ Firebase Admin SDK initialized");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin SDK:", error.message);
  console.log(
    "Please ensure you have the service account key file in the backend directory"
  );
  process.exit(1);
}

/**
 * Set admin role for a user
 */
async function setUserAsAdmin(email, isAdmin = true) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: isAdmin,
      role: isAdmin ? "admin" : "user",
    });

    console.log(
      `✅ Successfully set ${email} as ${isAdmin ? "admin" : "user"}`
    );
    console.log(`   UID: ${userRecord.uid}`);

    return userRecord;
  } catch (error) {
    console.error(`❌ Error setting admin role for ${email}:`, error.message);
    throw error;
  }
}

/**
 * List all admin users
 */
async function listAdminUsers() {
  try {
    console.log("\n📋 Listing all admin users...");

    // List all users (this is paginated in production)
    const listUsersResult = await admin.auth().listUsers(1000);

    const adminUsers = [];

    for (const userRecord of listUsersResult.users) {
      const customClaims = userRecord.customClaims || {};
      if (customClaims.admin === true || customClaims.role === "admin") {
        adminUsers.push({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          claims: customClaims,
        });
      }
    }

    if (adminUsers.length === 0) {
      console.log("No admin users found");
    } else {
      console.log(`Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.email} (${user.displayName || "No name"})`
        );
        console.log(`   UID: ${user.uid}`);
      });
    }

    return adminUsers;
  } catch (error) {
    console.error("❌ Error listing admin users:", error.message);
    throw error;
  }
}

/**
 * Remove admin role from a user
 */
async function removeAdminRole(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: false,
      role: "user",
    });

    console.log(`✅ Removed admin role from ${email}`);
    return userRecord;
  } catch (error) {
    console.error(`❌ Error removing admin role from ${email}:`, error.message);
    throw error;
  }
}

/**
 * Check user's current role
 */
async function checkUserRole(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const customClaims = userRecord.customClaims || {};

    console.log(`\n👤 User: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Display Name: ${userRecord.displayName || "Not set"}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Role: ${customClaims.role || "user"}`);
    console.log(`   Admin: ${customClaims.admin === true ? "Yes" : "No"}`);
    console.log(
      `   Created: ${new Date(
        userRecord.metadata.creationTime
      ).toLocaleString()}`
    );

    return { userRecord, customClaims };
  } catch (error) {
    console.error(`❌ Error checking user role for ${email}:`, error.message);
    throw error;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🛠️  Mockify Admin User Management

Usage:
  node setupAdmin.js set-admin <email>        # Set user as admin
  node setupAdmin.js remove-admin <email>     # Remove admin role
  node setupAdmin.js check <email>            # Check user role
  node setupAdmin.js list-admins              # List all admin users

Examples:
  node setupAdmin.js set-admin admin@mockify.com
  node setupAdmin.js check user@example.com
  node setupAdmin.js list-admins
    `);
    return;
  }

  const command = args[0];
  const email = args[1];

  try {
    switch (command) {
      case "set-admin":
        if (!email) {
          console.error("❌ Email is required for set-admin command");
          return;
        }
        await setUserAsAdmin(email, true);
        break;

      case "remove-admin":
        if (!email) {
          console.error("❌ Email is required for remove-admin command");
          return;
        }
        await removeAdminRole(email);
        break;

      case "check":
        if (!email) {
          console.error("❌ Email is required for check command");
          return;
        }
        await checkUserRole(email);
        break;

      case "list-admins":
        await listAdminUsers();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        break;
    }
  } catch (error) {
    console.error("❌ Operation failed:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = {
  setUserAsAdmin,
  listAdminUsers,
  removeAdminRole,
  checkUserRole,
};
