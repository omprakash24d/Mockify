import { Lock, User } from "lucide-react";
import React from "react";
import { Button } from "../../ui/Button";

interface SubmitButtonProps {
  isLogin: boolean;
  loading: boolean;
  isFormValid: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLogin,
  loading,
  isFormValid,
}) => {
  return (
    <div className="pt-4">
      <Button
        type="submit"
        disabled={loading || !isFormValid}
        loading={loading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        size="lg"
      >
        {/* Button component handles loading spinner, we just provide text and icons */}
        <div className="flex items-center justify-center space-x-2">
          <span>
            {loading
              ? isLogin
                ? "Signing you in..."
                : "Creating account..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </span>
          {!loading && (
            <>
              {isLogin ? (
                <Lock className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </>
          )}
        </div>
      </Button>
    </div>
  );
};
