"use client";
import { useEffect, useRef } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { scrollToTarget } from "./scroll";

/** In-page link that scrolls with the same animated, pin-aware scroll as the navbar (a plain #hash link jumps). */
export function ScrollLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a className={className} href={href} onClick={(e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let "open in new tab" through
      e.preventDefault();
      e.stopPropagation(); // Lenis also listens for #links and would scroll with its own, near-instant easing
      history.replaceState(history.state, "", `${location.pathname}${href}`);
      sessionStorage.setItem("lastSection", href);
      scrollToTarget(href);
    }}>{children}</a>
  );
}

/** Element drifts toward the pointer while hovered (fine pointers only, no reduced motion). */
export function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });
  const ok = useRef(false);
  useEffect(() => { ok.current = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches; }, []);
  return (
    <m.span ref={ref} className="magnetic" style={{ x, y }}
      onPointerMove={(e) => {
        if (!ok.current) return;
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left - r.width / 2) * strength);
        my.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}>
      {children}
    </m.span>
  );
}

/** Section links with live scrollspy (IntersectionObserver, so it follows smooth scrolling as it happens).
 *  The sliding pill is CSS anchor positioning; browsers without it get the same slide from measured --pill-x/--pill-w. */
export function NavLinks({ links, onNavigate, activeHref }: { links: [string, string][]; onNavigate?: (href: string) => void; activeHref?: string }) {
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = nav.current!;
    const anchors = [...el.querySelectorAll("a")];
    const native = CSS.supports("position-anchor: --a");
    let current: string | null = activeHref ? activeHref.replace(/^#/, "") : null;
    const place = () => {
      const a = anchors.find((x) => x.getAttribute("href") === `#${current}`);
      if (native || !a) return;
      el.style.setProperty("--pill-x", `${a.offsetLeft}px`);
      el.style.setProperty("--pill-w", `${a.offsetWidth}px`);
    };
    const mark = (id: string | null) => {
      current = id;
      anchors.forEach((a) => {
        if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      place();
    };

    if (activeHref !== undefined) {
      mark(activeHref.replace(/^#/, ""));
      addEventListener("resize", place);
      return () => removeEventListener("resize", place);
    }

    const visible = new Map<string, number>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visible.set(e.target.id, e.intersectionRatio) : visible.delete(e.target.id)));
      // the section crossing the viewport's middle wins; none (e.g. the hero) clears the indicator
      const first = links.map(([, h]) => h.slice(1)).find((id) => visible.has(id));
      mark(first ?? null);
    }, { rootMargin: "-45% 0px -45% 0px" });
    links.forEach(([, h]) => { const s = document.querySelector(h); if (s) io.observe(s); });
    addEventListener("resize", place);
    return () => { io.disconnect(); removeEventListener("resize", place); };
  }, [links, activeHref]);
  return (
    <nav ref={nav} aria-label="Sections">
      {links.map(([l, h]) => (
        <a
          key={h}
          href={h}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onNavigate) {
              onNavigate(h);
            } else {
              scrollToTarget(h);
            }
          }}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
