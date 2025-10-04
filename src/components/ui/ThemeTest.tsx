import React from "react";
import {
  NEETBadge,
  NEETButton,
  NEETCard,
  NEETInput,
  NEETLabel,
} from "./NEETComponents";

export const ThemeTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Theme Testing Components
        </h1>

        {/* NEETCard Test */}
        <NEETCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            NEET Card Component
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This card should properly switch between light and dark themes.
          </p>
        </NEETCard>

        {/* NEETButton Test */}
        <NEETCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            NEET Button Components
          </h2>
          <div className="flex flex-wrap gap-4">
            <NEETButton variant="primary">Primary Button</NEETButton>
            <NEETButton variant="secondary">Secondary Button</NEETButton>
            <NEETButton variant="secondary">Outline Button</NEETButton>
            <NEETButton variant="secondary">Ghost Button</NEETButton>
            <NEETButton variant="secondary">Secondary Button 2</NEETButton>
          </div>
        </NEETCard>

        {/* NEETInput Test */}
        <NEETCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            NEET Form Components
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <NEETLabel htmlFor="test-input" required>
                Test Input Label
              </NEETLabel>
              <NEETInput
                id="test-input"
                placeholder="Enter some text..."
                value="Sample input value"
              />
            </div>
            <div>
              <NEETLabel htmlFor="error-input">Error Input Example</NEETLabel>
              <NEETInput
                id="error-input"
                placeholder="This has an error..."
                error={true}
                value="Invalid input"
              />
            </div>
          </div>
        </NEETCard>

        {/* NEETBadge Test */}
        <NEETCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            NEET Badge Components
          </h2>
          <div className="flex flex-wrap gap-3">
            <NEETBadge variant="default">Default</NEETBadge>
            <NEETBadge variant="success">Success</NEETBadge>
            <NEETBadge variant="warning">Warning</NEETBadge>
            <NEETBadge variant="error">Error</NEETBadge>
          </div>
        </NEETCard>

        {/* Theme Status */}
        <NEETCard className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Theme Status Check
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If you can see proper color changes when switching themes, the
            implementation is working!
          </p>
          <div className="inline-block p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            Theme-aware background color test
          </div>
        </NEETCard>
      </div>
    </div>
  );
};
