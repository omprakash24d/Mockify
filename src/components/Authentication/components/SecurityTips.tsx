/**
 * Security Tips Component
 */

import { Shield } from "lucide-react";
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Card } from "../../ui/Card";

export const SecurityTips: React.FC = () => {
  const { classes } = useTheme();

  const accountSecurityTips = [
    "Use a strong, unique password",
    "Enable two-factor authentication when available",
    "Regularly review your security events",
    "Log out from shared devices",
  ];

  const platformFeatures = [
    "Automatic account lockout after failed attempts",
    "Rate limiting protects against abuse",
    "Real-time security event monitoring",
    "Input sanitization prevents XSS attacks",
  ];

  return (
    <Card className={`${classes.bg.primary} ${classes.border.default}`}>
      <div
        className={`${classes.bg.secondary} px-6 py-4 border-b ${classes.border.default}`}
      >
        <h2
          className={`text-xl font-semibold ${classes.text.primary} flex items-center gap-2`}
        >
          <Shield className="h-5 w-5" />
          Security Best Practices
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className={`font-medium ${classes.text.primary} mb-3`}>
              Account Security
            </h3>
            <ul className={`space-y-2 text-sm ${classes.text.secondary}`}>
              {accountSecurityTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-medium ${classes.text.primary} mb-3`}>
              Platform Features
            </h3>
            <ul className={`space-y-2 text-sm ${classes.text.secondary}`}>
              {platformFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SecurityTips;
