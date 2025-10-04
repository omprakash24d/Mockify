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
const { asyncHandler } = require("../middleware/errorHandler");
const {
  validateMongoId,
  validateQuestionQuery,
  validateSearchQuery,
  validateRandomQuestions,
  validateQuestionAttempt,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionOptions,
  validateUniqueQuestion,
  sanitizeInput,
} = require("../middleware/enhancedValidation");
const { NotFoundError, BusinessLogicError } = require("../errors/CustomErrors");
const logger = require("../config/logger");

// @route   GET /api/questions
// @desc    Get questions with filters and pagination
// @access  Public
router.get(
  "/",
  validateQuestionQuery,
  questionsCacheMiddleware,
  asyncHandler(async (req, res, next) => {
    const startTime = Date.now();

    const {
      page = 1,
      limit = 10,
      subject,
      chapter,
      difficulty,
      tags,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = { isActive: true };
    if (subject) query.subjectName = subject;
    if (chapter) query.chapterName = chapter;
    if (difficulty) query.difficulty = difficulty;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.subtopicTags = { $in: tagArray };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Execute queries in parallel
    const [questions, totalCount] = await Promise.all([
      Question.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Question.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Cache the result
    const cacheKey = CACHE_KEYS.QUESTIONS(req.query);
    const result = {
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          total: totalCount,
          totalQuestions: totalCount,
          hasNext,
          hasPrev,
        },
      },
    };

    await cacheHelper.set(cacheKey, result);

    // Performance logging
    const duration = Date.now() - startTime;
    logger.info("Questions retrieved", {
      operation: "get_questions",
      count: questions.length,
      totalCount,
      page: pageNum,
      duration,
      query: req.query,
    });

    res.json(result);
  })
);

// @route   GET /api/questions/random
// @desc    Get random questions
// @access  Public
router.get(
  "/random",
  validateRandomQuestions,
  randomQuestionsCacheMiddleware,
  asyncHandler(async (req, res, next) => {
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
  })
);

// @route   GET /api/questions/search
// @desc    Search questions
// @access  Public
router.get(
  "/search",
  validateSearchQuery,
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
  validateMongoId,
  questionCacheMiddleware,
  asyncHandler(async (req, res, next) => {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      throw new NotFoundError("Question", req.params.id);
    }

    logger.logBusinessEvent("question_retrieved", {
      questionId: req.params.id,
      subject: question.subjectName,
      chapter: question.chapterName,
    });

    res.json({
      success: true,
      data: question,
    });
  })
);

// @route   POST /api/questions/:id/attempt
// @desc    Record question attempt
// @access  Public
router.post(
  "/:id/attempt",
  validateMongoId,
  validateQuestionAttempt,
  sanitizeInput,
  asyncHandler(async (req, res, next) => {
    const { isCorrect, timeSpent } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      throw new NotFoundError("Question", req.params.id);
    }

    // Validate time spent (business logic)
    if (timeSpent > 3600) {
      // 1 hour max
      throw new BusinessLogicError("Time spent cannot exceed 1 hour", {
        maxTimeAllowed: 3600,
        timeSpent,
      });
    }

    // Record the attempt
    await question.incrementAttempt(isCorrect, timeSpent);

    // Clear related caches
    cacheHelper.clearQuestionCache(req.params.id);
    cacheHelper.clearChapterCache(question.subjectName, question.chapterName);

    // Log business event
    logger.logBusinessEvent("question_attempted", {
      questionId: req.params.id,
      isCorrect,
      timeSpent,
      subject: question.subjectName,
      chapter: question.chapterName,
    });

    res.json({
      success: true,
      data: {
        message: "Attempt recorded successfully",
        statistics: question.statistics,
      },
    });
  })
);

// @route   POST /api/questions
// @desc    Create new question (Admin only)
// @access  Private
router.post(
  "/",
  sanitizeInput,
  validateCreateQuestion,
  validateQuestionOptions,
  validateUniqueQuestion,
  asyncHandler(async (req, res, next) => {
    const questionData = {
      ...req.body,
      options: req.body.options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect || false,
      })),
    };

    const question = new Question(questionData);
    await question.save();

    // Clear related caches
    cacheHelper.clearSubjectCache(question.subjectName);
    cacheHelper.clearChapterCache(question.subjectName, question.chapterName);
    cacheHelper.clearQuestionCache();

    // Log business event
    logger.logBusinessEvent("question_created", {
      questionId: question._id,
      subject: question.subjectName,
      chapter: question.chapterName,
      difficulty: question.difficulty,
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  })
);

// @route   PUT /api/questions/:id
// @desc    Update question (Admin only)
// @access  Private
router.put(
  "/:id",
  validateMongoId,
  validateUpdateQuestion,
  asyncHandler(async (req, res, next) => {
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
          isCorrect: option.isCorrect || false,
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
  })
);

// @route   DELETE /api/questions/:id
// @desc    Delete question (Admin only)
// @access  Private
router.delete(
  "/:id",
  validateMongoId,
  asyncHandler(async (req, res, next) => {
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
  })
);

module.exports = router;
