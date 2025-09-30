# 🔐 Security Setup Instructions

## ⚠️ CRITICAL: Firebase Service Account Key Security

This repository previously contained Firebase service account keys that have been removed for security. **If you are the owner of this repository, you MUST take the following actions immediately:**

### 1. **Revoke the Compromised Key (URGENT)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`mockifyneet`)
3. Go to Project Settings → Service Accounts
4. Find the service account key that was committed
5. **Delete/Revoke it immediately**
6. Generate a new service account key

### 2. **Secure Setup for Development**

1. **Copy the environment template:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Download your new Firebase service account key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file to a secure location OUTSIDE this repository
   - Example: `C:\secure\firebase-keys\mockifyneet-service-account.json`

3. **Update your `.env` file:**
   ```env
   FIREBASE_PROJECT_ID=mockifyneet
   FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=C:\secure\firebase-keys\mockifyneet-service-account.json
   ```

### 3. **Production Deployment Security**

For production environments, consider these secure alternatives:

#### Option A: Environment Variables (Recommended)
Instead of using a file path, you can set the service account key as environment variables:

```javascript
// In your Firebase config
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});
```

#### Option B: Application Default Credentials
For Google Cloud deployments, use Application Default Credentials:

```javascript
const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});
```

### 4. **Security Best Practices**

- ✅ **DO**: Store service account keys outside the repository
- ✅ **DO**: Use environment variables for sensitive configuration
- ✅ **DO**: Add all key files to `.gitignore`
- ✅ **DO**: Use different service accounts for different environments
- ✅ **DO**: Regularly rotate service account keys

- ❌ **DON'T**: Commit any `.json` key files
- ❌ **DON'T**: Share service account keys in plain text
- ❌ **DON'T**: Use production keys in development
- ❌ **DON'T**: Store keys in code or configuration files

### 5. **Verification**

To verify your setup is secure:

```bash
# Check that no service account keys are tracked
git log --all --full-history -- "**/*firebase*adminsdk*.json"

# Should return no results or show deletion commits only
```

---

**Remember**: Security is not optional. Service account keys provide full access to your Firebase project. Treat them like passwords and never expose them publicly.