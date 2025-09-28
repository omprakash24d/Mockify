import jsPDF from "jspdf";
// import html2canvas from 'html2canvas'; // Reserved for future image rendering
import type { Chapter, Question, User } from "../types";

export interface PDFOptions {
  title: string;
  chapter?: Chapter;
  user?: User;
  includeAnswers: boolean;
  includeSolutions: boolean;
  watermark?: string;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 20;
  }

  private checkPageSpace(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private addTitle(title: string): void {
    this.pdf.setFontSize(20);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(title, this.pageWidth / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 15;
  }

  private addSubtitle(subtitle: string): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(subtitle, this.pageWidth / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 10;
  }

  private addUserInfo(user: User): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");

    if (user.coaching_name) {
      this.pdf.text(
        `Coaching: ${user.coaching_name}`,
        this.margin,
        this.currentY
      );
      this.currentY += 6;
    }

    this.pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      this.margin,
      this.currentY
    );
    this.currentY += 10;
  }

  private addQuestion(
    question: Question,
    index: number,
    options: PDFOptions
  ): void {
    const questionHeight = this.estimateQuestionHeight(question, options);
    this.checkPageSpace(questionHeight);

    // Question number and text
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(`Q${index + 1}.`, this.margin, this.currentY);

    this.pdf.setFont("helvetica", "normal");
    const lines = this.pdf.splitTextToSize(
      question.question_text,
      this.pageWidth - this.margin * 2 - 10
    );
    this.pdf.text(lines, this.margin + 10, this.currentY);
    this.currentY += lines.length * 5 + 5;

    // Add LaTeX if present
    if (question.question_media?.latex) {
      this.pdf.setFontSize(10);
      this.pdf.setFont("courier", "normal");
      this.pdf.text(
        `LaTeX: ${question.question_media.latex}`,
        this.margin + 10,
        this.currentY
      );
      this.currentY += 8;
    }

    // Options
    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "normal");
    question.options.forEach((option, optIndex) => {
      const optionText = `${option.label}) ${option.text}`;
      const optionLines = this.pdf.splitTextToSize(
        optionText,
        this.pageWidth - this.margin * 2 - 15
      );

      if (
        options.includeAnswers &&
        optIndex === question.correct_answer_index
      ) {
        this.pdf.setFont("helvetica", "bold");
        this.pdf.text("✓ ", this.margin + 10, this.currentY);
      }

      this.pdf.text(optionLines, this.margin + 15, this.currentY);
      this.currentY += optionLines.length * 5 + 2;

      if (
        options.includeAnswers &&
        optIndex === question.correct_answer_index
      ) {
        this.pdf.setFont("helvetica", "normal");
      }
    });

    // Solution
    if (options.includeSolutions && question.solution_explanation) {
      this.currentY += 3;
      this.pdf.setFontSize(10);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.text("Solution:", this.margin + 10, this.currentY);
      this.currentY += 5;

      this.pdf.setFont("helvetica", "normal");
      const solutionLines = this.pdf.splitTextToSize(
        question.solution_explanation,
        this.pageWidth - this.margin * 2 - 15
      );
      this.pdf.text(solutionLines, this.margin + 15, this.currentY);
      this.currentY += solutionLines.length * 4 + 5;
    }

    // Marks info
    this.pdf.setFontSize(9);
    this.pdf.setFont("helvetica", "italic");
    this.pdf.text(
      `[Marks: +${question.marks}, ${question.negative_marks}]`,
      this.pageWidth - this.margin - 30,
      this.currentY
    );

    this.currentY += 15;
  }

  private estimateQuestionHeight(
    question: Question,
    options: PDFOptions
  ): number {
    let height = 0;

    // Question text
    const questionLines = Math.ceil(question.question_text.length / 80);
    height += questionLines * 5 + 10;

    // LaTeX
    if (question.question_media?.latex) {
      height += 8;
    }

    // Options
    question.options.forEach((option) => {
      const optionLines = Math.ceil(option.text.length / 70);
      height += optionLines * 5 + 2;
    });

    // Solution
    if (options.includeSolutions && question.solution_explanation) {
      const solutionLines = Math.ceil(
        question.solution_explanation.length / 80
      );
      height += solutionLines * 4 + 10;
    }

    return height + 20; // Add some padding
  }

  private addWatermark(text: string): void {
    const totalPages = this.pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(40);
      this.pdf.setTextColor(200, 200, 200);
      this.pdf.text(text, this.pageWidth / 2, this.pageHeight / 2, {
        align: "center",
        angle: 45,
      });
    }

    // Reset color
    this.pdf.setTextColor(0, 0, 0);
  }

  public async generatePDF(
    questions: Question[],
    options: PDFOptions
  ): Promise<Blob> {
    try {
      // Title page
      this.addTitle(options.title);

      if (options.chapter) {
        this.addSubtitle(`Chapter: ${options.chapter.chapter_name}`);
        this.addSubtitle(`Subject: ${options.chapter.subject_id}`);
      }

      if (options.user) {
        this.addUserInfo(options.user);
      }

      this.addSubtitle(`Total Questions: ${questions.length}`);
      this.currentY += 10;

      // Add questions
      questions.forEach((question, index) => {
        this.addQuestion(question, index, options);
      });

      // Add watermark if specified
      if (options.watermark) {
        this.addWatermark(options.watermark);
      }

      // Return PDF as blob
      return new Promise((resolve) => {
        const pdfBlob = this.pdf.output("blob");
        resolve(pdfBlob);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  public downloadPDF(
    questions: Question[],
    options: PDFOptions,
    filename?: string
  ): void {
    this.generatePDF(questions, options).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `${options.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }
}
