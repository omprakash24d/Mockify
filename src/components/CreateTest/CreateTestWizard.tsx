import React, { useEffect, useState } from "react";
import { ErrorBanner } from "./components/ErrorBanner";
import { LoadingState } from "./components/LoadingState";
import { Navigation } from "./components/Navigation";
import { ProgressSteps } from "./components/ProgressSteps";
import { usePDFGeneration } from "./hooks/usePDFGeneration";
import { useTestData } from "./hooks/useTestData";
import { useTestSelection } from "./hooks/useTestSelection";
import { ChapterSelectionStep } from "./steps/ChapterSelectionStep";
import { PreviewGenerateStep } from "./steps/PreviewGenerateStep";
import { SubjectSelectionStep } from "./steps/SubjectSelectionStep";
import { TestConfigurationStep } from "./steps/TestConfigurationStep";
import type { CreateTestState } from "./types";
import { WIZARD_STEPS } from "./utils/constants";
import { canProceedToNextStep } from "./utils/helpers";

export const CreateTestWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Custom hooks
  const {
    subjects,
    chapters,
    questions,
    loading,
    stepLoading,
    error,
    setError,
    setStepLoading,
    loadSubjects,
    loadAllChapters,
    loadQuestions: loadQuestionsData,
  } = useTestData();

  const {
    selectedSubjects,
    selectedChapters,
    testFilters,
    testTitle,
    setSelectedSubjects,
    setSelectedChapters,
    setTestFilters,
    setTestTitle,
    handleSubjectToggle,
    handleChapterToggle,
    handleFilterChange,
  } = useTestSelection(subjects);

  const {
    pdfLoading,
    generatePDF: generatePDFFile,
    generateAnswerKey: generateAnswerKeyFile,
  } = usePDFGeneration();

  // Combined loading state
  const isLoading = loading || pdfLoading;

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
  }, [subjects.length]); // Only depend on subjects.length to prevent infinite loops

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
      // Clear chapters when no subjects are selected
      setSelectedChapters([]);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [selectedSubjects]); // Only depend on selectedSubjects to prevent infinite loops

  const loadQuestions = async () => {
    await loadQuestionsData(testFilters, selectedChapters);
  };

  const generatePDF = async () => {
    await generatePDFFile(questions, chapters, selectedChapters, testTitle);
  };

  const generateAnswerKey = async () => {
    await generateAnswerKeyFile(
      questions,
      chapters,
      selectedChapters,
      testTitle
    );
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
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

  const canProceed = canProceedToNextStep(
    currentStep,
    selectedSubjects,
    selectedChapters,
    testFilters,
    questions.length
  );

  // Create state object for step components
  const state: CreateTestState = {
    currentStep,
    loading: isLoading,
    stepLoading,
    error,
    subjects,
    chapters,
    questions,
    selectedSubjects,
    selectedChapters,
    testFilters,
    testTitle,
  };

  // Create actions object for step components
  const actions = {
    setSelectedSubjects,
    setSelectedChapters,
    setTestFilters,
    setTestTitle,
    setCurrentStep,
    handleSubjectToggle,
    handleChapterToggle,
    handleFilterChange,
    loadQuestions,
    generatePDF,
    generateAnswerKey,
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SubjectSelectionStep state={state} actions={actions} />;
      case 2:
        return <ChapterSelectionStep state={state} actions={actions} />;
      case 3:
        return <TestConfigurationStep state={state} actions={actions} />;
      case 4:
        return <PreviewGenerateStep state={state} actions={actions} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 neet-prep-font">
      {/* NEET-style Header Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl shadow-lg mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold">Create Test</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Generate customized tests in minutes with our intelligent test
              creation wizard
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Progress Steps */}
        <ProgressSteps
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          stepLoading={stepLoading}
          onStepClick={setCurrentStep}
        />

        {/* Main Content Card */}
        <div className="card-neet overflow-hidden">
          {/* Error Banner */}
          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          {/* Content Area */}
          <div className="p-8 lg:p-12">
            {isLoading ? (
              <LoadingState currentStep={currentStep} />
            ) : (
              <div className="transition-all duration-500 ease-in-out">
                {renderStepContent()}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <Navigation
            currentStep={currentStep}
            totalSteps={WIZARD_STEPS.length}
            canProceed={canProceed}
            onNextStep={nextStep}
            onPrevStep={prevStep}
          />
        </div>
      </div>
    </div>
  );
};
