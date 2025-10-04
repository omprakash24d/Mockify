const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subtopics: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        questionCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    statistics: {
      totalQuestions: {
        type: Number,
        default: 0,
      },
      difficultyDistribution: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
      },
      averageSuccessRate: {
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

// Compound index for unique chapter per subject
chapterSchema.index({ subjectName: 1, name: 1 }, { unique: true });
chapterSchema.index({ subjectName: 1, order: 1 });
chapterSchema.index({ isActive: 1 });

// Virtual for subject reference
chapterSchema.virtual("subject", {
  ref: "Subject",
  localField: "subjectName",
  foreignField: "name",
  justOne: true,
});

// Virtual for questions
chapterSchema.virtual("questions", {
  ref: "Question",
  localField: "name",
  foreignField: "chapterName",
  match: {
    subjectName: function () {
      return this.subjectName;
    },
  },
});

// Static methods
chapterSchema.statics.getBySubject = function (subjectName) {
  return this.find({
    subjectName,
    isActive: true,
  }).sort({ order: 1, name: 1 });
};

chapterSchema.statics.getChapterWithStats = function (
  subjectName,
  chapterName
) {
  return this.aggregate([
    {
      $match: {
        subjectName,
        name: chapterName,
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "questions",
        let: {
          chapterName: "$name",
          subjectName: "$subjectName",
        },
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
        "statistics.totalQuestions": { $size: "$questions" },
        "statistics.difficultyDistribution.easy": {
          $size: {
            $filter: {
              input: "$questions",
              cond: { $eq: ["$$this.difficulty", "easy"] },
            },
          },
        },
        "statistics.difficultyDistribution.medium": {
          $size: {
            $filter: {
              input: "$questions",
              cond: { $eq: ["$$this.difficulty", "medium"] },
            },
          },
        },
        "statistics.difficultyDistribution.hard": {
          $size: {
            $filter: {
              input: "$questions",
              cond: { $eq: ["$$this.difficulty", "hard"] },
            },
          },
        },
        "statistics.averageSuccessRate": {
          $avg: {
            $map: {
              input: "$questions",
              as: "question",
              in: {
                $cond: [
                  { $eq: ["$$question.statistics.totalAttempts", 0] },
                  0,
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$$question.statistics.correctAttempts",
                          "$$question.statistics.totalAttempts",
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
      },
    },
    {
      $project: {
        questions: 0,
      },
    },
  ]);
};

// Static method for getting chapters with question counts
chapterSchema.statics.getChaptersWithQuestionCounts = function (subjectName) {
  return this.aggregate([
    { $match: { subjectName, isActive: true } },
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
  ]);
};

// Instance methods
chapterSchema.methods.updateSubtopics = async function () {
  const Question = mongoose.model("Question");

  // Get all unique subtopic tags for this chapter
  const subtopicsAgg = await Question.aggregate([
    {
      $match: {
        subjectName: this.subjectName,
        chapterName: this.name,
        isActive: true,
      },
    },
    { $unwind: "$subtopicTags" },
    {
      $group: {
        _id: "$subtopicTags",
        questionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        name: "$_id",
        questionCount: 1,
        _id: 0,
      },
    },
    { $sort: { questionCount: -1, name: 1 } },
  ]);

  this.subtopics = subtopicsAgg;
  return this.save();
};

// Pre-save middleware to update statistics
chapterSchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isModified("subjectName")) {
    await this.updateSubtopics();
  }
  next();
});

module.exports = mongoose.model("Chapter", chapterSchema);
