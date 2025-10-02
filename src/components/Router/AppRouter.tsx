import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";

// Lazy load components to improve performance and prevent unnecessary re-renders
const Dashboard = React.lazy(() =>
  import("../Dashboard/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);
const NEETDashboard = React.lazy(() => import("../NEET/NEETDashboard"));
const EnhancedAdminDashboard = React.lazy(
  () => import("../AdminDashboard/EnhancedAdminDashboard")
);
const CreateTestWizard = React.lazy(() =>
  import("../CreateTest").then((module) => ({
    default: module.CreateTestWizard,
  }))
);
const EnhancedAccountManager = React.lazy(() =>
  import("../AccountManager").then((module) => ({
    default: module.EnhancedAccountManager,
  }))
);
const SecurityDashboard = React.lazy(() =>
  import("../Authentication/SecurityDashboard").then((module) => ({
    default: module.SecurityDashboard,
  }))
);
const PasswordResetFlow = React.lazy(
  () => import("../PasswordReset/PasswordResetFlow")
);
const EmailVerificationFlow = React.lazy(
  () => import("../EmailVerification/EmailVerificationFlow")
);

// Import AdminRoute (not lazy as it's a wrapper)
import { AdminRoute } from "../../middleware/adminAuth";

interface AppRouterProps {
  children?: React.ReactNode;
}

const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/neet" element={<NEETDashboard />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <EnhancedAdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/create-test" element={<CreateTestWizard />} />
          <Route path="/account" element={<EnhancedAccountManager />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/reset-password" element={<PasswordResetFlow />} />
          <Route path="/verify-email" element={<EmailVerificationFlow />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {children}
      </Suspense>
    </Router>
  );
};

export default AppRouter;
