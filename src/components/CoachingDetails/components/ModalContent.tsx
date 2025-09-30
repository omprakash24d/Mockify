import React from "react";
import type { CoachingDetailsFormState } from "../types";
import { isFormValid } from "../utils/validation";
import { ActionButtons } from "./ActionButtons";
import { FormFields } from "./FormFields";
import { Sidebar } from "./Sidebar";
import { StatusMessages } from "./StatusMessages";

interface ModalContentProps extends CoachingDetailsFormState {
  onCoachingNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onCoachingLogoChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  coachingName,
  phoneNumber,
  coachingLogo,
  loading,
  validationErrors,
  onCoachingNameChange,
  onPhoneNumberChange,
  onCoachingLogoChange,
  onSubmit,
}) => {
  const isValid = isFormValid(coachingName, phoneNumber);

  return (
    <div className="relative z-10 max-h-[calc(95vh-8rem)] overflow-y-auto">
      <form onSubmit={onSubmit} className="px-6 pb-8">
        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Fields */}
          <FormFields
            coachingName={coachingName}
            phoneNumber={phoneNumber}
            coachingLogo={coachingLogo}
            validationErrors={validationErrors}
            onCoachingNameChange={onCoachingNameChange}
            onPhoneNumberChange={onPhoneNumberChange}
            onCoachingLogoChange={onCoachingLogoChange}
          />

          {/* Right Column - Progress & Info */}
          <Sidebar
            coachingName={coachingName}
            phoneNumber={phoneNumber}
            coachingLogo={coachingLogo}
          />
        </div>

        {/* Action Buttons */}
        <ActionButtons
          loading={loading}
          isFormValid={isValid}
          onSubmit={onSubmit}
        />

        {/* Status Messages */}
        <StatusMessages isFormValid={isValid} />
      </form>
    </div>
  );
};
