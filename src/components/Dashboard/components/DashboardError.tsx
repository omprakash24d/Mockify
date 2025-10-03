import React from "react";

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 neet-prep-font flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <div className="card-neet p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neet-error-100 flex items-center justify-center">
            <div className="w-8 h-8 text-neet-error-600">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="btn-neet-primary w-full py-3 text-lg"
            >
              Try Again
            </button>
            <button
              className="btn-neet-secondary w-full py-3 text-lg"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
