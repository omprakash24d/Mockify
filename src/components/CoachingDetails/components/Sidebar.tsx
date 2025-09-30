import React from "react";
import type { ProgressCardProps } from "../types";
import { InfoCards } from "./InfoCards";
import { ProgressCard } from "./ProgressCard";

export const Sidebar: React.FC<ProgressCardProps> = ({
  coachingName,
  phoneNumber,
  coachingLogo,
}) => {
  return (
    <div className="space-y-6">
      <ProgressCard
        coachingName={coachingName}
        phoneNumber={phoneNumber}
        coachingLogo={coachingLogo}
      />
      <InfoCards />
    </div>
  );
};
