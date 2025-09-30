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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              Create Test
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
              Generate customized tests in minutes with our intelligent test
              creation wizard
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <ProgressSteps
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          stepLoading={stepLoading}
        />

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          {/* Error Banner */}
          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          {/* Content Area */}
          <div className="p-6 lg:p-8">
            {isLoading ? (
              <LoadingState currentStep={currentStep} />
            ) : (
              <div className="transition-all duration-300 ease-in-out">
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
