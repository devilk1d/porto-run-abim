"use client";
import { useEffect, useState, type RefObject } from "react";
import { useMotionValue } from "motion/react";
import Lenis from "lenis";

// Pinned (scroll-jacked) sections only where there is room and motion is welcome; elsewhere they flow normally.
const PIN_QUERY = "(min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

let lenis: Lenis | null = null;

/** Smooth scrolling (Lenis). Skipped for reduced motion. Mounted once from the layout. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ autoRaf: true, duration: 1.35, gestureOrientation: "both", anchors: { offset: -88 } });
    return () => { lenis?.destroy(); lenis = null; };
  }, []);
  return null;
}

export function scrollToY(y: number, instant = false) {
  if (lenis) lenis.scrollTo(y, { immediate: instant });
  else window.scrollTo({ top: y, behavior: instant || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

/** Accurately scroll to a target section by ID or selector.
 *  Handles pinned sections (top = 0) vs normal sections (offset = 80px)
 *  and temporarily disables sticky speed brakes during smooth programmatic scrolls. */
export function scrollToTarget(target: string, instant = false) {
  if (target === "#top" || target === "top") {
    scrollToY(0, instant);
    return;
  }
  const el = document.querySelector(target) as HTMLElement | null;
  if (!el) return;

  const isPinned = el.classList.contains("is-pinned") ||
                   el.classList.contains("about-pin") ||
                   el.classList.contains("projects-pin") ||
                   el.id === "about" ||
                   el.id === "principles" ||
                   el.id === "work";

  // Position relative to document
  const rect = el.getBoundingClientRect();
  let top = rect.top + window.scrollY;

  // Pinned sections must land at top = 0 so their sticky containers engage properly without gaps
  if (!isPinned) {
    top = Math.max(0, top - 80);
  }

  if (instant) {
    scrollToY(Math.max(0, top), true);
    return;
  }

  // Smooth scroll: temporarily collapse stack-scroll heights in pinned sections
  // so the camera glides smoothly across the natural flow of sections without pausing/holding
  document.documentElement.classList.add("is-bypassing-stacks");
  if (lenis) lenis.resize();

  // Measure target in this collapsed document
  const collapsedRect = el.getBoundingClientRect();
  let collapsedTop = collapsedRect.top + window.scrollY;
  if (!isPinned) {
    collapsedTop = Math.max(0, collapsedTop - 80);
  }

  const cleanup = () => {
    document.documentElement.classList.remove("is-bypassing-stacks");
    if (lenis) {
      lenis.resize();
      const finalRect = el.getBoundingClientRect();
      let expandedTop = finalRect.top + window.scrollY;
      if (!isPinned) expandedTop = Math.max(0, expandedTop - 80);
      lenis.scrollTo(Math.max(0, expandedTop), { immediate: true });
    } else {
      const finalRect = el.getBoundingClientRect();
      let expandedTop = finalRect.top + window.scrollY;
      if (!isPinned) expandedTop = Math.max(0, expandedTop - 80);
      window.scrollTo(0, Math.max(0, expandedTop));
    }
  };

  if (lenis) {
    // Longer trips take longer (1.6–3.2s) and ease in and out, so the glide starts and lands softly.
    const dist = Math.abs(collapsedTop - window.scrollY);
    lenis.scrollTo(Math.max(0, collapsedTop), {
      duration: Math.min(3.2, 1.6 + dist / 3500),
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      onComplete: cleanup,
    });
  } else {
    window.scrollTo({ top: Math.max(0, collapsedTop), behavior: "smooth" });
    setTimeout(cleanup, 1800);
  }
}

/** Scroll so a pinned section sits at progress p (0–1). */
export function scrollToProgress(el: HTMLElement, p: number, instant = false) {
  const top = el.getBoundingClientRect().top + window.scrollY;
  scrollToY(top + p * (el.offsetHeight - window.innerHeight), instant);
}

export function usePinned() {
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const m = matchMedia(PIN_QUERY);
    const sync = () => setPinned(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return pinned;
}

/** Progress (0–1) of a pinned section: how far its tall wrapper has scrolled past the viewport.
 *  Measured straight from the element on every scroll/resize, so it never goes stale when the layout changes
 *  (fonts loading, the stack-bypass jump, the wrapper's height being set after mount). */
export function usePinProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = ref.current!;
    const update = () => {
      const r = el.getBoundingClientRect();
      const range = r.height - innerHeight;
      progress.set(range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { removeEventListener("scroll", update); removeEventListener("resize", update); ro.disconnect(); };
  }, [ref, progress]);
  return progress;
}
