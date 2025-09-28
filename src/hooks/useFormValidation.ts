import { useCallback, useState } from "react";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

interface FormValidation {
  [key: string]: ValidationRule;
}

export const useFormValidation = (
  initialValues: Record<string, string>,
  validationRules: FormValidation
) => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach((key) => {
      initialFields[key] = {
        value: initialValues[key],
        error: "",
        touched: false,
      };
    });
    return initialFields;
  });

  const validateField = useCallback(
    (name: string, value: string): string => {
      const rules = validationRules[name];
      if (!rules) return "";

      if (rules.required && !value.trim()) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `${
          name.charAt(0).toUpperCase() + name.slice(1)
        } must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${
          name.charAt(0).toUpperCase() + name.slice(1)
        } must be no more than ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `Please enter a valid ${name}`;
      }

      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) return customError;
      }

      return "";
    },
    [validationRules]
  );

  const setFieldValue = useCallback(
    (name: string, value: string) => {
      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          value,
          error: validateField(name, value),
          touched: true,
        },
      }));
    },
    [validateField]
  );

  const setFieldTouched = useCallback(
    (name: string) => {
      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          touched: true,
          error: validateField(name, prev[name].value),
        },
      }));
    },
    [validateField]
  );

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(fields).forEach((name) => {
      const error = validateField(name, fields[name].value);
      newFields[name] = {
        ...newFields[name],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const resetForm = useCallback(() => {
    const resetFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach((key) => {
      resetFields[key] = {
        value: initialValues[key],
        error: "",
        touched: false,
      };
    });
    setFields(resetFields);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name: string) => ({
      value: fields[name]?.value || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFieldValue(name, e.target.value),
      onBlur: () => setFieldTouched(name),
      error: fields[name]?.error || "",
      touched: fields[name]?.touched || false,
    }),
    [fields, setFieldValue, setFieldTouched]
  );

  return {
    fields,
    setFieldValue,
    setFieldTouched,
    validateAll,
    resetForm,
    getFieldProps,
    isValid: Object.values(fields).every((field) => !field.error),
    hasErrors: Object.values(fields).some(
      (field) => field.error && field.touched
    ),
  };
};
