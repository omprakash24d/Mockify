import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React from "react";
import { Input } from "../../ui/Input";
import type { AuthFormData, FormFieldHandlers } from "../types";

interface LoginFormProps {
  formData: AuthFormData;
  formFieldHandlers: FormFieldHandlers;
  validationErrors: Record<string, string>;
  showPassword: boolean;
  onTogglePassword: () => void;
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  formFieldHandlers,
  validationErrors,
  showPassword,
  onTogglePassword,
  emailRef,
  passwordRef,
}) => {
  return (
    <div className="space-y-5">
      <Input
        ref={emailRef}
        id="email"
        type="email"
        label="Email address"
        required
        value={formData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          formFieldHandlers.setEmail(e.target.value)
        }
        placeholder="Enter your email address"
        icon={<Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
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
        value={formData.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          formFieldHandlers.setPassword(e.target.value)
        }
        placeholder="Enter your password"
        icon={<Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
        error={validationErrors.password}
        variant="filled"
        inputSize="md"
        rightElement={
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
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
  );
};
