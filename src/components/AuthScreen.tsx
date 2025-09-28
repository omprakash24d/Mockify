import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
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

      // Check if user needs to complete coaching details
      const needsDetails = await UserProfileService.needsCoachingDetails(
        result.user
      );

      if (needsDetails) {
        // Set pending user and show coaching details modal
        setPendingUser(result.user);
        setShowCoachingModal(true);
        return;
      }

      // The Google login won't affect existing email/password authentication
      // Firebase handles multiple auth providers for the same user automatically
      console.log("Google login successful:", result.user.email);
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
      console.log("Coaching details saved successfully");
    } catch (error) {
      console.error("Error saving coaching details:", error);
      setError("Failed to save coaching details. Please try again.");
    }
  };

  const { classes, theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${classes.bg.secondary} flex items-center justify-center p-4 sm:p-6 lg:p-8`}
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo and Header - Improved Layout */}
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo and Brand in single row */}
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">M</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
                  Mockify
                </h1>
                <p className={`${classes.text.secondary} text-sm font-medium`}>
                  Test Preparation Platform
                </p>
              </div>
            </div>

            {/* Welcome message */}
            <div className="space-y-1">
              <h2 className={`text-xl font-semibold ${classes.text.primary}`}>
                {isLogin ? "Welcome back!" : "Create account"}
              </h2>
              <p className={`${classes.text.secondary} text-sm`}>
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Join thousands of coaching institutes"}
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div
          className={`${classes.bg.elevated} rounded-xl shadow-lg border ${classes.border.default} p-6 sm:p-8 transition-all duration-200 hover:shadow-xl`}
        >
          <form onSubmit={handleEmailAuth} noValidate>
            {!isLogin ? (
              /* Signup Form - Multi-column layout */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Name field */}
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
                        <User className={`h-5 w-5 ${classes.text.primary}`} />
                      }
                      error={validationErrors.name}
                    />

                    {/* Coaching Name field */}
                    <Input
                      id="coachingName"
                      type="text"
                      label="Coaching Institute Name"
                      required
                      value={coachingName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCoachingName(e.target.value)
                      }
                      placeholder="Enter your coaching institute name"
                      icon={
                        <Building2
                          className={`h-5 w-5 ${classes.text.primary}`}
                        />
                      }
                      error={validationErrors.coachingName}
                    />

                    {/* Email field */}
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
                      placeholder="Enter your email"
                      icon={
                        <Mail className={`h-5 w-5 ${classes.text.primary}`} />
                      }
                      error={validationErrors.email}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Phone Number field */}
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      error={validationErrors.phoneNumber}
                      required
                    />

                    {/* Coaching Logo field */}
                    <FileUpload
                      label="Coaching Logo (Optional)"
                      value={coachingLogo}
                      onChange={(_, previewUrl) => setCoachingLogo(previewUrl)}
                      error={validationErrors.coachingLogo}
                      maxSize={5}
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* Full-width password fields */}
                <div className="space-y-4">
                  {/* Password field */}
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
                      <Lock className={`h-5 w-5 ${classes.text.primary}`} />
                    }
                    error={validationErrors.password}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:text-blue-500 dark:focus:text-blue-400"
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

                  {/* Confirm Password field for signup */}
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Re-enter your password"
                    icon={
                      <Lock className={`h-5 w-5 ${classes.text.primary}`} />
                    }
                    error={validationErrors.confirmPassword}
                    rightElement={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:text-blue-500 dark:focus:text-blue-400"
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

                  {/* Password strength indicator for signup */}
                  <PasswordStrengthIndicator
                    password={password}
                    confirmPassword={confirmPassword}
                    showConfirmation={!!confirmPassword}
                  />
                </div>
              </div>
            ) : (
              /* Login Form - Simple layout */
              <div className="space-y-6">
                {/* Email field */}
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
                  placeholder="Enter your email"
                  icon={<Mail className={`h-5 w-5 ${classes.text.primary}`} />}
                  error={validationErrors.email}
                />

                {/* Password field */}
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
                  icon={<Lock className={`h-5 w-5 ${classes.text.primary}`} />}
                  error={validationErrors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:text-blue-500 dark:focus:text-blue-400"
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

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Reset email confirmation */}
            {resetEmailSent && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Password reset email sent! Check your inbox.
                  </span>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={!email || loading || resetLoading}
                  className={`text-sm ${classes.text.accent} hover:opacity-80 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Send password reset email"
                >
                  {resetLoading
                    ? "Sending reset email..."
                    : "Forgot your password?"}
                </button>
              </div>
            )}

            {/* Form completion hint for signup */}
            {!isLogin && !isFormValid && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">
                      Complete all fields to continue:
                    </p>
                    <ul className="text-xs space-y-1">
                      {!name.trim() && <li>• Full name is required</li>}
                      {!email.trim() && <li>• Email address is required</li>}
                      {!password && <li>• Password is required</li>}
                      {!confirmPassword && (
                        <li>• Confirm password is required</li>
                      )}
                      {!coachingName.trim() && (
                        <li>• Coaching institute name is required</li>
                      )}
                      {!phoneNumber.trim() && (
                        <li>• Phone number is required</li>
                      )}
                      {password && !passwordStrength.isValid && (
                        <li>• Password strength requirements not met</li>
                      )}
                      {password &&
                        confirmPassword &&
                        password !== confirmPassword && (
                          <li>• Passwords must match</li>
                        )}
                    </ul>
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
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {loading
                  ? isLogin
                    ? "Signing you in..."
                    : "Creating account..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className={`absolute inset-0 flex items-center`}>
                <div
                  className={`w-full border-t ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  }`}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-4 ${classes.bg.elevated} ${classes.text.secondary} font-medium`}
                >
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
            className={`w-full h-12 text-base font-semibold border-2 hover:shadow-md transition-all duration-200 ${
              theme === "dark"
                ? "text-gray-200 border-gray-600 hover:bg-gray-800 hover:border-gray-500"
                : "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
            size="lg"
          >
            {!googleLoading && <GoogleIcon className="w-5 h-5 mr-3" />}
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </Button>

          {/* Toggle between login/signup */}
          <div className="mt-8 text-center">
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
              className={`text-sm sm:text-base ${classes.text.accent} hover:opacity-80 font-medium transition-opacity`}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center text-xs sm:text-sm ${classes.text.secondary} mt-8`}
        >
          <p>© 2025 Mockify. All rights reserved.</p>
          <p className="mt-1">Your trusted partner in test preparation.</p>
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
