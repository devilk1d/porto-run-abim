"use client";
import { useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { useMotionValue } from "motion/react";
import Lenis from "lenis";

// Pinned (scroll-jacked) sections only where there is room and motion is welcome; elsewhere they flow normally.
const PIN_QUERY = "(min-width: 961px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)";

const NAV_CLEAR = 92; // where a section's content starts: below the navbar pill, which ends at ~76px
const EDGE_STRIP = 28; // height of the decorative edge strips that hang over neighbouring sections
let lenis: Lenis | null = null;
let isProgrammatic = false;
let programmaticTimer: number | null = null;

export function isProgrammaticScrolling(): boolean {
  return isProgrammatic;
}

export function setProgrammaticScrolling(durationMs = 1200) {
  isProgrammatic = true;
  if (programmaticTimer !== null) {
    clearTimeout(programmaticTimer);
  }
  programmaticTimer = window.setTimeout(() => {
    isProgrammatic = false;
    programmaticTimer = null;
  }, durationMs);
}

/** Smooth scrolling (Lenis). Skipped for reduced motion. Mounted once from the layout. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (pathname?.startsWith("/admin")) {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      return;
    }
    lenis = new Lenis({ autoRaf: true, duration: 1.35, gestureOrientation: "both", anchors: { offset: -88 } });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, [pathname]);
  return null;
}

export function scrollToY(y: number, instant = false) {
  if (lenis) lenis.scrollTo(y, { immediate: instant });
  else window.scrollTo({ top: y, behavior: instant || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

/** Accurately scroll to a target section by ID or selector.
 *  Handles pinned sections (top = 0) vs normal sections (offset = 80px). */
export function scrollToTarget(target: string, instant = false) {
  let top = 0;

  if (target !== "#top" && target !== "top" && target !== "/") {
    const selector = target.startsWith("#") ? target : `#${target}`;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    if (lenis) {
      lenis.resize();
    }

    const isPinned = el.classList.contains("is-pinned") ||
                     el.classList.contains("about-pin") ||
                     el.classList.contains("projects-pin") ||
                     el.id === "about" ||
                     el.id === "principles" ||
                     el.id === "projects" ||
                     el.id === "work";

    // Position relative to document
    const rect = el.getBoundingClientRect();
    top = rect.top + window.scrollY;

    // Pinned sections must land at top = 0 so their sticky containers engage properly without gaps.
    // Other sections: "want" is where the section's top edge should sit in the viewport (negative = above it).
    //  - shorter than the screen: centred;  - taller: its heading lands just below the navbar pill.
    // A partial sliver of the previous section's edge strip (the lime teeth are ~26px) looks like a glitch, so never leave less than a full strip showing.
    if (!isPinned) {
      const vh = window.innerHeight;
      // padding is stable; a heading's position is not (reveal animations shift it), so it is only the fallback for sections with no padding
      const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const h = el.querySelector("h1, h2");
      let want = rect.height < vh ? (vh - rect.height) / 2 : NAV_CLEAR - (pad || (h ? h.getBoundingClientRect().top - rect.top : 0));
      if (want > -EDGE_STRIP && want < EDGE_STRIP) want = -EDGE_STRIP;
      top = Math.max(0, Math.round(top - want));
    }
  } else if (lenis) {
    lenis.resize();
  }

  if (instant) {
    setProgrammaticScrolling(600);
    scrollToY(Math.max(0, top), true);
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    return;
  }

  const dist = Math.abs(top - window.scrollY);
  const duration = Math.min(2.6, Math.max(1.4, 1.2 + dist / 3600));
  setProgrammaticScrolling(Math.round(duration * 1000) + 150);

  if (lenis) {
    // Sine ease-in-out: peak velocity in the middle is only ~1.57x (vs 3.0x for cubic).
    // This eliminates the violent acceleration through intermediate sections,
    // making sections 1, 2, and 6 feel calm, steady, and natural without looking jumpy.
    const easing = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

    lenis.scrollTo(Math.max(0, top), {
      duration,
      easing,
    });
  } else {
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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
