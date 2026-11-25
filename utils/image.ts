export interface OptimizeImageOptions {
  /** Maximum width or height in pixels. Aspect ratio is always preserved 1:1. */
  maxDimension?: number;
  /** WebP quality between 0 and 1. Default 0.88 keeps text and UI crisp without pixelation. */
  quality?: number;
}

export interface OptimizedImageResult {
  file: Blob;
  ext: string;
  contentType: string;
  width: number;
  height: number;
}

/**
 * Converts raster images (JPG, PNG, etc.) into WebP in the browser while
 * strictly preserving the original aspect ratio. Skips SVG and PDF files.
 */
export async function optimizeImageToWebP(
  input: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
  const { maxDimension = 1600, quality = 0.88 } = options;

  // Non-raster or vector files are uploaded as-is
  if (
    input.type === "image/svg+xml" ||
    input.type === "application/pdf" ||
    !input.type.startsWith("image/")
  ) {
    const ext = input.name.split(".").pop()?.toLowerCase() || "bin";
    return {
      file: input,
      ext,
      contentType: input.type || "application/octet-stream",
      width: 0,
      height: 0,
    };
  }

  const objectUrl = URL.createObjectURL(input);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Failed to decode image "${input.name}".`));
      el.src = objectUrl;
    });

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    if (!origW || !origH) {
      throw new Error(`Invalid dimensions for image "${input.name}".`);
    }

    // Preserve exact aspect ratio; only downscale if exceeding maxDimension
    const scale = Math.min(1, maxDimension / Math.max(origW, origH));
    const targetW = Math.max(1, Math.round(origW * scale));
    const targetH = Math.max(1, Math.round(origH * scale));

    // If already WebP, already within maxDimension, and reasonably small (< 180 KB), keep original
    if (input.type === "image/webp" && scale === 1 && input.size <= 180 * 1024) {
      return {
        file: input,
        ext: "webp",
        contentType: "image/webp",
        width: origW,
        height: origH,
      };
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("WebP conversion failed."));
        },
        "image/webp",
        quality
      );
    });

    // If original WebP was smaller than re-encoded blob and didn't need resizing, keep original
    if (input.type === "image/webp" && scale === 1 && input.size <= blob.size) {
      return {
        file: input,
        ext: "webp",
        contentType: "image/webp",
        width: origW,
        height: origH,
      };
    }

    return {
      file: blob,
      ext: "webp",
      contentType: "image/webp",
      width: targetW,
      height: targetH,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
