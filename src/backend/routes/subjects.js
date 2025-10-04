const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");
const { NotFoundError } = require("../errors/CustomErrors");
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
        throw new NotFoundError("Subject", subject);
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
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      // Get subject basic info
      const subjectInfo = await Subject.findOne({
        name: subject,
        isActive: true,
      });

      if (!subjectInfo) {
        throw new NotFoundError("Subject", subject);
      }

      // Get detailed statistics
      const [totalQuestions, chapters, difficultyDistribution, topChapters] =
        await Promise.all([
          // Total questions count
          Question.countDocuments({
            subjectName: subject,
            isActive: true,
          }),

          // Chapters with question counts using static method
          Chapter.getChaptersWithQuestionCounts(subject),

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

          // Top chapters by question count using static method
          Question.getTopChaptersByCount(subject, 5),
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
  statsCacheMiddleware,
  async (req, res, next) => {
    try {
      const { subject } = req.params;

      // Get questions with attempt statistics using static method
      const progressData = await Question.getChapterProgress(subject);

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
