import React from "react";
import { Button } from "../../ui/Button";
import type { ActionButtonsProps } from "../types";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  loading,
  isFormValid,
  onSubmit,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading || !isFormValid}
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          {loading ? "Setting up your profile..." : "Complete Setup & Continue"}
        </Button>
      </div>
    </div>
  );
};
