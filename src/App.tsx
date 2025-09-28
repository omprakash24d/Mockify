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

// Inner App component that uses auth context
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 transition-all duration-500">
        <Navbar user={user} />
        <main className="pt-16">
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
