"use client";
import { useEffect, useRef, useState } from "react";
import { m, useScroll, useSpring, useTransform } from "motion/react";

const WORDS = "Most of the work is the part nobody sees — the schema, the edge cases, and the tests that keep it standing.".split(" ");

// Words light up as the section scrolls through the viewport (design states p0 → p3).
export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(0);
  // The block starts small and grows to full size as the section scrolls into view (spring-smoothed).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 25%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 220, damping: 28, mass: 0.2 });
  const scale = useTransform(grow, [0, 1], [0.88, 1]);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); return setLit(WORDS.length); }
    let frame = 0;
    const update = () => {
      frame = 0;
      // React detaches the ref before passive cleanups run, so a frame queued just before unmount can land here with no element
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.9)));
      const next = Math.round(p * WORDS.length);
      setLit((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  const pips = Math.ceil((lit / WORDS.length) * 4);
  return (
    <section ref={ref} id="statement" className="statement" aria-labelledby="statement-text">
      <m.div className="statement-block" style={still ? undefined : { scale }}>
        <div className="row mono small"><span>[01] how I think</span><span>01 / 08</span></div>
        <p id="statement-text" className="statement-text">
          {WORDS.map((w, i) => <span key={i} className={i < lit ? "on" : undefined}>{w} </span>)}
        </p>
        <div className="row mono small">
          <span className="pips" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <i key={i} className={i < pips ? "on" : undefined} />)}
            <span>reading</span>
          </span>
          <span className="tags">schema · edge cases · tests · deploys</span>
        </div>
      </m.div>
    </section>
  );
}
