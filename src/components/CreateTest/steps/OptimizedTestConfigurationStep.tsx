import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Settings,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Question } from "../../../types";
import { SimpleQuestionBrowser } from "../components/SimpleQuestionBrowser";
import { useOptimizedTestData } from "../hooks/useOptimizedTestData";
import type { CreateTestState } from "../types";

interface OptimizedTestConfigurationStepProps {
  state: CreateTestState;
  actions: {
    setSelectedSubjects: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedChapters: React.Dispatch<React.SetStateAction<string[]>>;
    setTestFilters: React.Dispatch<React.SetStateAction<any>>;
    setTestTitle: React.Dispatch<React.SetStateAction<string>>;
    setQuestions?: React.Dispatch<React.SetStateAction<Question[]>>;
    handleSubjectToggle: (subjectId: string) => void;
    handleChapterToggle: (chapterId: string) => void;
    handleFilterChange: (key: string, value: unknown) => void;
    loadQuestions: () => Promise<void>;
    generatePDF: () => Promise<void>;
    generateAnswerKey: () => Promise<void>;
  };
}

export const OptimizedTestConfigurationStep: React.FC<
  OptimizedTestConfigurationStepProps
> = ({ state, actions }) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [generationStrategy, setGenerationStrategy] = useState<
    "balanced" | "random" | "weighted"
  >("balanced");
  const [showQuestionBrowser, setShowQuestionBrowser] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const {
    loadQuestionsSample,
    loadQuestionsMetadata,
    loading: sampleLoading,
    error: sampleError,
  } = useOptimizedTestData();

  // Load metadata on mount
  useEffect(() => {
    const loadMeta = async () => {
      const meta = await loadQuestionsMetadata();
      setMetadata(meta);
    };
    loadMeta();
  }, [loadQuestionsMetadata]);

  // Generate test questions using optimized sampling
  const generateTestQuestions = useCallback(async () => {
    if (!state.selectedSubjects.length || !state.selectedChapters.length) {
      return;
    }

    try {
      const questions = await loadQuestionsSample(
        state.selectedSubjects,
        state.selectedChapters,
        state.testFilters.questionCount || 50,
        Array.isArray(state.testFilters.difficulty)
          ? state.testFilters.difficulty[0]
          : state.testFilters.difficulty,
        generationStrategy
      );

      setSelectedQuestions(questions);

      // Update the main state
      actions.setQuestions?.(questions);
    } catch (error) {
      console.error("Failed to generate test questions:", error);
    }
  }, [
    state.selectedSubjects,
    state.selectedChapters,
    state.testFilters,
    generationStrategy,
    loadQuestionsSample,
    actions,
  ]);

  // Auto-generate when configuration changes
  useEffect(() => {
    if (state.selectedSubjects.length && state.selectedChapters.length) {
      generateTestQuestions();
    }
  }, [
    state.selectedSubjects,
    state.selectedChapters,
    state.testFilters.questionCount,
    generationStrategy,
  ]);

  const handleQuestionCountChange = (count: number) => {
    actions.handleFilterChange("questionCount", count);
  };

  const handleDifficultyChange = (difficulty: string) => {
    actions.handleFilterChange("difficulty", difficulty);
  };

  const handleStrategyChange = (
    strategy: "balanced" | "random" | "weighted"
  ) => {
    setGenerationStrategy(strategy);
  };

  const handleCustomQuestionsSelect = (questions: Question[]) => {
    setSelectedQuestions(questions);
    actions.setQuestions?.(questions);
  };

  // Calculate distribution stats
  const questionStats = React.useMemo(() => {
    if (!selectedQuestions.length) return null;

    const subjects = selectedQuestions.reduce((acc, q) => {
      acc[q.subject_id] = (acc[q.subject_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficulties = selectedQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { subjects, difficulties };
  }, [selectedQuestions]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Settings className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Configure Your Test
        </h2>
        <p className="text-slate-600">
          Fine-tune your test parameters for optimal question selection
        </p>
      </div>

      {/* Error Display */}
      {sampleError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading questions</p>
            <p className="text-red-600 text-sm">{sampleError}</p>
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Test Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={state.testFilters.questionCount || 50}
                  onChange={(e) =>
                    handleQuestionCountChange(parseInt(e.target.value) || 50)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {metadata && (
                  <p className="text-xs text-slate-500 mt-1">
                    Available: {metadata.totalQuestions.toLocaleString()}{" "}
                    questions
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={
                    Array.isArray(state.testFilters.difficulty)
                      ? state.testFilters.difficulty[0] || ""
                      : state.testFilters.difficulty || ""
                  }
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Mixed Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  value={state.testTitle}
                  onChange={(e) => actions.setTestTitle(e.target.value)}
                  placeholder="Enter test title..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Question Selection Strategy
            </h3>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="strategy"
                  value="balanced"
                  checked={generationStrategy === "balanced"}
                  onChange={(e) => handleStrategyChange(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-slate-800">
                    Balanced Selection
                  </div>
                  <div className="text-sm text-slate-600">
                    Even distribution across subjects and difficulty levels
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="strategy"
                  value="weighted"
                  checked={generationStrategy === "weighted"}
                  onChange={(e) => handleStrategyChange(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-slate-800">
                    Weighted Selection
                  </div>
                  <div className="text-sm text-slate-600">
                    Prioritizes harder questions and popular topics
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="strategy"
                  value="random"
                  checked={generationStrategy === "random"}
                  onChange={(e) => handleStrategyChange(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-slate-800">
                    Random Selection
                  </div>
                  <div className="text-sm text-slate-600">
                    Completely random question selection
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Selection */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Custom Question Selection
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Want to manually select specific questions? Use our advanced
              question browser.
            </p>
            <button
              onClick={() => setShowQuestionBrowser(!showQuestionBrowser)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showQuestionBrowser ? "Hide" : "Browse"} Questions
            </button>
          </div>
        </div>

        {/* Right Column - Preview and Stats */}
        <div className="space-y-6">
          {/* Generation Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Question Generation Status
            </h3>

            {sampleLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-slate-600">Generating questions...</span>
              </div>
            ) : selectedQuestions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {selectedQuestions.length} questions generated successfully
                  </span>
                </div>

                <button
                  onClick={generateTestQuestions}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Regenerate Questions
                </button>
              </div>
            ) : (
              <p className="text-slate-500">
                Configure your test parameters to generate questions
              </p>
            )}
          </div>

          {/* Question Distribution */}
          {questionStats && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Question Distribution
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    By Subject
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(questionStats.subjects).map(
                      ([subject, count]) => (
                        <div
                          key={subject}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-slate-600">
                            {subject}
                          </span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    By Difficulty
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(questionStats.difficulties).map(
                      ([difficulty, count]) => (
                        <div
                          key={difficulty}
                          className="flex justify-between items-center"
                        >
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              difficulty === "easy"
                                ? "bg-green-100 text-green-800"
                                : difficulty === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {difficulty}
                          </span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Configuration Summary */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-800 mb-3">
              Configuration Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Subjects:</span>
                <span className="text-blue-800 font-medium">
                  {state.selectedSubjects.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Chapters:</span>
                <span className="text-blue-800 font-medium">
                  {state.selectedChapters.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Questions:</span>
                <span className="text-blue-800 font-medium">
                  {state.testFilters.questionCount || 50}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Strategy:</span>
                <span className="text-blue-800 font-medium capitalize">
                  {generationStrategy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Browser Modal */}
      {showQuestionBrowser && (
        <div className="mt-8">
          <SimpleQuestionBrowser
            onSelectQuestions={handleCustomQuestionsSelect}
            maxSelections={state.testFilters.questionCount || 50}
            showSelectionControls={true}
            initialFilters={{
              subject: state.selectedSubjects[0],
              chapter: state.selectedChapters[0],
            }}
          />
        </div>
      )}
    </div>
  );
};
