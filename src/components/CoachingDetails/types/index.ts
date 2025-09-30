import type { CoachingDetailsFormData } from "../../../lib/validations";

export interface CoachingDetailsModalProps {
  isOpen: boolean;
  onComplete: (details: CoachingDetailsFormData) => void;
  initialData?: Partial<CoachingDetailsFormData>;
  title?: string;
  subtitle?: string;
}

export interface CoachingDetailsFormState {
  coachingName: string;
  phoneNumber: string;
  coachingLogo: string;
  loading: boolean;
  validationErrors: Record<string, string>;
}

export interface ProgressItem {
  id: string;
  label: string;
  isCompleted: boolean;
  isRequired: boolean;
}

export interface StatusMessageProps {
  isFormValid: boolean;
}

export interface ProgressCardProps {
  coachingName: string;
  phoneNumber: string;
  coachingLogo: string;
}

export interface ModalHeaderProps {
  title: string;
  subtitle: string;
}

export interface FormFieldsProps {
  coachingName: string;
  phoneNumber: string;
  coachingLogo: string;
  validationErrors: Record<string, string>;
  onCoachingNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onCoachingLogoChange: (value: string) => void;
}

export interface ActionButtonsProps {
  loading: boolean;
  isFormValid: boolean;
  onSubmit: (e: React.FormEvent) => void;
}
