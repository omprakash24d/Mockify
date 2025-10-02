import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  formatZodError,
  validateQuestion,
} from "../../lib/validations/questionValidation";
import { Button } from "../ui/Button";
import { FileUpload } from "../ui/FileUpload";
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
  questionImages?: string[];
  tags?: string[];
}

interface EnhancedQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  subjects: string[];
  chapters: string[];
  onSubmit: (data: Partial<Question>) => Promise<void>;
  onSubjectChange: (subject: string) => void;
}

export const EnhancedQuestionModal: React.FC<EnhancedQuestionModalProps> = ({
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
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [lastSubject, setLastSubject] = useState<string>("");

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
        // Only call onSubjectChange if the subject has actually changed
        if (question.subjectName && question.subjectName !== lastSubject) {
          setLastSubject(question.subjectName);
          onSubjectChange(question.subjectName);
        }
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
        setLastSubject("");
      }
      setErrors({});
      setImageUploadError("");
    }
  }, [isOpen, question]);

  const validateForm = (): boolean => {
    const validation = validateQuestion({
      ...formData,
      options:
        formData.options?.filter(
          (opt) => opt && typeof opt === "string" && opt.trim()
        ) || [],
    });

    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Filter out empty options
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
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "An error occurred",
      });
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

  const handleImageUpload = (file: File | null, previewUrl: string) => {
    if (file && previewUrl) {
      // Add the new image to the array
      const currentImages = formData.questionImages || [];
      if (currentImages.length >= 5) {
        setImageUploadError("Maximum 5 images allowed per question");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        questionImages: [...currentImages, previewUrl],
      }));
      setImageUploadError("");
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.questionImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questionImages: newImages }));
  };

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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? "Edit Question" : "Create Question"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
            {errors.general}
          </div>
        )}

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
            placeholder="Enter the question text..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.questionText
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />
          {errors.questionText && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.questionText}
            </p>
          )}
        </div>

        {/* Subject and Chapter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <select
              value={formData.subjectName || ""}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  subjectName: e.target.value,
                  chapterName: "",
                }));
                onSubjectChange(e.target.value);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.subjectName
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.subjectName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 ${
                errors.chapterName
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              disabled={!formData.subjectName}
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

        {/* Difficulty and Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

        {/* Question Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Images (Optional)
          </label>

          {/* Current Images */}
          {formData.questionImages && formData.questionImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.questionImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Question image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload New Image */}
          {(!formData.questionImages || formData.questionImages.length < 5) && (
            <FileUpload
              label="Add Image"
              onChange={handleImageUpload}
              error={imageUploadError}
              accept="image/*"
              maxSize={5}
            />
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.options}
            </p>
          )}

          {(formData.options?.length || 0) < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          )}
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.correctAnswer
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Select Correct Answer</option>
            {formData.options
              ?.filter(
                (option) =>
                  option && typeof option === "string" && option.trim()
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
            placeholder="Provide an explanation for the correct answer..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Subtopics and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtopics (Optional)
            </label>
            <Input
              value={formData.subtopics?.join(", ") || ""}
              onChange={(e) => handleSubtopicsChange(e.target.value)}
              placeholder="Enter subtopics separated by commas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <Input
              value={formData.tags?.join(", ") || ""}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {question ? "Update Question" : "Create Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnhancedQuestionModal;
