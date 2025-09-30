import { Building2 } from "lucide-react";
import React from "react";
import { FileUpload } from "../../ui/FileUpload";
import { Input } from "../../ui/Input";
import { PhoneInput } from "../../ui/PhoneInput";
import type { FormFieldsProps } from "../types";

export const FormFields: React.FC<FormFieldsProps> = ({
  coachingName,
  phoneNumber,
  coachingLogo,
  validationErrors,
  onCoachingNameChange,
  onPhoneNumberChange,
  onCoachingLogoChange,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Institute Name */}
      <div className="space-y-4">
        <Input
          label="Coaching Institute Name"
          type="text"
          value={coachingName}
          onChange={(e) => onCoachingNameChange(e.target.value)}
          placeholder="Enter your coaching institute name"
          icon={<Building2 className="h-5 w-5" />}
          error={validationErrors.coachingName}
          required
          inputSize="lg"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-4">
        <PhoneInput
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          error={validationErrors.phoneNumber}
          required
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <FileUpload
          label="Coaching Logo (Optional)"
          value={coachingLogo}
          onChange={(_, previewUrl) => onCoachingLogoChange(previewUrl)}
          error={validationErrors.coachingLogo}
          maxSize={5}
          accept="image/*"
        />
      </div>
    </div>
  );
};
