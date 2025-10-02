const { body, query, param, validationResult } = require("express-validator");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// Common validation rules
const paginationValidation = [
  query("page")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const subjectValidation = [
  param("subject")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
];

const chapterValidation = [
  param("chapter")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Chapter is required"),
];

const questionIdValidation = [
  param("id").isMongoId().withMessage("Invalid question ID"),
];

const searchValidation = [
  query("q")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Search query must be at least 2 characters long"),
];

const difficultyValidation = [
  query("difficulty")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
];

const randomQuestionsValidation = [
  query("count")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 50 })
    .withMessage("Count must be between 1 and 50"),
];

const questionAttemptValidation = [
  body("isCorrect").isBoolean().withMessage("isCorrect must be a boolean"),
  body("timeSpent")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time spent must be a non-negative integer"),
];

const createQuestionValidation = [
  body("subjectName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Subject name is required"),
  body("chapterName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Chapter name is required"),
  body("questionText")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Question text is required"),
  body("options")
    .isArray({ min: 2, max: 4 })
    .withMessage("Must have 2-4 options"),
  body("options.*.text")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Option text is required"),
  body("correctAnswer")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Correct answer is required"),
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
  body("subtopicTags")
    .optional()
    .isArray()
    .withMessage("Subtopic tags must be an array"),
  body("subtopicTags.*")
    .optional()
    .isString()
    .trim()
    .withMessage("Each subtopic tag must be a string"),
];

const updateQuestionValidation = [
  body("questionText")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Question text cannot be empty"),
  body("options")
    .optional()
    .isArray({ min: 2, max: 4 })
    .withMessage("Must have 2-4 options"),
  body("options.*.text")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Option text is required"),
  body("correctAnswer")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Correct answer cannot be empty"),
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
  body("subtopicTags")
    .optional()
    .isArray()
    .withMessage("Subtopic tags must be an array"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  validate,
  paginationValidation,
  subjectValidation,
  chapterValidation,
  questionIdValidation,
  searchValidation,
  difficultyValidation,
  randomQuestionsValidation,
  questionAttemptValidation,
  createQuestionValidation,
  updateQuestionValidation,
};
