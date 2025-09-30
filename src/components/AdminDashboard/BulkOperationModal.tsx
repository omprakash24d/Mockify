import React, { useState } from "react";
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

interface BulkOperation {
  type: "update" | "delete" | "duplicate";
  data?: Partial<Question>;
}

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: BulkOperation | null;
  selectedCount: number;
  subjects: string[];
  chapters: string[];
  onConfirm: () => Promise<void>;
  onUpdate: (operation: BulkOperation) => void;
  onSubjectChange: (subject: string) => void;
}

export const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  isOpen,
  onClose,
  operation,
  selectedCount,
  subjects,
  chapters,
  onConfirm,
  onUpdate,
  onSubjectChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState<Partial<Question>>({});

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (error) {
      console.error("Bulk operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDataChange = (field: keyof Question, value: any) => {
    const newData = { ...updateData, [field]: value };
    setUpdateData(newData);
    onUpdate({ ...operation!, data: newData });
  };

  const getModalTitle = () => {
    switch (operation?.type) {
      case "update":
        return `Bulk Edit ${selectedCount} Questions`;
      case "delete":
        return `Delete ${selectedCount} Questions`;
      case "duplicate":
        return `Duplicate ${selectedCount} Questions`;
      default:
        return "Bulk Operation";
    }
  };

  const getConfirmationMessage = () => {
    switch (operation?.type) {
      case "update":
        return `Are you sure you want to update ${selectedCount} questions with the specified changes?`;
      case "delete":
        return `Are you sure you want to permanently delete ${selectedCount} questions? This action cannot be undone.`;
      case "duplicate":
        return `Are you sure you want to duplicate ${selectedCount} questions?`;
      default:
        return "";
    }
  };

  const isDangerous = operation?.type === "delete";

  if (!isOpen || !operation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      <div className="space-y-6">
        {/* Confirmation Message */}
        <div
          className={`p-4 rounded-lg ${
            isDangerous
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <p
            className={`text-sm ${
              isDangerous ? "text-red-800" : "text-blue-800"
            }`}
          >
            {getConfirmationMessage()}
          </p>
        </div>

        {/* Update Fields (only for update and duplicate operations) */}
        {(operation.type === "update" || operation.type === "duplicate") && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {operation.type === "update"
                ? "Fields to Update:"
                : "Modifications for Duplicates:"}
            </h4>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={updateData.subjectName || ""}
                onChange={(e) => {
                  handleUpdateDataChange(
                    "subjectName",
                    e.target.value || undefined
                  );
                  if (e.target.value) {
                    onSubjectChange(e.target.value);
                    handleUpdateDataChange("chapterName", undefined);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep Current Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter
              </label>
              <select
                value={updateData.chapterName || ""}
                onChange={(e) =>
                  handleUpdateDataChange(
                    "chapterName",
                    e.target.value || undefined
                  )
                }
                disabled={!updateData.subjectName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep Current Chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={updateData.difficulty || ""}
                onChange={(e) =>
                  handleUpdateDataChange(
                    "difficulty",
                    e.target.value || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep Current Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Year Appeared */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Appeared
              </label>
              <Input
                type="number"
                value={updateData.yearAppeared || ""}
                onChange={(e) =>
                  handleUpdateDataChange(
                    "yearAppeared",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="Keep current year"
                min="1990"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Subtopics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtopics
              </label>
              <Input
                value={
                  Array.isArray(updateData.subtopics)
                    ? updateData.subtopics.join(", ")
                    : (updateData.subtopics as unknown as string) || ""
                }
                onChange={(e) => {
                  const subtopicsArray = e.target.value
                    ? e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s)
                    : undefined;
                  handleUpdateDataChange("subtopics", subtopicsArray);
                }}
                placeholder="Keep current subtopics"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to keep current subtopics. Separate new subtopics
                with commas.
              </p>
            </div>

            {/* Explanation (for duplicates) */}
            {operation.type === "duplicate" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  value={updateData.explanation || ""}
                  onChange={(e) =>
                    handleUpdateDataChange(
                      "explanation",
                      e.target.value || undefined
                    )
                  }
                  placeholder="Keep current explanation"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Note:</strong> Only fields with values will be updated.
              Empty fields will keep their current values.
            </div>
          </div>
        )}

        {/* Warning for Delete */}
        {operation.type === "delete" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Warning: Permanent Deletion
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  This action will permanently delete {selectedCount} questions
                  from both Firebase and MongoDB. This cannot be undone. Make
                  sure you have backups if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={
              isDangerous ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }
          >
            {loading
              ? "Processing..."
              : operation.type === "delete"
              ? `Delete ${selectedCount} Questions`
              : operation.type === "update"
              ? `Update ${selectedCount} Questions`
              : `Duplicate ${selectedCount} Questions`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
