import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";
import {
  getChaptersBySubject,
  getQuestions,
  getSubjects,
} from "../services/firestore";
import { PDFGenerator } from "../services/pdfGenerator";
import type { Chapter, Question, Subject, TestFilters } from "../types";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: "Select Subjects",
    description: "Choose subjects for your test",
    icon: BookOpen,
    color: "blue",
  },
  {
    id: 2,
    title: "Select Chapters",
    description: "Pick specific chapters to include",
    icon: GraduationCap,
    color: "indigo",
  },
  {
    id: 3,
    title: "Configure Test",
    description: "Set difficulty, questions, and options",
    icon: Settings,
    color: "purple",
  },
  {
    id: 4,
    title: "Preview & Generate",
    description: "Review and download your test",
    icon: Eye,
    color: "green",
  },
];

export const CreateTestWizard: React.FC = () => {
  const { classes } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Selection states - Updated for multi-selection
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const [testFilters, setTestFilters] = useState<TestFilters>({
    subjects: [],
    chapters: [],
    difficulty: ["easy", "medium", "hard"],
    questionCount: 30,
    includeImages: true,
    onlyPYQs: false,
  });

  const [testTitle, setTestTitle] = useState("");

  // Load subjects on component mount with better error handling
  useEffect(() => {
    const initializeData = async () => {
      setStepLoading((prev) => ({ ...prev, 1: true }));
      try {
        await loadSubjects();
      } catch (err) {
        setError("Failed to load subjects. Please refresh the page.");
        console.error("Failed to initialize data:", err);
      } finally {
        setStepLoading((prev) => ({ ...prev, 1: false }));
      }
    };

    // Only load if subjects are not already loaded
    if (subjects.length === 0) {
      initializeData();
    }
  }, [subjects.length]);

  // Load chapters when subjects are selected with debouncing
  useEffect(() => {
    let timeoutId: number;

    if (selectedSubjects.length > 0) {
      setStepLoading((prev) => ({ ...prev, 2: true }));
      timeoutId = window.setTimeout(async () => {
        try {
          await loadAllChapters(selectedSubjects);
        } catch (err) {
          console.error("Error loading chapters:", err);
        } finally {
          setStepLoading((prev) => ({ ...prev, 2: false }));
        }
      }, 300); // Debounce for 300ms
    } else {
      setChapters([]);
      setSelectedChapters([]);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [selectedSubjects]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      console.log("✅ Loaded subjects:", subjectsData.length);
    } catch (error) {
      console.error("❌ Error loading subjects:", error);
      throw error;
    }
  };

  const loadAllChapters = async (subjectIds: string[]) => {
    try {
      const allChaptersData: Chapter[] = [];

      // Load chapters in parallel for better performance
      const chapterPromises = subjectIds.map((subjectId) =>
        getChaptersBySubject(subjectId).catch((err) => {
          console.warn(
            `Failed to load chapters for subject ${subjectId}:`,
            err
          );
          return [];
        })
      );

      const chapterResults = await Promise.all(chapterPromises);
      chapterResults.forEach((chapters) => allChaptersData.push(...chapters));

      setChapters(allChaptersData);
      console.log("✅ Loaded chapters:", allChaptersData.length);
    } catch (error) {
      console.error("❌ Error loading chapters:", error);
      throw error;
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const filters: TestFilters = {
        ...testFilters,
        chapters: selectedChapters,
      };
      const questionsData = await getQuestions(filters);
      setQuestions(questionsData);
      console.log("✅ Loaded questions:", questionsData.length);
    } catch (error) {
      console.error("❌ Error loading questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId];

      // Reset chapters when subjects change
      setSelectedChapters([]);

      // Update test title based on selected subjects
      const selectedSubjectNames = subjects
        .filter((s) => newSelection.includes(s.id))
        .map((s) => s.name);

      if (selectedSubjectNames.length === 1) {
        setTestTitle(`${selectedSubjectNames[0]} Test`);
      } else if (selectedSubjectNames.length > 1) {
        setTestTitle(`Multi-Subject Test`);
      } else {
        setTestTitle("");
      }

      return newSelection;
    });
  };

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleFilterChange = (key: keyof TestFilters, value: any) => {
    setTestFilters((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 3) {
        // Load questions when entering preview step
        loadQuestions();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePDF = async () => {
    if (questions.length === 0) return;

    try {
      setLoading(true);
      const pdfGenerator = new PDFGenerator();

      const selectedChapterObjects = chapters.filter((c) =>
        selectedChapters.includes(c.id)
      );

      pdfGenerator.downloadPDF(questions, {
        title: testTitle || "Mockify Test",
        chapter: selectedChapterObjects[0], // Use first chapter if multiple
        includeAnswers: false,
        includeSolutions: false,
        watermark: "MOCKIFY",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnswerKey = async () => {
    if (questions.length === 0) return;

    try {
      setLoading(true);
      const pdfGenerator = new PDFGenerator();

      const selectedChapterObjects = chapters.filter((c) =>
        selectedChapters.includes(c.id)
      );

      pdfGenerator.downloadPDF(
        questions,
        {
          title: `${testTitle || "Mockify Test"} - Answer Key`,
          chapter: selectedChapterObjects[0],
          includeAnswers: true,
          includeSolutions: true,
          watermark: "MOCKIFY - ANSWER KEY",
        },
        `${testTitle}_answer_key.pdf`
      );
    } catch (error) {
      console.error("Error generating answer key:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedSubjects.length > 0;
      case 2:
        return selectedChapters.length > 0;
      case 3:
        return testFilters.questionCount > 0;
      case 4:
        return questions.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold ${classes.text.primary} mb-2`}>
                Choose Your Subjects
              </h2>
              <p
                className={`${classes.text.secondary} text-lg max-w-2xl mx-auto`}
              >
                Select one or more subjects to include in your test. You can
                always adjust your selection later.
              </p>
            </div>

            {/* Loading State */}
            {stepLoading[1] && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className={`text-lg font-semibold ${classes.text.primary}`}>
                  Loading Subjects...
                </h3>
                <p className={`${classes.text.secondary} text-center`}>
                  Fetching the latest curriculum data
                </p>
              </div>
            )}

            {/* Empty State */}
            {!stepLoading[1] && subjects.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3
                  className={`text-xl font-semibold ${classes.text.primary} mb-2`}
                >
                  No Subjects Available
                </h3>
                <p className={`${classes.text.secondary} mb-6`}>
                  We couldn't find any subjects in the database. Please contact
                  support or try again later.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className={`${classes.button.primary} px-6 py-3 rounded-lg font-medium`}
                >
                  Reload Page
                </button>
              </div>
            )}

            {/* Subjects Grid */}
            {!stepLoading[1] && subjects.length > 0 && (
              <>
                {/* Stats & Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${classes.bg.secondary} px-4 py-2 rounded-lg border ${classes.border.default}`}
                    >
                      <span
                        className={`text-sm font-medium ${classes.text.primary}`}
                      >
                        {subjects.length} Available Subjects
                      </span>
                    </div>
                    {selectedSubjects.length > 0 && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {selectedSubjects.length} Selected
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSubjects(subjects.map((s) => s.id))
                      }
                      className="px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubjects([])}
                      disabled={selectedSubjects.length === 0}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    return (
                      <label
                        key={subject.id}
                        className={cn(
                          "group relative p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105",
                          "border-2 hover:shadow-lg",
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : `border-gray-200 dark:border-gray-700 ${classes.bg.elevated} hover:border-blue-300 dark:hover:border-blue-600`
                        )}
                      >
                        {/* Selection Indicator */}
                        <div className="absolute top-4 right-4">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                            )}
                          >
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubjectToggle(subject.id)}
                          className="sr-only"
                        />

                        <div className="space-y-3">
                          {/* Subject Icon */}
                          <div
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                            )}
                          >
                            <GraduationCap className="w-6 h-6" />
                          </div>

                          {/* Subject Info */}
                          <div>
                            <h3
                              className={`font-semibold text-lg ${
                                isSelected
                                  ? "text-blue-900 dark:text-blue-100"
                                  : classes.text.primary
                              }`}
                            >
                              {subject.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                <span
                                  className={`text-sm ${classes.text.secondary}`}
                                >
                                  {subject.chapters?.length || 0} chapters
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BarChart3 className="w-4 h-4 text-gray-400" />
                                <span
                                  className={`text-sm ${classes.text.secondary}`}
                                >
                                  ~{(subject.chapters?.length || 0) * 15}{" "}
                                  questions
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selection Overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none transition-opacity duration-200" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Selection Summary */}
                {selectedSubjects.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Selected Subjects Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjects.find(
                          (s) => s.id === subjectId
                        );
                        if (!subject) return null;
                        return (
                          <div
                            key={subject.id}
                            className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {subject.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {subject.chapters?.length || 0} chapters
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold ${classes.text.primary} mb-2`}>
                Select Chapters
              </h2>
              <p
                className={`${classes.text.secondary} text-lg max-w-2xl mx-auto`}
              >
                Choose specific chapters from your selected subjects to focus
                your test content.
              </p>
            </div>

            {/* Selected Subjects Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                  Selected Subjects
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((id) => {
                  const subject = subjects.find((s) => s.id === id);
                  return (
                    <span
                      key={id}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-700"
                    >
                      {subject?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Loading State */}
            {stepLoading[2] && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h3 className={`text-lg font-semibold ${classes.text.primary}`}>
                  Loading Chapters...
                </h3>
                <p className={`${classes.text.secondary} text-center`}>
                  Fetching chapters for your selected subjects
                </p>
              </div>
            )}

            {/* Empty State */}
            {!stepLoading[2] &&
              chapters.length === 0 &&
              selectedSubjects.length > 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3
                    className={`text-xl font-semibold ${classes.text.primary} mb-2`}
                  >
                    No Chapters Found
                  </h3>
                  <p className={`${classes.text.secondary} mb-6`}>
                    We couldn't find any chapters for your selected subjects.
                    Please try selecting different subjects.
                  </p>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`${classes.button.secondary} px-6 py-3 rounded-lg font-medium`}
                  >
                    Go Back to Subjects
                  </button>
                </div>
              )}

            {/* Chapters Content */}
            {!stepLoading[2] && chapters.length > 0 && (
              <>
                {/* Stats & Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${classes.bg.secondary} px-4 py-2 rounded-lg border ${classes.border.default}`}
                    >
                      <span
                        className={`text-sm font-medium ${classes.text.primary}`}
                      >
                        {chapters.length} Available Chapters
                      </span>
                    </div>
                    {selectedChapters.length > 0 && (
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {selectedChapters.length} Selected
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedChapters(chapters.map((c) => c.id))
                      }
                      className="px-4 py-2 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChapters([])}
                      disabled={selectedChapters.length === 0}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Chapters by Subject */}
                <div className="space-y-6">
                  {selectedSubjects.map((subjectId) => {
                    const subject = subjects.find((s) => s.id === subjectId);
                    const subjectChapters = chapters.filter(
                      (c) => c.subject_id === subjectId
                    );

                    if (subjectChapters.length === 0) return null;

                    const selectedInSubject = subjectChapters.filter((c) =>
                      selectedChapters.includes(c.id)
                    ).length;

                    return (
                      <div
                        key={subjectId}
                        className={`${classes.bg.elevated} border ${classes.border.default} rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
                      >
                        {/* Subject Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h4
                                className={`text-lg font-semibold ${classes.text.primary}`}
                              >
                                {subject?.name}
                              </h4>
                              <p
                                className={`text-sm ${classes.text.secondary}`}
                              >
                                {subjectChapters.length} chapters •{" "}
                                {selectedInSubject} selected
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const subjectChapterIds = subjectChapters.map(
                                (c) => c.id
                              );
                              const allSelected = subjectChapterIds.every(
                                (id) => selectedChapters.includes(id)
                              );

                              if (allSelected) {
                                setSelectedChapters((prev) =>
                                  prev.filter(
                                    (id) => !subjectChapterIds.includes(id)
                                  )
                                );
                              } else {
                                setSelectedChapters((prev) => [
                                  ...new Set([...prev, ...subjectChapterIds]),
                                ]);
                              }
                            }}
                            className={cn(
                              "px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                              subjectChapters.every((c) =>
                                selectedChapters.includes(c.id)
                              )
                                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                            )}
                          >
                            {subjectChapters.every((c) =>
                              selectedChapters.includes(c.id)
                            )
                              ? "Unselect All"
                              : "Select All"}
                          </button>
                        </div>

                        {/* Chapters Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subjectChapters.map((chapter) => {
                            const isSelected = selectedChapters.includes(
                              chapter.id
                            );
                            return (
                              <label
                                key={chapter.id}
                                className={cn(
                                  "group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                                  isSelected
                                    ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
                                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                )}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all duration-200",
                                      isSelected
                                        ? "border-indigo-500 bg-indigo-500"
                                        : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                                    )}
                                  >
                                    {isSelected && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5
                                      className={`font-medium text-sm ${
                                        isSelected
                                          ? "text-indigo-900 dark:text-indigo-100"
                                          : classes.text.primary
                                      } mb-1`}
                                    >
                                      {chapter.chapter_name}
                                    </h5>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                                      <div className="flex items-center space-x-1">
                                        <Users className="w-3 h-3" />
                                        <span>
                                          {chapter.topics?.length || 0} topics
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <BarChart3 className="w-3 h-3" />
                                        <span>
                                          ~
                                          {Math.max(
                                            1,
                                            (chapter.topics?.length || 0) * 3
                                          )}{" "}
                                          questions
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleChapterToggle(chapter.id)
                                  }
                                  className="sr-only"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selection Summary */}
                {selectedChapters.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Chapter Selection Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Total Chapters
                          </div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {selectedChapters.length}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Total Topics
                          </div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {chapters
                              .filter((c) => selectedChapters.includes(c.id))
                              .reduce(
                                (sum, c) => sum + (c.topics?.length || 0),
                                0
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Est. Questions
                          </div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ~
                            {chapters
                              .filter((c) => selectedChapters.includes(c.id))
                              .reduce(
                                (sum, c) =>
                                  sum +
                                  Math.max(1, (c.topics?.length || 0) * 3),
                                0
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold ${classes.text.primary} mb-2`}>
                Configure Your Test
              </h2>
              <p
                className={`${classes.text.secondary} text-lg max-w-2xl mx-auto`}
              >
                Customize your test parameters to match your requirements and
                student levels.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Settings */}
              <div className="space-y-6">
                {/* Test Title */}
                <div
                  className={`${classes.bg.elevated} p-6 rounded-xl border ${classes.border.default}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${classes.text.primary}`}
                      >
                        Test Information
                      </h3>
                      <p className={`text-sm ${classes.text.secondary}`}>
                        Basic test details
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${classes.text.primary} mb-3`}
                    >
                      Test Title *
                    </label>
                    <input
                      type="text"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${classes.border.default} ${classes.bg.elevated} ${classes.text.primary} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter a descriptive test title"
                    />
                    <p className={`text-xs ${classes.text.secondary} mt-2`}>
                      This will appear on the test paper and PDF
                    </p>
                  </div>
                </div>

                {/* Question Count */}
                <div
                  className={`${classes.bg.elevated} p-6 rounded-xl border ${classes.border.default}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${classes.text.primary}`}
                      >
                        Question Count
                      </h3>
                      <p className={`text-sm ${classes.text.secondary}`}>
                        How many questions to include
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label
                        className={`text-sm font-medium ${classes.text.primary}`}
                      >
                        Number of Questions
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {testFilters.questionCount}
                        </span>
                        <span className={`text-sm ${classes.text.secondary}`}>
                          questions
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={testFilters.questionCount}
                      onChange={(e) =>
                        handleFilterChange(
                          "questionCount",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          (testFilters.questionCount - 10) / 0.9
                        }%, #e5e7eb ${
                          (testFilters.questionCount - 10) / 0.9
                        }%, #e5e7eb 100%)`,
                      }}
                    />

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>10</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[20, 30, 50, 75].map((count) => (
                        <button
                          key={count}
                          onClick={() =>
                            handleFilterChange("questionCount", count)
                          }
                          className={cn(
                            "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                            testFilters.questionCount === count
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          )}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Difficulty Levels */}
                <div
                  className={`${classes.bg.elevated} p-6 rounded-xl border ${classes.border.default}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${classes.text.primary}`}
                      >
                        Difficulty Levels
                      </h3>
                      <p className={`text-sm ${classes.text.secondary}`}>
                        Select question difficulty mix
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        value: "easy",
                        label: "Easy",
                        color: "green",
                        icon: "🟢",
                        description: "Basic concepts & fundamentals",
                      },
                      {
                        value: "medium",
                        label: "Medium",
                        color: "yellow",
                        icon: "🟡",
                        description: "Application-based problems",
                      },
                      {
                        value: "hard",
                        label: "Hard",
                        color: "red",
                        icon: "🔴",
                        description: "Advanced & analytical questions",
                      },
                    ].map(({ value, label, color, icon, description }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                          testFilters.difficulty.includes(value as any)
                            ? `border-${color}-300 dark:border-${color}-600 bg-${color}-50 dark:bg-${color}-900/20`
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={testFilters.difficulty.includes(
                              value as any
                            )}
                            onChange={(e) => {
                              const difficulties = e.target.checked
                                ? [...testFilters.difficulty, value as any]
                                : testFilters.difficulty.filter(
                                    (d) => d !== value
                                  );
                              handleFilterChange("difficulty", difficulties);
                            }}
                            className={`w-5 h-5 text-${color}-600 rounded focus:ring-${color}-500 transition-colors`}
                          />
                          <span className="text-lg">{icon}</span>
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold ${classes.text.primary}`}
                          >
                            {label}
                          </div>
                          <div className={`text-sm ${classes.text.secondary}`}>
                            {description}
                          </div>
                        </div>
                        {testFilters.difficulty.includes(value as any) && (
                          <CheckCircle
                            className={`w-5 h-5 text-${color}-600`}
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  {testFilters.difficulty.length === 0 && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Please select at least one difficulty level
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Advanced Options */}
              <div className="space-y-6">
                {/* Additional Options */}
                <div
                  className={`${classes.bg.elevated} p-6 rounded-xl border ${classes.border.default}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${classes.text.primary}`}
                      >
                        Additional Options
                      </h3>
                      <p className={`text-sm ${classes.text.secondary}`}>
                        Customize test content
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                        testFilters.includeImages
                          ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={testFilters.includeImages}
                        onChange={(e) =>
                          handleFilterChange("includeImages", e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${classes.text.primary}`}>
                          Include Image Questions
                        </div>
                        <div className={`text-sm ${classes.text.secondary}`}>
                          Add questions that contain diagrams and images
                        </div>
                      </div>
                      {testFilters.includeImages && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </label>

                    <label
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                        testFilters.onlyPYQs
                          ? "border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={testFilters.onlyPYQs}
                        onChange={(e) =>
                          handleFilterChange("onlyPYQs", e.target.checked)
                        }
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${classes.text.primary}`}>
                          Previous Year Questions Only
                        </div>
                        <div className={`text-sm ${classes.text.secondary}`}>
                          Include only questions from previous year exams
                        </div>
                      </div>
                      {testFilters.onlyPYQs && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </label>
                  </div>
                </div>

                {/* Test Preview */}
                <div
                  className={`${classes.bg.elevated} p-6 rounded-xl border ${classes.border.default}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${classes.text.primary}`}
                      >
                        Test Preview
                      </h3>
                      <p className={`text-sm ${classes.text.secondary}`}>
                        Quick overview of your test
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 ${classes.bg.secondary} rounded-lg`}>
                        <div className={`text-sm ${classes.text.secondary}`}>
                          Title
                        </div>
                        <div
                          className={`font-medium ${classes.text.primary} truncate`}
                        >
                          {testTitle || "Untitled Test"}
                        </div>
                      </div>
                      <div className={`p-3 ${classes.bg.secondary} rounded-lg`}>
                        <div className={`text-sm ${classes.text.secondary}`}>
                          Questions
                        </div>
                        <div
                          className={`text-lg font-bold text-blue-600 dark:text-blue-400`}
                        >
                          {testFilters.questionCount}
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 ${classes.bg.secondary} rounded-lg`}>
                      <div className={`text-sm ${classes.text.secondary} mb-2`}>
                        Subjects & Chapters
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubjects.map((id) => {
                          const subject = subjects.find((s) => s.id === id);
                          const subjectChapters = chapters.filter(
                            (c) =>
                              c.subject_id === id &&
                              selectedChapters.includes(c.id)
                          ).length;
                          return (
                            <span
                              key={id}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
                            >
                              {subject?.name} ({subjectChapters})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`p-3 ${classes.bg.secondary} rounded-lg`}>
                      <div className={`text-sm ${classes.text.secondary} mb-2`}>
                        Difficulty Mix
                      </div>
                      <div className="flex space-x-2">
                        {testFilters.difficulty.map((diff) => (
                          <span
                            key={diff}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              diff === "easy" &&
                                "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                              diff === "medium" &&
                                "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
                              diff === "hard" &&
                                "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                            )}
                          >
                            {diff}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Eye className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold ${classes.text.primary} mb-2`}>
                Preview & Generate Test
              </h2>
              <p
                className={`${classes.text.secondary} text-lg max-w-2xl mx-auto`}
              >
                Review your test configuration and generate PDF files when
                ready.
              </p>
            </div>

            {/* Load Questions CTA */}
            {questions.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3
                  className={`text-xl font-semibold ${classes.text.primary} mb-2`}
                >
                  Ready to Generate Questions
                </h3>
                <p
                  className={`${classes.text.secondary} mb-6 max-w-md mx-auto`}
                >
                  Click the button below to generate questions based on your
                  selected criteria. This may take a few moments.
                </p>
                <button
                  onClick={loadQuestions}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5 mr-2 inline" />
                  Generate Questions
                </button>
              </div>
            )}

            {/* Test Summary - Always show */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                    Test Configuration Summary
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your test is configured with the following parameters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Title
                    </span>
                  </div>
                  <div
                    className={`font-semibold ${classes.text.primary} truncate`}
                  >
                    {testTitle || "Untitled Test"}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Subjects
                    </span>
                  </div>
                  <div className={`font-semibold ${classes.text.primary}`}>
                    {selectedSubjects.length}
                  </div>
                  <div className={`text-xs ${classes.text.secondary} truncate`}>
                    {selectedSubjects
                      .map((id) => subjects.find((s) => s.id === id)?.name)
                      .join(", ")}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Chapters
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold text-purple-600 dark:text-purple-400`}
                  >
                    {selectedChapters.length}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Target Questions
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold text-orange-600 dark:text-orange-400`}
                  >
                    {testFilters.questionCount}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Settings className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Difficulty
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {testFilters.difficulty.map((diff) => (
                      <span
                        key={diff}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          diff === "easy" &&
                            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                          diff === "medium" &&
                            "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
                          diff === "hard" &&
                            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}
                      >
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span
                      className={`text-sm font-medium ${classes.text.secondary}`}
                    >
                      Generated Questions
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      questions.length > 0
                        ? "text-green-600 dark:text-green-400"
                        : classes.text.secondary
                    }`}
                  >
                    {questions.length > 0 ? questions.length : "Not loaded"}
                  </div>
                  {questions.length > 0 && (
                    <div className={`text-xs ${classes.text.secondary}`}>
                      Total Marks:{" "}
                      {questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Options Summary */}
              <div className="mt-6 flex flex-wrap gap-3">
                {testFilters.includeImages && (
                  <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Image Questions Included
                    </span>
                  </div>
                )}
                {testFilters.onlyPYQs && (
                  <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      Previous Year Questions Only
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Questions Preview */}
            {questions.length > 0 && (
              <div
                className={`${classes.bg.elevated} border ${classes.border.default} rounded-2xl overflow-hidden`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${classes.text.primary}`}
                        >
                          Questions Preview
                        </h3>
                        <p className={`text-sm ${classes.text.secondary}`}>
                          Showing {Math.min(5, questions.length)} of{" "}
                          {questions.length} questions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold text-green-600 dark:text-green-400`}
                      >
                        {questions.length}
                      </div>
                      <div className={`text-xs ${classes.text.secondary}`}>
                        Total Questions
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {questions.slice(0, 5).map((question, index) => (
                      <div
                        key={question.id}
                        className={`p-4 ${classes.bg.secondary} rounded-lg border ${classes.border.default}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`font-medium ${classes.text.primary}`}
                          >
                            Q{index + 1}.
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                question.difficulty === "easy"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : question.difficulty === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              )}
                            >
                              {question.difficulty}
                            </span>
                            <span
                              className={`text-xs ${classes.text.secondary} px-2 py-1 rounded-full ${classes.bg.elevated}`}
                            >
                              {question.marks || 1} marks
                            </span>
                          </div>
                        </div>
                        <div
                          className={`text-sm ${classes.text.primary} mb-3 leading-relaxed`}
                        >
                          {question.question_text.length > 200
                            ? `${question.question_text.substring(0, 200)}...`
                            : question.question_text}
                        </div>
                        <div
                          className={`text-xs ${classes.text.secondary} flex items-center space-x-2`}
                        >
                          <GraduationCap className="w-3 h-3" />
                          <span>
                            {chapters.find((c) => c.id === question.chapter_id)
                              ?.chapter_name || "Unknown Chapter"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {questions.length > 5 && (
                      <div
                        className={`text-center py-4 ${classes.bg.secondary} rounded-lg border ${classes.border.default}`}
                      >
                        <div
                          className={`text-sm ${classes.text.secondary} font-medium`}
                        >
                          ... and {questions.length - 5} more questions
                        </div>
                        <div
                          className={`text-xs ${classes.text.secondary} mt-1`}
                        >
                          Total marks:{" "}
                          {questions.reduce(
                            (sum, q) => sum + (q.marks || 1),
                            0
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {questions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={generatePDF}
                  disabled={loading}
                  className={cn(
                    "group relative overflow-hidden flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
                    loading
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                  <Download className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">
                    {loading ? "Generating PDF..." : "Download Test Paper"}
                  </span>
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                  )}
                </button>

                <button
                  onClick={generateAnswerKey}
                  disabled={loading}
                  className={cn(
                    "group relative overflow-hidden flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2",
                    loading
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
                  )}
                >
                  <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                  <FileText className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">
                    {loading ? "Generating Key..." : "Download Answer Key"}
                  </span>
                  {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin relative z-10"></div>
                  )}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${classes.bg.secondary} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1
              className={`text-3xl lg:text-4xl font-bold ${classes.text.primary} mb-2`}
            >
              Create Test
            </h1>
            <p
              className={`text-lg ${classes.text.secondary} max-w-2xl mx-auto`}
            >
              Generate customized tests in minutes with our intelligent test
              creation wizard
            </p>
          </div>
        </div>

        {/* Modern Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {wizardSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-300 relative",
                        isCompleted && "bg-green-500 text-white shadow-lg",
                        isCurrent &&
                          `bg-${step.color}-500 text-white shadow-lg scale-110`,
                        isUpcoming &&
                          `${classes.bg.elevated} ${classes.border.default} border-2 ${classes.text.secondary}`
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7" />
                      ) : (
                        <StepIcon className="w-6 h-6 lg:w-7 lg:h-7" />
                      )}

                      {/* Loading spinner for current step */}
                      {isCurrent && stepLoading[step.id] && (
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="mt-3 text-center max-w-28">
                      <div
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isCompleted || isCurrent
                            ? classes.text.primary
                            : classes.text.secondary
                        )}
                      >
                        {step.title}
                      </div>
                      <div
                        className={`text-xs ${classes.text.secondary} mt-1 hidden sm:block`}
                      >
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < wizardSteps.length - 1 && (
                    <div className="flex-1 mx-4 hidden sm:block">
                      <div
                        className={cn(
                          "h-0.5 transition-all duration-300",
                          currentStep > step.id
                            ? "bg-green-500"
                            : currentStep === step.id
                            ? `bg-${step.color}-200`
                            : classes.border.default
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <div
          className={`${classes.bg.elevated} rounded-2xl shadow-xl border ${classes.border.default} overflow-hidden`}
        >
          {/* Error Banner */}
          {error && (
            <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-6 py-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">
                    Something went wrong
                  </h4>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-6 lg:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <h3
                  className={`mt-6 text-lg font-semibold ${classes.text.primary}`}
                >
                  {currentStep === 4
                    ? "Generating your test..."
                    : "Loading data..."}
                </h3>
                <p
                  className={`mt-2 ${classes.text.secondary} text-center max-w-md`}
                >
                  {currentStep === 4
                    ? "We're creating your personalized test based on your selections. This may take a moment."
                    : "Please wait while we load the latest content from our database."}
                </p>
              </div>
            ) : (
              <div className="transition-all duration-300 ease-in-out">
                {renderStepContent()}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div
            className={`px-6 lg:px-8 py-4 ${classes.bg.secondary} border-t ${classes.border.default}`}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                  currentStep === 1
                    ? `${classes.bg.secondary} ${classes.text.secondary} cursor-not-allowed opacity-50`
                    : `${classes.button.secondary} hover:scale-105 shadow-md hover:shadow-lg`
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {/* Step Indicator */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium ${classes.text.secondary}`}
                >
                  Step {currentStep} of {wizardSteps.length}
                </span>
                <div className="flex space-x-1">
                  {wizardSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        index + 1 <= currentStep
                          ? "bg-blue-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={nextStep}
                disabled={!canProceed() || currentStep === wizardSteps.length}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                  !canProceed() || currentStep === wizardSteps.length
                    ? `${classes.bg.secondary} ${classes.text.secondary} cursor-not-allowed opacity-50`
                    : `${classes.button.primary} hover:scale-105 shadow-md hover:shadow-lg`
                )}
              >
                <span>
                  {currentStep === wizardSteps.length
                    ? "Complete"
                    : "Next Step"}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
