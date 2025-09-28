import { z } from "zod";

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(254, "Email is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    coachingName: z
      .string()
      .min(1, "Coaching name is required")
      .min(2, "Coaching name must be at least 2 characters")
      .max(100, "Coaching name is too long"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
      .length(10, "Phone number must be exactly 10 digits"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for additional details collection (Google login or missing info)
export const coachingDetailsSchema = z.object({
  coachingName: z
    .string()
    .min(1, "Coaching name is required")
    .min(2, "Coaching name must be at least 2 characters")
    .max(100, "Coaching name is too long"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .length(10, "Phone number must be exactly 10 digits"),
  coachingLogo: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
});

// Test creation validation schemas
export const testCreationSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  chapters: z.array(z.string()).min(1, "At least one chapter must be selected"),
  questionCount: z
    .number()
    .min(1, "At least 1 question is required")
    .max(100, "Maximum 100 questions allowed"),
  timeLimit: z
    .number()
    .min(5, "Minimum 5 minutes required")
    .max(180, "Maximum 3 hours allowed"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "Difficulty level is required",
  }),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long")
    .optional(),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type TestCreationFormData = z.infer<typeof testCreationSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type CoachingDetailsFormData = z.infer<typeof coachingDetailsSchema>;

// Utility function to get validation errors
export const getValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    if (issue.path.length > 0) {
      errors[issue.path[0] as string] = issue.message;
    }
  });
  return errors;
};

// Password strength checker
export const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength: "very-weak" | "weak" | "fair" | "good" | "strong";
  if (score < 1) strength = "very-weak";
  else if (score < 2) strength = "weak";
  else if (score < 3) strength = "fair";
  else if (score < 5) strength = "good";
  else strength = "strong";

  return {
    score,
    strength,
    checks,
    isValid: score >= 4, // At least 4 out of 5 criteria
  };
};
