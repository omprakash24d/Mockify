import { Image, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface FileUploadProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (file: File | null, previewUrl: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className,
  required = false,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      onChange?.(null, "");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onChange?.(file, url);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange?.(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label
          className={`block text-sm font-medium font-lato ${
            error
              ? theme === "dark"
                ? "text-red-400"
                : "text-red-500"
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : ""}
          ${
            error
              ? theme === "dark"
                ? "border-red-400 bg-red-900/10"
                : "border-red-500 bg-red-50"
              : theme === "dark"
              ? "border-gray-600 bg-gray-800 hover:border-gray-500"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }
        `}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          /* Preview */
          <div className="relative">
            <img
              src={previewUrl}
              alt="Logo preview"
              className="mx-auto h-24 w-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className={`absolute -top-2 -right-2 p-1 rounded-full ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600"
              } text-white transition-colors`}
            >
              <X className="h-4 w-4" />
            </button>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Click to change logo
            </p>
          </div>
        ) : (
          /* Upload Prompt */
          <div>
            <div
              className={`mx-auto h-12 w-12 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {isDragging ? (
                <Upload className="h-12 w-12" />
              ) : (
                <Image className="h-12 w-12" />
              )}
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {isDragging ? "Drop your logo here" : "Upload coaching logo"}
            </p>
            <p
              className={`mt-1 text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              PNG, JPG, GIF up to {maxSize}MB (Optional)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          className={`text-sm font-lato ${
            theme === "dark" ? "text-red-400" : "text-red-500"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
};
