import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Components
import { EnhancedAccountManager } from "./components/AccountManager";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthScreen } from "./components/Authentication";
import { SecurityDashboard } from "./components/Authentication/SecurityDashboard";
import { CreateTestWizard } from "./components/CreateTest";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Navbar } from "./components/Navbar/index";
import NEETDashboard from "./components/NEET/NEETDashboard.tsx";
// Hooks
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";

// Inner App component that uses auth context
const AppContent = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

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
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
        }`}
      >
        <Navbar user={user} />
        <main className="pt-16 transition-all duration-300 ease-in-out">
          <div className="min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/neet" element={<NEETDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/create-test" element={<CreateTestWizard />} />
              <Route path="/account" element={<EnhancedAccountManager />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
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
