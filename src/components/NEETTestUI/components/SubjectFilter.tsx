import { ChevronDown } from "lucide-react";
import React from "react";

interface SubjectFilterProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = ["All", "Botany", "Chemistry", "Physics", "Zoology"];

export const SubjectFilter: React.FC<SubjectFilterProps> = ({
  selectedSubject,
  onSubjectChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center">
        <span className="text-gray-700 font-medium mr-3">Select Subject:</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => onSubjectChange(subject)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedSubject === subject
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
};
