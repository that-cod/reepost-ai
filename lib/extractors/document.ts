/**
 * Document Text Extraction (DOCX, etc.)
 */

import mammoth from 'mammoth';
import logger, { loggers } from '../logger';

/**
 * Extract text from DOCX buffer
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    loggers.error('Failed to extract text from DOCX', error as Error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from DOCX URL
 */
export async function extractTextFromDocxUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return extractTextFromDocx(buffer);
  } catch (error) {
    loggers.error('Failed to extract text from DOCX URL', error as Error);
    throw new Error('Failed to extract text from DOCX URL');
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return extractTextFromDocx(buffer);
  } catch (error) {
    loggers.error('Failed to extract text from DOCX file', error as Error);
    throw new Error('Failed to extract text from DOCX file');
  }
}
