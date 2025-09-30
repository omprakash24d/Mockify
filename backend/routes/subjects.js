const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");
const {
  subjectsCacheMiddleware,
  statsCacheMiddleware,
} = require("../middleware/cache");
const { validate, subjectValidation } = require("../middleware/validation");

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Public
router.get("/", subjectsCacheMiddleware, async (req, res, next) => {
  try {
    const subjects = await Subject.getActiveSubjects();

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/subjects/:subject
// @desc    Get subject details with statistics
// @access  Public
router.get(
  "/:subject",
  [subjectValidation, validate],
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      const subjectData = await Subject.getSubjectWithStats(subject);

      if (!subjectData || subjectData.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Subject not found",
        });
      }

      res.json({
        success: true,
        data: subjectData[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/subjects/:subject/overview
// @desc    Get subject overview with detailed statistics
// @access  Public
router.get(
  "/:subject/overview",
  [subjectValidation, validate],
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      // Get subject basic info
      const subjectInfo = await Subject.findOne({
        name: subject,
        isActive: true,
      });

      if (!subjectInfo) {
        return res.status(404).json({
          success: false,
          error: "Subject not found",
        });
      }

      // Get detailed statistics
      const [totalQuestions, chapters, difficultyDistribution, topChapters] =
        await Promise.all([
          // Total questions count
          Question.countDocuments({
            subjectName: subject,
            isActive: true,
          }),

          // Chapters with question counts
          Chapter.aggregate([
            { $match: { subjectName: subject, isActive: true } },
            {
              $lookup: {
                from: "questions",
                let: { chapterName: "$name", subjectName: "$subjectName" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$chapterName", "$$chapterName"] },
                          { $eq: ["$subjectName", "$$subjectName"] },
                          { $eq: ["$isActive", true] },
                        ],
                      },
                    },
                  },
                ],
                as: "questions",
              },
            },
            {
              $addFields: {
                questionCount: { $size: "$questions" },
              },
            },
            {
              $project: {
                name: 1,
                displayName: 1,
                questionCount: 1,
                order: 1,
              },
            },
            { $sort: { order: 1, name: 1 } },
          ]),

          // Difficulty distribution
          Question.aggregate([
            { $match: { subjectName: subject, isActive: true } },
            {
              $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
              },
            },
          ]),

          // Top chapters by question count
          Question.aggregate([
            { $match: { subjectName: subject, isActive: true } },
            {
              $group: {
                _id: "$chapterName",
                questionCount: { $sum: 1 },
                avgSuccessRate: {
                  $avg: {
                    $cond: [
                      { $eq: ["$statistics.totalAttempts", 0] },
                      0,
                      {
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
                    ],
                  },
                },
              },
            },
            { $sort: { questionCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                chapterName: "$_id",
                questionCount: 1,
                avgSuccessRate: { $round: ["$avgSuccessRate", 2] },
                _id: 0,
              },
            },
          ]),
        ]);

      // Format difficulty distribution
      const difficultyMap = difficultyDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const formattedDifficultyDistribution = {
        easy: difficultyMap.easy || 0,
        medium: difficultyMap.medium || 0,
        hard: difficultyMap.hard || 0,
      };

      const overview = {
        ...subjectInfo.toObject(),
        statistics: {
          totalQuestions,
          totalChapters: chapters.length,
          difficultyDistribution: formattedDifficultyDistribution,
          chaptersWithQuestions: chapters.filter((ch) => ch.questionCount > 0)
            .length,
        },
        chapters,
        topChapters,
      };

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/subjects/:subject/progress
// @desc    Get subject progress statistics
// @access  Public
router.get(
  "/:subject/progress",
  [subjectValidation, validate],
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      // Get questions with attempt statistics
      const progressData = await Question.aggregate([
        { $match: { subjectName: subject, isActive: true } },
        {
          $group: {
            _id: "$chapterName",
            totalQuestions: { $sum: 1 },
            attemptedQuestions: {
              $sum: {
                $cond: [{ $gt: ["$statistics.totalAttempts", 0] }, 1, 0],
              },
            },
            totalAttempts: { $sum: "$statistics.totalAttempts" },
            correctAttempts: { $sum: "$statistics.correctAttempts" },
            avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
          },
        },
        {
          $addFields: {
            progressPercentage: {
              $multiply: [
                { $divide: ["$attemptedQuestions", "$totalQuestions"] },
                100,
              ],
            },
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
          $project: {
            chapterName: "$_id",
            totalQuestions: 1,
            attemptedQuestions: 1,
            progressPercentage: { $round: ["$progressPercentage", 2] },
            successRate: { $round: ["$successRate", 2] },
            avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
            _id: 0,
          },
        },
        { $sort: { chapterName: 1 } },
      ]);

      // Calculate overall progress
      const overallStats = progressData.reduce(
        (acc, chapter) => {
          acc.totalQuestions += chapter.totalQuestions;
          acc.attemptedQuestions += chapter.attemptedQuestions;
          return acc;
        },
        { totalQuestions: 0, attemptedQuestions: 0 }
      );

      const overallProgress =
        overallStats.totalQuestions > 0
          ? (
              (overallStats.attemptedQuestions / overallStats.totalQuestions) *
              100
            ).toFixed(2)
          : 0;

      res.json({
        success: true,
        data: {
          subject,
          overallProgress: parseFloat(overallProgress),
          overallStats,
          chapterProgress: progressData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
