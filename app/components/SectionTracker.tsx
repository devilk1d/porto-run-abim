"use client";

import { useEffect, useRef } from "react";
import { isProgrammaticScrolling, scrollToTarget, setProgrammaticScrolling } from "./scroll";

const SECTIONS = [
  "top",
  "statement",
  "about",
  "experience",
  "stack",
  "projects",
  "certificates",
  "process",
  "contact",
] as const;

export default function SectionTracker() {
  const currentActiveRef = useRef<string>("top");

  useEffect(() => {
    // 1. Initial scroll check on page mount
    const initialHash = window.location.hash;
    const lastSaved = sessionStorage.getItem("lastSection");

    const targetSection = initialHash && initialHash !== "#top"
      ? initialHash
      : (document.referrer.includes("/all-certificates") || document.referrer.includes("/certificates") || document.referrer.includes("/all-projects") || document.referrer.includes("/projects")) && lastSaved && lastSaved !== "#top" && lastSaved !== "/"
      ? lastSaved
      : null;

    let rafId = 0;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;

    if (targetSection) {
      currentActiveRef.current = targetSection.replace(/^#/, "");
      if (!initialHash && targetSection.startsWith("#") && typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", targetSection);
      }
      setProgrammaticScrolling(1500);

      // Instant jump directly to target
      scrollToTarget(targetSection, true);
      rafId = requestAnimationFrame(() => {
        scrollToTarget(targetSection, true);
      });
      t1 = setTimeout(() => scrollToTarget(targetSection, true), 60);
      t2 = setTimeout(() => scrollToTarget(targetSection, true), 180);
    }

    // 2. Handle browser Back / Forward (hashchange & popstate)
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash && hash !== "#top") {
        currentActiveRef.current = hash.replace(/^#/, "");
        scrollToTarget(hash, true);
        sessionStorage.setItem("lastSection", hash);
      } else {
        currentActiveRef.current = "top";
        scrollToTarget("#top", true);
        sessionStorage.setItem("lastSection", "#top");
      }
    };

    window.addEventListener("hashchange", handlePopState);
    window.addEventListener("popstate", handlePopState);

    // 3. Scroll spy for live section tracking
    let frame = 0;
    const determineActiveSection = (): string => {
      const scrollY = window.scrollY;
      if (scrollY < 120) return "top";
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 60) {
        return "contact";
      }

      const anchor = window.innerHeight * 0.38;

      // Check each section container
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const id = SECTIONS[i];
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor && rect.bottom > anchor) {
          return id;
        }
      }

      // Fallback: section top closest to anchor
      let bestId = "top";
      let minDiff = Infinity;
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor) {
          const diff = anchor - rect.top;
          if (diff < minDiff) {
            minDiff = diff;
            bestId = id;
          }
        }
      }
      return bestId;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (isProgrammaticScrolling() || window.location.pathname !== "/") return;

        const activeId = determineActiveSection();
        if (activeId !== currentActiveRef.current) {
          currentActiveRef.current = activeId;
          const hash = activeId === "top" ? "" : `#${activeId}`;
          const newUrl = hash ? `${window.location.pathname}${hash}` : window.location.pathname;

          window.history.replaceState(window.history.state, "", newUrl);
          sessionStorage.setItem("lastSection", hash || "#top");
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("hashchange", handlePopState);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}
