const express = require("express");
const router = express.Router();
const QuestionReport = require("../models/QuestionReport");
const Question = require("../models/Question");
const { validationResult, body, query } = require("express-validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { parseIntParam } = require("../utils/projectionUtils");
const cache = require("../middleware/cache");
const logger = require("../config/logger");

// Validation middleware
const validateReport = [
  body("questionId").optional().isMongoId().withMessage("Invalid question ID"),
  body("reportType")
    .isIn([
      "wrong_answer",
      "unclear_question",
      "multiple_correct",
      "typo",
      "other",
    ])
    .withMessage("Invalid report type"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage(
      "Description must be between 10 and 1000 characters if provided"
    ),
  body("reportedBy").optional().isString().withMessage("Invalid reporter ID"),
  body("questionSnapshot")
    .isObject()
    .withMessage("Question snapshot is required"),
  body("questionSnapshot.questionText")
    .isString()
    .withMessage("Question text is required in snapshot"),
];

const validateReportUpdate = [
  body("status")
    .isIn(["pending", "reviewing", "resolved", "dismissed"])
    .withMessage("Invalid status"),
  body("adminNotes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Admin notes must be less than 2000 characters"),
];

const validateReportQuery = [
  query("status")
    .optional({ checkFalsy: true })
    .isIn(["pending", "reviewing", "resolved", "dismissed"])
    .withMessage("Invalid status filter"),
  query("type")
    .optional({ checkFalsy: true })
    .isIn([
      "wrong_answer",
      "unclear_question",
      "multiple_correct",
      "typo",
      "other",
    ])
    .withMessage("Invalid type filter"),
  query("priority")
    .optional({ checkFalsy: true })
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority filter"),
  query("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Invalid page number"),
  query("limit")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Invalid limit"),
];

// Submit a new question report
router.post(
  "/",
  validateReport,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug("Report validation errors:", errors.array());
      logger.debug("Request body:", req.body);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const {
      questionId,
      reportType,
      description,
      reportedBy,
      questionSnapshot,
    } = req.body;

    // Validation already handled by middleware, no need to re-check

    // Try to find the question in database, but don't require it
    let question = null;
    try {
      if (questionId && questionId !== "000000000000000000000000") {
        question = await Question.findById(questionId);
      }
    } catch (error) {
      // Question not found or invalid ID - we'll use the snapshot data
    }

    // Use provided snapshot or fallback to database question data
    const finalQuestionSnapshot = questionSnapshot;

    // Create the report
    const report = new QuestionReport({
      questionId: question ? questionId : null, // Only set if question exists in DB
      reportType,
      description: description || "No description provided",
      reportedBy: reportedBy || "anonymous",
      questionSnapshot: finalQuestionSnapshot,
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: {
        reportId: report._id,
        message: "Report submitted successfully",
      },
    });
  })
);

// Get reports with filtering and pagination
router.get(
  "/",
  validateReportQuery,
  asyncHandler(async (req, res) => {
    logger.debug("GET /api/reports query params:", req.query);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const {
      status,
      type: reportType,
      priority,
      page = 1,
      limit = 20,
    } = req.query;

    // Use utility function for safe integer parsing
    const pageInt = parseIntParam(page, 1, 1, 1000);
    const limitInt = parseIntParam(limit, 20, 1, 100);

    // Build filter query
    const filter = { isActive: true };
    if (status && status.trim()) filter.status = status;
    if (reportType && reportType.trim()) filter.reportType = reportType;
    if (priority && priority.trim()) filter.priority = priority;

    // Calculate pagination
    const skip = (pageInt - 1) * limitInt;

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      QuestionReport.find(filter)
        .populate("questionId", "questionText subjectName chapterName")
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitInt),
      QuestionReport.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitInt);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: pageInt,
          totalPages,
          totalItems: total,
          itemsPerPage: limitInt,
          hasNext: pageInt < totalPages,
          hasPrev: pageInt > 1,
        },
      },
    });
  })
);

// Get reports summary
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const summaryData = await QuestionReport.getReportsSummary();

    let summary = {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      byType: {},
      byPriority: {},
    };

    if (summaryData.length > 0) {
      const data = summaryData[0];
      summary = {
        total: data.total || 0,
        pending: data.pending || 0,
        reviewing: data.reviewing || 0,
        resolved: data.resolved || 0,
        dismissed: data.dismissed || 0,
        byType:
          data.byType?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {},
        byPriority:
          data.byPriority?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {},
      };
    }

    res.json({
      success: true,
      data: summary,
    });
  })
);

// Get reports for a specific question
router.get(
  "/question/:questionId",
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid question ID format",
      });
    }

    const reports = await QuestionReport.getReportsForQuestion(questionId);

    res.json({
      success: true,
      data: reports,
    });
  })
);

// Update report status (admin only)
router.put(
  "/:reportId",
  validateReportUpdate,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user?.id || "admin"; // Assumes admin middleware sets req.user

    if (!reportId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid report ID format",
      });
    }

    const report = await QuestionReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    // Update report based on status
    switch (status) {
      case "reviewing":
        await report.markAsReviewing(adminId);
        break;
      case "resolved":
        await report.resolve(adminId, adminNotes);
        break;
      case "dismissed":
        await report.dismiss(adminId, adminNotes);
        break;
      case "pending":
        // Allow admin to revert to pending if needed
        report.status = "pending";
        report.resolvedBy = null;
        report.resolvedAt = null;
        if (adminNotes) report.adminNotes = adminNotes;
        await report.save();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid status transition",
        });
    }

    res.json({
      success: true,
      data: {
        message: "Report status updated successfully",
        report,
      },
    });
  })
);

// Get pending reports (for admin dashboard)
router.get(
  "/pending",
  asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const pendingReports = await QuestionReport.getPendingReports(
      parseInt(limit)
    );

    res.json({
      success: true,
      data: pendingReports,
    });
  })
);

// Bulk update reports
router.put(
  "/bulk",
  asyncHandler(async (req, res) => {
    const { reportIds, status, adminNotes } = req.body;
    const adminId = req.user?.id || "admin";

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Report IDs array is required",
      });
    }

    const updateData = {
      status,
      resolvedBy: adminId,
    };

    if (status === "resolved" || status === "dismissed") {
      updateData.resolvedAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const result = await QuestionReport.updateMany(
      { _id: { $in: reportIds } },
      updateData
    );

    res.json({
      success: true,
      data: {
        message: `Updated ${result.modifiedCount} reports`,
        updatedCount: result.modifiedCount,
      },
    });
  })
);

module.exports = router;
