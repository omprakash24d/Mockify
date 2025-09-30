const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Question = require("../models/Question");
const { cacheHelper } = require("../config/cache");
const {
  validate,
  paginationValidation,
  questionIdValidation,
  searchValidation,
  difficultyValidation,
} = require("../middleware/validation");

// @route   GET /api/optimized-questions/meta
// @desc    Get questions metadata (counts, filters) without loading data
// @access  Public
router.get("/meta", async (req, res, next) => {
  try {
    const cacheKey = "questions:meta";
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Aggregate metadata efficiently
    const metadata = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          subjects: { $addToSet: "$subjectName" },
          difficulties: { $addToSet: "$difficulty" },
          avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuestions: 1,
          subjects: 1,
          difficulties: 1,
          avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
        },
      },
    ]);

    // Get subject-wise breakdown
    const subjectBreakdown = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$subjectName",
          count: { $sum: 1 },
          chapters: { $addToSet: "$chapterName" },
          difficulties: {
            $push: {
              difficulty: "$difficulty",
              count: 1,
            },
          },
        },
      },
      {
        $project: {
          subject: "$_id",
          count: 1,
          chapterCount: { $size: "$chapters" },
          chapters: 1,
          difficulties: 1,
          _id: 0,
        },
      },
    ]);

    const result = {
      ...metadata[0],
      subjectBreakdown,
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 10 minutes
    cacheHelper.set(cacheKey, result, 600);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/optimized-questions/paginated
// @desc    Get paginated questions with efficient loading
// @access  Public
router.get(
  "/paginated",
  [paginationValidation, difficultyValidation, validate],
  async (req, res, next) => {
    try {
      const {
        subject,
        chapter,
        page = 1,
        limit = 20,
        difficulty,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        fields = "basic", // basic, full, minimal
      } = req.query;

      // Build query
      const query = { isActive: true };
      if (subject) query.subjectName = subject;
      if (chapter) query.chapterName = chapter;
      if (difficulty) query.difficulty = difficulty;
      if (search) {
        query.$text = { $search: search };
      }

      // Define field projections based on requested detail level
      let projection = {};
      switch (fields) {
        case "minimal":
          projection = {
            questionText: 1,
            correctAnswer: 1,
            difficulty: 1,
            subjectName: 1,
            chapterName: 1,
          };
          break;
        case "basic":
          projection = {
            questionText: 1,
            options: 1,
            correctAnswer: 1,
            difficulty: 1,
            subjectName: 1,
            chapterName: 1,
            subtopicTags: 1,
            examYear: 1,
          };
          break;
        case "full":
          // Include all fields (default behavior)
          break;
        default:
          projection = {
            questionText: 1,
            options: 1,
            correctAnswer: 1,
            difficulty: 1,
            subjectName: 1,
            chapterName: 1,
            subtopicTags: 1,
            examYear: 1,
          };
      }

      // Build sort object
      const sort = {};
      if (search) {
        sort.score = { $meta: "textScore" };
      }
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Cache key for this specific query
      const cacheKey = `questions:paginated:${JSON.stringify({
        subject,
        chapter,
        page,
        limit,
        difficulty,
        search,
        sortBy,
        sortOrder,
        fields,
      })}`;

      const cached = cacheHelper.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      // Use aggregation for better performance with large datasets
      const pipeline = [{ $match: query }];

      if (search) {
        pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
      }

      pipeline.push(
        { $sort: sort },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );

      if (Object.keys(projection).length > 0) {
        pipeline.push({ $project: projection });
      }

      const [questions, totalCount] = await Promise.all([
        Question.aggregate(pipeline),
        Question.countDocuments(query),
      ]);

      const response = {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalQuestions: totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit),
        },
        meta: {
          fields,
          loadTime: new Date().toISOString(),
        },
      };

      // Cache for 5 minutes
      cacheHelper.set(cacheKey, response, 300);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/optimized-questions/sample
// @desc    Get intelligently sampled questions for test creation
// @access  Public
router.get("/sample", async (req, res, next) => {
  try {
    const {
      subjects,
      chapters,
      count = 50,
      difficulty,
      strategy = "balanced", // balanced, random, weighted
      excludeIds,
      includeTags,
    } = req.query;

    const cacheKey = `questions:sample:${JSON.stringify({
      subjects,
      chapters,
      count,
      difficulty,
      strategy,
      includeTags,
    })}`;

    const cached = cacheHelper.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Build base match query
    const matchQuery = { isActive: true };

    if (subjects) {
      const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
      matchQuery.subjectName = { $in: subjectArray };
    }

    if (chapters) {
      const chapterArray = Array.isArray(chapters) ? chapters : [chapters];
      matchQuery.chapterName = { $in: chapterArray };
    }

    if (difficulty) {
      matchQuery.difficulty = difficulty;
    }

    if (includeTags) {
      const tagsArray = Array.isArray(includeTags)
        ? includeTags
        : [includeTags];
      matchQuery.subtopicTags = { $in: tagsArray };
    }

    if (excludeIds) {
      const excludeArray = Array.isArray(excludeIds)
        ? excludeIds
        : [excludeIds];
      matchQuery._id = {
        $nin: excludeArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    let pipeline = [{ $match: matchQuery }];

    // Apply sampling strategy
    switch (strategy) {
      case "balanced":
        // Balance across subjects and difficulties
        pipeline = [
          { $match: matchQuery },
          {
            $group: {
              _id: {
                subject: "$subjectName",
                difficulty: "$difficulty",
              },
              questions: { $push: "$$ROOT" },
            },
          },
          {
            $project: {
              questions: {
                $slice: [
                  "$questions",
                  Math.ceil(parseInt(count) / 6), // Assuming 3 subjects × 2 main difficulties
                ],
              },
            },
          },
          { $unwind: "$questions" },
          { $replaceRoot: { newRoot: "$questions" } },
          { $sample: { size: parseInt(count) } },
        ];
        break;

      case "weighted":
        // Weight by difficulty and success rate
        pipeline.push(
          {
            $addFields: {
              weight: {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ["$difficulty", "hard"] },
                      3,
                      { $cond: [{ $eq: ["$difficulty", "medium"] }, 2, 1] },
                    ],
                  },
                  {
                    $add: [1, { $divide: ["$statistics.totalAttempts", 100] }],
                  },
                ],
              },
            },
          },
          { $sample: { size: parseInt(count) * 2 } },
          { $sort: { weight: -1 } },
          { $limit: parseInt(count) }
        );
        break;

      default: // random
        pipeline.push({ $sample: { size: parseInt(count) } });
    }

    // Project only necessary fields for test creation
    pipeline.push({
      $project: {
        questionText: 1,
        options: 1,
        correctAnswer: 1,
        difficulty: 1,
        subjectName: 1,
        chapterName: 1,
        subtopicTags: 1,
        examYear: 1,
        explanation: 1,
        imageUrl: 1,
        statistics: {
          totalAttempts: 1,
          correctAttempts: 1,
        },
      },
    });

    const questions = await Question.aggregate(pipeline);

    const response = {
      questions,
      meta: {
        strategy,
        count: questions.length,
        requestedCount: parseInt(count),
        filters: { subjects, chapters, difficulty, includeTags },
      },
    };

    // Cache for 2 minutes (shorter cache for sampling)
    cacheHelper.set(cacheKey, response, 120);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/optimized-questions/filters
// @desc    Get available filter options dynamically
// @access  Public
router.get("/filters", async (req, res, next) => {
  try {
    const { subject, chapter } = req.query;

    const cacheKey = `questions:filters:${subject || "all"}:${
      chapter || "all"
    }`;
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const matchQuery = { isActive: true };
    if (subject) matchQuery.subjectName = subject;
    if (chapter) matchQuery.chapterName = chapter;

    const filters = await Question.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          subjects: { $addToSet: "$subjectName" },
          chapters: { $addToSet: "$chapterName" },
          difficulties: { $addToSet: "$difficulty" },
          subtopics: { $addToSet: "$subtopicTags" },
          years: { $addToSet: "$examYear" },
        },
      },
      {
        $project: {
          _id: 0,
          subjects: { $sortArray: { input: "$subjects", sortBy: 1 } },
          chapters: { $sortArray: { input: "$chapters", sortBy: 1 } },
          difficulties: 1,
          subtopics: {
            $sortArray: {
              input: {
                $reduce: {
                  input: "$subtopics",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] },
                },
              },
              sortBy: 1,
            },
          },
          years: { $sortArray: { input: "$years", sortBy: -1 } },
        },
      },
    ]);

    const result = filters[0] || {
      subjects: [],
      chapters: [],
      difficulties: [],
      subtopics: [],
      years: [],
    };

    // Cache for 15 minutes
    cacheHelper.set(cacheKey, result, 900);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/optimized-questions/bulk-ids
// @desc    Get questions by array of IDs (for test loading)
// @access  Public
router.post("/bulk-ids", async (req, res, next) => {
  try {
    const { ids, fields = "full" } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid array of question IDs is required",
      });
    }

    // Limit bulk requests to prevent abuse
    if (ids.length > 200) {
      return res.status(400).json({
        success: false,
        error: "Maximum 200 questions can be requested at once",
      });
    }

    const cacheKey = `questions:bulk:${JSON.stringify(ids.sort())}:${fields}`;
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Define projection based on fields
    let projection = {};
    if (fields === "minimal") {
      projection = {
        questionText: 1,
        correctAnswer: 1,
        difficulty: 1,
      };
    } else if (fields === "basic") {
      projection = {
        questionText: 1,
        options: 1,
        correctAnswer: 1,
        difficulty: 1,
        subjectName: 1,
        chapterName: 1,
      };
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const questions = await Question.find(
      {
        _id: { $in: objectIds },
        isActive: true,
      },
      projection
    ).lean();

    // Maintain order of requested IDs
    const orderedQuestions = ids
      .map((id) => questions.find((q) => q._id.toString() === id))
      .filter(Boolean);

    const response = {
      questions: orderedQuestions,
      found: orderedQuestions.length,
      requested: ids.length,
    };

    // Cache for 10 minutes
    cacheHelper.set(cacheKey, response, 600);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
