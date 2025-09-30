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

      // Use the firestore wrapper functions for better compatibility
      const subjects = await getSubjects();

      // Load sample questions to get count
      const sampleQuestions = await getQuestions({
        subjects: [],
        chapters: [],
        difficulty: ["easy", "medium", "hard"],
        questionCount: 1000,
        onlyPYQs: false,
        includeImages: true,
      });

      // Calculate chapters from subjects
      let totalChapters = 0;
      for (const subject of subjects) {
        try {
          const chapters = await MockifyAPI.getChaptersBySubject(subject.id);
          totalChapters += chapters.length;
        } catch (err) {
          console.warn(
            `Could not load chapters for subject ${subject.id}:`,
            err
          );
        }
      }

      // Load user's recent tests if authenticated
      let userTests: Test[] = [];
      if (user) {
        try {
          userTests = await MockifyAPI.getUserTests(user.uid);
        } catch (error) {
          console.log("No user tests found yet:", error);
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
