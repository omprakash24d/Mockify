import React from "react";

export interface DashboardStats {
  totalSubjects: number;
  totalChapters: number;
  totalQuestions: number;
  totalTests: number;
  recentActivity: string[];
}

export interface QuickAction {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  primary?: boolean;
  bgColor?: string;
  hoverColor?: string;
}

export interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface StudyTip {
  id: number;
  text: string;
}
