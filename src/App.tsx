import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import { AuthScreen } from "./components/AuthScreen";
import { CreateTestWizard } from "./components/CreateTestWizard";
import { Dashboard } from "./components/Dashboard";
import { EnhancedAccountManager } from "./components/EnhancedAccountManager";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Navbar } from "./components/Navbar";
import { SecurityDashboard } from "./components/SecurityDashboard";
// Hooks
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";

// Inner App component that uses auth context
const AppContent = () => {
  const { user, loading } = useAuth();

  // Monitor performance in production
  usePerformanceMonitor();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 ease-in-out">
        <Navbar user={user} />
        <main className="pt-16 transition-all duration-300 ease-in-out">
          <div className="min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create-test" element={<CreateTestWizard />} />
              <Route path="/account" element={<EnhancedAccountManager />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        {/* Debug components removed - theme toggle is working */}
      </div>
    </Router>
  );
};

// Main App component with providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
