"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { scrollToY, scrollToTarget, setProgrammaticScrolling } from "./scroll";

/* Pixel-wipe page transition (the site's own look: the 28px pixel grid of the ABIM mark).
 *
 *   <PageTransitionProvider> once in the root layout, then anywhere:
 *   <TransitionLink href="/projects" label="projects">…</TransitionLink>      // drop-in for next/link
 *   const { go } = usePageTransition(); go("/projects", "projects");           // from code
 *
 * Squares sweep in diagonally from the top-left until the screen is covered, the route changes underneath,
 * then the same sweep uncovers the new page. Reduced motion: plain navigation, no overlay. */

type Phase = "idle" | "in" | "out";
const CELL = 84;      // px, target square size
const STEP = 16;      // ms between diagonals
const CELL_MS = 360;  // ms for one square to grow or shrink
const HOLD_MS = 700;   // how long the label stays readable once the screen is covered
const SAFETY_MS = 3000;

const Ctx = createContext<{ go: (href: string, label?: string) => void }>({ go: () => {} });
export const usePageTransition = () => useContext(Ctx);

const pathOf = (href: string) => href.split("#")[0].split("?")[0] || "/";

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const target = useRef<string | null>(null);
  const coveredAt = useRef(0);
  const timers = useRef<number[]>([]);
  const after = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  // scroll: false because Next scrolls pages that have several top-level elements to their last one; we reset to the top ourselves.
  const push = useCallback((href: string) => {
    router.push(href, { scroll: false });
    if (!href.includes("#")) {
      setTimeout(() => scrollToY(0, true), 40);
    } else {
      const h = href.slice(href.indexOf("#"));
      scrollToTarget(h, true);
    }
  }, [router]);

  const reveal = useCallback(() => {
    const hash = target.current?.includes("#") ? target.current.slice(target.current.indexOf("#")) : null;
    target.current = null;
    clear();
    if (!hash) {
      scrollToY(0, true); // new page starts at the top, hidden behind the squares
    } else {
      scrollToTarget(hash, true);
    }
    const wait = Math.max(120, HOLD_MS - (performance.now() - coveredAt.current)); // keep the label up long enough to read
    if (hash) {
      setTimeout(() => scrollToTarget(hash, true), 60);
    }
    after(wait, () => {
      if (hash) {
        scrollToTarget(hash, true);
      }
      setPhase("out");
      const total = (grid.cols + grid.rows) * STEP + CELL_MS + 80;
      after(total, () => {
        setPhase("idle");
        if (hash) {
          scrollToTarget(hash, true);
        }
      });
    });
  }, [grid.cols, grid.rows]);

  const go = useCallback((href: string, lbl?: string) => {
    if (phase !== "idle") return;

    // Smart return to home section if href is "/" or without hash
    let targetHref = href;
    if (targetHref === "/" && typeof window !== "undefined") {
      const last = sessionStorage.getItem("lastSection");
      if (last && last !== "#top" && last !== "/") {
        targetHref = "/" + (last.startsWith("#") ? last : "#" + last);
      } else if (pathname === "/all-certificates" || pathname === "/certificates") {
        targetHref = "/#certificates";
      } else if (pathname === "/all-projects" || pathname === "/projects") {
        targetHref = "/#projects";
      }
    }

    // Save lastSection before leaving home page
    if (pathname === "/" && typeof window !== "undefined") {
      const clean = pathOf(targetHref);
      if (clean === "/all-certificates" || clean === "/certificates") {
        sessionStorage.setItem("lastSection", window.location.hash || "#certificates");
      } else if (clean === "/all-projects" || clean === "/projects") {
        sessionStorage.setItem("lastSection", window.location.hash || "#projects");
      } else if (window.location.hash) {
        sessionStorage.setItem("lastSection", window.location.hash);
      }
    }

    if (pathOf(targetHref) === pathname) {
      if (targetHref.includes("#")) {
        const h = targetHref.slice(targetHref.indexOf("#"));
        scrollToTarget(h);
      } else {
        router.push(targetHref);
      }
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { push(targetHref); return; }
    setProgrammaticScrolling(1200);
    const cols = Math.ceil(innerWidth / CELL), rows = Math.ceil(innerHeight / CELL);
    setGrid({ cols, rows });
    setLabel(lbl ?? pathOf(targetHref).replace("/", "") ?? "");
    setPhase("in");
    target.current = targetHref;
    after((cols + rows) * STEP + CELL_MS + 60, () => { coveredAt.current = performance.now(); push(targetHref); });
    after(SAFETY_MS, () => { if (target.current) reveal(); }); // never leave the screen covered
  }, [phase, pathname, router, push, reveal]);

  // The route actually changed underneath the covered screen: uncover.
  useEffect(() => {
    if (target.current && pathOf(target.current) === pathname && phase === "in") reveal();
  }, [pathname, phase, reveal]);

  const cells = phase === "idle" ? [] : Array.from({ length: grid.cols * grid.rows }, (_, i) => {
    const x = i % grid.cols, y = Math.floor(i / grid.cols);
    return { d: x + y };
  });

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="pt" data-phase={phase} aria-hidden="true"
        style={{ "--cols": grid.cols, "--rows": grid.rows, "--step": `${STEP}ms`, "--cell-ms": `${CELL_MS}ms` } as React.CSSProperties}>
        {cells.map((c, i) => <i key={i} className="pt-cell" style={{ "--d": c.d } as React.CSSProperties} />)}
        <p className="pt-label mono"><b />→ {label || "loading"}<span /></p>
      </div>
    </Ctx.Provider>
  );
}

/** Drop-in replacement for next/link that plays the transition. Modified clicks and external links behave normally. */
export function TransitionLink({ href, label, onClick, children, ...rest }: React.ComponentProps<typeof Link> & { label?: string }) {
  const { go } = usePageTransition();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        const h = typeof href === "string" ? href : href.pathname ?? "/";
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || !h.startsWith("/")) return;
        e.preventDefault();
        go(h, label);
      }}
    >
      {children}
    </Link>
  );
}
