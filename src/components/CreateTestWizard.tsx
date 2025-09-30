import React from "react";
import { CreateTestWizard as ModularCreateTestWizard } from "./CreateTest";

// Re-export the modular version
export const CreateTestWizard: React.FC = () => {
  return <ModularCreateTestWizard />;
};
