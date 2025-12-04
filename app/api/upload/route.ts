/**
 * File Upload API
 * POST /api/upload - Upload file to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { uploadFile } from '@/lib/supabase';
import { extractTextFromFile } from '@/lib/extractors';

/**
 * POST /api/upload - Upload file
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();

    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'media';
    const extractText = formData.get('extractText') === 'true';

    if (!file) {
      return NextResponse.json(
        {
          error: {
            message: 'No file provided',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Upload to Supabase
    const url = await uploadFile(
      file,
      user.id,
      folder as 'images' | 'documents' | 'media'
    );

    // Extract text if requested
    let extractedText: string | undefined;
    if (extractText) {
      try {
        const result = await extractTextFromFile(file);
        extractedText = result.text;
      } catch (error) {
        // Don't fail upload if extraction fails
        console.error('Text extraction failed:', error);
      }
    }

    return NextResponse.json({
      url,
      extractedText,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
