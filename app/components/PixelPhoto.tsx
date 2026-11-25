"use client";
import { useCallback, useEffect, useRef } from "react";

// The portrait starts as a coarse pixel mosaic and sharpens continuously as `amount` goes 0 -> 1.
// The mosaic resolution grows exponentially (16 -> 408 px across) and follows `amount` directly (the page's smooth scroll already
// eases it), so the photo is guaranteed to be fully sharp once amount reaches 1. Redrawn only when the resolution changes.
const W = 408, H = 448, MIN = 16;
const levelOf = (t: number) => (t >= 0.9 ? 0 : Math.round(MIN * Math.pow(W / MIN, t / 0.9))); // 0 = the real photo

function drawCover(
  ctx: CanvasRenderingContext2D,
  im: HTMLImageElement,
  dw: number,
  dh: number
) {
  const sw0 = im.naturalWidth || im.width;
  const sh0 = im.naturalHeight || im.height;
  if (!sw0 || !sh0) return;

  const targetRatio = dw / dh;
  const sourceRatio = sw0 / sh0;

  let sx = 0;
  let sy = 0;
  let sw = sw0;
  let sh = sh0;

  if (sourceRatio > targetRatio) {
    sw = sh0 * targetRatio;
    sx = (sw0 - sw) / 2;
  } else if (sourceRatio < targetRatio) {
    sh = sw0 / targetRatio;
    sy = (sh0 - sh) / 2;
  }

  ctx.drawImage(im, sx, sy, sw, sh, 0, 0, dw, dh);
}

function drawEmptyPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#141618";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(W - 24, H - 24);
  ctx.moveTo(W - 24, 24);
  ctx.lineTo(24, H - 24);
  ctx.stroke();

  ctx.fillStyle = "rgba(232, 234, 230, 0.55)";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PHOTO NOT SET", W / 2, H / 2);
}

export default function PixelPhoto({
  src,
  amount,
  alt,
}: {
  src: string | null;
  amount: number;
  alt: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const shown = useRef(-1);
  const latest = useRef(amount);
  latest.current = amount;

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const im = img.current;
    if (!im) {
      drawEmptyPlaceholder(ctx);
      return;
    }

    const level = levelOf(latest.current);
    if (level === shown.current) return;
    shown.current = level;

    if (!level) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawCover(ctx, im, W, H);
      return;
    }
    const off = document.createElement("canvas");
    off.width = level;
    off.height = Math.max(1, Math.round((level * H) / W));
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    drawCover(offCtx, im, off.width, off.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    img.current = null;
    shown.current = -1;

    if (!src) {
      draw();
      return;
    }

    let cancelled = false;
    let im: HTMLImageElement | null = null;

    const loadImage = () => {
      if (cancelled || im) return;
      im = new Image();
      im.crossOrigin = "anonymous";
      im.decoding = "async";
      im.src = src;
      im.onload = () => {
        if (cancelled) return;
        img.current = im;
        shown.current = -1;
        draw();
      };
      im.onerror = () => {
        if (cancelled) return;
        img.current = null;
        draw();
      };
    };

    if (typeof IntersectionObserver === "undefined") {
      loadImage();
      return () => {
        cancelled = true;
        if (im) {
          im.onload = null;
          im.onerror = null;
        }
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadImage();
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (im) {
        im.onload = null;
        im.onerror = null;
      }
    };
  }, [src, draw]);

  useEffect(draw, [amount, draw]);

  return <canvas ref={canvas} width={W} height={H} className="px-photo" role="img" aria-label={alt} />;
}
