import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Hash,
  Image,
  Send,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { reportingService } from "../../services/reportingService";
import type { Question } from "../../types/neet";

// Function to generate unique report ID
const generateReportId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `RPT-${timestamp}-${randomPart}`.toUpperCase();
};

interface ReportQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

const REPORT_TYPES = [
  {
    value: "wrong_answer",
    label: "Wrong Answer",
    description: "The correct answer marked is incorrect",
    icon: XCircle,
    priority: "high",
  },
  {
    value: "multiple_correct",
    label: "Multiple Correct Answers",
    description: "More than one option appears to be correct",
    icon: AlertTriangle,
    priority: "critical",
  },
  {
    value: "unclear_question",
    label: "Unclear Question",
    description: "Question is ambiguous or poorly worded",
    icon: AlertTriangle,
    priority: "medium",
  },
  {
    value: "typo",
    label: "Spelling/Grammar Error",
    description: "There are spelling or grammatical mistakes",
    icon: AlertTriangle,
    priority: "low",
  },
  {
    value: "other",
    label: "Other Issue",
    description: "Something else is wrong with this question",
    icon: AlertTriangle,
    priority: "medium",
  },
];

export const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [reportId] = useState(generateReportId());

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Please select a report type");
      return;
    }

    if (description.trim() && description.trim().length < 10) {
      setError(
        "Description must be at least 10 characters long or leave empty"
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create question snapshot
      const questionSnapshot = {
        questionText: question.questionText,
        options: question.options.map((opt: any, index: number) => ({
          text: typeof opt === "string" ? opt : opt.text,
          isCorrect:
            index ===
            (typeof question.correctAnswer === "string"
              ? 0
              : question.correctAnswer),
        })),
        correctAnswer:
          typeof question.correctAnswer === "string"
            ? question.correctAnswer
            : (question.options[question.correctAnswer] as any)?.text || "",
        subjectName: question.subjectName,
        chapterName: question.chapterName,
      };

      // Debug the ObjectId structure
      console.log("Question object:", question);
      console.log("Question._id:", question._id);
      console.log("Question._id type:", typeof question._id);
      console.log(
        "Question._id structure:",
        JSON.stringify(question._id, null, 2)
      );
      if (
        question._id &&
        typeof question._id === "object" &&
        (question._id as any).buffer
      ) {
        console.log("Buffer data:", (question._id as any).buffer.data);
      }

      // Extract the actual string ID from the question object
      const extractQuestionId = (q: any): string => {
        // Handle string IDs
        if (typeof q._id === "string") return q._id;
        if (typeof q.id === "string") return q.id;

        // Handle MongoDB ObjectId objects
        if (q._id && typeof q._id === "object") {
          // Handle ObjectId with buffer property
          if (q._id.buffer && q._id.buffer.data) {
            // Convert buffer to hex string
            const bytes = Array.from(q._id.buffer.data) as number[];
            return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
          }

          // Try toString() method (MongoDB ObjectId has this)
          if (typeof q._id.toString === "function") {
            const strResult = q._id.toString();
            if (strResult !== "[object Object]") return strResult;
          }

          // Try $oid property (some serialized formats)
          if (q._id.$oid) return q._id.$oid;

          // Try toHexString() method (another MongoDB ObjectId method)
          if (typeof q._id.toHexString === "function")
            return q._id.toHexString();

          // Handle direct hex string property
          if (q._id.id && typeof q._id.id === "string") return q._id.id;
        }

        if (q.id && typeof q.id === "object") {
          // Handle ObjectId with buffer property
          if (q.id.buffer && q.id.buffer.data) {
            const bytes = Array.from(q.id.buffer.data) as number[];
            return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
          }

          if (typeof q.id.toString === "function") {
            const strResult = q.id.toString();
            if (strResult !== "[object Object]") return strResult;
          }

          if (q.id.$oid) return q.id.$oid;
          if (typeof q.id.toHexString === "function") return q.id.toHexString();
          if (q.id.id && typeof q.id.id === "string") return q.id.id;
        }

        return "000000000000000000000000"; // fallback to valid ObjectId format
      };

      const reportData = {
        questionId: extractQuestionId(question),
        reportType: selectedType as
          | "wrong_answer"
          | "unclear_question"
          | "multiple_correct"
          | "typo"
          | "other",
        description: description.trim() || "No description provided",
        questionSnapshot,
        priority: REPORT_TYPES.find((t) => t.value === selectedType)
          ?.priority as "low" | "medium" | "high" | "critical",
      };

      console.log("Question object:", question);
      console.log("Question._id:", question._id);
      console.log("Question._id type:", typeof question._id);
      console.log("Question._id toString:", question._id?.toString?.());
      console.log("Extracted questionId:", extractQuestionId(question));
      console.log("Submitting report data:", reportData);
      const result = await reportingService.submitReport(reportData);

      if (result.success) {
        setSubmitted(true);
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        console.error("Report submission failed:", result);
        setError(result.error || "Failed to submit report");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Report submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType("");
    setDescription("");
    setSubmitted(false);
    setError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Report Question Issue
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Report ID: {reportId}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            // Success State
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Report Submitted Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for helping us improve the question quality. Our team
                will review this issue soon.
              </p>
            </div>
          ) : (
            <>
              {/* Question Preview */}
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Question Header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {question.subjectName} • {question.chapterName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            Reported {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-gray-900 dark:text-gray-100 text-base leading-relaxed">
                        {question.questionText}
                      </p>
                      {question.questionImage && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Image className="w-4 h-4" />
                          <span>Question includes image content</span>
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answer Options:
                      </div>
                      {question.options?.map((option, index) => {
                        const optionText =
                          typeof option === "string"
                            ? option
                            : option?.text || "";

                        // Correct logic: correctAnswer is the text of the correct option (virtual field)
                        let isCorrect = false;
                        if (typeof option === "object" && option.isCorrect) {
                          isCorrect = true;
                        } else if (typeof question.correctAnswer === "string") {
                          isCorrect = question.correctAnswer === optionText;
                        } else if (typeof question.correctAnswer === "number") {
                          isCorrect = index === question.correctAnswer;
                        }

                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              isCorrect
                                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                isCorrect
                                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1">
                              <span
                                className={`text-sm ${
                                  isCorrect
                                    ? "text-green-900 dark:text-green-100"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {optionText}
                              </span>
                              {isCorrect && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What's the issue with this question?
                </label>
                <div className="space-y-2">
                  {REPORT_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedType === type.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportType"
                          value={type.value}
                          checked={selectedType === type.value}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {type.label}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                type.priority === "critical"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : type.priority === "high"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                  : type.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {type.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specific details about the issue. For wrong answers, explain why you think the current answer is incorrect and what you believe the correct answer should be."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                  maxLength={1000}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {description.length}/1000 characters (optional)
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !selectedType ||
                    (description.trim().length > 0 &&
                      description.trim().length < 10)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
