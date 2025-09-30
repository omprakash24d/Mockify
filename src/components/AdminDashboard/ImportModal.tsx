import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any, format: string, options?: any) => Promise<void>;
  subjects: string[];
}

interface ImportOptions {
  defaultSubject?: string;
  defaultChapter?: string;
  defaultDifficulty?: "Easy" | "Medium" | "Hard";
  skipDuplicates?: boolean;
  transformDifficulty?: Record<string, string>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  subjects,
}) => {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [importData, setImportData] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  // Import options
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    defaultDifficulty: "Medium",
  });

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      setImportData(text);

      // Auto-detect format based on file extension
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension === "csv") {
        setFormat("csv");
        await parsePreview(text, "csv");
      } else if (extension === "json") {
        setFormat("json");
        await parsePreview(text, "json");
      }
    } catch (err) {
      setError("Failed to read file");
    }
  };

  const parsePreview = async (data: string, fmt: "json" | "csv") => {
    try {
      let parsed: any[] = [];

      if (fmt === "json") {
        const jsonData = JSON.parse(data);
        parsed = Array.isArray(jsonData) ? jsonData.slice(0, 5) : [jsonData];
      } else if (fmt === "csv") {
        const lines = data.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          throw new Error("CSV must have at least header and one data row");
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        parsed = lines.slice(1, 6).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
      }

      setPreview(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse data");
      setPreview([]);
    }
  };

  const handleTextInput = async (text: string) => {
    setImportData(text);
    if (text.trim()) {
      await parsePreview(text, format);
    } else {
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setError("Please provide data to import");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onImport(importData, format, options);

      // Reset form
      setImportData("");
      setFile(null);
      setPreview([]);
      setOptions({
        skipDuplicates: true,
        defaultDifficulty: "Medium",
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (preview.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Preview (first 5 rows):
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const csvTemplateHeaders = [
    "questionText",
    "subjectName",
    "chapterName",
    "difficulty",
    "option1",
    "option2",
    "option3",
    "option4",
    "correctAnswer",
    "explanation",
    "subtopics",
    "yearAppeared",
  ];

  const downloadTemplate = (templateFormat: "json" | "csv") => {
    let content = "";
    let filename = "";
    let mimeType = "";

    if (templateFormat === "json") {
      const template = [
        {
          questionText: "What is the powerhouse of the cell?",
          subjectName: "Biology",
          chapterName: "Cell Biology",
          difficulty: "Easy",
          options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
          correctAnswer: "Mitochondria",
          explanation: "Mitochondria produce ATP through cellular respiration",
          subtopics: ["Organelles", "Cell Structure"],
          yearAppeared: 2023,
        },
      ];
      content = JSON.stringify(template, null, 2);
      filename = "questions_template.json";
      mimeType = "application/json";
    } else {
      const headers = csvTemplateHeaders.join(",");
      const example = [
        '"What is the powerhouse of the cell?"',
        '"Biology"',
        '"Cell Biology"',
        '"Easy"',
        '"Nucleus"',
        '"Mitochondria"',
        '"Ribosome"',
        '"Golgi Apparatus"',
        '"Mitochondria"',
        '"Mitochondria produce ATP through cellular respiration"',
        '"Organelles,Cell Structure"',
        "2023",
      ].join(",");
      content = headers + "\n" + example;
      filename = "questions_template.csv";
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Questions">
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import Format
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`px-4 py-2 rounded-md border ${
                format === "json"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`px-4 py-2 rounded-md border ${
                format === "csv"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              CSV
            </button>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Download Template
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Download a template file to see the expected format for your data.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadTemplate("json")}
            >
              JSON Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadTemplate("csv")}
            >
              CSV Template
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept={format === "json" ? ".json" : ".csv"}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-sm text-gray-600">
                {file ? (
                  <span className="text-blue-600 font-medium">{file.name}</span>
                ) : (
                  <>
                    <span className="text-blue-600 font-medium">
                      Click to upload
                    </span>
                    <span> or drag and drop</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {format.toUpperCase()} files only
              </div>
            </label>
          </div>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Paste {format.toUpperCase()} Data
          </label>
          <textarea
            value={importData}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder={
              format === "json"
                ? "Paste JSON data here..."
                : "Paste CSV data here..."
            }
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {/* Preview */}
        {renderPreview()}

        {/* Import Options */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Import Options</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Subject (for missing values)
              </label>
              <select
                value={options.defaultSubject || ""}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    defaultSubject: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No default</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Difficulty
              </label>
              <select
                value={options.defaultDifficulty || "Medium"}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    defaultDifficulty: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.skipDuplicates}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    skipDuplicates: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Skip duplicate questions (based on question text)
              </span>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !importData.trim()}
          >
            {loading
              ? "Importing..."
              : `Import ${
                  preview.length > 0
                    ? `(${preview.length}+ questions)`
                    : "Questions"
                }`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
