"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB pre-compression guard
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Validates, compresses, and uploads a progress photo to the `photos` bucket
 * under `{userId}/{dayNumber}-{ts}.webp`. Returns a public URL.
 */
export async function uploadProgressPhoto(
  file: File,
  userId: string,
  dayNumber: number,
): Promise<UploadResult> {
  if (!ACCEPTED.includes(file.type)) {
    return { error: "Use a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image is over 5MB — pick a smaller one." };
  }

  let compressed: File;
  try {
    compressed = await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1440,
      useWebWorker: true,
      fileType: "image/webp",
    });
  } catch {
    return { error: "Could not process that image." };
  }

  const supabase = createClient();
  // Stable-ish name without Math.random(): user + day + size + lastModified.
  const path = `${userId}/${dayNumber}-${compressed.size}-${file.lastModified}.webp`;

  const { error } = await supabase.storage.from("photos").upload(path, compressed, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return { url: data.publicUrl };
}
