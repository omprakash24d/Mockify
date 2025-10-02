const admin = require("firebase-admin");

/**
 * Middleware to verify Firebase ID token and check admin role
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    // Get the ID token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No authorization token provided",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user has admin role
    const isAdmin = checkAdminRole(decodedToken);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions. Admin access required.",
      });
    }

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "user",
      customClaims: decodedToken,
    };

    next();
  } catch (error) {
    console.error("Admin auth error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({
        success: false,
        error: "Token revoked",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

/**
 * Check if user has admin role
 */
function checkAdminRole(decodedToken) {
  // Method 1: Check custom claims
  if (decodedToken.admin === true || decodedToken.role === "admin") {
    return true;
  }

  // Method 2: Check specific admin emails (for development/small teams)
  const adminEmails = [
    "admin@mockify.com",
    "omprakash24d@gmail.com", // Add your admin email
    // Add more admin emails as needed
  ];

  if (adminEmails.includes(decodedToken.email)) {
    return true;
  }

  // Method 3: Check if user is in admin domain
  if (decodedToken.email && decodedToken.email.endsWith("@mockify.com")) {
    return true;
  }

  return false;
}

/**
 * Optional middleware - only verify token but don't require admin
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No authorization token provided",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "user",
      customClaims: decodedToken,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

/**
 * Set custom claims for a user (to make them admin)
 * This should be called from a secure admin endpoint
 */
const setAdminClaims = async (uid, isAdmin = true) => {
  try {
    await admin.auth().setCustomUserClaims(uid, {
      admin: isAdmin,
      role: isAdmin ? "admin" : "user",
    });
    console.log(`Admin claims set for user: ${uid}`);
    return true;
  } catch (error) {
    console.error("Error setting admin claims:", error);
    throw error;
  }
};

/**
 * Get user with custom claims
 */
const getUserWithClaims = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      customClaims: userRecord.customClaims || {},
    };
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

module.exports = {
  verifyAdminToken,
  verifyToken,
  setAdminClaims,
  getUserWithClaims,
  checkAdminRole,
};
