import React from "react";
import { useCoachingDetailsForm } from "../hooks/useCoachingDetailsForm";
import type { CoachingDetailsModalProps } from "../types";
import { ModalContent } from "./ModalContent";
import { ModalHeader } from "./ModalHeader";

export const CoachingDetailsModal: React.FC<CoachingDetailsModalProps> = ({
  isOpen,
  onComplete,
  initialData = {},
  title = "Complete Your Coaching Profile",
  subtitle = "All fields are required to proceed",
}) => {
  const {
    coachingName,
    phoneNumber,
    coachingLogo,
    loading,
    validationErrors,
    updateField,
    handleSubmit,
  } = useCoachingDetailsForm({
    initialData,
    onComplete,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title={title} subtitle={subtitle} />

        <ModalContent
          coachingName={coachingName}
          phoneNumber={phoneNumber}
          coachingLogo={coachingLogo}
          loading={loading}
          validationErrors={validationErrors}
          onCoachingNameChange={(value) => updateField("coachingName", value)}
          onPhoneNumberChange={(value) => updateField("phoneNumber", value)}
          onCoachingLogoChange={(value) => updateField("coachingLogo", value)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
