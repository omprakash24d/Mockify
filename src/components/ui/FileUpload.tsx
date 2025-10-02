import { Image, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

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
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50
          ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-[1.03]"
              : ""
          }
          ${
            error
              ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
              : "border-gray-300 dark:border-gray-600"
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
          <div className="relative inline-block">
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto h-24 w-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Click to change image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition ${
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {isDragging ? (
                <Upload className="h-8 w-8" />
              ) : (
                <Image className="h-8 w-8" />
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {isDragging ? "Drop your image here" : "Upload an image"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop or{" "}
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg
            className="w-4 h-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
