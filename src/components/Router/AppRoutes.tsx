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

const AdminPage = React.lazy(() =>
  import("../Admin/AdminPage").then((module) => ({
    default: module.AdminPage,
  }))
);
const StudentPage = React.lazy(() =>
  import("../Student/StudentPage").then((module) => ({
    default: module.StudentPage,
  }))
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

// AdminRoute removed - admin functionality now integrated into NEETUIDemo

interface AppRoutesProps {
  children?: React.ReactNode;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/neet" element={<NEETDashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
        {/* Legacy route - redirects to admin */}
        <Route
          path="/neet-ui-demo"
          element={<Navigate to="/admin" replace />}
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
