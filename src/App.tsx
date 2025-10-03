import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
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
import { AppRoutes } from "./components/Router";
import { AuthProvider, ThemeProvider, useAuth } from "./contexts";
import { Footer } from "./Footer";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";
import UserProfileService from "./lib/user-profile";
import type { CoachingDetailsFormData } from "./lib/validations";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [needsCoachingDetails, setNeedsCoachingDetails] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  usePerformanceMonitor();

  // Handle Google redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const { enhancedAuthService } = await import(
          "./components/Authentication/utils/enhancedAuthService"
        );
        const result = await enhancedAuthService.handleGoogleRedirectResult();
        if (result) console.log("✅ Google redirect completed");
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };
    handleRedirectResult();
  }, []);

  // Check coaching details requirement
  useEffect(() => {
    const checkCoachingDetails = async () => {
      if (!user?.emailVerified) {
        setNeedsCoachingDetails(false);
        setCheckingProfile(false);
        return;
      }

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
    };
    checkCoachingDetails();
  }, [user]);

  const handleCoachingDetailsComplete = async (
    details: CoachingDetailsFormData
  ) => {
    if (!user) return;
    try {
      await UserProfileService.updateUserProfile(user.uid, details);
      setNeedsCoachingDetails(false);
      console.log("✅ Coaching details completed");
    } catch (error) {
      console.error("Error updating coaching details:", error);
    }
  };

  // Show loading spinner
  if (loading || checkingProfile) {
    return <LoadingSpinner message="Loading your account..." />;
  }

  // Handle unauthenticated users
  if (!user) {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === "/reset-password") return <PasswordResetFlow />;
    if (path === "/verify-email" || params.get("mode") === "verifyEmail") {
      return <EmailVerificationFlow />;
    }
    return <AuthScreen />;
  }

  // Handle unverified email
  if (!user.emailVerified && window.location.pathname !== "/verify-email") {
    return <EmailVerificationFlow />;
  }

  return (
    <NetworkErrorBoundary>
      <div className="min-h-screen bg-gray-50 neet-prep-font transition-colors">
        <NetworkStatus />
        <Navbar user={user} />
        <EmailVerificationBanner />

        <main className={user.emailVerified ? "pt-[104px]" : "pt-[140px]"}>
          <div className="min-h-[calc(100vh-6.5rem)]">
            <AppRoutes>
              {needsCoachingDetails && (
                <CoachingDetailsModal
                  isOpen={needsCoachingDetails}
                  onComplete={handleCoachingDetailsComplete}
                  initialData={{}}
                  title="Complete Your Profile"
                  subtitle="Please provide your coaching details to continue"
                />
              )}
            </AppRoutes>
          </div>
          <Footer />
        </main>
      </div>
    </NetworkErrorBoundary>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
