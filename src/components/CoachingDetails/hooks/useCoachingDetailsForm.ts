import { useState } from "react";
import type { CoachingDetailsFormData } from "../../../lib/validations";
import type { CoachingDetailsFormState } from "../types";
import {
  prepareFormData,
  validateCoachingDetailsForm,
  validateRequiredFields,
} from "../utils/validation";

interface UseCoachingDetailsFormProps {
  initialData?: Partial<CoachingDetailsFormData>;
  onComplete: (details: CoachingDetailsFormData) => void;
}

export const useCoachingDetailsForm = ({
  initialData = {},
  onComplete,
}: UseCoachingDetailsFormProps) => {
  const [formState, setFormState] = useState<CoachingDetailsFormState>({
    coachingName: initialData.coachingName || "",
    phoneNumber: initialData.phoneNumber || "",
    coachingLogo: initialData.coachingLogo || "",
    loading: false,
    validationErrors: {},
  });

  const updateField = (
    field: keyof Omit<CoachingDetailsFormState, "loading" | "validationErrors">,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setLoading = (loading: boolean) => {
    setFormState((prev) => ({
      ...prev,
      loading,
    }));
  };

  const setValidationErrors = (errors: Record<string, string>) => {
    setFormState((prev) => ({
      ...prev,
      validationErrors: errors,
    }));
  };

  const clearValidationErrors = () => {
    setFormState((prev) => ({
      ...prev,
      validationErrors: {},
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearValidationErrors();

    try {
      const formData = prepareFormData(
        formState.coachingName,
        formState.phoneNumber,
        formState.coachingLogo
      );

      // Validate required fields first
      const requiredFieldsValidation = validateRequiredFields({
        coachingName: formData.coachingName!,
        phoneNumber: formData.phoneNumber!,
      });

      if (!requiredFieldsValidation.isValid) {
        setValidationErrors(requiredFieldsValidation.errors);
        setLoading(false);
        return;
      }

      // Validate with schema
      const schemaValidation = validateCoachingDetailsForm({
        coachingName: formData.coachingName!,
        phoneNumber: formData.phoneNumber!,
        coachingLogo: formData.coachingLogo,
      });

      if (!schemaValidation.isValid) {
        setValidationErrors(schemaValidation.errors);
        setLoading(false);
        return;
      }

      await onComplete(schemaValidation.data!);
    } catch (error) {
      console.error("Error submitting coaching details:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...formState,
    updateField,
    handleSubmit,
    setLoading,
    setValidationErrors,
    clearValidationErrors,
  };
};
