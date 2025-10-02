/**
 * Post-Signup Success Guide
 *
 * Shows after successful account creation to guide users through email verification
 */

import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import React from "react";
import { Button } from "../../ui/Button";

interface PostSignupGuideProps {
  email: string;
  onContinue: () => void;
  onResendEmail?: () => void;
  resendLoading?: boolean;
}

export const PostSignupGuide: React.FC<PostSignupGuideProps> = ({
  email,
  onContinue,
  onResendEmail,
  resendLoading = false,
}) => {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome to Mockify! Your account has been created with the email:
        </p>
        <p className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2 px-4 inline-block">
          {email}
        </p>
      </div>

      {/* Email Verification Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
            Verify Your Email Address
          </h3>
        </div>

        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          We've sent a verification email to your inbox. Please verify your
          email to unlock all features:
        </p>

        <div className="text-left text-sm text-yellow-700 dark:text-yellow-300 space-y-1 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            <span>Check your email inbox (and spam folder)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            <span>Click the verification link</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            <span>Return here and sign in</span>
          </div>
        </div>

        {onResendEmail && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResendEmail}
            disabled={resendLoading}
            className="text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}
      </div>

      {/* Continue Button */}
      <div className="space-y-3">
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          size="lg"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          You can start using Mockify now, but some features require email
          verification
        </p>
      </div>
    </div>
  );
};
