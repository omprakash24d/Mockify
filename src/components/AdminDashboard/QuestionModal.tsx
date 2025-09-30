import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface Question {
  id: string;
  questionText: string;
  subjectName: string;
  chapterName: string;
  difficulty: "Easy" | "Medium" | "Hard";
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subtopics?: string[];
  yearAppeared?: number;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  subjects: string[];
  chapters: string[];
  onSubmit: (data: Partial<Question>) => Promise<void>;
  onSubjectChange: (subject: string) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
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
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      if (question) {
        setFormData({
          questionText: question.questionText || "",
          subjectName: question.subjectName || "",
          chapterName: question.chapterName || "",
          difficulty: question.difficulty || "Medium",
          options: question.options || ["", "", "", ""],
          correctAnswer: question.correctAnswer || "",
          explanation: question.explanation || "",
          subtopics: question.subtopics || [],
          yearAppeared: question.yearAppeared || new Date().getFullYear(),
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
        });
      }
      setErrors({});
    }
  }, [isOpen, question]);

  // Handle subject change
  useEffect(() => {
    if (formData.subjectName) {
      onSubjectChange(formData.subjectName);
    }
  }, [formData.subjectName, onSubjectChange]);

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

    if (!formData.options || formData.options.length < 2) {
      newErrors.options = "At least 2 options are required";
    } else {
      const filledOptions = formData.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options must be filled";
      }
    }

    if (!formData.correctAnswer?.trim()) {
      newErrors.correctAnswer = "Correct answer is required";
    } else if (
      formData.options &&
      !formData.options.includes(formData.correctAnswer)
    ) {
      newErrors.correctAnswer = "Correct answer must match one of the options";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Clean up options (remove empty ones)
      const cleanedOptions =
        formData.options?.filter((opt) => opt.trim()) || [];

      // Parse subtopics from comma-separated string
      const subtopicsArray = Array.isArray(formData.subtopics)
        ? formData.subtopics
        : ((formData.subtopics as unknown as string) || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s);

      const dataToSubmit = {
        ...formData,
        options: cleanedOptions,
        subtopics: subtopicsArray,
        yearAppeared: formData.yearAppeared
          ? Number(formData.yearAppeared)
          : undefined,
      };

      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Failed to save question:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const removeOption = (index: number) => {
    if ((formData.options?.length || 0) > 2) {
      const newOptions = formData.options?.filter((_, i) => i !== index) || [];
      setFormData((prev) => ({ ...prev, options: newOptions }));

      // Update correct answer if it was the removed option
      if (formData.correctAnswer === formData.options?.[index]) {
        setFormData((prev) => ({ ...prev, correctAnswer: "" }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? "Edit Question" : "Create Question"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={formData.questionText || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, questionText: e.target.value }))
            }
            placeholder="Enter the question text..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.questionText ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.questionText && (
            <p className="mt-1 text-sm text-red-600">{errors.questionText}</p>
          )}
        </div>

        {/* Subject and Chapter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              value={formData.subjectName || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subjectName: e.target.value,
                  chapterName: "",
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subjectName ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {errors.subjectName && (
              <p className="mt-1 text-sm text-red-600">{errors.subjectName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter *
            </label>
            <select
              value={formData.chapterName || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chapterName: e.target.value,
                }))
              }
              disabled={!formData.subjectName}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.chapterName ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
            {errors.chapterName && (
              <p className="mt-1 text-sm text-red-600">{errors.chapterName}</p>
            )}
          </div>
        </div>

        {/* Difficulty and Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty || "Medium"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: e.target.value as Question["difficulty"],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Appeared
            </label>
            <Input
              type="number"
              value={formData.yearAppeared || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  yearAppeared: parseInt(e.target.value) || undefined,
                }))
              }
              placeholder="e.g., 2023"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options * (minimum 2 required)
          </label>
          <div className="space-y-2">
            {formData.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {(formData.options?.length || 0) > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="mt-1 text-sm text-red-600">{errors.options}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="mt-2"
          >
            Add Option
          </Button>
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer *
          </label>
          <select
            value={formData.correctAnswer || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                correctAnswer: e.target.value,
              }))
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.correctAnswer ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Correct Answer</option>
            {formData.options
              ?.filter((opt) => opt.trim())
              .map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
          </select>
          {errors.correctAnswer && (
            <p className="mt-1 text-sm text-red-600">{errors.correctAnswer}</p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={formData.explanation || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, explanation: e.target.value }))
            }
            placeholder="Provide an explanation for the correct answer..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subtopics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtopics (Optional)
          </label>
          <Input
            value={
              Array.isArray(formData.subtopics)
                ? formData.subtopics.join(", ")
                : (formData.subtopics as unknown as string) || ""
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subtopics: e.target.value as unknown as string[],
              }))
            }
            placeholder="Enter subtopics separated by commas"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple subtopics with commas (e.g., "Genetics, DNA, RNA")
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : question
              ? "Update Question"
              : "Create Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
