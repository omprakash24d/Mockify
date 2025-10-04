/**
 * ThemeDemo Component - Demonstrates proper dark/light mode implementation
 * This component shows industry-standard theme switching patterns using Tailwind CSS
 */

import {
  AlertTriangle,
  Book,
  Check,
  CheckCircle,
  Info,
  Moon,
  Sun,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { themeClasses } from "../../utils/themeUtils";

export const ThemeDemo: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses.background.primary}`}
    >
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className={`rounded-lg p-6 mb-8 ${themeClasses.layout.header}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                Theme Demo
              </h1>
              <p className={`mt-2 ${themeClasses.text.secondary}`}>
                Comprehensive dark/light mode implementation showcase
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                p-3 rounded-lg transition-all duration-200
                ${themeClasses.form.button.outline}
                ${themeClasses.interactive.hover}
                ${themeClasses.interactive.focus}
              `}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Card */}
          <div
            className={`rounded-lg p-6 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}
            >
              Basic Card
            </h3>
            <p className={themeClasses.text.secondary}>
              This is a standard card component with proper theme support.
            </p>
          </div>

          {/* Interactive Card */}
          <div
            className={`
            rounded-lg p-6 cursor-pointer transition-all duration-200
            ${themeClasses.background.card} 
            ${themeClasses.border.primary} 
            border
            ${themeClasses.interactive.hover}
            hover:shadow-lg
          `}
          >
            <div className="flex items-center mb-2">
              <TrendingUp
                className={`w-5 h-5 mr-2 ${themeClasses.text.accent}`}
              />
              <h3
                className={`text-lg font-semibold ${themeClasses.text.primary}`}
              >
                Interactive Card
              </h3>
            </div>
            <p className={themeClasses.text.secondary}>
              Hover over this card to see interactive states.
            </p>
          </div>

          {/* Status Card */}
          <div
            className={`rounded-lg p-6 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
          >
            <div className="flex items-center mb-2">
              <CheckCircle
                className={`w-5 h-5 mr-2 ${themeClasses.text.success}`}
              />
              <h3
                className={`text-lg font-semibold ${themeClasses.text.primary}`}
              >
                Status Card
              </h3>
            </div>
            <p className={themeClasses.text.secondary}>
              Cards with status indicators and icons.
            </p>
          </div>
        </div>

        {/* Alert Components */}
        <div className="space-y-4 mb-8">
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            Alert Components
          </h2>

          {/* Success Alert */}
          <div
            className={`
            rounded-lg p-4 border
            ${themeClasses.status.success.bg}
            ${themeClasses.status.success.border}
          `}
          >
            <div className="flex items-center">
              <CheckCircle
                className={`w-5 h-5 mr-3 ${themeClasses.status.success.text}`}
              />
              <div>
                <h4
                  className={`font-semibold ${themeClasses.status.success.text}`}
                >
                  Success!
                </h4>
                <p className={`text-sm ${themeClasses.status.success.text}`}>
                  Your changes have been saved successfully.
                </p>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <div
            className={`
            rounded-lg p-4 border
            ${themeClasses.status.warning.bg}
            ${themeClasses.status.warning.border}
          `}
          >
            <div className="flex items-center">
              <AlertTriangle
                className={`w-5 h-5 mr-3 ${themeClasses.status.warning.text}`}
              />
              <div>
                <h4
                  className={`font-semibold ${themeClasses.status.warning.text}`}
                >
                  Warning
                </h4>
                <p className={`text-sm ${themeClasses.status.warning.text}`}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          <div
            className={`
            rounded-lg p-4 border
            ${themeClasses.status.error.bg}
            ${themeClasses.status.error.border}
          `}
          >
            <div className="flex items-center">
              <XCircle
                className={`w-5 h-5 mr-3 ${themeClasses.status.error.text}`}
              />
              <div>
                <h4
                  className={`font-semibold ${themeClasses.status.error.text}`}
                >
                  Error
                </h4>
                <p className={`text-sm ${themeClasses.status.error.text}`}>
                  Something went wrong. Please try again.
                </p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div
            className={`
            rounded-lg p-4 border
            ${themeClasses.status.info.bg}
            ${themeClasses.status.info.border}
          `}
          >
            <div className="flex items-center">
              <Info
                className={`w-5 h-5 mr-3 ${themeClasses.status.info.text}`}
              />
              <div>
                <h4
                  className={`font-semibold ${themeClasses.status.info.text}`}
                >
                  Information
                </h4>
                <p className={`text-sm ${themeClasses.status.info.text}`}>
                  Here's some helpful information for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div
          className={`rounded-lg p-6 mb-8 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${themeClasses.text.primary}`}
          >
            Form Elements
          </h2>

          <div className="space-y-4">
            {/* Input Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className={`
                  w-full px-3 py-2 rounded-lg border transition-colors
                  ${themeClasses.form.input}
                  ${themeClasses.interactive.focus}
                `}
              />
            </div>

            {/* Select Dropdown */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}
              >
                Select Subject
              </label>
              <select
                className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${themeClasses.form.select}
                ${themeClasses.interactive.focus}
              `}
              >
                <option>Choose a subject</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${themeClasses.form.button.primary}
                ${themeClasses.interactive.focus}
              `}
              >
                Primary Button
              </button>

              <button
                className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${themeClasses.form.button.secondary}
                ${themeClasses.interactive.focus}
              `}
              >
                Secondary Button
              </button>

              <button
                className={`
                px-4 py-2 rounded-lg font-medium border transition-colors
                ${themeClasses.form.button.outline}
                ${themeClasses.interactive.focus}
              `}
              >
                Outline Button
              </button>

              <button
                className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${themeClasses.form.button.ghost}
                ${themeClasses.interactive.focus}
              `}
              >
                Ghost Button
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`rounded-lg p-6 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${themeClasses.status.info.bg}`}>
                <Book className={`w-6 h-6 ${themeClasses.status.info.text}`} />
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${themeClasses.text.secondary}`}
                >
                  Total Questions
                </p>
                <p
                  className={`text-2xl font-bold ${themeClasses.text.primary}`}
                >
                  1,234
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg p-6 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg ${themeClasses.status.success.bg}`}
              >
                <Users
                  className={`w-6 h-6 ${themeClasses.status.success.text}`}
                />
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${themeClasses.text.secondary}`}
                >
                  Active Users
                </p>
                <p
                  className={`text-2xl font-bold ${themeClasses.text.primary}`}
                >
                  567
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg p-6 ${themeClasses.background.card} ${themeClasses.border.primary} border`}
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg ${themeClasses.status.warning.bg}`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${themeClasses.status.warning.text}`}
                />
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${themeClasses.text.secondary}`}
                >
                  Growth Rate
                </p>
                <p
                  className={`text-2xl font-bold ${themeClasses.text.primary}`}
                >
                  +12%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Guidelines */}
        <div
          className={`rounded-lg p-6 ${themeClasses.background.secondary} ${themeClasses.border.primary} border`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}
          >
            Implementation Guidelines
          </h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <Check
                className={`w-5 h-5 mr-3 mt-0.5 ${themeClasses.text.success}`}
              />
              <div>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  Always use theme-aware classes
                </p>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Every background, text, and border should have both light and
                  dark variants
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Check
                className={`w-5 h-5 mr-3 mt-0.5 ${themeClasses.text.success}`}
              />
              <div>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  Use consistent color patterns
                </p>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Stick to the predefined theme utility classes for consistency
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Check
                className={`w-5 h-5 mr-3 mt-0.5 ${themeClasses.text.success}`}
              />
              <div>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  Test interactive states
                </p>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Ensure hover, focus, and active states work in both themes
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <X className={`w-5 h-5 mr-3 mt-0.5 ${themeClasses.text.error}`} />
              <div>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  Avoid hard-coded colors
                </p>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Don't use fixed colors like "bg-white" without dark variants
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-8 p-4 rounded-lg ${themeClasses.background.tertiary}`}
        >
          <p className={`text-sm ${themeClasses.text.secondary}`}>
            Current theme:{" "}
            <span className={`font-semibold ${themeClasses.text.primary}`}>
              {theme}
            </span>
          </p>
          <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
            Theme switching is persistent and respects system preferences
          </p>
        </div>
      </div>
    </div>
  );
};
