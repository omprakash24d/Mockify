const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const { cacheHelper } = require("../config/cache");
const {
  getSuccessRateExpression,
  getRoundedSuccessRateExpression,
  getDifficultyDistributionFields,
  getQuestionStatsFields,
  parseIntParam,
} = require("../utils/projectionUtils");
const { asyncHandler } = require("../middleware/errorHandler");

// @route   GET /api/analytics/overview
// @desc    Get overall platform analytics
// @access  Public
router.get(
  "/overview",
  asyncHandler(async (req, res, next) => {
    const cacheKey = "analytics:overview";
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const [
      totalQuestions,
      totalSubjects,
      totalChapters,
      totalAttempts,
      overallStats,
    ] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Chapter.countDocuments({ isActive: true }),
      Question.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: "$statistics.totalAttempts" },
            correctAttempts: { $sum: "$statistics.correctAttempts" },
          },
        },
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const attemptStats = totalAttempts[0] || {
      totalAttempts: 0,
      correctAttempts: 0,
    };

    const difficultyDistribution = overallStats.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    const analytics = {
      totalQuestions,
      totalSubjects,
      totalChapters,
      totalAttempts: attemptStats.totalAttempts,
      overallSuccessRate:
        attemptStats.totalAttempts > 0
          ? (
              (attemptStats.correctAttempts / attemptStats.totalAttempts) *
              100
            ).toFixed(2)
          : 0,
      difficultyDistribution,
      timestamp: new Date().toISOString(),
    };

    cacheHelper.set(cacheKey, analytics, 600); // Cache for 10 minutes

    res.json({
      success: true,
      data: analytics,
    });
  })
);

// @route   GET /api/analytics/subjects
// @desc    Get subject-wise analytics
// @access  Public
router.get(
  "/subjects",
  asyncHandler(async (req, res, next) => {
    const cacheKey = "analytics:subjects";
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const subjectAnalytics = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$subjectName",
          ...getQuestionStatsFields(),
          ...getDifficultyDistributionFields(),
        },
      },
      {
        $addFields: {
          successRate: getRoundedSuccessRateExpression(),
        },
      },
      {
        $project: {
          subject: "$_id",
          totalQuestions: 1,
          totalAttempts: 1,
          successRate: 1,
          avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
          difficultyDistribution: {
            easy: "$easyCount",
            medium: "$mediumCount",
            hard: "$hardCount",
          },
          _id: 0,
        },
      },
      { $sort: { totalQuestions: -1 } },
    ]);

    cacheHelper.set(cacheKey, subjectAnalytics, 600);

    res.json({
      success: true,
      data: subjectAnalytics,
    });
  })
);

// @route   GET /api/analytics/popular-questions
// @desc    Get most attempted questions
// @access  Public
router.get(
  "/popular-questions",
  asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;
    const limitInt = parseIntParam(limit, 10, 1, 100);

    const cacheKey = `analytics:popular:${limitInt}`;
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const popularQuestions = await Question.find({ isActive: true })
      .select("questionText subjectName chapterName difficulty statistics")
      .sort({ "statistics.totalAttempts": -1 })
      .limit(limitInt);

    cacheHelper.set(cacheKey, popularQuestions, 300);

    res.json({
      success: true,
      data: popularQuestions,
    });
  })
);

// @route   GET /api/analytics/difficult-questions
// @desc    Get questions with lowest success rates
// @access  Public
router.get(
  "/difficult-questions",
  asyncHandler(async (req, res, next) => {
    const { limit = 10, minAttempts = 5 } = req.query;
    const limitInt = parseIntParam(limit, 10, 1, 100);
    const minAttemptsInt = parseIntParam(minAttempts, 5, 1, 1000);

    const cacheKey = `analytics:difficult:${limitInt}:${minAttemptsInt}`;
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const difficultQuestions = await Question.aggregate([
      {
        $match: {
          isActive: true,
          "statistics.totalAttempts": { $gte: minAttemptsInt },
        },
      },
      {
        $addFields: {
          successRate: getRoundedSuccessRateExpression(),
        },
      },
      {
        $project: {
          questionText: 1,
          subjectName: 1,
          chapterName: 1,
          difficulty: 1,
          statistics: 1,
          successRate: 1,
        },
      },
      { $sort: { successRate: 1 } },
      { $limit: limitInt },
    ]);

    cacheHelper.set(cacheKey, difficultQuestions, 300);

    res.json({
      success: true,
      data: difficultQuestions,
    });
  })
);

// @route   GET /api/analytics/performance-breakdown
// @desc    Get current performance breakdown by subject and difficulty
// @access  Public
// Note: This provides a snapshot of performance grouped by subject and difficulty,
// not a true trend over time. For real trends, implement an Attempt collection with timestamps.
router.get(
  "/performance-breakdown",
  asyncHandler(async (req, res, next) => {
    const cacheKey = "analytics:performance-breakdown";
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const performanceBreakdown = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            subject: "$subjectName",
            difficulty: "$difficulty",
          },
          ...getQuestionStatsFields(),
        },
      },
      {
        $addFields: {
          successRate: getRoundedSuccessRateExpression(),
        },
      },
      {
        $group: {
          _id: "$_id.subject",
          difficulties: {
            $push: {
              difficulty: "$_id.difficulty",
              successRate: "$successRate",
              totalAttempts: "$totalAttempts",
              avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
              totalQuestions: "$totalQuestions",
            },
          },
        },
      },
      {
        $project: {
          subject: "$_id",
          breakdown: "$difficulties",
          _id: 0,
        },
      },
      { $sort: { subject: 1 } },
    ]);

    cacheHelper.set(cacheKey, performanceBreakdown, 600);

    res.json({
      success: true,
      data: performanceBreakdown,
    });
  })
);

// @route   GET /api/analytics/cache-stats
// @desc    Get cache performance statistics
// @access  Public
router.get("/cache-stats", (req, res) => {
  const stats = cacheHelper.getStats();

  res.json({
    success: true,
    data: {
      ...stats,
      cacheEnabled: cacheHelper.isEnabled(),
      timestamp: new Date().toISOString(),
    },
  });
});

// @route   DELETE /api/analytics/cache
// @desc    Clear all cache
// @access  Admin
router.delete("/cache", (req, res) => {
  const cleared = cacheHelper.flush();

  res.json({
    success: true,
    data: {
      message: cleared
        ? "Cache cleared successfully"
        : "Cache was already empty",
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
