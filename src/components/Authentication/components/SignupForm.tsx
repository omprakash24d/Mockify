import React from "react";
import type { AuthFormData, FormFieldHandlers } from "../types";
import { InstituteDetailsSection } from "./InstituteDetailsSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { SecuritySection } from "./SecuritySection";

interface SignupFormProps {
  formData: AuthFormData;
  formFieldHandlers: FormFieldHandlers;
  validationErrors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  nameRef: React.RefObject<HTMLInputElement | null>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  formFieldHandlers,
  validationErrors,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  nameRef,
  emailRef,
  passwordRef,
}) => {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <PersonalInfoSection
        formData={formData}
        formFieldHandlers={formFieldHandlers}
        validationErrors={validationErrors}
        nameRef={nameRef}
        emailRef={emailRef}
      />

      {/* Institute Information Section */}
      <InstituteDetailsSection
        formData={formData}
        formFieldHandlers={formFieldHandlers}
        validationErrors={validationErrors}
      />

      {/* Security Section */}
      <SecuritySection
        formData={formData}
        formFieldHandlers={formFieldHandlers}
        validationErrors={validationErrors}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        onTogglePassword={onTogglePassword}
        onToggleConfirmPassword={onToggleConfirmPassword}
        passwordRef={passwordRef}
      />
    </div>
  );
};
