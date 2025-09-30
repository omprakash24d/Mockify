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
  );
};
