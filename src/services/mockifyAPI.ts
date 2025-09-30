import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  Analytics,
  Chapter,
  Question,
  Session,
  Subject,
  Test,
  TestFilters,
  TestResponse,
  UserAttempt,
} from "../types/schema";
import { getCollectionPath } from "../types/schema";

export class MockifyAPI {
  // Questions API
  static async getQuestions(
    filters: Partial<TestFilters> = {}
  ): Promise<Question[]> {
    try {
      const questionsRef = collection(db, getCollectionPath("questions"));
      let q = query(questionsRef, where("is_active", "==", true));

      // Apply filters
      if (filters.subjects && filters.subjects.length > 0) {
        q = query(q, where("subject_id", "in", filters.subjects));
      }

      if (filters.chapters && filters.chapters.length > 0) {
        q = query(q, where("chapter_id", "in", filters.chapters));
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        q = query(q, where("difficulty", "in", filters.difficulty));
      }

      if (filters.onlyPYQs) {
        q = query(q, where("source.year", ">", 0));
      }

      // Order and limit
      q = query(q, orderBy("q_num"), limit(filters.questionCount || 50));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Question)
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw new Error("Failed to fetch questions");
    }
  }

  static async addQuestion(question: Omit<Question, "id">): Promise<string> {
    try {
      const questionsRef = collection(db, getCollectionPath("questions"));
      const docRef = await addDoc(questionsRef, {
        ...question,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding question:", error);
      throw new Error("Failed to add question");
    }
  }

  static async updateQuestion(
    id: string,
    updates: Partial<Question>
  ): Promise<void> {
    try {
      const questionRef = doc(db, getCollectionPath("questions"), id);
      await updateDoc(questionRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating question:", error);
      throw new Error("Failed to update question");
    }
  }

  // Subjects API
  static async getSubjects(): Promise<Subject[]> {
    try {
      const subjectsRef = collection(db, getCollectionPath("subjects"));
      const q = query(subjectsRef, orderBy("order"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Subject)
      );
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new Error("Failed to fetch subjects");
    }
  }

  static async getSubject(id: string): Promise<Subject | null> {
    try {
      const subjectRef = doc(db, getCollectionPath("subjects"), id);
      const snapshot = await getDoc(subjectRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Subject;
      }
      return null;
    } catch (error) {
      console.error("Error fetching subject:", error);
      throw new Error("Failed to fetch subject");
    }
  }

  // Chapters API
  static async getChapters(): Promise<Chapter[]> {
    try {
      const chaptersRef = collection(db, getCollectionPath("chapters"));
      const snapshot = await getDocs(chaptersRef);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Chapter)
      );
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw new Error("Failed to fetch chapters");
    }
  }

  static async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    try {
      const chaptersRef = collection(db, getCollectionPath("chapters"));
      const q = query(chaptersRef, where("subject_id", "==", subjectId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Chapter)
      );
    } catch (error) {
      console.error("Error fetching chapters by subject:", error);
      throw new Error("Failed to fetch chapters");
    }
  }

  static async getChapter(id: string): Promise<Chapter | null> {
    try {
      const chapterRef = doc(db, getCollectionPath("chapters"), id);
      const snapshot = await getDoc(chapterRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Chapter;
      }
      return null;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      throw new Error("Failed to fetch chapter");
    }
  }

  // Tests API
  static async createTest(
    test: Omit<Test, "id" | "created_at">
  ): Promise<string> {
    try {
      const testsRef = collection(db, getCollectionPath("tests"));
      const docRef = await addDoc(testsRef, {
        ...test,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating test:", error);
      throw new Error("Failed to create test");
    }
  }

  static async getTest(id: string): Promise<Test | null> {
    try {
      const testRef = doc(db, getCollectionPath("tests"), id);
      const snapshot = await getDoc(testRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Test;
      }
      return null;
    } catch (error) {
      console.error("Error fetching test:", error);
      throw new Error("Failed to fetch test");
    }
  }

  static async getUserTests(userId: string): Promise<Test[]> {
    try {
      const testsRef = collection(db, getCollectionPath("tests"));
      const q = query(
        testsRef,
        where("user_id", "==", userId),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Test)
      );
    } catch (error) {
      console.error("Error fetching user tests:", error);
      throw new Error("Failed to fetch user tests");
    }
  }

  // Test Responses API
  static async submitTestResponse(
    response: Omit<TestResponse, "id" | "created_at">
  ): Promise<string> {
    try {
      const responsesRef = collection(db, "test_responses");
      const docRef = await addDoc(responsesRef, {
        ...response,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error submitting test response:", error);
      throw new Error("Failed to submit test response");
    }
  }

  // User Attempts API
  static async recordAttempt(
    userId: string,
    attempt: UserAttempt
  ): Promise<void> {
    try {
      const attemptRef = doc(
        db,
        "users",
        userId,
        "attempts",
        attempt.question_id
      );
      const existingAttempt = await getDoc(attemptRef);

      if (existingAttempt.exists()) {
        const existing = existingAttempt.data() as UserAttempt;
        await updateDoc(attemptRef, {
          ...attempt,
          attempt_count: existing.attempt_count + 1,
          last_attempted_at: new Date().toISOString(),
        });
      } else {
        await updateDoc(attemptRef, {
          ...attempt,
          attempt_count: 1,
          last_attempted_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error recording attempt:", error);
      throw new Error("Failed to record attempt");
    }
  }

  // Sessions API
  static async createSession(
    userId: string,
    session: Omit<Session, "id">
  ): Promise<string> {
    try {
      const sessionsRef = collection(db, "users", userId, "sessions");
      const docRef = await addDoc(sessionsRef, session);
      return docRef.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }
  }

  static async updateSession(
    userId: string,
    sessionId: string,
    updates: Partial<Session>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, "users", userId, "sessions", sessionId);
      await updateDoc(sessionRef, updates);
    } catch (error) {
      console.error("Error updating session:", error);
      throw new Error("Failed to update session");
    }
  }

  static async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessionsRef = collection(db, "users", userId, "sessions");
      const q = query(sessionsRef, orderBy("started_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Session)
      );
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw new Error("Failed to fetch user sessions");
    }
  }

  // Analytics API
  static async createAnalytics(
    userId: string,
    analytics: Omit<Analytics, "id">
  ): Promise<string> {
    try {
      const analyticsRef = collection(db, "users", userId, "analytics");
      const docRef = await addDoc(analyticsRef, analytics);
      return docRef.id;
    } catch (error) {
      console.error("Error creating analytics:", error);
      throw new Error("Failed to create analytics");
    }
  }

  static async getUserAnalytics(userId: string): Promise<Analytics[]> {
    try {
      const analyticsRef = collection(db, "users", userId, "analytics");
      const q = query(analyticsRef, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Analytics)
      );
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw new Error("Failed to fetch user analytics");
    }
  }

  // Validation helpers
  static async validateSubjectExists(subjectId: string): Promise<boolean> {
    try {
      const subject = await this.getSubject(subjectId);
      return subject !== null;
    } catch {
      return false;
    }
  }

  static async validateChapterExists(chapterId: string): Promise<boolean> {
    try {
      const chapter = await this.getChapter(chapterId);
      return chapter !== null;
    } catch {
      return false;
    }
  }

  static async validateChapterBelongsToSubject(
    chapterId: string,
    subjectId: string
  ): Promise<boolean> {
    try {
      const chapter = await this.getChapter(chapterId);
      return chapter?.subject_id === subjectId;
    } catch {
      return false;
    }
  }
}
