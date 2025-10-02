import { useEffect, useState } from "react";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Services
import UserProfileService from "./lib/user-profile";

// Components
import { AuthScreen } from "./components/Authentication";
import { CoachingDetailsModal } from "./components/CoachingDetails";
import EmailVerificationBanner from "./components/EmailVerification/EmailVerificationBanner";
import EmailVerificationFlow from "./components/EmailVerification/EmailVerificationFlow";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Navbar } from "./components/Navbar/index";
import {
  NetworkErrorBoundary,
  NetworkStatus,
} from "./components/NetworkStatus";
import PasswordResetFlow from "./components/PasswordReset/PasswordResetFlow";
import AppRouter from "./components/Router/AppRouter";

// Types
import type { CoachingDetailsFormData } from "./lib/validations";
// Hooks
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";

// Inner App component that uses auth context
const AppContent = () => {
  const { user, loading } = useAuth();
  const [needsCoachingDetails, setNeedsCoachingDetails] =
    useState<boolean>(false);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(false);

  // Monitor performance in production
  usePerformanceMonitor();

  // Handle Google redirect result on app initialization
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const { enhancedAuthService } = await import(
          "./components/Authentication/utils/enhancedAuthService"
        );
        const result = await enhancedAuthService.handleGoogleRedirectResult();
        if (result) {
          console.log("✅ Google redirect authentication completed");
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    handleRedirectResult();
  }, []);

  // Check if authenticated user needs coaching details
  useEffect(() => {
    const checkCoachingDetails = async () => {
      if (user && user.emailVerified) {
        setCheckingProfile(true);
        try {
          const needsDetails = await UserProfileService.needsCoachingDetails(
            user
          );
          setNeedsCoachingDetails(needsDetails);
        } catch (error) {
          console.error("Error checking coaching details:", error);
          setNeedsCoachingDetails(false);
        } finally {
          setCheckingProfile(false);
        }
      } else {
        setNeedsCoachingDetails(false);
        setCheckingProfile(false);
      }
    };

    checkCoachingDetails();
  }, [user]);

  if (loading || checkingProfile) {
    return <LoadingSpinner />;
  }

  // Handle coaching details completion
  const handleCoachingDetailsComplete = async (
    details: CoachingDetailsFormData
  ) => {
    if (!user) return;

    try {
      await UserProfileService.updateUserProfile(user.uid, details);
      setNeedsCoachingDetails(false);
      console.log("✅ Coaching details completed from App level");
    } catch (error) {
      console.error("Error updating coaching details:", error);
    }
  };

  if (!user) {
    // Check if we're on special routes
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (currentPath === "/reset-password") {
      return <PasswordResetFlow />;
    }
    if (
      currentPath === "/verify-email" ||
      searchParams.get("mode") === "verifyEmail"
    ) {
      return <EmailVerificationFlow />;
    }
    return <AuthScreen />;
  }

  // Check if user needs email verification
  if (user && !user.emailVerified) {
    const currentPath = window.location.pathname;
    if (currentPath !== "/verify-email") {
      return <EmailVerificationFlow />;
    }
  }

  // Check if authenticated user needs to complete coaching details
  if (user && user.emailVerified) {
    // This will be handled by showing the coaching modal overlay
    // The main app will render but with the modal on top
  }

  return (
    <NetworkErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <NetworkStatus />
        <Navbar user={user} />
        <EmailVerificationBanner />
        <main
          className={`${
            user && !user.emailVerified ? "pt-28" : "pt-16"
          } transition-all duration-300 ease-in-out`}
        >
          <div className="min-h-[calc(100vh-4rem)]">
            <AppRouter>
              {/* Coaching Details Modal - shown as overlay when needed */}
              {needsCoachingDetails && (
                <CoachingDetailsModal
                  isOpen={needsCoachingDetails}
                  onComplete={handleCoachingDetailsComplete}
                  initialData={{}}
                  title="Complete Your Profile"
                  subtitle="Please provide your coaching details to continue"
                />
              )}
            </AppRouter>
          </div>
        </main>
      </div>
    </NetworkErrorBoundary>
  );
};

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
