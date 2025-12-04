/**
 * Text Extraction Utilities
 * Aggregates all extraction methods
 */

import { extractTextFromPDF, extractTextFromPDFUrl, extractTextFromPDFFile } from './pdf';
import { extractTextFromDocx, extractTextFromDocxUrl, extractTextFromDocxFile } from './document';
import { extractTextFromImage } from '../ai';
import logger from '../logger';

export interface ExtractionResult {
  text: string;
  type: 'pdf' | 'docx' | 'image' | 'unknown';
}

/**
 * Extract text from file based on type
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // PDF
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      const text = await extractTextFromPDFFile(file);
      return { text, type: 'pdf' };
    }

    // DOCX
    if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('msword') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      const text = await extractTextFromDocxFile(file);
      return { text, type: 'docx' };
    }

    // Images (using AI vision)
    if (fileType.includes('image')) {
      // Upload to temporary storage first
      const formData = new FormData();
      formData.append('file', file);

      // Create object URL for local processing
      const objectUrl = URL.createObjectURL(file);
      const text = await extractTextFromImage(objectUrl);
      URL.revokeObjectURL(objectUrl);

      return { text, type: 'image' };
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    logger.error('Failed to extract text from file', {
      error,
      fileType,
      fileName,
    } as any);
    throw error;
  }
}

/**
 * Extract text from URL based on type
 */
export async function extractTextFromUrl(url: string): Promise<ExtractionResult> {
  const urlLower = url.toLowerCase();

  try {
    // PDF
    if (urlLower.includes('.pdf')) {
      const text = await extractTextFromPDFUrl(url);
      return { text, type: 'pdf' };
    }

    // DOCX
    if (urlLower.includes('.docx') || urlLower.includes('.doc')) {
      const text = await extractTextFromDocxUrl(url);
      return { text, type: 'docx' };
    }

    // Images
    if (
      urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/) ||
      urlLower.includes('image')
    ) {
      const text = await extractTextFromImage(url);
      return { text, type: 'image' };
    }

    throw new Error(`Unsupported URL type: ${url}`);
  } catch (error) {
    logger.error('Failed to extract text from URL', {
      error,
      url,
    } as any);
    throw error;
  }
}

// Re-export individual functions
export {
  extractTextFromPDF,
  extractTextFromPDFUrl,
  extractTextFromPDFFile,
  extractTextFromDocx,
  extractTextFromDocxUrl,
  extractTextFromDocxFile,
  extractTextFromImage,
};
