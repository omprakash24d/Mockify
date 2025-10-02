import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { getQuestions, getSubjects } from "../../../services/firestore";
import { MockifyAPI } from "../../../services/mockifyAPI";
import type { Test } from "../../../types/schema";
import type { DashboardStats } from "../types";
import { getDefaultRecentActivity } from "../utils/dashboardUtils";

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalChapters: 0,
    totalQuestions: 0,
    totalTests: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTests, setRecentTests] = useState<Test[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading dashboard data...");

      // Use the firestore wrapper functions for better compatibility
      console.log("Fetching subjects...");
      const subjects = await getSubjects();
      console.log(`Loaded ${subjects.length} subjects`);

      // Load sample questions to get count (reduced to avoid timeout)
      console.log("Fetching sample questions...");
      const sampleQuestions = await getQuestions({
        subjects: [],
        chapters: [],
        difficulty: ["easy", "medium", "hard"],
        questionCount: 100, // Reduced from 1000 to avoid firestore limits
        onlyPYQs: false,
        includeImages: true,
      });
      console.log(`Loaded ${sampleQuestions.length} sample questions`);

      // Calculate chapters from subjects (with better error handling)
      console.log("Calculating chapters...");
      let totalChapters = 0;
      for (const subject of subjects) {
        try {
          const chapters = await MockifyAPI.getChaptersBySubject(subject.id);
          totalChapters += chapters.length;
        } catch (err) {
          console.warn(
            `Could not load chapters for subject ${subject.name} (${subject.id}):`,
            err
          );
        }
      }
      console.log(`Total chapters: ${totalChapters}`);

      // Load user's recent tests if authenticated
      let userTests: Test[] = [];
      if (user) {
        try {
          console.log("Fetching user tests...");
          userTests = await MockifyAPI.getUserTests(user.uid);
          console.log(`Loaded ${userTests.length} user tests`);
        } catch (err) {
          console.log("No user tests found:", err);
          // No user tests found yet - using empty array
        }
      }

      const statsData = {
        totalSubjects: subjects.length,
        totalChapters,
        totalQuestions: sampleQuestions.length,
        totalTests: userTests.length,
        recentActivity: getDefaultRecentActivity({
          totalSubjects: subjects.length,
          totalChapters,
          totalQuestions: sampleQuestions.length,
        }),
      };

      console.log("Dashboard stats:", statsData);
      setStats(statsData);
      setRecentTests(userTests.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return {
    stats,
    loading,
    error,
    recentTests,
    loadDashboardData,
  };
};
