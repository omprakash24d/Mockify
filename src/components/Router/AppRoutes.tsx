import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";

// Lazy load components to improve performance and prevent unnecessary re-renders
const Dashboard = React.lazy(() =>
  import("../Dashboard/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);
const NEETDashboard = React.lazy(() => import("../NEET/NEETDashboard"));
const NEETUIDemo = React.lazy(() =>
  import("../NEETTestUI/NEETUIDemo").then((module) => ({
    default: module.NEETUIDemo,
  }))
);

const ModernAdminDashboard = React.lazy(
  () => import("../AdminDashboard/ModernAdminDashboard")
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

interface AppRoutesProps {
  children?: React.ReactNode;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/neet" element={<NEETDashboard />} />
        <Route path="/neet-ui-demo" element={<NEETUIDemo />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <ModernAdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/create-test" element={<CreateTestWizard />} />
        <Route path="/test" element={<Navigate to="/create-test" replace />} />
        <Route path="/analytics" element={<Navigate to="/" replace />} />
        <Route path="/account" element={<EnhancedAccountManager />} />
        <Route path="/security" element={<SecurityDashboard />} />
        <Route path="/reset-password" element={<PasswordResetFlow />} />
        <Route path="/verify-email" element={<EmailVerificationFlow />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {children}
    </Suspense>
  );
};

export default AppRoutes;
