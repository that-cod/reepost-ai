/**
 * Supabase Client for Storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'easygen-uploads';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  userId: string,
  folder: 'images' | 'documents' | 'media' = 'media'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Upload buffer to Supabase Storage
 */
export async function uploadBuffer(
  buffer: Buffer,
  userId: string,
  fileName: string,
  folder: 'images' | 'documents' | 'media' = 'media'
): Promise<string> {
  const filePath = `${userId}/${folder}/${Date.now()}-${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload buffer: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  // Extract path from URL
  const url = new URL(fileUrl);
  const path = url.pathname.split(`${STORAGE_BUCKET}/`)[1];

  if (!path) {
    throw new Error('Invalid file URL');
  }

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files for a user
 */
export async function listUserFiles(
  userId: string,
  folder?: string
): Promise<string[]> {
  const path = folder ? `${userId}/${folder}` : userId;

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .list(path);

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data.map((file) => file.name);
}
