import { Building2 } from "lucide-react";
import React from "react";
import { FileUpload } from "../../ui/FileUpload";
import { Input } from "../../ui/Input";
import { PhoneInput } from "../../ui/PhoneInput";
import type { AuthFormData, FormFieldHandlers } from "../types";

interface InstituteDetailsSectionProps {
  formData: AuthFormData;
  formFieldHandlers: FormFieldHandlers;
  validationErrors: Record<string, string>;
}

export const InstituteDetailsSection: React.FC<
  InstituteDetailsSectionProps
> = ({ formData, formFieldHandlers, validationErrors }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
          <Building2 className="w-3 h-3 text-green-600 dark:text-green-400" />
        </div>
        Institute Details
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="coachingName"
          type="text"
          label="Coaching Institute Name"
          required
          value={formData.coachingName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formFieldHandlers.setCoachingName(e.target.value)
          }
          placeholder="Enter your institute name"
          icon={
            <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          }
          error={validationErrors.coachingName}
          variant="filled"
          inputSize="md"
        />

        <PhoneInput
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={formFieldHandlers.setPhoneNumber}
          error={validationErrors.phoneNumber}
          required
          placeholder="Enter 10-digit number"
        />
      </div>
      <div className="mt-4">
        <FileUpload
          label="Coaching Logo (Optional)"
          value={formData.coachingLogo}
          onChange={(_, previewUrl) =>
            formFieldHandlers.setCoachingLogo(previewUrl)
          }
          error={validationErrors.coachingLogo}
          maxSize={5}
          accept="image/*"
        />
      </div>
    </div>
  );
};
