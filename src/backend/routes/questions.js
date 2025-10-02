const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { cacheHelper, CACHE_KEYS } = require("../config/cache");
const {
  questionsCacheMiddleware,
  questionCacheMiddleware,
  randomQuestionsCacheMiddleware,
  searchCacheMiddleware,
} = require("../middleware/cache");
const {
  validate,
  paginationValidation,
  questionIdValidation,
  searchValidation,
  difficultyValidation,
  randomQuestionsValidation,
  questionAttemptValidation,
  createQuestionValidation,
  updateQuestionValidation,
} = require("../middleware/validation");

// @route   GET /api/questions
// @desc    Get questions with filters and pagination
// @access  Public
router.get(
  "/",
  [paginationValidation, difficultyValidation, validate],
  questionsCacheMiddleware,
  async (req, res, next) => {
    try {
      const {
        subject,
        chapter,
        page = 1,
        limit = 10,
        difficulty,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = { isActive: true };

      if (subject) query.subjectName = subject;
      if (chapter) query.chapterName = chapter;
      if (difficulty) query.difficulty = difficulty;
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      if (search) {
        sort.score = { $meta: "textScore" };
      }
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        select: search ? { score: { $meta: "textScore" } } : {},
      };

      const questions = await Question.find(query, options.select)
        .sort(sort)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

      const total = await Question.countDocuments(query);

      const response = {
        questions,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalQuestions: total,
          hasNext: options.page < Math.ceil(total / options.limit),
          hasPrev: options.page > 1,
        },
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/questions/random
// @desc    Get random questions
// @access  Public
router.get(
  "/random",
  [randomQuestionsValidation, difficultyValidation, validate],
  randomQuestionsCacheMiddleware,
  async (req, res, next) => {
    try {
      const {
        count = 10,
        subject,
        chapter,
        difficulty,
        excludeIds,
      } = req.query;

      // Build match query
      const matchQuery = { isActive: true };
      if (subject) matchQuery.subjectName = subject;
      if (chapter) matchQuery.chapterName = chapter;
      if (difficulty) matchQuery.difficulty = difficulty;
      if (excludeIds) {
        const excludeArray = Array.isArray(excludeIds)
          ? excludeIds
          : [excludeIds];
        matchQuery._id = { $nin: excludeArray };
      }

      const questions = await Question.getRandomQuestions(
        parseInt(count),
        matchQuery
      );

      res.json({
        success: true,
        data: questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/questions/search
// @desc    Search questions
// @access  Public
router.get(
  "/search",
  [searchValidation, paginationValidation, difficultyValidation, validate],
  searchCacheMiddleware,
  async (req, res, next) => {
    try {
      const {
        q: searchTerm,
        subject,
        chapter,
        difficulty,
        page = 1,
        limit = 10,
      } = req.query;

      // Build filters
      const filters = {};
      if (subject) filters.subjectName = subject;
      if (chapter) filters.chapterName = chapter;
      if (difficulty) filters.difficulty = difficulty;

      // Perform search
      const questions = await Question.searchQuestions(searchTerm, filters)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalQuery = await Question.find({
        $text: { $search: searchTerm },
        isActive: true,
        ...filters,
      });
      const total = totalQuery.length;

      const response = {
        questions,
        searchTerm,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalQuestions: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Public
router.get(
  "/:id",
  [questionIdValidation, validate],
  questionCacheMiddleware,
  async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.id);

      if (!question || !question.isActive) {
        return res.status(404).json({
          success: false,
          error: "Question not found",
        });
      }

      res.json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/questions/:id/attempt
// @desc    Record question attempt
// @access  Public
router.post(
  "/:id/attempt",
  [questionIdValidation, questionAttemptValidation, validate],
  async (req, res, next) => {
    try {
      const { isCorrect, timeSpent = 0 } = req.body;

      const question = await Question.findById(req.params.id);

      if (!question || !question.isActive) {
        return res.status(404).json({
          success: false,
          error: "Question not found",
        });
      }

      // Record the attempt
      await question.incrementAttempt(isCorrect, timeSpent);

      // Clear related caches
      cacheHelper.clearQuestionCache(req.params.id);
      cacheHelper.clearChapterCache(question.subjectName, question.chapterName);

      res.json({
        success: true,
        data: {
          message: "Attempt recorded successfully",
          statistics: question.statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/questions
// @desc    Create new question (Admin only)
// @access  Private
router.post(
  "/",
  [createQuestionValidation, validate],
  async (req, res, next) => {
    try {
      const questionData = {
        ...req.body,
        options: req.body.options.map((option, index) => ({
          text: option.text,
          isCorrect: option.text === req.body.correctAnswer,
        })),
      };

      const question = new Question(questionData);
      await question.save();

      // Clear related caches
      cacheHelper.clearSubjectCache(question.subjectName);
      cacheHelper.clearChapterCache(question.subjectName, question.chapterName);
      cacheHelper.clearQuestionCache();

      res.status(201).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/questions/:id
// @desc    Update question (Admin only)
// @access  Private
router.put(
  "/:id",
  [questionIdValidation, updateQuestionValidation, validate],
  async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          error: "Question not found",
        });
      }

      // Update options if provided
      if (req.body.options) {
        req.body.options = req.body.options.map((option) => ({
          text: option.text,
          isCorrect:
            option.text === (req.body.correctAnswer || question.correctAnswer),
        }));
      }

      const updatedQuestion = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      // Clear related caches
      cacheHelper.clearQuestionCache(req.params.id);
      cacheHelper.clearSubjectCache(updatedQuestion.subjectName);
      cacheHelper.clearChapterCache(
        updatedQuestion.subjectName,
        updatedQuestion.chapterName
      );

      res.json({
        success: true,
        data: updatedQuestion,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/questions/:id
// @desc    Delete question (Admin only)
// @access  Private
router.delete(
  "/:id",
  [questionIdValidation, validate],
  async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          error: "Question not found",
        });
      }

      // Soft delete
      question.isActive = false;
      await question.save();

      // Clear related caches
      cacheHelper.clearQuestionCache(req.params.id);
      cacheHelper.clearSubjectCache(question.subjectName);
      cacheHelper.clearChapterCache(question.subjectName, question.chapterName);

      res.json({
        success: true,
        data: { message: "Question deleted successfully" },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
