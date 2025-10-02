import { z } from "zod";

// Question validation schema
export const questionSchema = z
  .object({
    questionText: z
      .string()
      .min(10, "Question text must be at least 10 characters")
      .max(2000, "Question text must not exceed 2000 characters"),

    subjectName: z
      .string()
      .min(1, "Subject is required")
      .max(100, "Subject name too long"),

    chapterName: z
      .string()
      .min(1, "Chapter is required")
      .max(100, "Chapter name too long"),

    difficulty: z.enum(["Easy", "Medium", "Hard"], {
      message: "Difficulty must be Easy, Medium, or Hard",
    }),

    options: z
      .array(z.string().min(1, "Option cannot be empty"))
      .min(2, "At least 2 options are required")
      .max(6, "Maximum 6 options allowed")
      .refine(
        (options) => new Set(options).size === options.length,
        "All options must be unique"
      ),

    correctAnswer: z.string().min(1, "Correct answer is required"),

    explanation: z.string().max(1000, "Explanation too long").optional(),

    subtopics: z.array(z.string()).optional().default([]),

    yearAppeared: z
      .number()
      .int()
      .min(1990, "Year must be 1990 or later")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .optional(),

    questionImages: z
      .array(z.string().url("Invalid image URL"))
      .max(5, "Maximum 5 images allowed")
      .optional()
      .default([]),

    tags: z.array(z.string()).optional().default([]),
  })
  .refine((data) => data.options.includes(data.correctAnswer), {
    message: "Correct answer must be one of the provided options",
    path: ["correctAnswer"],
  });

// Type inference from schema
export type QuestionFormData = z.infer<typeof questionSchema>;

// Bulk operation schemas
export const bulkCreateSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

export const bulkUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1, "Question ID is required"),
        data: questionSchema.partial(),
      })
    )
    .min(1, "At least one update is required"),
});

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1, "Invalid ID"))
    .min(1, "At least one ID is required"),
});

// Import schema
export const importSchema = z.object({
  data: z.union([z.string(), z.array(z.unknown())]),
  format: z.enum(["json", "csv"]),
  options: z
    .object({
      defaultSubject: z.string().optional(),
      defaultChapter: z.string().optional(),
      defaultDifficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
      skipDuplicates: z.boolean().default(true),
      transformDifficulty: z.record(z.string(), z.string()).optional(),
    })
    .optional()
    .default({ skipDuplicates: true }),
});

// Search/Filter schema
export const questionFiltersSchema = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  yearFrom: z.string().optional(),
  yearTo: z.string().optional(),
  minAccuracy: z.string().optional(),
  maxAccuracy: z.string().optional(),
  tags: z.array(z.string()).default([]),
  hasImages: z.boolean().optional(),
});

export type QuestionFilters = z.infer<typeof questionFiltersSchema>;

// Image upload schema
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type
        ),
      "Only JPEG, PNG, GIF, and WebP images are allowed"
    ),
  questionId: z.string().optional(), // Optional for new questions
});

// Validation helper functions
export const validateQuestion = (data: unknown) => {
  return questionSchema.safeParse(data);
};

export const validateBulkCreate = (data: unknown) => {
  return bulkCreateSchema.safeParse(data);
};

export const validateBulkUpdate = (data: unknown) => {
  return bulkUpdateSchema.safeParse(data);
};

export const validateBulkDelete = (data: unknown) => {
  return bulkDeleteSchema.safeParse(data);
};

export const validateImport = (data: unknown) => {
  return importSchema.safeParse(data);
};

export const validateFilters = (data: unknown) => {
  return questionFiltersSchema.safeParse(data);
};

export const validateImageUpload = (data: unknown) => {
  return imageUploadSchema.safeParse(data);
};

// Error formatter for Zod errors
export const formatZodError = (error: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
};

export default {
  questionSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  importSchema,
  questionFiltersSchema,
  imageUploadSchema,
  validateQuestion,
  validateBulkCreate,
  validateBulkUpdate,
  validateBulkDelete,
  validateImport,
  validateFilters,
  validateImageUpload,
  formatZodError,
};
