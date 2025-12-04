/**
 * PDF Text Extraction
 */

import pdfParse from 'pdf-parse';
import logger, { loggers } from '../logger';

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    loggers.error('Failed to extract text from PDF', error as Error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from PDF URL
 */
export async function extractTextFromPDFUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return extractTextFromPDF(buffer);
  } catch (error) {
    loggers.error('Failed to extract text from PDF URL', error as Error);
    throw new Error('Failed to extract text from PDF URL');
  }
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return extractTextFromPDF(buffer);
  } catch (error) {
    loggers.error('Failed to extract text from PDF file', error as Error);
    throw new Error('Failed to extract text from PDF file');
  }
}
