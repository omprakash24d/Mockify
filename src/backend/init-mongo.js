// MongoDB initialization script
db = db.getSiblingDB("mockify_neet");

// Create collections with indexes for better performance
db.createCollection("questions");
db.createCollection("subjects");
db.createCollection("chapters");

// Create indexes for questions collection
db.questions.createIndex({ subjectName: 1, chapterName: 1 });
db.questions.createIndex({ subtopicTags: 1 });
db.questions.createIndex({ difficulty: 1 });
db.questions.createIndex({ isActive: 1 });
db.questions.createIndex({ createdAt: -1 });
db.questions.createIndex({
  questionText: "text",
  subtopicTags: "text",
  subjectName: "text",
  chapterName: "text",
});

// Create indexes for subjects collection
db.subjects.createIndex({ name: 1 }, { unique: true });
db.subjects.createIndex({ order: 1 });
db.subjects.createIndex({ isActive: 1 });

// Create indexes for chapters collection
db.chapters.createIndex({ subjectName: 1, name: 1 }, { unique: true });
db.chapters.createIndex({ subjectName: 1, order: 1 });
db.chapters.createIndex({ isActive: 1 });

print("Database initialized with collections and indexes");
