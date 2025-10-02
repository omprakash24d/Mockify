import { Eye, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface Question {
  _id?: string;
  questionText: string;
  subjectName: string;
  chapterName: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subtopics?: string[];
  yearAppeared?: number;
  questionImages?: string[];
  tags?: string[];
}

interface ModernQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  subjects: string[];
  chapters: string[];
  onSubmit: (data: Partial<Question>) => Promise<void>;
  onSubjectChange: (subject: string) => void;
}

export const ModernQuestionModal: React.FC<ModernQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  subjects,
  chapters,
  onSubmit,
  onSubjectChange,
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    questionText: "",
    subjectName: "",
    chapterName: "",
    difficulty: "Medium",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    subtopics: [],
    yearAppeared: new Date().getFullYear(),
    questionImages: [],
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      if (question) {
        setFormData({
          ...question,
          subtopics: question.subtopics || [],
          questionImages: question.questionImages || [],
          tags: question.tags || [],
        });
      } else {
        setFormData({
          questionText: "",
          subjectName: "",
          chapterName: "",
          difficulty: "Medium",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
          subtopics: [],
          yearAppeared: new Date().getFullYear(),
          questionImages: [],
          tags: [],
        });
      }
      setCurrentStep(1);
      setShowPreview(false);
    }
    setErrors({});
  }, [isOpen, question]);

  // Subject change handler
  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectName: subject,
      chapterName: "", // Reset chapter when subject changes
    }));
    onSubjectChange(subject);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText?.trim()) {
      newErrors.questionText = "Question text is required";
    }

    if (!formData.subjectName) {
      newErrors.subjectName = "Subject is required";
    }

    if (!formData.chapterName) {
      newErrors.chapterName = "Chapter is required";
    }

    const validOptions =
      formData.options?.filter(
        (opt) => opt && typeof opt === "string" && opt.trim()
      ) || [];
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    if (!formData.correctAnswer?.trim()) {
      newErrors.correctAnswer = "Correct answer is required";
    } else if (!validOptions.includes(formData.correctAnswer)) {
      newErrors.correctAnswer = "Correct answer must be one of the options";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const cleanData = {
        ...formData,
        options:
          formData.options?.filter(
            (opt) => opt && typeof opt === "string" && opt.trim()
          ) || [],
        subtopics: formData.subtopics?.filter(
          (tag) => tag && typeof tag === "string" && tag.trim()
        ),
        tags: formData.tags?.filter(
          (tag) => tag && typeof tag === "string" && tag.trim()
        ),
      };

      await onSubmit(cleanData);
      onClose();
    } catch (error) {
      console.error("Failed to submit question:", error);
    } finally {
      setLoading(false);
    }
  };

  // Option handlers
  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const removeOption = (index: number) => {
    if ((formData.options?.length || 0) > 2) {
      const newOptions = formData.options?.filter((_, i) => i !== index) || [];
      const updatedData = { ...formData, options: newOptions };

      // Update correct answer if it was the removed option
      if (formData.correctAnswer === formData.options?.[index]) {
        updatedData.correctAnswer = "";
      }

      setFormData(updatedData);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  // Tag handlers
  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter((tag) => tag && typeof tag === "string");
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleSubtopicsChange = (value: string) => {
    const subtopics = value
      .split(",")
      .map((topic) => (typeof topic === "string" ? topic.trim() : ""))
      .filter((topic) => topic && typeof topic === "string");
    setFormData((prev) => ({ ...prev, subtopics }));
  };

  // Step Navigation
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info before proceeding
      const basicErrors: Record<string, string> = {};
      if (!formData.questionText?.trim())
        basicErrors.questionText = "Question text is required";
      if (!formData.subjectName)
        basicErrors.subjectName = "Subject is required";
      if (!formData.chapterName)
        basicErrors.chapterName = "Chapter is required";

      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        return;
      }
    }

    setCurrentStep((prev) => Math.min(3, prev + 1));
    setErrors({});
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setErrors({});
  };

  // Preview Component
  const QuestionPreview = () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Question Preview
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Q:
          </span>
          <p className="text-gray-900 dark:text-gray-100 flex-1">
            {formData.questionText || "Your question will appear here..."}
          </p>
        </div>

        <div className="space-y-2 ml-6">
          {formData.options?.map((option, index) => {
            if (!option?.trim()) return null;

            const isCorrect = option === formData.correctAnswer;
            const optionLabel = String.fromCharCode(65 + index);

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isCorrect
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                    : "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                    isCorrect
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100"
                  )}
                >
                  {optionLabel}
                </span>
                <span
                  className={cn(
                    isCorrect
                      ? "text-green-900 dark:text-green-100 font-medium"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {option}
                </span>
                {isCorrect && (
                  <span className="ml-auto text-xs font-medium text-green-600 dark:text-green-400">
                    ✓ Correct
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {formData.explanation && (
          <div className="ml-6 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Explanation:
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {formData.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Step 1: Basic Information
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Basic Information
        </h3>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question Text *
        </label>
        <textarea
          value={formData.questionText || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, questionText: e.target.value }))
          }
          rows={4}
          className={cn(
            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none",
            errors.questionText
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          )}
          placeholder="Enter your question here..."
        />
        {errors.questionText && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.questionText}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject *
          </label>
          <select
            value={formData.subjectName || ""}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              errors.subjectName
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            )}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subjectName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.subjectName}
            </p>
          )}
        </div>

        {/* Chapter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chapter *
          </label>
          <select
            value={formData.chapterName || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, chapterName: e.target.value }))
            }
            disabled={!formData.subjectName}
            className={cn(
              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              errors.chapterName
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600",
              !formData.subjectName && "opacity-50"
            )}
          >
            <option value="">Select Chapter</option>
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
          {errors.chapterName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.chapterName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty *
          </label>
          <select
            value={formData.difficulty || "Medium"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                difficulty: e.target.value as any,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Year Appeared
          </label>
          <Input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={formData.yearAppeared || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                yearAppeared: parseInt(e.target.value) || undefined,
              }))
            }
            placeholder="e.g., 2024"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Options and Answer
  const OptionsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Options & Correct Answer
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </Button>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {formData.options?.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
              {String.fromCharCode(65 + index)}
            </span>
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1"
            />
            {formData.options && formData.options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {errors.options && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.options}
        </p>
      )}

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Correct Answer *
        </label>
        <select
          value={formData.correctAnswer || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))
          }
          className={cn(
            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            errors.correctAnswer
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          )}
        >
          <option value="">Select Correct Answer</option>
          {formData.options
            ?.filter(
              (option) => option && typeof option === "string" && option.trim()
            )
            .map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </select>
        {errors.correctAnswer && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.correctAnswer}
          </p>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={formData.explanation || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, explanation: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          placeholder="Provide an explanation for the correct answer..."
        />
      </div>
    </div>
  );

  // Step 3: Additional Details
  const AdditionalDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Additional Details
        </h3>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <Input
          value={formData.tags?.join(", ") || ""}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="e.g., mechanics, friction, newton's laws"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add relevant tags to help categorize this question
        </p>
      </div>

      {/* Subtopics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtopics (comma-separated)
        </label>
        <Input
          value={formData.subtopics?.join(", ") || ""}
          onChange={(e) => handleSubtopicsChange(e.target.value)}
          placeholder="e.g., static friction, kinetic friction"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Specify the subtopics this question covers
        </p>
      </div>

      {/* Preview Toggle */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-center gap-2"
        >
          {showPreview ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {showPreview && (
        <div className="mt-6">
          <QuestionPreview />
        </div>
      )}
    </div>
  );

  const steps = [
    { number: 1, title: "Basic Info", component: <BasicInfoStep /> },
    { number: 2, title: "Options", component: <OptionsStep /> },
    { number: 3, title: "Details", component: <AdditionalDetailsStep /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {question ? "Edit Question" : "Add New Question"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStep} of {steps.length}:{" "}
              {steps[currentStep - 1].title}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={cn(
                  "flex items-center",
                  index < steps.length - 1 && "flex-1"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step.number <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium hidden sm:block",
                    step.number <= currentStep
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-gray-200 dark:bg-gray-700">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        step.number < currentStep
                          ? "bg-blue-600"
                          : "bg-transparent"
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {steps[currentStep - 1].component}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Question
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModernQuestionModal;
