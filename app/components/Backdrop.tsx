"use client";
import { useEffect, useRef } from "react";

// Site-wide ASCII wave: a fixed canvas behind everything, drawn by a worker (see backdrop.worker.ts) so the main
// thread stays free for scrolling. Scroll position and theme colour are forwarded to it. Sections with their own
// background cover it.
export default function Backdrop() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The canvas is created here (not in JSX) because transferControlToOffscreen works once per element, and
    // React strict mode runs this effect twice in dev.
    const cv = document.createElement("canvas");
    if (!("transferControlToOffscreen" in cv)) return; // shortcut: no backdrop on browsers without OffscreenCanvas, upgrade if that matters
    cv.className = "bg-canvas";
    cv.setAttribute("aria-hidden", "true");
    host.current!.appendChild(cv);

    const worker = new Worker(new URL("./backdrop.worker.ts", import.meta.url));
    const inkRgb = () => (getComputedStyle(document.body).color.match(/\d+/g) ?? ["16", "18", "19"]).slice(0, 3).map(Number);
    const off = cv.transferControlToOffscreen();
    worker.postMessage(
      { type: "init", canvas: off, dpr: Math.min(devicePixelRatio || 1, 1.5), w: innerWidth, h: innerHeight, ink: inkRgb(), still: matchMedia("(prefers-reduced-motion: reduce)").matches },
      [off],
    );

    let frame = 0;
    const onScroll = () => { frame ||= requestAnimationFrame(() => { frame = 0; worker.postMessage({ type: "scroll", y: scrollY }); }); };
    const onResize = () => worker.postMessage({ type: "resize", w: innerWidth, h: innerHeight });
    const onTheme = () => worker.postMessage({ type: "ink", ink: inkRgb() });
    const onVisible = () => worker.postMessage({ type: "visible", v: !document.hidden });

    const meta = document.querySelector('meta[name="color-scheme"]')!;
    const mo = new MutationObserver(onTheme);
    mo.observe(meta, { attributes: true });
    const dark = matchMedia("(prefers-color-scheme: dark)");
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisible);
    dark.addEventListener("change", onTheme);
    return () => {
      worker.terminate(); mo.disconnect(); cancelAnimationFrame(frame); cv.remove();
      removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible); dark.removeEventListener("change", onTheme);
    };
  }, []);

  return <div ref={host} aria-hidden="true" />;
}
