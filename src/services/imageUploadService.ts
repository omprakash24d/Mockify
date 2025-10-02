import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../lib/firebase";

export interface ImageUploadResult {
  url: string;
  path: string;
  filename: string;
}

export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  private static readonly STORAGE_PATH = "question-images";

  /**
   * Upload an image file to Firebase Storage
   */
  static async uploadImage(
    file: File,
    questionId?: string,
    imageIndex?: number
  ): Promise<ImageUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = questionId
        ? `${questionId}_${imageIndex || 0}_${timestamp}.${extension}`
        : `temp_${timestamp}.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `${this.STORAGE_PATH}/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        filename: filename,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    }
  }

  /**
   * Upload multiple images for a question
   */
  static async uploadMultipleImages(
    files: File[],
    questionId?: string
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], questionId, i);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        // Continue uploading other images even if one fails
      }
    }

    return results;
  }

  /**
   * Delete an image from Firebase Storage
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Image deletion error:", error);
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Delete multiple images
   */
  static async deleteMultipleImages(imagePaths: string[]): Promise<void> {
    const deletePromises = imagePaths.map((path) => this.deleteImage(path));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    // Check if file is actually an image
    if (!file.type.startsWith("image/")) {
      throw new Error("Selected file is not an image");
    }
  }

  /**
   * Compress image before upload (optional utility)
   */
  static async compressImage(
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail from image
   */
  static async generateThumbnail(
    file: File,
    width: number = 150,
    height: number = 150
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = width;
      canvas.height = height;

      img.onload = () => {
        // Calculate scaling to cover the thumbnail area
        const scale = Math.max(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);

        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataURL);
      };

      img.onerror = () => reject(new Error("Failed to generate thumbnail"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Extract metadata from image
   */
  static async getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    name: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        });
      };

      img.onerror = () => reject(new Error("Failed to read image metadata"));
      img.src = URL.createObjectURL(file);
    });
  }
}

export default ImageUploadService;
