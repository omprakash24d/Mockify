import type { CoachingDetailsFormData } from "../../../lib/validations";
import {
  coachingDetailsSchema,
  getValidationErrors,
} from "../../../lib/validations";

/**
 * Validates the coaching details form data
 */
export const validateCoachingDetailsForm = (formData: {
  coachingName: string;
  phoneNumber: string;
  coachingLogo?: string;
}) => {
  const validationResult = coachingDetailsSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      isValid: false,
      errors: getValidationErrors(validationResult.error),
      data: null,
    };
  }

  return {
    isValid: true,
    errors: {},
    data: validationResult.data,
  };
};

/**
 * Performs additional custom validation for required fields
 */
export const validateRequiredFields = (formData: {
  coachingName: string;
  phoneNumber: string;
}) => {
  const errors: Record<string, string> = {};

  if (!formData.coachingName.trim()) {
    errors.coachingName = "Coaching institute name is required";
  }

  if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
    errors.phoneNumber = "Valid 10-digit phone number is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Checks if the form is valid for submission
 */
export const isFormValid = (
  coachingName: string,
  phoneNumber: string
): boolean => {
  return coachingName.trim().length > 0 && phoneNumber.trim().length >= 10;
};

/**
 * Calculates the completion percentage of the form
 */
export const calculateCompletionPercentage = (
  coachingName: string,
  phoneNumber: string
): number => {
  const requiredFieldsCount = 2; // coachingName and phoneNumber
  const completedFields =
    (coachingName.trim() ? 1 : 0) + (phoneNumber.trim().length >= 10 ? 1 : 0);

  return Math.round((completedFields / requiredFieldsCount) * 100);
};

/**
 * Prepares form data for submission
 */
export const prepareFormData = (
  coachingName: string,
  phoneNumber: string,
  coachingLogo: string
): Partial<CoachingDetailsFormData> => {
  return {
    coachingName: coachingName.trim(),
    phoneNumber: phoneNumber.trim(),
    coachingLogo: coachingLogo.trim() || undefined,
  };
};
