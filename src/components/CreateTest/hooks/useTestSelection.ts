import { useState } from "react";
import type { TestFilters } from "../../../types";
import { DEFAULT_TEST_FILTERS } from "../utils/constants";
import { generateTestTitle } from "../utils/helpers";

export const useTestSelection = (
  subjects: Array<{ id: string; name: string }>
) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [testFilters, setTestFilters] =
    useState<TestFilters>(DEFAULT_TEST_FILTERS);
  const [testTitle, setTestTitle] = useState("");

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId];

      // Reset chapters when subjects change
      setSelectedChapters([]);

      // Update test title based on selected subjects
      const newTitle = generateTestTitle(newSelection, subjects);
      setTestTitle(newTitle);

      return newSelection;
    });
  };

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleFilterChange = (key: keyof TestFilters, value: any) => {
    setTestFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    selectedSubjects,
    selectedChapters,
    testFilters,
    testTitle,
    setSelectedSubjects,
    setSelectedChapters,
    setTestFilters,
    setTestTitle,
    handleSubjectToggle,
    handleChapterToggle,
    handleFilterChange,
  };
};
