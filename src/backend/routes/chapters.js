const express = require("express");
const router = express.Router();
const Chapter = require("../models/Chapter");
const Question = require("../models/Question");
const { NotFoundError } = require("../errors/CustomErrors");
const {
  chaptersCacheMiddleware,
  statsCacheMiddleware,
} = require("../middleware/cache");
const {
  validate,
  subjectValidation,
  chapterValidation,
} = require("../middleware/validation");

// @route   GET /api/chapters/:subject
// @desc    Get all chapters for a subject
// @access  Public
router.get(
  "/:subject",
  [subjectValidation, validate],
  chaptersCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      const chapters = await Chapter.getBySubject(subject);

      res.json({
        success: true,
        data: chapters,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/chapters/:subject/:chapter
// @desc    Get chapter details with statistics
// @access  Public
router.get(
  "/:subject/:chapter",
  [subjectValidation, chapterValidation, validate],
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject, chapter } = req.params;

      const chapterData = await Chapter.getChapterWithStats(subject, chapter);

      if (!chapterData || chapterData.length === 0) {
        throw new NotFoundError("Chapter", `${subject}/${chapter}`);
      }

      res.json({
        success: true,
        data: chapterData[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/chapters/:subject/:chapter/overview
// @desc    Get detailed chapter overview
// @access  Public
router.get(
  "/:subject/:chapter/overview",
  [subjectValidation, chapterValidation, validate],
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject, chapter } = req.params;

      // Get chapter basic info
      const chapterInfo = await Chapter.findOne({
        subjectName: subject,
        name: chapter,
        isActive: true,
      });

      if (!chapterInfo) {
        throw new NotFoundError("Chapter", `${subject}/${chapter}`);
      }

      // Get detailed statistics
      const [questionStats, difficultyStats, subtopicStats, recentQuestions] =
        await Promise.all([
          // Basic question statistics
          Question.aggregate([
            {
              $match: {
                subjectName: subject,
                chapterName: chapter,
                isActive: true,
              },
            },
            {
              $group: {
                _id: null,
                totalQuestions: { $sum: 1 },
                totalAttempts: { $sum: "$statistics.totalAttempts" },
                correctAttempts: { $sum: "$statistics.correctAttempts" },
                avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
                questionsWithAttempts: {
                  $sum: {
                    $cond: [{ $gt: ["$statistics.totalAttempts", 0] }, 1, 0],
                  },
                },
              },
            },
          ]),

          // Difficulty distribution
          Question.aggregate([
            {
              $match: {
                subjectName: subject,
                chapterName: chapter,
                isActive: true,
              },
            },
            {
              $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
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
            {
              $project: {
                difficulty: "$_id",
                count: 1,
                avgSuccessRate: { $round: ["$avgSuccessRate", 2] },
                _id: 0,
              },
            },
          ]),

          // Subtopic statistics using static method
          Question.getSubtopicStats(subject, chapter),

          // Recent questions (most recently added)
          Question.find({
            subjectName: subject,
            chapterName: chapter,
            isActive: true,
          })
            .select("questionText difficulty createdAt statistics")
            .sort({ createdAt: -1 })
            .limit(5),
        ]);

      // Format difficulty distribution
      const difficultyMap = difficultyStats.reduce((acc, item) => {
        acc[item.difficulty] = item;
        return acc;
      }, {});

      const formattedDifficultyStats = {
        easy: difficultyMap.easy || { count: 0, avgSuccessRate: 0 },
        medium: difficultyMap.medium || { count: 0, avgSuccessRate: 0 },
        hard: difficultyMap.hard || { count: 0, avgSuccessRate: 0 },
      };

      // Calculate overall success rate
      const overallStats = questionStats[0] || {
        totalQuestions: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        avgTimeSpent: 0,
        questionsWithAttempts: 0,
      };

      const overallSuccessRate =
        overallStats.totalAttempts > 0
          ? (overallStats.correctAttempts / overallStats.totalAttempts) * 100
          : 0;

      const overview = {
        ...chapterInfo.toObject(),
        statistics: {
          ...overallStats,
          overallSuccessRate: parseFloat(overallSuccessRate.toFixed(2)),
          progressPercentage:
            overallStats.totalQuestions > 0
              ? parseFloat(
                  (
                    (overallStats.questionsWithAttempts /
                      overallStats.totalQuestions) *
                    100
                  ).toFixed(2)
                )
              : 0,
        },
        difficultyDistribution: formattedDifficultyStats,
        subtopics: subtopicStats,
        recentQuestions,
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

// @route   GET /api/chapters/:subject/:chapter/subtopics
// @desc    Get subtopics for a chapter with statistics
// @access  Public
router.get(
  "/:subject/:chapter/subtopics",
  [subjectValidation, chapterValidation, validate],
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject, chapter } = req.params;

      const subtopics = await Question.getSubtopicStats(subject, chapter);

      res.json({
        success: true,
        data: {
          subject,
          chapter,
          subtopics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
