/**
 * Utility functions for handling MongoDB projections
 */

/**
 * Get projection fields based on requested detail level
 * @param {string} fields - The detail level: 'minimal', 'basic', 'full'
 * @returns {object} MongoDB projection object
 */
function getProjectionFields(fields) {
  const projections = {
    minimal: {
      questionText: 1,
      difficulty: 1,
      subjectName: 1,
      chapterName: 1,
    },
    basic: {
      questionText: 1,
      options: 1,
      difficulty: 1,
      subjectName: 1,
      chapterName: 1,
      subtopicTags: 1,
      examYear: 1,
    },
    full: {}, // Empty object means include all fields
  };

  return projections[fields] || projections.basic;
}

/**
 * Get success rate calculation for aggregation pipelines
 * @returns {object} MongoDB aggregation expression for success rate
 */
function getSuccessRateExpression() {
  return {
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
  };
}

/**
 * Get rounded success rate calculation for aggregation pipelines
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {object} MongoDB aggregation expression for rounded success rate
 */
function getRoundedSuccessRateExpression(decimals = 2) {
  return {
    $round: [getSuccessRateExpression(), decimals],
  };
}

/**
 * Get optimized difficulty distribution counts using conditional sum
 * @returns {object} MongoDB aggregation fields for difficulty counting
 */
function getDifficultyDistributionFields() {
  return {
    easyCount: { $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] } },
    mediumCount: {
      $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] },
    },
    hardCount: { $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] } },
  };
}

/**
 * Get standard aggregation fields for question statistics
 * @returns {object} Common aggregation fields
 */
function getQuestionStatsFields() {
  return {
    totalQuestions: { $sum: 1 },
    totalAttempts: { $sum: "$statistics.totalAttempts" },
    correctAttempts: { $sum: "$statistics.correctAttempts" },
    avgTimeSpent: { $avg: "$statistics.averageTimeSpent" },
  };
}

/**
 * Parse and validate integer query parameters
 * @param {string|number} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Parsed and validated integer
 */
function parseIntParam(
  value,
  defaultValue = 1,
  min = 1,
  max = Number.MAX_SAFE_INTEGER
) {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue;
  }
  return parsed;
}

module.exports = {
  getProjectionFields,
  getSuccessRateExpression,
  getRoundedSuccessRateExpression,
  getDifficultyDistributionFields,
  getQuestionStatsFields,
  parseIntParam,
};
