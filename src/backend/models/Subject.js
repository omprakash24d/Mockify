const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
    },
    icon: {
      type: String,
      default: "📚",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    statistics: {
      totalQuestions: {
        type: Number,
        default: 0,
      },
      totalChapters: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
subjectSchema.index({ name: 1 });
subjectSchema.index({ order: 1 });
subjectSchema.index({ isActive: 1 });

// Virtual for chapters
subjectSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "name",
  foreignField: "subjectName",
});

// Static methods
subjectSchema.statics.getActiveSubjects = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

subjectSchema.statics.getSubjectWithStats = function (subjectName) {
  return this.aggregate([
    { $match: { name: subjectName, isActive: true } },
    {
      $lookup: {
        from: "questions",
        localField: "name",
        foreignField: "subjectName",
        as: "questions",
      },
    },
    {
      $lookup: {
        from: "chapters",
        localField: "name",
        foreignField: "subjectName",
        as: "chapters",
      },
    },
    {
      $addFields: {
        "statistics.totalQuestions": { $size: "$questions" },
        "statistics.totalChapters": { $size: "$chapters" },
      },
    },
    {
      $project: {
        questions: 0,
      },
    },
  ]);
};

// Pre-save middleware to update statistics
subjectSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    // Update statistics when subject name changes
    const Question = mongoose.model("Question");
    const Chapter = mongoose.model("Chapter");

    this.statistics.totalQuestions = await Question.countDocuments({
      subjectName: this.name,
      isActive: true,
    });

    this.statistics.totalChapters = await Chapter.countDocuments({
      subjectName: this.name,
      isActive: true,
    });
  }
  next();
});

module.exports = mongoose.model("Subject", subjectSchema);
