const { z } = require("zod");
const { ValidationError } = require("../errors/CustomErrors");

/**
 * Enhanced Validation Middleware using Zod
 * Provides comprehensive input validation with detailed error messages
 */

// Common validation schemas
const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  positiveInteger: z.coerce.number().int().positive(),
  nonNegativeInteger: z.coerce.number().int().min(0),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "Difficulty must be easy, medium, or hard" }),
  }),
  sortOrder: z.enum(["asc", "desc"], {
    errorMap: () => ({ message: "Sort order must be asc or desc" }),
  }),
};

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Question schemas
const questionSchema = z.object({
  subjectName: z.string().trim().min(1, "Subject name is required"),
  chapterName: z.string().trim().min(1, "Chapter name is required"),
  questionText: z.string().trim().min(1, "Question text is required"),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, "Option text is required"),
        isCorrect: z.boolean().optional(),
      })
    )
    .min(2, "At least 2 options are required")
    .max(4, "Maximum 4 options allowed"),
  correctAnswer: z.string().trim().min(1, "Correct answer is required"),
  difficulty: commonSchemas.difficulty.default("medium"),
  subtopicTags: z.array(z.string().trim()).optional().default([]),
  explanation: z.string().optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  examYear: z.number().int().min(1990).max(new Date().getFullYear()).optional(),
  isActive: z.boolean().default(true),
});

const updateQuestionSchema = questionSchema.partial();

// Search and query schemas
const searchQuerySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters"),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: commonSchemas.difficulty.optional(),
  ...paginationSchema.shape,
});

const questionQuerySchema = z.object({
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: commonSchemas.difficulty.optional(),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: commonSchemas.sortOrder.default("desc"),
  ...paginationSchema.shape,
});

const randomQuestionsSchema = z.object({
  count: z.coerce.number().int().min(1).max(50).default(10),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: commonSchemas.difficulty.optional(),
  excludeIds: z.union([z.string(), z.array(z.string())]).optional(),
});

// Question attempt schema
const questionAttemptSchema = z.object({
  isCorrect: z.boolean(),
  timeSpent: z.coerce.number().int().min(0).default(0),
});

// Admin schemas
const bulkQuestionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

const bulkUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        id: commonSchemas.mongoId,
        data: updateQuestionSchema,
      })
    )
    .min(1, "At least one update is required"),
});

const bulkDeleteSchema = z.object({
  ids: z.array(commonSchemas.mongoId).min(1, "At least one ID is required"),
});

const importQuestionsSchema = z.object({
  data: z.union([z.string(), z.array(z.any())]),
  format: z.enum(["json", "csv"]).default("json"),
  options: z
    .object({
      transformDifficulty: z.record(z.string()).optional(),
      defaultSubject: z.string().optional(),
    })
    .default({}),
});

// Student management schemas
const studentQuerySchema = z.object({
  search: z.string().optional(),
  ...paginationSchema.shape,
});

/**
 * Create validation middleware for different locations (body, query, params)
 */
const createValidator = (schema, location = "body") => {
  return (req, res, next) => {
    try {
      const data = req[location];
      const result = schema.parse(data);
      req[location] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
          received: err.received,
        }));

        const validationError = new ValidationError(
          "Validation failed",
          details
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validation middleware functions
 */
const validateBody = (schema) => createValidator(schema, "body");
const validateQuery = (schema) => createValidator(schema, "query");
const validateParams = (schema) => createValidator(schema, "params");

// Specific validation middlewares
const validateMongoId = validateParams(
  z.object({
    id: commonSchemas.mongoId,
  })
);

const validateSubjectParam = validateParams(
  z.object({
    subject: z.string().trim().min(1, "Subject is required"),
  })
);

const validateChapterParam = validateParams(
  z.object({
    chapter: z.string().trim().min(1, "Chapter is required"),
  })
);

// Question validation middlewares
const validateCreateQuestion = validateBody(questionSchema);
const validateUpdateQuestion = validateBody(updateQuestionSchema);
const validateQuestionAttempt = validateBody(questionAttemptSchema);

// Query validation middlewares
const validateQuestionQuery = validateQuery(questionQuerySchema);
const validateSearchQuery = validateQuery(searchQuerySchema);
const validateRandomQuestions = validateQuery(randomQuestionsSchema);
const validatePagination = validateQuery(paginationSchema);

// Admin validation middlewares
const validateBulkQuestions = validateBody(bulkQuestionsSchema);
const validateBulkUpdate = validateBody(bulkUpdateSchema);
const validateBulkDelete = validateBody(bulkDeleteSchema);
const validateImportQuestions = validateBody(importQuestionsSchema);
const validateStudentQuery = validateQuery(studentQuerySchema);

/**
 * Custom validation functions
 */
const validateQuestionOptions = (req, res, next) => {
  const { options, correctAnswer } = req.body;

  if (!options || !Array.isArray(options)) {
    return next(new ValidationError("Options must be an array"));
  }

  // Check if correct answer exists in options
  const optionTexts = options.map((opt) => opt.text);
  if (!optionTexts.includes(correctAnswer)) {
    return next(
      new ValidationError("Correct answer must match one of the options")
    );
  }

  // Ensure only one correct answer
  const correctOptions = options.filter(
    (opt) => opt.isCorrect || opt.text === correctAnswer
  );
  if (correctOptions.length > 1) {
    return next(new ValidationError("Only one option can be correct"));
  }

  next();
};

const validateUniqueQuestion = async (req, res, next) => {
  try {
    const { subjectName, chapterName, questionText } = req.body;
    const Question = require("../models/Question");

    const existingQuestion = await Question.findOne({
      subjectName,
      chapterName,
      questionText,
      isActive: true,
    });

    if (existingQuestion && existingQuestion._id.toString() !== req.params.id) {
      return next(
        new ValidationError(
          "A question with the same text already exists in this chapter"
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize strings in request body
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};

module.exports = {
  // Schema exports
  questionSchema,
  updateQuestionSchema,
  paginationSchema,

  // Validation functions
  validateBody,
  validateQuery,
  validateParams,

  // Common validations
  validateMongoId,
  validateSubjectParam,
  validateChapterParam,
  validatePagination,

  // Question validations
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionAttempt,
  validateQuestionQuery,
  validateSearchQuery,
  validateRandomQuestions,
  validateQuestionOptions,
  validateUniqueQuestion,

  // Admin validations
  validateBulkQuestions,
  validateBulkUpdate,
  validateBulkDelete,
  validateImportQuestions,
  validateStudentQuery,

  // Utilities
  sanitizeInput,
  commonSchemas,
};
