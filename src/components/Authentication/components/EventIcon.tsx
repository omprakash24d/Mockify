/**
 * Security Event Icon Component
 */

import {
  Activity,
  AlertTriangle,
  Lock,
  Shield,
  Unlock,
  UserX,
} from "lucide-react";
import React from "react";

interface EventIconProps {
  type: string;
}

export const EventIcon: React.FC<EventIconProps> = ({ type }) => {
  switch (type) {
    case "login_success":
      return <Unlock className="h-4 w-4 text-green-500" />;
    case "login_failure":
      return <Lock className="h-4 w-4 text-red-500" />;
    case "account_locked":
      return <UserX className="h-4 w-4 text-red-600" />;
    case "account_unlocked":
      return <Unlock className="h-4 w-4 text-blue-500" />;
    case "rate_limit_exceeded":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "password_change":
      return <Shield className="h-4 w-4 text-blue-500" />;
    case "mfa_enrollment":
      return <Shield className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export default EventIcon;
