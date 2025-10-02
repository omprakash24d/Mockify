const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    chapterName: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
    correctAnswer: {
      type: String,
      required: true,
    },
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

// Static methods
questionSchema.statics.getBySubject = function (subject, options = {}) {
  const query = { subjectName: subject, isActive: true };
  return this.find(query, null, options);
};

questionSchema.statics.getByChapter = function (
  subject,
  chapter,
  options = {}
) {
  const query = {
    subjectName: subject,
    chapterName: chapter,
    isActive: true,
  };
  return this.find(query, null, options);
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

questionSchema.statics.getRandomQuestions = function (count, filters = {}) {
  const matchQuery = { isActive: true, ...filters };

  return this.aggregate([{ $match: matchQuery }, { $sample: { size: count } }]);
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

module.exports = mongoose.model("Question", questionSchema);
