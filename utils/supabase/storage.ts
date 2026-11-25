import { createClient } from "./client";
import { optimizeImageToWebP, type OptimizeImageOptions } from "../image";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UploadOptimizedImageParams extends OptimizeImageOptions {
  file: File;
  bucket: "about" | "certificates" | "projects";
  folder: string;
  uniquePrefix?: string;
}

/** Validates file size, converts raster images to WebP, uploads to Supabase Storage, and returns its public URL. */
export async function uploadOptimizedImage({
  file,
  bucket,
  folder,
  uniquePrefix,
  maxDimension = 1600,
  quality = 0.88,
}: UploadOptimizedImageParams): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File "${file.name}" exceeds 10MB limit.`);
  }

  const supabase = createClient();
  const optimized = await optimizeImageToWebP(file, { maxDimension, quality });
  const cleanName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const stamp = uniquePrefix ? `${Date.now()}-${uniquePrefix}` : `${Date.now()}`;
  const filePath = `${folder}/${stamp}-${cleanName}.${optimized.ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(filePath, optimized.file, {
      upsert: true,
      contentType: optimized.contentType,
      cacheControl: "31536000",
    });

  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return urlData.publicUrl;
}
