"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform, useMotionValue, useMotionValueEvent, type MotionValue } from "motion/react";
import { projects, GITHUB, type Project } from "../data";
import Figure from "./Figures";
import GitHubMark from "./GitHubMark";
import Shots from "./Shots";
import { usePinned, scrollToProgress, usePinProgress } from "./scroll";
import { TransitionLink } from "./PageTransition";

const pad = (n: number) => String(n).padStart(2, "0");

// Stack pose for a card whose distance from the front is `rel` (0 = front, 1.. = behind, < 0 = leaving).
// Cards behind are nudged up and right so their title strips peek out; a leaving card drops away downward.
const DX = 30, DY = -28, TILT = [-0.4, 0.8, -1.1, 1.6];
function pose(rel: number) {
  if (rel < 0) { const t = Math.min(1, -rel); return `translate(${t * 50}px, ${t * 115}vh) rotate(${-0.4 + t * 8}deg)`; }
  const d = Math.min(rel, 3), k = Math.floor(d), f = d - k;
  const r = TILT[k] + (TILT[Math.min(3, k + 1)] - TILT[k]) * f;
  return `translate(${d * DX}px, ${d * DY}px) rotate(${r}deg)`;
}

function CardBody({ pr, i }: { pr: Project; i: number }) {
  return (
    <>
      <div className="pk-bar mono"><span>{pad(i + 1)} · {pr.title.toUpperCase()}</span><span>{pr.label}</span></div>
      <div className="pk-fig">
        {pr.shots ? <Shots pr={pr} /> : <Figure slug={pr.slug} label={pr.fig} />}
        {pr.shots && <p className="sr-only">{pr.shots.map((x) => x.alt).join(". ")}</p>}
      </div>
      <div className="pk-info">
        <span className="pk-ghost cond" aria-hidden="true">{pad(i + 1)}</span>
        <div className="pk-text">
          <h3>{pr.title}</h3>
          <p className="pk-tag">{pr.tagline}</p>
          <ul className="chips">{pr.stack.split(" · ").map((t) => <li key={t} className="mono">{t}</li>)}</ul>
        </div>
        <div className="pk-act">
          {pr.live && <a className="btn dark" href={pr.live} target="_blank" rel="noreferrer">View live <span aria-hidden="true">↗</span></a>}
          <a className="btn ghost gh" href={GITHUB} target="_blank" rel="noreferrer" aria-label={`View ${pr.title} codebase on GitHub`}>
            <GitHubMark size={22} />
            <span>View codebase</span>
          </a>
        </div>
      </div>
    </>
  );
}

// One card of the stack. In pinned mode its pose follows the scroll position `s`; otherwise it is a plain slide.
function StackCard({ i, s, pinned, front, children, label, total }: { i: number; s: MotionValue<number>; pinned: boolean; front: boolean; children: React.ReactNode; label: string; total: number }) {
  const transform = useTransform(s, (v) => pose(i - v));
  const visibility = useTransform(s, (v) => (i - v <= -1 ? "hidden" : "visible"));
  return (
    <motion.article className="pk-card" style={pinned ? { transform, visibility, zIndex: total + 1 - i } : undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(pinned && !front ? ({ inert: true } as any) : {})}
      role="group" aria-roledescription="slide" aria-label={label}>
      {children}
    </motion.article>
  );
}

const STAIRS = Array.from({ length: 6 }, (_, c) => Array.from({ length: c + 1 }, (_, r) => [c, r] as const)).flat();

// Section 6's own backdrop: shapes at different depths that drift sideways as the stack moves.
function WorkBackdrop({ p }: { p: MotionValue<number> }) {
  const far = useTransform(p, [0, 1], ["0vw", "-8vw"]);
  const mid = useTransform(p, [0, 1], ["0vw", "-16vw"]);
  const near = useTransform(p, [0, 1], ["0vw", "-30vw"]);
  const spin = useTransform(p, [0, 1], [0, 160]);
  return (
    <div className="work-bg" aria-hidden="true">
      <div className="wb-grid" />
      <motion.i className="wb-ring" style={{ x: far }} />
      <motion.i className="wb-hatch" style={{ x: mid }} />
      <motion.i className="wb-square" style={{ x: mid, rotate: spin }} />
      <motion.span className="wb-glyph" style={{ x: near }}>{"{ }"}</motion.span>
      <motion.svg className="wb-stairs" style={{ x: far }} viewBox="0 0 240 240">
        {STAIRS.map(([c, r]) => <rect key={`${c}${r}`} x={c * 40} y={200 - r * 40} width="36" height="36" className={c === 5 && r === 5 ? "hot" : undefined} />)}
      </motion.svg>
      <motion.i className="wb-disc" style={{ x: near }} />
    </div>
  );
}

export default function Projects({ items = projects }: { items?: Project[] }) {
  const list = items && items.length > 0 ? items : projects;
  const N = list.length;
  const outer = useRef<HTMLElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const prevBtn = useRef<HTMLButtonElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const pending = useRef<number | null>(null);
  const releaseTimer = useRef<number>(0);
  const pinned = usePinned();
  const [current, setCurrent] = useState(0);
  const [front, setFront] = useState(0); // the card on top of the stack, 0 … N (N = "view all"); everything behind it is inert
  const [status, setStatus] = useState("");

  // ---- pinned mode: vertical scroll flips through the stack. s runs 0 … N (N = the "view all" card). ----
  const scrollYProgress = usePinProgress(outer);
  const s = useMotionValue(0);
  const apply = useCallback(() => s.set(scrollYProgress.get() * N), [scrollYProgress, s]);
  useMotionValueEvent(scrollYProgress, "change", apply);
  useLayoutEffect(apply, [apply]);
  useMotionValueEvent(s, "change", (v) => {
    if (!pinned) return;
    setFront(Math.min(N, Math.round(v)));
    // While an arrow jump is travelling, keep showing its target (no flick back through the old numbers); free again on arrival.
    if (pending.current !== null) { if (Math.abs(v - pending.current) < 0.08) pending.current = null; return; }
    setCurrent(Math.min(N - 1, Math.round(v)));
  });

  // ---- native mode (small screens / reduced motion): scroll-snap carousel of plain cards ----
  const nearest = () => {
    const t = deck.current!;
    const slides = [...t.children] as HTMLElement[];
    let best = 0;
    slides.forEach((sl, i) => {
      if (Math.abs(sl.offsetLeft - t.offsetLeft - t.scrollLeft) < Math.abs(slides[best].offsetLeft - t.offsetLeft - t.scrollLeft)) best = i;
    });
    return Math.min(N - 1, best);
  };

  useEffect(() => {
    if (pinned) return;
    const t = deck.current!;
    let frame = 0, timer = 0, settled = 0;
    const hasScrollEnd = "onscrollend" in t;
    const onEnd = () => {
      pending.current = null;
      const i = nearest();
      setCurrent(i);
      if (i !== settled) { settled = i; setStatus(`Project ${i + 1} of ${N}: ${list[i]?.title ?? ""}`); }
    };
    const onScroll = () => {
      if (pending.current === null) frame ||= requestAnimationFrame(() => { frame = 0; setCurrent(nearest()); });
      if (!hasScrollEnd) { clearTimeout(timer); timer = setTimeout(onEnd, 120) as unknown as number; }
    };
    t.addEventListener("scroll", onScroll, { passive: true });
    t.addEventListener("scrollend", onEnd);
    return () => { t.removeEventListener("scroll", onScroll); t.removeEventListener("scrollend", onEnd); cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [pinned]);

  const go = (i: number, instant = false) => {
    const target = Math.max(0, Math.min(N - 1, i));
    pending.current = target;
    setCurrent(target);
    if (pinned) {
      clearTimeout(releaseTimer.current);
      releaseTimer.current = window.setTimeout(() => { pending.current = null; }, 2500); // safety: free if the user scrolls away mid-jump
      if (Math.abs(s.get() - target) < 0.08) pending.current = null; // already there: nothing to wait for
      scrollToProgress(outer.current!, target / N, instant);
      setStatus(`Project ${target + 1} of ${N}: ${list[target]?.title ?? ""}`);
      return;
    }
    const t = deck.current!;
    const sl = t.children[target] as HTMLElement;
    t.scrollTo({ left: sl.offsetLeft - t.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  // Arrow keys move between projects while the pinned section fills the screen.
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (!outer.current) return;
      const r = outer.current.getBoundingClientRect();
      if (r.top > 1 || r.bottom < innerHeight - 1) return;
      e.preventDefault();
      go((pending.current ?? Math.round(s.get())) + (e.key === "ArrowRight" ? 1 : -1));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  // Keep focus on a usable control when the focused one becomes disabled at an end.
  useEffect(() => {
    if (current === 0 && document.activeElement === prevBtn.current) nextBtn.current?.focus();
    if (current === N - 1 && document.activeElement === nextBtn.current) prevBtn.current?.focus();
  }, [current]);

  const fill = useTransform(scrollYProgress, (v) => 0.04 + v * 0.96);

  return (
    <section ref={outer} id="projects" tabIndex={-1} className={`projects-pin${pinned ? " is-pinned" : ""}`}
      style={pinned ? { height: `${100 + N * 85}vh` } : undefined}
      aria-roledescription="carousel" aria-label="Selected projects">
      <div className="pin-sticky">
        <WorkBackdrop p={scrollYProgress} />
        <div className="projects wrap">
          <div className="pk">
            <div className="pk-side">
              <p className="mono small">[05] selected projects</p>
              <h2 className="pk-h">Selected<br />projects.</h2>
              <p className="pk-sub">Web apps, ML research and hardware — from thesis to side project.</p>
              <div className="pk-ctl">
                <p className="pk-count" aria-hidden="true">
                  <span className="pk-num"><motion.span key={current} initial={{ y: "60%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}>{pad(current + 1)}</motion.span></span>
                  <span className="mono small">/ {pad(N)}</span>
                </p>
                <div className="pk-arrows">
                  <button ref={prevBtn} type="button" className="arrow" onClick={() => go((pending.current ?? current) - 1)} disabled={current === 0} aria-label="Previous project">←</button>
                  <button ref={nextBtn} type="button" className="arrow dark" onClick={() => go((pending.current ?? current) + 1)} disabled={current === N - 1} aria-label="Next project">→</button>
                </div>
              </div>
              <div className="progress">
                <div className="progress-track">
                  {pinned ? <motion.i style={{ scaleX: fill }} /> : <i style={{ scale: `${(current + 1) / N} 1` }} />}
                </div>
                <p className="mono small">{pinned ? "scroll ↓ or use the arrow keys" : "swipe or use the arrows"}</p>
              </div>
            </div>

            <div ref={deck} className="pk-deck" tabIndex={pinned ? undefined : 0} role="group" aria-label="Projects">
              {list.map((pr, i) => (
                <StackCard key={pr.slug} i={i} s={s} pinned={pinned} front={i === front} label={`${i + 1} of ${N}`} total={N}>
                  <CardBody pr={pr} i={i} />
                </StackCard>
              ))}
              <StackCard i={N} s={s} pinned={pinned} front={front === N} label="All projects" total={N}>
                <TransitionLink href="/all-projects" label="all projects" className="pk-cta">
                  <span className="mono small">[{pad(N)}] projects, one page</span>
                  <span className="pk-cta-t">View all<br />projects</span>
                  <span className="btn accent">Open the full list <span aria-hidden="true">→</span></span>
                </TransitionLink>
              </StackCard>
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </div>
      </div>
    </section>
  );
}
