import { Image, Plus, Trash2, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Question } from "../../../types/neet";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

interface QuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  mode: "view" | "edit" | "create";
  onClose: () => void;
  onSave?: (questionData: any) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  question,
  mode,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "options" | "media" | "meta"
  >("basic");
  const [formData, setFormData] = useState({
    questionText: "",
    subjectName: "",
    chapterName: "",
    difficulty: "medium",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    explanation: "",
    yearAppeared: "",
    subtopicTags: [] as string[],
    questionImage: "",
    optionImages: ["", "", "", ""],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (question && isOpen) {
      setFormData({
        questionText: question.questionText || "",
        subjectName: question.subjectName || "",
        chapterName: question.chapterName || "",
        difficulty: question.difficulty || "medium",
        options: question.options || [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: question.explanation || "",
        yearAppeared: question.yearAppeared?.toString() || "",
        subtopicTags: question.subtopicTags || [],
        questionImage: question.questionImage || "",
        optionImages: question.optionImages || ["", "", "", ""],
      });
    } else if (mode === "create" && isOpen) {
      setFormData({
        questionText: "",
        subjectName: "",
        chapterName: "",
        difficulty: "medium",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: "",
        yearAppeared: "",
        subtopicTags: [],
        questionImage: "",
        optionImages: ["", "", "", ""],
      });
    }
  }, [isOpen, question, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text };
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = formData.options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.subtopicTags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          subtopicTags: [...formData.subtopicTags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      subtopicTags: formData.subtopicTags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "question" | "option",
    optionIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "question") {
          setFormData({ ...formData, questionImage: result });
        } else if (type === "option" && optionIndex !== undefined) {
          const newOptionImages = [...formData.optionImages];
          newOptionImages[optionIndex] = result;
          setFormData({ ...formData, optionImages: newOptionImages });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: "question" | "option", optionIndex?: number) => {
    if (type === "question") {
      setFormData({ ...formData, questionImage: "" });
    } else if (type === "option" && optionIndex !== undefined) {
      const newOptionImages = [...formData.optionImages];
      newOptionImages[optionIndex] = "";
      setFormData({ ...formData, optionImages: newOptionImages });
    }
  };

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mode === "view"
                ? "Question Details"
                : mode === "edit"
                ? "Edit Question"
                : "Create New Question"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {mode === "view"
                ? "View question information and statistics"
                : mode === "edit"
                ? "Modify question content and settings"
                : "Create a new question for your question bank"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {["basic", "options", "media", "meta"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-800/50"
              }`}
            >
              {tab === "basic" && "📝 Basic Info"}
              {tab === "options" && "✅ Options"}
              {tab === "media" && "🖼️ Images"}
              {tab === "meta" && "🏷️ Metadata"}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subjectName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectName: e.target.value,
                        })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chapter *
                    </label>
                    <Input
                      value={formData.chapterName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chapterName: e.target.value,
                        })
                      }
                      disabled={isReadOnly}
                      placeholder="e.g., Mechanics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={formData.questionText}
                    onChange={(e) =>
                      setFormData({ ...formData, questionText: e.target.value })
                    }
                    disabled={isReadOnly}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Enter the question text here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) =>
                      setFormData({ ...formData, explanation: e.target.value })
                    }
                    disabled={isReadOnly}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Explain the correct answer and why other options are incorrect..."
                  />
                </div>
              </div>
            )}

            {/* Options Tab */}
            {activeTab === "options" && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Click the radio button next to the
                    correct answer. Make sure all options are filled out.
                  </p>
                </div>

                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center pt-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(index)}
                          disabled={isReadOnly}
                          className="w-5 h-5 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                        />
                        <span className="ml-3 text-lg font-bold text-gray-700 dark:text-gray-300">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          disabled={isReadOnly}
                          rows={2}
                          placeholder={`Enter option ${String.fromCharCode(
                            65 + index
                          )} text...`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                          required
                        />
                        {option.isCorrect && (
                          <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                            <span className="text-sm font-medium">
                              ✅ Correct Answer
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <div className="space-y-6">
                {/* Question Image */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Question Image (Optional)
                  </h3>
                  <div className="space-y-4">
                    {formData.questionImage ? (
                      <div className="relative">
                        <img
                          src={formData.questionImage}
                          alt="Question"
                          className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeImage("question")}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      !isReadOnly && (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Upload an image for this question
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "question")}
                            className="hidden"
                            id="question-image"
                          />
                          <label
                            htmlFor="question-image"
                            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Choose Image
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Option Images */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Option Images (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.options.map((_, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Option {String.fromCharCode(65 + index)}
                        </h4>
                        {formData.optionImages[index] ? (
                          <div className="relative">
                            <img
                              src={formData.optionImages[index]}
                              alt={`Option ${String.fromCharCode(65 + index)}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => removeImage("option", index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          !isReadOnly && (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(e, "option", index)
                                }
                                className="hidden"
                                id={`option-image-${index}`}
                              />
                              <label
                                htmlFor={`option-image-${index}`}
                                className="cursor-pointer text-sm bg-gray-500 dark:bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                              >
                                Add Image
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Tab */}
            {activeTab === "meta" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year Appeared (Optional)
                    </label>
                    <Input
                      value={formData.yearAppeared}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearAppeared: e.target.value,
                        })
                      }
                      disabled={isReadOnly}
                      placeholder="e.g., 2023"
                      type="number"
                      min="1990"
                      max="2030"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtopic Tags
                  </label>
                  <div className="space-y-3">
                    {!isReadOnly && (
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={addTag}
                          placeholder="Type a tag and press Enter"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (
                              tagInput.trim() &&
                              !formData.subtopicTags.includes(tagInput.trim())
                            ) {
                              setFormData({
                                ...formData,
                                subtopicTags: [
                                  ...formData.subtopicTags,
                                  tagInput.trim(),
                                ],
                              });
                              setTagInput("");
                            }
                          }}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.subtopicTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {tag}
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Statistics (View mode only) */}
                {mode === "view" && question && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                      📊 Question Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {question.statistics.totalAttempts}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Total Attempts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {question.statistics.correctAttempts}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Correct Attempts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {question.statistics.totalAttempts > 0
                            ? Math.round(
                                (question.statistics.correctAttempts /
                                  question.statistics.totalAttempts) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Success Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {Math.round(question.statistics.averageTimeSpent)}s
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Avg Time
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {!isReadOnly && "* Required fields"}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                >
                  {mode === "edit"
                    ? "💾 Update Question"
                    : "✨ Create Question"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
