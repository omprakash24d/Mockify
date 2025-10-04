const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    chapterName: {
      type: String,
      required: true,
      trim: true,
    },
    questionNumberForChapter: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      text: true, // Enable text search
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],

    subtopicTags: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    examYear: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear(),
    },
    explanation: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    statistics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      correctAttempts: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number,
        default: 0, // in seconds
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
questionSchema.index({ subjectName: 1, chapterName: 1 });
questionSchema.index({ subtopicTags: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ "statistics.totalAttempts": -1 });
questionSchema.index({ createdAt: -1 });

// Text index for search functionality
questionSchema.index({
  questionText: "text",
  subtopicTags: "text",
  subjectName: "text",
  chapterName: "text",
});

// Virtual for success rate
questionSchema.virtual("successRate").get(function () {
  if (this.statistics.totalAttempts === 0) return 0;
  return (
    (this.statistics.correctAttempts / this.statistics.totalAttempts) *
    100
  ).toFixed(2);
});

// Virtual for correct answer (derived from options)
questionSchema.virtual("correctAnswer").get(function () {
  const correctOption = this.options.find((option) => option.isCorrect);
  return correctOption ? correctOption.text : null;
});

// Static methods
questionSchema.statics.getBySubject = function (
  subject,
  projection = null,
  options = {}
) {
  const query = { subjectName: subject, isActive: true };
  return this.find(query, projection, options);
};

questionSchema.statics.getByChapter = function (
  subject,
  chapter,
  projection = null,
  options = {}
) {
  const query = {
    subjectName: subject,
    chapterName: chapter,
    isActive: true,
  };
  return this.find(query, projection, options);
};

questionSchema.statics.searchQuestions = function (searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true,
    ...filters,
  };

  return this.find(query, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

questionSchema.statics.getRandomQuestions = async function (
  count,
  filters = {}
) {
  const matchQuery = { isActive: true, ...filters };

  // Get total count first
  const totalCount = await this.countDocuments(matchQuery);

  if (totalCount === 0) {
    return [];
  }

  // If requesting more than available, return all
  const limitCount = Math.min(count, totalCount);

  // Generate random skip values
  const randomSkips = [];
  for (let i = 0; i < limitCount; i++) {
    randomSkips.push(Math.floor(Math.random() * totalCount));
  }

  // Get questions at random positions
  const questions = await Promise.all(
    randomSkips.map((skip) => this.findOne(matchQuery).skip(skip))
  );

  // Filter out nulls and remove duplicates
  const uniqueQuestions = questions
    .filter(Boolean)
    .filter(
      (question, index, arr) =>
        arr.findIndex((q) => q._id.toString() === question._id.toString()) ===
        index
    );

  return uniqueQuestions.slice(0, count);
};

// Static method for subtopic statistics
questionSchema.statics.getSubtopicStats = function (subject, chapter) {
  return this.aggregate([
    {
      $match: {
        subjectName: subject,
        chapterName: chapter,
        isActive: true,
      },
    },
    { $unwind: "$subtopicTags" },
    {
      $group: {
        _id: "$subtopicTags",
        questionCount: { $sum: 1 },
        totalAttempts: { $sum: "$statistics.totalAttempts" },
        correctAttempts: { $sum: "$statistics.correctAttempts" },
        avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
        difficulties: { $push: "$difficulty" },
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
        difficultyDistribution: {
          easy: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "easy"] },
              },
            },
          },
          medium: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "medium"] },
              },
            },
          },
          hard: {
            $size: {
              $filter: {
                input: "$difficulties",
                cond: { $eq: ["$$this", "hard"] },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: "$_id",
        questionCount: 1,
        successRate: { $round: ["$successRate", 2] },
        avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
        difficultyDistribution: 1,
        _id: 0,
      },
    },
    { $sort: { questionCount: -1, name: 1 } },
  ]);
};

// Static method for top chapters by question count
questionSchema.statics.getTopChaptersByCount = function (subject, limit = 5) {
  return this.aggregate([
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
    { $limit: limit },
    {
      $project: {
        chapterName: "$_id",
        questionCount: 1,
        avgSuccessRate: { $round: ["$avgSuccessRate", 2] },
        _id: 0,
      },
    },
  ]);
};

// Static method for chapter progress statistics
questionSchema.statics.getChapterProgress = function (subject) {
  return this.aggregate([
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
};

// Static method for subject metadata with improved breakdown
questionSchema.statics.getSubjectMetadata = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { subject: "$subjectName", difficulty: "$difficulty" },
        count: { $sum: 1 },
        chapters: { $addToSet: "$chapterName" },
      },
    },
    {
      $group: {
        _id: "$_id.subject",
        totalCount: { $sum: "$count" },
        chapterCount: { $first: { $size: "$chapters" } },
        difficulties: {
          $push: {
            difficulty: "$_id.difficulty",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        subject: "$_id",
        count: "$totalCount",
        chapterCount: 1,
        difficulties: 1,
        _id: 0,
      },
    },
  ]);
};

// Instance methods
questionSchema.methods.incrementAttempt = function (isCorrect, timeSpent = 0) {
  this.statistics.totalAttempts += 1;
  if (isCorrect) {
    this.statistics.correctAttempts += 1;
  }

  // Update average time spent
  const currentAvg = this.statistics.averageTimeSpent;
  const totalAttempts = this.statistics.totalAttempts;
  this.statistics.averageTimeSpent =
    (currentAvg * (totalAttempts - 1) + timeSpent) / totalAttempts;

  return this.save();
};

// Pre-save validation for options array
questionSchema.pre("save", function (next) {
  // Validate minimum number of options
  if (this.options.length < 2) {
    return next(new Error("A question must have at least two options."));
  }

  // Validate exactly one correct option
  const correctCount = this.options.filter((opt) => opt.isCorrect).length;
  if (correctCount !== 1) {
    return next(new Error("A question must have exactly one correct option."));
  }

  next();
});

module.exports = mongoose.model("Question", questionSchema);
