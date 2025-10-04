const mongoose = require("mongoose");

const questionReportSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: false, // Allow null for questions not in database
      index: true,
    },
    reportType: {
      type: String,
      enum: [
        "wrong_answer",
        "unclear_question",
        "multiple_correct",
        "typo",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reportedBy: {
      type: String,
      default: "anonymous", // Can be user ID or anonymous
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    resolvedBy: {
      type: String, // Admin user ID
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    // Question snapshot for reference
    questionSnapshot: {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          text: {
            type: String,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
      subjectName: {
        type: String,
        required: true,
      },
      chapterName: {
        type: String,
        required: true,
      },
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
questionReportSchema.index({ questionId: 1, status: 1 });
questionReportSchema.index({ reportType: 1, status: 1 });
questionReportSchema.index({ priority: 1, status: 1 });
questionReportSchema.index({ reportedBy: 1 });
questionReportSchema.index({ createdAt: -1 });
questionReportSchema.index({ resolvedAt: -1 });

// Compound indexes
questionReportSchema.index({ status: 1, priority: 1, createdAt: -1 });
questionReportSchema.index({ questionId: 1, reportType: 1 });

// Virtual for time since reported
questionReportSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    }
    return `${hours} hours ago`;
  }
  return `${days} days ago`;
});

// Static methods
questionReportSchema.statics.getReportsSummary = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        reviewing: {
          $sum: { $cond: [{ $eq: ["$status", "reviewing"] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
        },
        dismissed: {
          $sum: { $cond: [{ $eq: ["$status", "dismissed"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "questionreports",
        pipeline: [
          {
            $group: {
              _id: "$reportType",
              count: { $sum: 1 },
            },
          },
        ],
        as: "byType",
      },
    },
    {
      $lookup: {
        from: "questionreports",
        pipeline: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ],
        as: "byPriority",
      },
    },
  ]);
};

questionReportSchema.statics.getReportsForQuestion = function (questionId) {
  return this.find({ questionId, isActive: true })
    .sort({ createdAt: -1 })
    .populate("questionId", "questionText subjectName chapterName");
};

questionReportSchema.statics.getPendingReports = function (limit = 50) {
  return this.find({ status: "pending", isActive: true })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate("questionId", "questionText subjectName chapterName");
};

// Instance methods
questionReportSchema.methods.markAsReviewing = function (adminId) {
  this.status = "reviewing";
  this.resolvedBy = adminId;
  return this.save();
};

questionReportSchema.methods.resolve = function (adminId, adminNotes = "") {
  this.status = "resolved";
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  this.adminNotes = adminNotes;
  return this.save();
};

questionReportSchema.methods.dismiss = function (adminId, adminNotes = "") {
  this.status = "dismissed";
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  this.adminNotes = adminNotes;
  return this.save();
};

// Pre-save middleware to auto-set priority based on report type
questionReportSchema.pre("save", function (next) {
  if (this.isNew) {
    // Auto-assign priority based on report type
    switch (this.reportType) {
      case "wrong_answer":
        this.priority = "high";
        break;
      case "multiple_correct":
        this.priority = "critical";
        break;
      case "unclear_question":
        this.priority = "medium";
        break;
      case "typo":
        this.priority = "low";
        break;
      default:
        this.priority = "medium";
    }
  }
  next();
});

module.exports = mongoose.model("QuestionReport", questionReportSchema);
