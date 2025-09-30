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

      // Additional validation to ensure essential fields are not empty
      if (!formData.coachingName) {
        setValidationErrors({
          coachingName: "Coaching institute name is required",
        });
        setLoading(false);
        return;
      }

      if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
        setValidationErrors({
          phoneNumber: "Valid 10-digit phone number is required",
        });
        setLoading(false);
        return;
      }

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

  // Check if form is valid for button state
  const isFormValid =
    coachingName.trim().length > 0 && phoneNumber.trim().length >= 10;

  if (!isOpen) return null;

  // Prevent modal dismissal - user must complete the form
  const overlayClasses =
    "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm";
  const modalClasses = `
    max-w-2xl w-full rounded-xl shadow-2xl border transition-all duration-200 max-h-[90vh] overflow-y-auto
    ${
      theme === "dark"
        ? "bg-gray-900 border-gray-700"
        : "bg-white border-gray-200"
    }
  `;

  return (
    <div className={overlayClasses} onClick={(e) => e.stopPropagation()}>
      <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                <p className="font-medium mb-2">
                  ⚠️ Profile Completion Required
                </p>
                <p className="text-xs leading-relaxed">
                  You must complete your coaching institute name and phone
                  number to access your dashboard. Only the logo is optional.
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
              disabled={loading || !isFormValid}
              className="w-full"
              size="lg"
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>

            {!isFormValid && (
              <div
                className={`text-xs text-center mt-3 p-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-yellow-900/20 text-yellow-300"
                    : "bg-yellow-50 text-yellow-600"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>Complete all required fields to proceed</span>
                </div>
                <div className="flex justify-center space-x-4 mt-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <span
                      className={
                        coachingName.trim() ? "text-green-500" : "text-gray-400"
                      }
                    >
                      {coachingName.trim() ? "✓" : "○"}
                    </span>
                    <span>Institute Name</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={
                        phoneNumber.trim().length >= 10
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                    >
                      {phoneNumber.trim().length >= 10 ? "✓" : "○"}
                    </span>
                    <span>Phone Number</span>
                  </div>
                </div>
              </div>
            )}

            {isFormValid && (
              <p
                className={`text-xs text-center mt-3 ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                ✓ Ready to complete your profile
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
