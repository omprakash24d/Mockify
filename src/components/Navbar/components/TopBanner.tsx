import { Phone } from "lucide-react";

export const TopBanner: React.FC = () => {
  return (
    <div className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 border-b border-blue-700 dark:border-blue-600">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="font-medium text-xs sm:text-sm">
            NEET Classroom Test Series
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <Phone className="w-4 h-4" />
          <span className="font-medium">+91-8527521718</span>
        </div>
        <div className="flex sm:hidden items-center">
          <Phone className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
