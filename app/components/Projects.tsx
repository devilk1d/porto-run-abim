"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionValueEvent, type MotionValue } from "motion/react";
import { projects, GITHUB } from "../data";
import Figure from "./Figures";
import { usePinned, scrollToProgress, usePinProgress } from "./scroll";
import { TransitionLink } from "./PageTransition";

const N = projects.length;
const pad = (n: number) => String(n).padStart(2, "0");

// Pinned mode: the slide nearest the current position is full size, neighbours ease back.
function Slide({ i, s, pinned, active, onOpen, onFocusSlide }: { i: number; s: MotionValue<number>; pinned: boolean; active: boolean; onOpen: () => void; onFocusSlide: () => void }) {
  const scale = useTransform(s, (v) => 1 - Math.min(1, Math.abs(v - i)) * 0.06);
  const opacity = useTransform(s, (v) => 1 - Math.min(1, Math.abs(v - i)) * 0.45);
  const pr = projects[i];
  return (
    <motion.article className={`card${active ? " is-active" : ""}`} style={pinned ? { scale, opacity } : undefined} onFocus={onFocusSlide}
      role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${N}`}>
      <Figure slug={pr.slug} label={pr.fig} />
      <div className="card-info">
        <span className="card-ghost cond" aria-hidden="true">{pad(i + 1)}</span>
        <div className="row"><span className="chip accent">{pr.label}</span><span className="mono small muted">{pad(i + 1)} / {pad(N)}</span></div>
        <h3>{pr.title}</h3>
        <p className="tagline">{pr.tagline}</p>
        <p className="desc">{pr.desc}</p>
        <dl className="meta">
          <dt>ROLE</dt><dd>{pr.role}</dd>
          <dt>STACK</dt>
          <dd><ul className="chips">{pr.stack.split(" · ").map((t) => <li key={t} className="mono">{t}</li>)}</ul></dd>
        </dl>
        <div className="card-actions">
          <button type="button" className="btn dark" onClick={onOpen}>Open case study <span aria-hidden="true">→</span></button>
          <a className="link-u mono" href={GITHUB} target="_blank" rel="noreferrer">GITHUB ↗</a>
        </div>
      </div>
    </motion.article>
  );
}

const STAIRS = Array.from({ length: 6 }, (_, c) => Array.from({ length: c + 1 }, (_, r) => [c, r] as const)).flat();

// Section 6's own backdrop: shapes at different depths that drift sideways as the list moves.
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

export default function Projects() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const prevBtn = useRef<HTMLButtonElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<number | null>(null);
  const releaseTimer = useRef<number>(0);
  const pinned = usePinned();
  const [distance, setDistance] = useState(0);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(0);

  // ---- pinned mode: vertical scroll drives the horizontal track ----
  // stops[i] = scroll progress at which slide i (the last one is the "view all" panel) sits at the left edge.
  const scrollYProgress = usePinProgress(outer);
  const [stops, setStops] = useState<number[]>(() => Array.from({ length: N + 1 }, (_, i) => i / N));
  const x = useMotionValue(0);
  const s = useMotionValue(0);
  const apply = useCallback(() => {
    const p = scrollYProgress.get();
    x.set(-p * distance);
    let i = 0;
    while (i < N - 1 && p > stops[i + 1]) i++;
    const span = stops[i + 1] - stops[i];
    s.set(i + (span > 0 ? Math.min(1, Math.max(0, (p - stops[i]) / span)) : 0));
  }, [scrollYProgress, distance, stops, x, s]);
  useMotionValueEvent(scrollYProgress, "change", apply);
  useLayoutEffect(apply, [apply]);
  useMotionValueEvent(s, "change", (v) => {
    if (!pinned) return;
    // While a button/tab jump is travelling, keep showing its target (no flick back through the old numbers); free again on arrival.
    if (pending.current !== null) { if (Math.abs(v - pending.current) < 0.08) pending.current = null; return; }
    setCurrent(Math.min(N - 1, Math.round(v)));
  });

  useLayoutEffect(() => {
    if (!pinned) { setDistance(0); return; }
    const t = track.current!;
    const measure = () => {
      const kids = [...t.children] as HTMLElement[];
      const d = kids[N].offsetLeft - t.offsetLeft;
      setDistance(d);
      setStops(kids.map((k) => (d > 0 ? (k.offsetLeft - t.offsetLeft) / d : 0)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => ro.disconnect();
  }, [pinned]);

  // ---- native mode (small screens / reduced motion): scroll-snap carousel ----
  const nearest = () => {
    const t = track.current!;
    const slides = [...t.children] as HTMLElement[];
    let best = 0;
    slides.forEach((sl, i) => {
      if (Math.abs(sl.offsetLeft - t.offsetLeft - t.scrollLeft) < Math.abs(slides[best].offsetLeft - t.offsetLeft - t.scrollLeft)) best = i;
    });
    return Math.min(N - 1, best);
  };

  useEffect(() => {
    if (pinned) return;
    const t = track.current!;
    let frame = 0, timer = 0, settled = 0;
    const hasScrollEnd = "onscrollend" in t;
    const onEnd = () => {
      pending.current = null;
      const i = nearest();
      setCurrent(i);
      if (i !== settled) { settled = i; setStatus(`Project ${i + 1} of ${N}: ${projects[i].title}`); }
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
      scrollToProgress(outer.current!, stops[target], instant);
      setStatus(`Project ${target + 1} of ${N}: ${projects[target].title}`);
      return;
    }
    const t = track.current!;
    const sl = t.children[target] as HTMLElement;
    t.scrollTo({ left: sl.offsetLeft - t.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  // Arrow keys move between projects while the pinned section fills the screen.
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (dialog.current?.open || (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))) return;
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

  const openCase = (i: number) => { setOpen(i); dialog.current!.showModal(); };
  const p = projects[open];
  const fill = useTransform(scrollYProgress, (v) => 0.04 + v * 0.96);

  return (
    <section ref={outer} id="work" tabIndex={-1} className={`projects-pin${pinned ? " is-pinned" : ""}`}
      style={pinned ? { height: `calc(100vh + ${distance * 1.15}px)` } : undefined}
      aria-roledescription="carousel" aria-label="Selected work">
      <div className="pin-sticky">
        <WorkBackdrop p={scrollYProgress} />
        <div className="projects wrap">
          <div className="projects-head">
            <div>
              <p className="mono small muted">[05] selected work</p>
              <h2 className="h2">Selected work.</h2>
              <p className="sub">Web apps, ML research and hardware — from thesis to side project.</p>
            </div>
            <p className="counter" aria-hidden="true">
              <span className="cond counter-num"><motion.span key={current} initial={{ y: "60%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}>{pad(current + 1)}</motion.span></span>
              <span className="mono small">/ {pad(N)}</span>
            </p>
            <div className="arrows">
              <button ref={prevBtn} type="button" className="arrow" onClick={() => go((pending.current ?? current) - 1)} disabled={current === 0} aria-label="Previous project">←</button>
              <button ref={nextBtn} type="button" className="arrow dark" onClick={() => go((pending.current ?? current) + 1)} disabled={current === N - 1} aria-label="Next project">→</button>
            </div>
          </div>

          <div className="wtabs" role="group" aria-label="Choose a project">
            {projects.map((pr, i) => (
              <button key={pr.slug} type="button" className="wtab mono" aria-current={i === current ? "true" : undefined} onClick={() => go(i)}>
                <span>{pad(i + 1)}</span>{pr.file.split("/").pop()}
              </button>
            ))}
          </div>

          <motion.div ref={track} className="track" style={pinned ? { x } : undefined}
            tabIndex={pinned ? undefined : 0} role="group" aria-label="Projects">
            {projects.map((pr, i) => (
              <Slide key={pr.slug} i={i} s={s} pinned={pinned} active={i === current} onOpen={() => openCase(i)}
                onFocusSlide={() => { if (pinned && Math.round(s.get()) !== i) go(i, true); }} />
            ))}
            <div className="cta-slide" role="group" aria-roledescription="slide" aria-label="All projects">
              <TransitionLink href="/projects" label="projects" className="cta-link">
                <span className="cta-k mono small">[{pad(N)}] projects, one page</span>
                <span className="cta-t">View all<br />projects</span>
                <span className="cta-go"><span className="btn accent">Open the full list <span aria-hidden="true">→</span></span></span>
              </TransitionLink>
            </div>
          </motion.div>

          <div className="progress">
            <div className="progress-track">
              {pinned ? <motion.i style={{ scaleX: fill }} /> : <i style={{ scale: `${(current + 1) / N} 1` }} />}
            </div>
            <div className="row mono small muted"><span>{pad(current + 1)} / {pad(N)}</span><span>{pinned ? "scroll ↓ or use the arrow keys" : "swipe or use the arrows"}</span></div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </div>
      </div>

      {/* closedby="any": click outside closes where supported; Esc closes everywhere. data-lenis-prevent: wheel inside scrolls the panel, not the page. */}
      <dialog ref={dialog} className="case" aria-labelledby="case-title" data-lenis-prevent {...{ closedby: "any" }}>
        <div className="case-head">
          <span className="mono small muted">{p.file}</span>
          <form method="dialog"><button className="pill mono small" autoFocus>close <span className="muted">esc</span></button></form>
        </div>
        <div className="case-body" key={open}>
          <p className="mono small muted">projects / {pad(open + 1)}</p>
          <h2 id="case-title">{p.title}</h2>
          <p className="case-tag">{p.tagline}</p>
          <dl className="case-meta">
            <dt>ROLE</dt><dd>{p.role}</dd>
            <dt>TYPE</dt><dd>{p.type}</dd>
            <dt>STACK</dt><dd>{p.stack}</dd>
          </dl>
          <h3 className="mono small">## context</h3>
          <p>{p.context}</p>
          <h3 className="mono small">## what I built</h3>
          <p>{p.built}</p>
        </div>
        <div className="case-foot">
          <a className="btn dark" href={GITHUB} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          {/* shortcut: only Next Lap has a known live URL; add the others when they exist */}
          {open === 0 && <a className="btn ghost" href="https://nextlap.live" target="_blank" rel="noreferrer">Visit live <span aria-hidden="true">↗</span></a>}
          <button type="button" className="next mono small" onClick={() => setOpen((open + 1) % N)}>
            next: {projects[(open + 1) % N].title} <span aria-hidden="true">→</span>
          </button>
        </div>
      </dialog>
    </section>
  );
}
