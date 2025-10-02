import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
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
        return `Are you sure you want to update ${selectedCount} questions?`;
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
      <div className="space-y-5">
        {/* Confirmation Message */}
        <div
          className={cn(
            "p-4 rounded-lg border",
            isDangerous
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          )}
        >
          <p
            className={cn(
              "text-sm",
              isDangerous
                ? "text-red-800 dark:text-red-300"
                : "text-blue-800 dark:text-blue-300"
            )}
          >
            {getConfirmationMessage()}
          </p>
        </div>

        {/* Update Fields */}
        {(operation.type === "update" || operation.type === "duplicate") && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {operation.type === "update"
                ? "Fields to Update:"
                : "Modifications:"}
            </h4>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Keep Current Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Year Appeared */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to keep current. Separate with commas.
              </p>
            </div>

            {/* Explanation */}
            {operation.type === "duplicate" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <strong>Note:</strong> Only filled fields will be updated.
            </div>
          </div>
        )}

        {/* Delete Warning */}
        {operation.type === "delete" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Warning: Permanent Deletion
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  This will permanently delete {selectedCount} questions. This
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              isDangerous && "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            {loading
              ? "Processing..."
              : operation.type === "delete"
              ? `Delete ${selectedCount}`
              : operation.type === "update"
              ? `Update ${selectedCount}`
              : `Duplicate ${selectedCount}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
