import { useState } from "react";
import { PDFGenerator } from "../../../services/pdfGenerator";
import type { Chapter, Question } from "../../../types";

export const usePDFGeneration = () => {
  const [pdfLoading, setPdfLoading] = useState(false);

  const generatePDF = async (
    questions: Question[],
    chapters: Chapter[],
    selectedChapters: string[],
    testTitle: string
  ) => {
    if (questions.length === 0) return;

    try {
      setPdfLoading(true);
      const pdfGenerator = new PDFGenerator();

      const selectedChapterObjects = chapters.filter((c) =>
        selectedChapters.includes(c.id)
      );

      pdfGenerator.downloadPDF(questions, {
        title: testTitle || "Mockify Test",
        chapter: selectedChapterObjects[0], // Use first chapter if multiple
        includeAnswers: false,
        includeSolutions: false,
        watermark: "MOCKIFY",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const generateAnswerKey = async (
    questions: Question[],
    chapters: Chapter[],
    selectedChapters: string[],
    testTitle: string
  ) => {
    if (questions.length === 0) return;

    try {
      setPdfLoading(true);
      const pdfGenerator = new PDFGenerator();

      const selectedChapterObjects = chapters.filter((c) =>
        selectedChapters.includes(c.id)
      );

      pdfGenerator.downloadPDF(
        questions,
        {
          title: `${testTitle || "Mockify Test"} - Answer Key`,
          chapter: selectedChapterObjects[0],
          includeAnswers: true,
          includeSolutions: true,
          watermark: "MOCKIFY - ANSWER KEY",
        },
        `${testTitle}_answer_key.pdf`
      );
    } catch (error) {
      console.error("Error generating answer key:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  return {
    pdfLoading,
    generatePDF,
    generateAnswerKey,
  };
};
