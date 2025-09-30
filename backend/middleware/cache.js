const { cacheHelper } = require("../config/cache");

// Generic cache middleware
const cacheMiddleware = (keyGenerator, ttl = null) => {
  return (req, res, next) => {
    if (!cacheHelper.isEnabled()) {
      return next();
    }

    const key =
      typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;
    const cachedData = cacheHelper.get(key);

    if (cachedData) {
      console.log(`Cache HIT: ${key}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Cache MISS: ${key}`);

    // Store the original json method
    const originalJson = res.json;

    // Override the json method to cache successful responses
    res.json = function (data) {
      if (data.success && data.data) {
        cacheHelper.set(key, data.data, ttl);
      }
      // Call the original json method
      originalJson.call(this, data);
    };

    next();
  };
};

// Specific cache middleware for different endpoints
const questionsCacheMiddleware = cacheMiddleware((req) => {
  const {
    subject,
    chapter,
    page = 1,
    limit = 10,
    difficulty,
    search,
  } = req.query;
  return `questions:${JSON.stringify({
    subject,
    chapter,
    page,
    limit,
    difficulty,
    search,
  })}`;
}, 300);

const subjectsCacheMiddleware = cacheMiddleware("subjects", 600);

const chaptersCacheMiddleware = cacheMiddleware((req) => {
  const { subject } = req.params;
  return `chapters:${subject}`;
}, 600);

const questionCacheMiddleware = cacheMiddleware((req) => {
  return `question:${req.params.id}`;
}, 300);

const randomQuestionsCacheMiddleware = cacheMiddleware((req) => {
  const { count, subject, chapter, difficulty } = req.query;
  return `random:${JSON.stringify({ count, subject, chapter, difficulty })}`;
}, 60); // Shorter cache for random questions

const searchCacheMiddleware = cacheMiddleware((req) => {
  const { q, subject, chapter, difficulty } = req.query;
  return `search:${q}:${JSON.stringify({ subject, chapter, difficulty })}`;
}, 300);

const statsCacheMiddleware = cacheMiddleware((req) => {
  const { subject, chapter } = req.params;
  if (chapter) {
    return `chapter_stats:${subject}:${chapter}`;
  }
  return `subject_stats:${subject}`;
}, 600);

module.exports = {
  cacheMiddleware,
  questionsCacheMiddleware,
  subjectsCacheMiddleware,
  chaptersCacheMiddleware,
  questionCacheMiddleware,
  randomQuestionsCacheMiddleware,
  searchCacheMiddleware,
  statsCacheMiddleware,
};
