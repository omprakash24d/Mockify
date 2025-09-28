import { Building2 } from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { CoachingDetailsFormData } from "../lib/validations";
import { coachingDetailsSchema, getValidationErrors } from "../lib/validations";
import { Button } from "./ui/Button";
import { FileUpload } from "./ui/FileUpload";
import { Input } from "./ui/Input";
import { PhoneInput } from "./ui/PhoneInput";

interface CoachingDetailsModalProps {
  isOpen: boolean;
  onComplete: (details: CoachingDetailsFormData) => void;
  initialData?: Partial<CoachingDetailsFormData>;
  title?: string;
  subtitle?: string;
}

export const CoachingDetailsModal: React.FC<CoachingDetailsModalProps> = ({
  isOpen,
  onComplete,
  initialData = {},
  title = "Complete Your Coaching Profile",
  subtitle = "All fields are required to proceed",
}) => {
  const { theme } = useTheme();
  const [coachingName, setCoachingName] = useState(
    initialData.coachingName || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || "");
  const [coachingLogo, setCoachingLogo] = useState(
    initialData.coachingLogo || ""
  );
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      const formData = {
        coachingName: coachingName.trim(),
        phoneNumber: phoneNumber.trim(),
        coachingLogo: coachingLogo.trim() || undefined,
      };

      const validationResult = coachingDetailsSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = getValidationErrors(validationResult.error);
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      await onComplete(validationResult.data);
    } catch (error) {
      console.error("Error submitting coaching details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const overlayClasses =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50";
  const modalClasses = `
    max-w-2xl w-full rounded-xl shadow-xl border transition-all duration-200
    ${
      theme === "dark"
        ? "bg-neutral-900 border-neutral-700"
        : "bg-white border-gray-200"
    }
  `;

  return (
    <div className={overlayClasses}>
      <div className={modalClasses}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2
              className={`text-xl font-semibold mb-2 font-lato ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Coaching Name */}
              <Input
                label="Coaching Institute Name"
                type="text"
                value={coachingName}
                onChange={(e) => setCoachingName(e.target.value)}
                placeholder="Enter your coaching institute name"
                icon={<Building2 className="h-5 w-5" />}
                error={validationErrors.coachingName}
                required
              />

              {/* Phone Number */}
              <PhoneInput
                
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={validationErrors.phoneNumber}
                required
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Coaching Logo (Optional) */}
              <FileUpload
                label="Coaching Logo (Optional)"
                value={coachingLogo}
                onChange={(_, previewUrl) => setCoachingLogo(previewUrl)}
                error={validationErrors.coachingLogo}
                maxSize={5}
                accept="image/*"
              />

              {/* Info Text */}
              <div
                className={`text-sm p-4 rounded-lg border ${
                  theme === "dark"
                    ? "bg-blue-900/20 border-blue-800 text-blue-300"
                    : "bg-blue-50 border-blue-200 text-blue-600"
                }`}
              >
                <p className="font-medium mb-2">Smart Detection</p>
                <p className="text-xs leading-relaxed">
                  Only coaching logo can be skipped - all other fields are
                  required to complete your profile.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            * If no logo is uploaded, a default school icon will be used
          </div>

          {/* Buttons */}
          <div className="pt-6">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>

            <p
              className={`text-xs text-center mt-3 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              All fields are required to proceed to your dashboard
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
