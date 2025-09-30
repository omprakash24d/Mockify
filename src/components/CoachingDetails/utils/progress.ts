import type { ProgressItem } from "../types";

/**
 * Gets progress items with their completion status
 */
export const getProgressItems = (
  coachingName: string,
  phoneNumber: string,
  coachingLogo: string
): ProgressItem[] => {
  return [
    {
      id: "coaching-name",
      label: "Institute Name",
      isCompleted: !!coachingName.trim(),
      isRequired: true,
    },
    {
      id: "phone-number",
      label: "Phone Number",
      isCompleted: phoneNumber.trim().length >= 10,
      isRequired: true,
    },
    {
      id: "coaching-logo",
      label: "Logo (Optional)",
      isCompleted: !!coachingLogo,
      isRequired: false,
    },
  ];
};

/**
 * Calculates the overall completion percentage
 */
export const calculateProgress = (
  coachingName: string,
  phoneNumber: string
): number => {
  const requiredItems = getProgressItems(coachingName, phoneNumber, "").filter(
    (item) => item.isRequired
  );

  const completedRequiredItems = requiredItems.filter(
    (item) => item.isCompleted
  );

  return Math.round(
    (completedRequiredItems.length / requiredItems.length) * 100
  );
};

/**
 * Gets the number of completed required items
 */
export const getCompletedRequiredCount = (
  coachingName: string,
  phoneNumber: string
): number => {
  return getProgressItems(coachingName, phoneNumber, "").filter(
    (item) => item.isRequired && item.isCompleted
  ).length;
};

/**
 * Gets the total number of required items
 */
export const getTotalRequiredCount = (): number => {
  return 2; // coachingName and phoneNumber are required
};
