import { Building2 } from "lucide-react";
import React from "react";
import type { ModalHeaderProps } from "../types";

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <>
      {/* Gradient Header Background */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-800" />

      {/* Header Content */}
      <div className="relative z-10 px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-blue-100">{subtitle}</p>
      </div>
    </>
  );
};
