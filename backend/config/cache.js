const NodeCache = require("node-cache");

// Cache configuration
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for better performance
});

// Cache keys constants
const CACHE_KEYS = {
  SUBJECTS: "subjects",
  CHAPTERS: (subject) => `chapters:${subject}`,
  QUESTION: (id) => `question:${id}`,
  QUESTIONS: (params) => `questions:${JSON.stringify(params)}`,
  CHAPTER_STATS: (subject, chapter) => `chapter_stats:${subject}:${chapter}`,
  SUBJECT_STATS: (subject) => `subject_stats:${subject}`,
  RANDOM_QUESTIONS: (params) => `random:${JSON.stringify(params)}`,
  SEARCH_RESULTS: (term, filters) =>
    `search:${term}:${JSON.stringify(filters)}`,
};

// Helper functions
const cacheHelper = {
  // Check if caching is enabled
  isEnabled: () => process.env.ENABLE_CACHE === "true",

  // Get from cache
  get: (key) => {
    if (!cacheHelper.isEnabled()) return null;
    return cache.get(key);
  },

  // Set to cache
  set: (key, value, ttl = null) => {
    if (!cacheHelper.isEnabled()) return false;
    return cache.set(key, value, ttl);
  },

  // Delete from cache
  del: (key) => {
    if (!cacheHelper.isEnabled()) return false;
    return cache.del(key);
  },

  // Delete multiple keys
  delMultiple: (keys) => {
    if (!cacheHelper.isEnabled()) return false;
    return cache.del(keys);
  },

  // Flush all cache
  flush: () => {
    if (!cacheHelper.isEnabled()) return false;
    return cache.flushAll();
  },

  // Get cache statistics
  getStats: () => cache.getStats(),

  // Clear subject-related cache
  clearSubjectCache: (subject) => {
    const keysToDelete = [
      CACHE_KEYS.SUBJECTS,
      CACHE_KEYS.CHAPTERS(subject),
      CACHE_KEYS.SUBJECT_STATS(subject),
    ];

    // Also clear question caches that might contain this subject
    const allKeys = cache.keys();
    const questionKeys = allKeys.filter(
      (key) =>
        key.startsWith("questions:") ||
        key.startsWith("random:") ||
        key.startsWith("search:")
    );

    keysToDelete.push(...questionKeys);
    return cacheHelper.delMultiple(keysToDelete);
  },

  // Clear chapter-related cache
  clearChapterCache: (subject, chapter) => {
    const keysToDelete = [
      CACHE_KEYS.CHAPTERS(subject),
      CACHE_KEYS.CHAPTER_STATS(subject, chapter),
      CACHE_KEYS.SUBJECT_STATS(subject),
    ];

    // Also clear question caches that might contain this chapter
    const allKeys = cache.keys();
    const questionKeys = allKeys.filter(
      (key) =>
        key.startsWith("questions:") ||
        key.startsWith("random:") ||
        key.startsWith("search:")
    );

    keysToDelete.push(...questionKeys);
    return cacheHelper.delMultiple(keysToDelete);
  },

  // Clear question-related cache
  clearQuestionCache: (questionId = null) => {
    if (questionId) {
      return cacheHelper.del(CACHE_KEYS.QUESTION(questionId));
    }

    // Clear all question-related caches
    const allKeys = cache.keys();
    const questionKeys = allKeys.filter(
      (key) =>
        key.startsWith("question:") ||
        key.startsWith("questions:") ||
        key.startsWith("random:") ||
        key.startsWith("search:")
    );

    return cacheHelper.delMultiple(questionKeys);
  },
};

// Cache events
cache.on("set", (key, value) => {
  console.log(`Cache SET: ${key}`);
});

cache.on("del", (key, value) => {
  console.log(`Cache DEL: ${key}`);
});

cache.on("expired", (key, value) => {
  console.log(`Cache EXPIRED: ${key}`);
});

module.exports = {
  cache,
  cacheHelper,
  CACHE_KEYS,
};
