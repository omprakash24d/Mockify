import React, { useRef } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuthForm } from "./hooks/useAuth";

// Import all modular components
import { AuthToggle } from "./components/AuthToggle";
import { BackgroundPattern } from "./components/BackgroundPattern";
import { BrandHeader } from "./components/BrandHeader";
import { Footer } from "./components/Footer";
import { ForgotPasswordLink } from "./components/ForgotPasswordLink";
import { FormHeader } from "./components/FormHeader";
import { GoogleAuthButton } from "./components/GoogleAuthButton";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { SubmitButton } from "./components/SubmitButton";
import { WelcomeMessage } from "./components/WelcomeMessage";

// Import consolidated message components
import {
  ErrorMessage,
  FormCompletionHint,
  FormDivider,
  SuccessMessage,
} from "./components/Messages";

export const AuthScreen: React.FC = () => {
  const {
    formData,
    authState,
    passwordStrength,
    formFieldHandlers,
    authHandlers,
  } = useAuthForm();

  // Refs for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="switch" size="md" />
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div
          className={`w-full ${
            authState.isLogin ? "max-w-md" : "max-w-2xl"
          } transition-all duration-300`}
        >
          {/* Brand Header */}
          <BrandHeader />

          {/* Dynamic Welcome Message */}
          <WelcomeMessage isLogin={authState.isLogin} />

          {/* Auth Form Container */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            {/* Form Header */}
            <FormHeader isLogin={authState.isLogin} />

            <form
              onSubmit={authHandlers.handleEmailAuth}
              noValidate
              className="space-y-5"
            >
              {authState.isLogin ? (
                /* Login Form */
                <LoginForm
                  formData={formData}
                  formFieldHandlers={formFieldHandlers}
                  validationErrors={authState.validationErrors}
                  showPassword={authState.showPassword}
                  onTogglePassword={authHandlers.togglePasswordVisibility}
                  emailRef={emailRef}
                  passwordRef={passwordRef}
                />
              ) : (
                /* Signup Form */
                <SignupForm
                  formData={formData}
                  formFieldHandlers={formFieldHandlers}
                  validationErrors={authState.validationErrors}
                  showPassword={authState.showPassword}
                  showConfirmPassword={authState.showConfirmPassword}
                  onTogglePassword={authHandlers.togglePasswordVisibility}
                  onToggleConfirmPassword={
                    authHandlers.toggleConfirmPasswordVisibility
                  }
                  nameRef={nameRef}
                  emailRef={emailRef}
                  passwordRef={passwordRef}
                />
              )}

              {/* Status Messages */}
              <ErrorMessage error={authState.error} />

              <SuccessMessage
                show={authState.resetEmailSent}
                title="Reset Email Sent"
                message="Check your inbox for password reset instructions."
              />

              {/* Forgot Password */}
              {authState.isLogin && (
                <ForgotPasswordLink
                  email={formData.email}
                  loading={authState.loading}
                  resetLoading={authState.resetLoading}
                  onPasswordReset={authHandlers.handlePasswordReset}
                />
              )}

              {/* Form completion hint for signup */}
              <FormCompletionHint
                isLogin={authState.isLogin}
                isFormValid={authState.isFormValid}
                formData={formData}
                passwordStrength={passwordStrength}
              />

              {/* Submit Button */}
              <SubmitButton
                isLogin={authState.isLogin}
                loading={authState.loading}
                isFormValid={authState.isFormValid}
              />
            </form>

            {/* Divider */}
            <FormDivider />

            {/* Google Auth */}
            <GoogleAuthButton
              loading={authState.loading}
              googleLoading={authState.googleLoading}
              onGoogleAuth={authHandlers.handleGoogleAuth}
            />

            {/* Toggle between login/signup */}
            <AuthToggle
              isLogin={authState.isLogin}
              onToggle={authHandlers.toggleAuthMode}
            />
          </div>

          {/* Enhanced Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
