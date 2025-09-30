import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { auth } from "../lib/firebase";
import { SecurityManager } from "../lib/security";
import UserProfileService from "../lib/user-profile";
import type { CoachingDetailsFormData } from "../lib/validations";
import {
  checkPasswordStrength,
  getValidationErrors,
  loginSchema,
  signupSchema,
} from "../lib/validations";
import { CoachingDetailsModal } from "./CoachingDetailsModal";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { FileUpload } from "./ui/FileUpload";
import { GoogleIcon } from "./ui/GoogleIcon";
import { Input } from "./ui/Input";
import { PasswordStrengthIndicator } from "./ui/PasswordStrengthIndicator";
import { PhoneInput } from "./ui/PhoneInput";

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [coachingName, setCoachingName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coachingLogo, setCoachingLogo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<FirebaseUser | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize security manager
  const securityManager = SecurityManager.getInstance();

  // Refs for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  // Security features for future implementation
  // const [isLocked, setIsLocked] = useState(false);
  // const [lockoutTime, setLockoutTime] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    feedback: string[];
    score: number;
    strength: "very-weak" | "weak" | "fair" | "good" | "strong";
  }>({ isValid: false, feedback: [], score: 0, strength: "very-weak" });

  // Check account lockout on component mount and email change
  useEffect(() => {
    if (email) {
      const isLocked = securityManager.isAccountLocked(email);
      if (isLocked) {
        const remainingTime = securityManager.getRemainingLockoutTime(email);
        console.log(`Account locked for ${remainingTime}ms`);
      }
    }
  }, [email, securityManager]);

  // Update password strength on password change using Zod validation
  useEffect(() => {
    if (password && !isLogin) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength({
        isValid: strength.isValid,
        score: strength.score,
        strength: strength.strength,
        feedback: [
          !strength.checks.length ? "At least 8 characters" : "",
          !strength.checks.uppercase ? "One uppercase letter" : "",
          !strength.checks.lowercase ? "One lowercase letter" : "",
          !strength.checks.number ? "One number" : "",
          !strength.checks.special ? "One special character" : "",
        ].filter(Boolean),
      });
    }
  }, [password, isLogin]);

  // Validate form completeness and correctness
  useEffect(() => {
    if (isLogin) {
      // For login, only email and password are required
      const isValid = email.trim().length > 0 && password.length > 0;
      setIsFormValid(isValid);
    } else {
      // For signup, all fields must be valid
      const formData = {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        coachingName: coachingName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      // Check if all required fields are filled
      const allFieldsFilled = Object.values(formData).every(
        (value) => value.length > 0
      );

      // Validate using Zod schema
      const validationResult = signupSchema.safeParse(formData);

      // Check password strength
      const isPasswordStrong = passwordStrength.isValid;

      // Form is valid if all fields are filled, validation passes, and password is strong
      const isValid =
        allFieldsFilled && validationResult.success && isPasswordStrong;
      setIsFormValid(isValid);

      // Clear validation errors for fields that are now valid
      if (validationResult.success) {
        setValidationErrors({});
      }
    }
  }, [
    isLogin,
    email,
    password,
    confirmPassword,
    name,
    coachingName,
    phoneNumber,
    passwordStrength.isValid,
  ]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      // Validate form data using Zod
      const formData = {
        email: email.trim(),
        password,
        ...((!isLogin && {
          confirmPassword,
          name: name.trim(),
          coachingName: coachingName.trim(),
          phoneNumber: phoneNumber.trim(),
        }) ||
          {}),
      };

      let validationResult;
      if (isLogin) {
        validationResult = loginSchema.safeParse(formData);
      } else {
        validationResult = signupSchema.safeParse(formData);
      }

      if (!validationResult.success) {
        const errors = getValidationErrors(validationResult.error);
        setValidationErrors(errors);

        // Set the first error as the main error message
        const firstError = Object.values(errors)[0];
        if (firstError) {
          setError(firstError);
        }

        setLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedEmail = securityManager.sanitizeInput(email).toLowerCase();
      const sanitizedName = securityManager.sanitizeInput(name);

      // Check account lockout
      const isLocked = securityManager.isAccountLocked(sanitizedEmail);
      if (isLocked) {
        const remainingTime =
          securityManager.getRemainingLockoutTime(sanitizedEmail);
        const remainingMinutes = Math.ceil(remainingTime / 60000);
        const remainingSeconds = Math.ceil((remainingTime % 60000) / 1000);
        const timeDisplay =
          remainingMinutes > 0
            ? `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
            : `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;

        setError(
          `Account temporarily locked due to multiple failed attempts. Please try again in ${timeDisplay}.`
        );
        setLoading(false);
        return;
      }

      // Validate password strength for registration
      if (!isLogin && !passwordStrength.isValid) {
        setError("Please choose a stronger password to create your account");
        setLoading(false);
        return;
      }

      // Proceed with authentication
      if (isLogin) {
        await signInWithEmailAndPassword(auth, sanitizedEmail, password);
        securityManager.recordLoginAttempt(sanitizedEmail, true);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          sanitizedEmail,
          password
        );

        // Update user profile with sanitized name
        if (sanitizedName && userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: sanitizedName,
          });
        }

        // Create user profile with coaching details
        if (userCredential.user) {
          const sanitizedCoachingName =
            securityManager.sanitizeInput(coachingName);
          const sanitizedPhone = securityManager.sanitizeInput(phoneNumber);

          await UserProfileService.createUserProfile(userCredential.user, {
            coachingName: sanitizedCoachingName,
            phoneNumber: sanitizedPhone,
            coachingLogo: coachingLogo || undefined,
          });
        }

        securityManager.recordLoginAttempt(sanitizedEmail, true);
      }
    } catch (error: any) {
      if (isLogin && email) {
        securityManager.recordLoginAttempt(
          securityManager.sanitizeInput(email).toLowerCase(),
          false
        );
      }

      // Handle specific error messages
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      // Configure to get user info but not force account selection
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Auto-fill available Google profile information
      if (user.displayName && !name) {
        setName(user.displayName);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }

      // Check if user needs to complete coaching details
      const needsDetails = await UserProfileService.needsCoachingDetails(user);

      if (needsDetails) {
        // If we're in signup mode and have Google data, switch to signup to show the form
        if (isLogin) {
          setIsLogin(false);
        }

        // Set pending user and show coaching details modal for immediate completion
        setPendingUser(user);
        setShowCoachingModal(true);
        return;
      }

      // The Google login won't affect existing email/password authentication
      // Firebase handles multiple auth providers for the same user automatically
      console.log("Google login successful:", user.email);
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        setError(
          "An account already exists with this email. Please sign in with your email and password first, then link your Google account in settings."
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        setError(
          "Google sign-in was cancelled. Please try again if you want to continue with Google."
        );
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "Sign-in popup was blocked by your browser. Please allow popups and try again."
        );
      } else if (error.code === "auth/cancelled-popup-request") {
        // User cancelled - don't show error for this
        return;
      } else {
        setError(error.message || "An error occurred during Google sign-in");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetLoading(true);

    // Validate email using Zod
    const resetPasswordSchema = { email: email.trim() };
    const validation = loginSchema
      .pick({ email: true })
      .safeParse(resetPasswordSchema);

    if (!validation.success) {
      const errors = getValidationErrors(validation.error);
      setError(errors.email || "Please enter a valid email address");
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
      setError("");
      // Clear password fields after successful reset email
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many password reset attempts. Please try again later.");
      } else {
        setError(
          error.message || "An error occurred while sending reset email"
        );
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleCoachingDetailsComplete = async (
    details: CoachingDetailsFormData
  ) => {
    if (!pendingUser) return;

    try {
      // Validate that all essential information is provided
      if (!details.coachingName || !details.phoneNumber) {
        setError("All coaching details are required to proceed.");
        return;
      }

      // Update or create user profile with coaching details
      const existingProfile = await UserProfileService.getUserProfile(
        pendingUser.uid
      );

      if (existingProfile) {
        await UserProfileService.updateUserProfile(pendingUser.uid, details);
      } else {
        await UserProfileService.createUserProfile(pendingUser, details);
      }

      setShowCoachingModal(false);
      setPendingUser(null);

      // Clear form data after successful completion
      setName("");
      setEmail("");
      setCoachingName("");
      setPhoneNumber("");
      setCoachingLogo("");
      setPassword("");
      setConfirmPassword("");

      console.log("Coaching details saved successfully");
    } catch (error) {
      console.error("Error saving coaching details:", error);
      setError("Failed to save coaching details. Please try again.");
    }
  };

  const {} = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 60 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="7"
                cy="7"
                r="1"
                fill="currentColor"
                className="text-gray-300 dark:text-gray-700"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="switch" size="md" />
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div
          className={`w-full ${
            isLogin ? "max-w-md" : "max-w-2xl"
          } transition-all duration-300`}
        >
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              {/* Modern Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-lg flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <span className="text-white text-xl font-bold">M</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Brand Text */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent leading-tight">
                Mockify
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Test Preparation Platform
              </p>
            </div>

            {/* Dynamic Welcome Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isLogin ? "Welcome back!" : "Join Mockify"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Create your account to get started"}
              </p>
            </div>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
                {isLogin ? (
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLogin
                  ? "Enter your credentials to access your dashboard"
                  : "Fill in your details to get started"}
              </p>
            </div>
            <form onSubmit={handleEmailAuth} noValidate className="space-y-5">
              {!isLogin ? (
                /* Signup Form - Modern two-column layout */
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        ref={nameRef}
                        id="name"
                        type="text"
                        label="Full Name"
                        required
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setName(e.target.value)
                        }
                        placeholder="Enter your full name"
                        icon={
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        }
                        error={validationErrors.name}
                        variant="filled"
                        inputSize="md"
                      />

                      <Input
                        ref={emailRef}
                        id="email"
                        type="email"
                        label="Email address"
                        required
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                        placeholder="Enter your email address"
                        icon={
                          <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        }
                        error={validationErrors.email}
                        variant="filled"
                        inputSize="md"
                      />
                    </div>
                  </div>

                  {/* Institute Information Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                        <Building2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      Institute Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id="coachingName"
                        type="text"
                        label="Coaching Institute Name"
                        required
                        value={coachingName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCoachingName(e.target.value)
                        }
                        placeholder="Enter your institute name"
                        icon={
                          <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        }
                        error={validationErrors.coachingName}
                        variant="filled"
                        inputSize="md"
                      />

                      <PhoneInput
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        error={validationErrors.phoneNumber}
                        required
                        placeholder="Enter 10-digit number"
                      />
                    </div>
                    <div className="mt-4">
                      <FileUpload
                        label="Coaching Logo (Optional)"
                        value={coachingLogo}
                        onChange={(_, previewUrl) =>
                          setCoachingLogo(previewUrl)
                        }
                        error={validationErrors.coachingLogo}
                        maxSize={5}
                        accept="image/*"
                      />
                    </div>
                  </div>

                  {/* Security Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-2">
                        <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </div>
                      Security Setup
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        ref={passwordRef}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        required
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Create a strong password"
                        icon={
                          <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        }
                        error={validationErrors.password}
                        variant="filled"
                        inputSize="md"
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                      />

                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Confirm your password"
                        icon={
                          <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        }
                        error={validationErrors.confirmPassword}
                        variant="filled"
                        inputSize="md"
                        rightElement={
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <PasswordStrengthIndicator
                        password={password}
                        confirmPassword={confirmPassword}
                        showConfirmation={!!confirmPassword}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Login Form - Clean and focused */
                <div className="space-y-5">
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    label="Email address"
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email address"
                    icon={
                      <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    }
                    error={validationErrors.email}
                    variant="filled"
                    inputSize="md"
                  />

                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    icon={
                      <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    }
                    error={validationErrors.password}
                    variant="filled"
                    inputSize="md"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                  />
                </div>
              )}

              {/* Status Messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg animate-slide-down">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Authentication Error
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resetEmailSent && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg animate-slide-down">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Reset Email Sent
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Check your inbox for password reset instructions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={!email || loading || resetLoading}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send password reset email"
                  >
                    {resetLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
              )}

              {/* Form completion hint for signup */}
              {!isLogin && !isFormValid && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-2">
                        Complete all required fields:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                        {!name.trim() && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Full name</span>
                          </div>
                        )}
                        {!email.trim() && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Email address</span>
                          </div>
                        )}
                        {!password && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Password</span>
                          </div>
                        )}
                        {!confirmPassword && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Confirm password</span>
                          </div>
                        )}
                        {!coachingName.trim() && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Institute name</span>
                          </div>
                        )}
                        {!phoneNumber.trim() && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            <span>Phone number</span>
                          </div>
                        )}
                        {password && !passwordStrength.isValid && (
                          <div className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                            <span>Strong password</span>
                          </div>
                        )}
                        {password &&
                          confirmPassword &&
                          password !== confirmPassword && (
                            <div className="flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              <span>Passwords match</span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  loading={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>
                        {isLogin ? "Signing you in..." : "Creating account..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      {isLogin ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/95 dark:bg-gray-900/95 text-gray-500 dark:text-gray-400 font-medium backdrop-blur-sm">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Google Auth */}
            <Button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              loading={googleLoading}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              {!googleLoading && <GoogleIcon className="w-5 h-5 mr-3" />}
              {googleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setResetEmailSent(false);
                  setValidationErrors({});
                  setIsFormValid(false);
                  // Clear signup fields when switching to login
                  if (!isLogin) {
                    setName("");
                    setCoachingName("");
                    setPhoneNumber("");
                    setCoachingLogo("");
                    setConfirmPassword("");
                  }
                  setPassword("");
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors group"
              >
                <span className="group-hover:underline decoration-2 underline-offset-2">
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-8 space-y-3">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>© 2025 Mockify.</span>
              <span>•</span>
              <span>All rights reserved.</span>
              <span>•</span>
              <span>Trusted worldwide</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
              Secure authentication powered by industry-standard encryption.
              Your data is protected and never shared.
            </p>
          </div>
        </div>
      </div>

      {/* Coaching Details Modal */}
      <CoachingDetailsModal
        isOpen={showCoachingModal}
        onComplete={handleCoachingDetailsComplete}
        title="Complete Your Coaching Setup"
        subtitle="All details are required to proceed"
      />
    </div>
  );
};
