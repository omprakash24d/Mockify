const mongoose = require("mongoose");
const { getFirestore } = require("../config/firebase");
const logger = require("../config/logger");

class HybridDataService {
  constructor() {
    this.useFirebase = false;
    this.useMongoDB = false;
    this.firestore = null;
  }

  async initialize() {
    try {
      // Try to initialize Firebase first
      this.firestore = getFirestore();
      if (this.firestore) {
        this.useFirebase = true;
        logger.info("Firebase Firestore initialized as primary database");
      }

      // Always initialize MongoDB as backup
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        });
        this.useMongoDB = true;
        logger.info("MongoDB initialized as backup database");
      } else {
        this.useMongoDB = true;
      }

      logger.info(
        `Database strategy: Firebase=${this.useFirebase}, MongoDB=${this.useMongoDB}`
      );
    } catch (error) {
      logger.error("Database initialization failed:", error);
      throw error;
    }
  }

  // Generic CRUD operations
  async create(collection, data) {
    try {
      if (this.useFirebase) {
        const docRef = await this.firestore.collection(collection).add({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
      }

      // Fallback to MongoDB
      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const document = new Model(data);
        await document.save();
        return document.toObject();
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Create operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async findById(collection, id) {
    try {
      if (this.useFirebase) {
        const doc = await this.firestore.collection(collection).doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
        return null;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const document = await Model.findById(id);
        return document ? document.toObject() : null;
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`FindById operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async find(collection, query = {}, options = {}) {
    try {
      if (this.useFirebase) {
        let firestoreQuery = this.firestore.collection(collection);

        // Apply filters
        Object.entries(query).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle complex queries
            if (value.$regex) {
              // Firestore doesn't support regex, fall back to MongoDB
              throw new Error("Complex query requires MongoDB");
            }
          } else {
            firestoreQuery = firestoreQuery.where(key, "==", value);
          }
        });

        // Apply pagination
        if (options.limit) {
          firestoreQuery = firestoreQuery.limit(options.limit);
        }
        if (options.offset) {
          firestoreQuery = firestoreQuery.offset(options.offset);
        }

        const snapshot = await firestoreQuery.get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const documents = await Model.find(query, null, options);
        return documents.map((doc) => doc.toObject());
      }

      throw new Error("No database available");
    } catch (error) {
      // If Firebase fails with complex query, try MongoDB
      if (error.message.includes("Complex query") && this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const documents = await Model.find(query, null, options);
        return documents.map((doc) => doc.toObject());
      }

      logger.error(`Find operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async update(collection, id, data) {
    try {
      if (this.useFirebase) {
        await this.firestore
          .collection(collection)
          .doc(id)
          .update({
            ...data,
            updatedAt: new Date(),
          });
        return this.findById(collection, id);
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const document = await Model.findByIdAndUpdate(id, data, { new: true });
        return document ? document.toObject() : null;
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Update operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection, id) {
    try {
      if (this.useFirebase) {
        await this.firestore.collection(collection).doc(id).delete();
        return true;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const result = await Model.findByIdAndDelete(id);
        return !!result;
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Delete operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async bulkCreate(collection, dataArray) {
    try {
      if (this.useFirebase) {
        const batch = this.firestore.batch();
        const results = [];

        dataArray.forEach((data) => {
          const docRef = this.firestore.collection(collection).doc();
          batch.set(docRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          results.push({ id: docRef.id, ...data });
        });

        await batch.commit();
        return results;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const documents = await Model.insertMany(dataArray);
        return documents.map((doc) => doc.toObject());
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Bulk create operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async bulkUpdate(collection, updates) {
    try {
      if (this.useFirebase) {
        const batch = this.firestore.batch();

        updates.forEach(({ id, data }) => {
          const docRef = this.firestore.collection(collection).doc(id);
          batch.update(docRef, {
            ...data,
            updatedAt: new Date(),
          });
        });

        await batch.commit();
        return updates.length;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const operations = updates.map(({ id, data }) => ({
          updateOne: {
            filter: { _id: id },
            update: data,
          },
        }));

        const result = await Model.bulkWrite(operations);
        return result.modifiedCount;
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Bulk update operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async bulkDelete(collection, ids) {
    try {
      if (this.useFirebase) {
        const batch = this.firestore.batch();

        ids.forEach((id) => {
          const docRef = this.firestore.collection(collection).doc(id);
          batch.delete(docRef);
        });

        await batch.commit();
        return ids.length;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const result = await Model.deleteMany({ _id: { $in: ids } });
        return result.deletedCount;
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Bulk delete operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async aggregate(collection, pipeline) {
    try {
      // Aggregation is MongoDB-specific, so use MongoDB
      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        const results = await Model.aggregate(pipeline);
        return results;
      }

      throw new Error("Aggregation requires MongoDB");
    } catch (error) {
      logger.error(`Aggregation operation failed for ${collection}:`, error);
      throw error;
    }
  }

  async count(collection, query = {}) {
    try {
      if (this.useFirebase) {
        let firestoreQuery = this.firestore.collection(collection);

        Object.entries(query).forEach(([key, value]) => {
          firestoreQuery = firestoreQuery.where(key, "==", value);
        });

        const snapshot = await firestoreQuery.get();
        return snapshot.size;
      }

      if (this.useMongoDB) {
        const Model = this.getMongoModel(collection);
        return await Model.countDocuments(query);
      }

      throw new Error("No database available");
    } catch (error) {
      logger.error(`Count operation failed for ${collection}:`, error);
      throw error;
    }
  }

  getMongoModel(collection) {
    const models = {
      questions: require("../models/Question"),
      subjects: require("../models/Subject"),
      chapters: require("../models/Chapter"),
    };

    return models[collection] || mongoose.model(collection);
  }

  // Health check
  async healthCheck() {
    const status = {
      firebase: false,
      mongodb: false,
      primary: null,
    };

    try {
      if (this.useFirebase && this.firestore) {
        await this.firestore
          .collection("_health")
          .doc("test")
          .set({ timestamp: new Date() });
        status.firebase = true;
        status.primary = "firebase";
      }
    } catch (error) {
      logger.warn("Firebase health check failed:", error.message);
    }

    try {
      if (this.useMongoDB && mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        status.mongodb = true;
        if (!status.primary) status.primary = "mongodb";
      }
    } catch (error) {
      logger.warn("MongoDB health check failed:", error.message);
    }

    return status;
  }
}

// Singleton instance
const hybridDataService = new HybridDataService();

module.exports = hybridDataService;
