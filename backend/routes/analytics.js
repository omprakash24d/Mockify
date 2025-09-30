const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const { cacheHelper } = require("../config/cache");

// @route   GET /api/analytics/overview
// @desc    Get overall platform analytics
// @access  Public
router.get("/overview", async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/subjects
// @desc    Get subject-wise analytics
// @access  Public
router.get("/subjects", async (req, res, next) => {
  try {
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
          totalQuestions: { $sum: 1 },
          totalAttempts: { $sum: "$statistics.totalAttempts" },
          correctAttempts: { $sum: "$statistics.correctAttempts" },
          avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
          difficultyDistribution: {
            $push: "$difficulty",
          },
        },
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correctAttempts", "$totalAttempts"] },
                  100,
                ],
              },
            ],
          },
          easyCount: {
            $size: {
              $filter: {
                input: "$difficultyDistribution",
                cond: { $eq: ["$$this", "easy"] },
              },
            },
          },
          mediumCount: {
            $size: {
              $filter: {
                input: "$difficultyDistribution",
                cond: { $eq: ["$$this", "medium"] },
              },
            },
          },
          hardCount: {
            $size: {
              $filter: {
                input: "$difficultyDistribution",
                cond: { $eq: ["$$this", "hard"] },
              },
            },
          },
        },
      },
      {
        $project: {
          subject: "$_id",
          totalQuestions: 1,
          totalAttempts: 1,
          successRate: { $round: ["$successRate", 2] },
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
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/popular-questions
// @desc    Get most attempted questions
// @access  Public
router.get("/popular-questions", async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const cacheKey = `analytics:popular:${limit}`;
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
      .limit(parseInt(limit));

    cacheHelper.set(cacheKey, popularQuestions, 300);

    res.json({
      success: true,
      data: popularQuestions,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/difficult-questions
// @desc    Get questions with lowest success rates
// @access  Public
router.get("/difficult-questions", async (req, res, next) => {
  try {
    const { limit = 10, minAttempts = 5 } = req.query;

    const cacheKey = `analytics:difficult:${limit}:${minAttempts}`;
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
          "statistics.totalAttempts": { $gte: parseInt(minAttempts) },
        },
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              {
                $divide: [
                  "$statistics.correctAttempts",
                  "$statistics.totalAttempts",
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $project: {
          questionText: 1,
          subjectName: 1,
          chapterName: 1,
          difficulty: 1,
          statistics: 1,
          successRate: { $round: ["$successRate", 2] },
        },
      },
      { $sort: { successRate: 1 } },
      { $limit: parseInt(limit) },
    ]);

    cacheHelper.set(cacheKey, difficultQuestions, 300);

    res.json({
      success: true,
      data: difficultQuestions,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/performance-trends
// @desc    Get performance trends over time
// @access  Public
router.get("/performance-trends", async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const cacheKey = `analytics:trends:${days}`;
    const cached = cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Note: This is a simplified version. In a real implementation,
    // you would track attempt timestamps and calculate trends
    const trends = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            subject: "$subjectName",
            difficulty: "$difficulty",
          },
          totalAttempts: { $sum: "$statistics.totalAttempts" },
          correctAttempts: { $sum: "$statistics.correctAttempts" },
          avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
        },
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ["$totalAttempts", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correctAttempts", "$totalAttempts"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id.subject",
          difficulties: {
            $push: {
              difficulty: "$_id.difficulty",
              successRate: { $round: ["$successRate", 2] },
              totalAttempts: "$totalAttempts",
              avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
            },
          },
        },
      },
      {
        $project: {
          subject: "$_id",
          trends: "$difficulties",
          _id: 0,
        },
      },
    ]);

    cacheHelper.set(cacheKey, trends, 600);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
});

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
