"use client";
import { useCallback, useEffect, useRef } from "react";

// The portrait starts as a coarse pixel mosaic and sharpens continuously as `amount` goes 0 → 1.
// The mosaic resolution grows exponentially (16 → 408 px across) and follows `amount` directly (the page's smooth scroll already
// eases it), so the photo is guaranteed to be fully sharp once amount reaches 1. Redrawn only when the resolution changes.
const W = 408, H = 448, MIN = 16;
const levelOf = (t: number) => (t >= 0.9 ? 0 : Math.round(MIN * Math.pow(W / MIN, t / 0.9))); // 0 = the real photo

export default function PixelPhoto({ amount, alt }: { amount: number; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const shown = useRef(-1);
  const latest = useRef(amount);
  latest.current = amount;

  const draw = useCallback(() => {
    const im = img.current, c = canvas.current;
    if (!im || !c) return;
    const level = levelOf(latest.current);
    if (level === shown.current) return;
    shown.current = level;
    const ctx = c.getContext("2d")!;
    if (!level) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(im, 0, 0, W, H);
      return;
    }
    const off = document.createElement("canvas");
    off.width = level;
    off.height = Math.max(1, Math.round((level * H) / W));
    off.getContext("2d")!.drawImage(im, 0, 0, off.width, off.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);
  }, []);

  useEffect(() => {
    const im = new Image();
    im.src = "/portrait.jpg";
    im.onload = () => { img.current = im; shown.current = -1; draw(); };
    return () => { im.onload = null; };
  }, [draw]);

  useEffect(draw, [amount, draw]);

  return <canvas ref={canvas} width={W} height={H} className="px-photo" role="img" aria-label={alt} />;
}
