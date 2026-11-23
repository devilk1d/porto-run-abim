"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { principles } from "../data";
import { usePinned, scrollToProgress, usePinProgress } from "./scroll";

const N = principles.length;
// the "test" each principle would be, shown as a code line on its card
const CODE = [
  <><i className="k">expect</i>(app.status).<i className="k">toBe</i>(<i className="s">&quot;live&quot;</i>);</>,
  <><i className="k">await</i> ship({"{ "}db, api, <i className="s">ui</i>{" }"}); <i className="c">{"// one standard"}</i></>,
  <><i className="k">explain</i>(model, input); <i className="c">{"// SHAP, commits, docs"}</i></>,
  <><i className="k">test</i>(<i className="s">&quot;a real user can finish the task&quot;</i>);</>,
];

// Card i slides up over the stack; cards underneath shrink back and dim.
function Card({ i, s, pinned }: { i: number; s: MotionValue<number>; pinned: boolean }) {
  const depth = useTransform(s, (v) => Math.min(3, Math.max(0, v - i)));
  // px: below the stage until its turn, then lifted slightly per card stacked on top
  const y = useTransform(s, (v) => Math.min(1, Math.max(0, i - v)) * (typeof window === "undefined" ? 1000 : window.innerHeight) - Math.min(3, Math.max(0, v - i)) * 22);
  const scale = useTransform(depth, (d) => 1 - d * 0.05);
  const dim = useTransform(depth, (d) => d * 0.22);
  const p = principles[i];
  return (
    <motion.article className={`pcard c${i}`} style={pinned ? { y, scale, zIndex: i } : undefined} aria-labelledby={`p-${i}`}>
      <div className="pcard-tab mono small">
        <i /><span>principle-0{i + 1}.test.ts</span><b>PASS</b>
      </div>
      <div className="pcard-main">
        <span className="num" aria-hidden="true">0{i + 1}</span>
        <h3 id={`p-${i}`}>{p.title}</h3>
        <p>{p.body}</p>
      </div>
      <pre className="pcard-code mono" aria-hidden="true">{CODE[i]}</pre>
      {pinned && <motion.i className="pcard-shade" style={{ opacity: dim }} aria-hidden="true" />}
    </motion.article>
  );
}

// Pinned: scrolling stacks the four cards one by one before the page moves on.
export default function Principles() {
  const outer = useRef<HTMLElement>(null);
  const pinned = usePinned();
  const scrollYProgress = usePinProgress(outer);
  const s = useTransform(scrollYProgress, [0.05, 0.9], [0, N - 1], { clamp: true });
  const [active, setActive] = useState(0);
  const [allDone, setAllDone] = useState(false);
  useMotionValueEvent(s, "change", (v) => setActive(Math.round(v)));
  useMotionValueEvent(scrollYProgress, "change", (v) => setAllDone(v > 0.9));
  const passed = allDone ? N : active;

  const goTo = (i: number) => outer.current && scrollToProgress(outer.current, 0.05 + (i / (N - 1)) * 0.85);

  return (
    <section ref={outer} id="principles" tabIndex={-1} className={`principles block-section${pinned ? " is-pinned" : ""}`} style={pinned ? { height: `${N * 80 + 100}vh` } : undefined}>
      <div className="pin-sticky">
        <div className="wrap principles-grid">
          <div>
            <div className="row mono small"><span>[05] principles</span></div>
            <h2 className="h2">Why work<br />with me.</h2>
            <p className="sub">Four things I hold every project to, from the first commit to the last deploy.</p>
            {pinned && (
              <div className="runner mono" role="group" aria-label="Principles checklist">
                <p className="runner-head"><b className={allDone ? "ok" : "run"}>{allDone ? "PASS" : "RUNS"}</b> principles.test.ts</p>
                <ol>
                  {principles.map((t, i) => {
                    const state = i < passed ? "pass" : i === active ? "run" : "todo";
                    return (
                      <li key={t.title} data-state={state}>
                        <button type="button" aria-current={i === active ? "step" : undefined} onClick={() => goTo(i)}>
                          <span className="runner-ic" aria-hidden="true">{state === "pass" ? "✓" : state === "run" ? "▸" : "○"}</span>
                          <span>{t.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="runner-sum">Tests: <b>{passed} passed</b>, {N} total</p>
              </div>
            )}
            {pinned && <motion.div className="pbar" aria-hidden="true"><motion.i style={{ scaleX: scrollYProgress }} /></motion.div>}
          </div>
          <div className="pstack">
            <span className="mono small count">05 / 08</span>
            {principles.map((_, i) => <Card key={i} i={i} s={s} pinned={pinned} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
