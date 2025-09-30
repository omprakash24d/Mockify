import { Mail, User } from "lucide-react";
import React from "react";
import { Input } from "../../ui/Input";
import type { AuthFormData, FormFieldHandlers } from "../types";

interface PersonalInfoSectionProps {
  formData: AuthFormData;
  formFieldHandlers: FormFieldHandlers;
  validationErrors: Record<string, string>;
  nameRef: React.RefObject<HTMLInputElement | null>;
  emailRef: React.RefObject<HTMLInputElement | null>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  formFieldHandlers,
  validationErrors,
  nameRef,
  emailRef,
}) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
          <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        </div>
        Personal Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          ref={nameRef}
          id="name"
          type="text"
          label="Full Name"
          required
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formFieldHandlers.setName(e.target.value)
          }
          placeholder="Enter your full name"
          icon={<User className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          error={validationErrors.name}
          variant="filled"
          inputSize="md"
        />

        <Input
          ref={emailRef}
          id="email"
          type="email"
          label="Email address"
          required
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            formFieldHandlers.setEmail(e.target.value)
          }
          placeholder="Enter your email address"
          icon={<Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
          error={validationErrors.email}
          variant="filled"
          inputSize="md"
        />
      </div>
    </div>
  );
};
