import React from "react";
import { Button } from "../../ui/Button";
import { GoogleIcon } from "../../ui/GoogleIcon";

interface GoogleAuthButtonProps {
  loading: boolean;
  googleLoading: boolean;
  onGoogleAuth: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  loading,
  googleLoading,
  onGoogleAuth,
}) => {
  return (
    <Button
      type="button"
      onClick={onGoogleAuth}
      disabled={loading || googleLoading}
      loading={googleLoading}
      variant="outline"
      className="w-full h-12 text-base font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      size="lg"
    >
      {/* Button component handles loading spinner, we just provide text and icon */}
      <div className="flex items-center space-x-2">
        {!googleLoading && <GoogleIcon className="w-5 h-5" />}
        <span>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </span>
      </div>
    </Button>
  );
};
