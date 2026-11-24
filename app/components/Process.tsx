"use client";
import { useEffect, useRef, useState } from "react";
import { process } from "../data";

const N = process.length;
const slug = (t: string) => t.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "");

// A CI pipeline for the five stages: pick a stage, or run the whole thing and watch it go green.
export default function Process() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number>(0);
  const S = process[active];
  const deliverables = S.deliv.split(" · ");

  const stop = () => { clearInterval(timer.current); setRunning(false); };
  useEffect(() => stop, []);

  const pick = (i: number) => { stop(); setActive(i); };

  function run() {
    stop();
    setRunning(true);
    setActive(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i++;
      if (i >= N) return stop();
      setActive(i);
    }, 1300);
  }

  function onKey(e: React.KeyboardEvent) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + N) % N;
    pick(next);
    document.getElementById(`pl-${next}`)?.focus();
  }

  return (
    <section id="process" tabIndex={-1} className="process wrap">
      <div className="stack-head">
        <div>
          <p className="mono small muted">[07] process</p>
          <h2 className="h2">Built to run.<br />Made to last.</h2>
        </div>
        <div>
          <p className="mono small muted count">07 / 08</p>
          <p className="sub">Every project moves through the same five stages, with you kept in the loop at each one. Pick a stage, or run the whole pipeline.</p>
        </div>
      </div>

      <div className="pl" style={{ "--p": active / (N - 1) } as React.CSSProperties}>
        <div className="pl-track" aria-hidden="true"><i /></div>
        <div className="pl-nodes" role="tablist" aria-label="Process stages" onKeyDown={onKey}>
          {process.map((s, i) => (
            <button
              key={s.title} id={`pl-${i}`} type="button" role="tab" aria-selected={i === active} aria-controls="pl-panel"
              tabIndex={i === active ? 0 : -1} data-state={i < active ? "done" : i === active ? "active" : "todo"}
              onClick={() => pick(i)} onPointerEnter={(e) => { if (e.pointerType === "mouse" && !running) setActive(i); }}
            >
              <span className="pl-dot cond">{i < active ? "✓" : `0${i + 1}`}</span>
              <span className="pl-t">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div id="pl-panel" className="pl-job" role="tabpanel" aria-labelledby={`pl-${active}`} aria-live={running ? "off" : "polite"}>
        <div className="pl-job-bar mono small">
          <span className="pl-badge" data-running={running}>{running ? "RUNNING" : active === N - 1 ? "READY" : "STAGE"}</span>
          <span>pipeline / {slug(S.title)}</span>
          <button type="button" className="pl-run mono" onClick={run}>{running ? "▮▮ running…" : "▶ run pipeline"}</button>
        </div>
        <div className="pl-job-body" key={active}>
          <div className="pl-job-main">
            <span className="pl-num cond" aria-hidden="true">0{active + 1}</span>
            <h3>{S.title}</h3>
            <p>{S.desc}</p>
          </div>
          <pre className="pl-log mono" aria-hidden="true">
            <span className="l">$ stage --run {slug(S.title)}</span>
            {deliverables.map((d) => <span key={d} className="l ok">✓ {d}</span>)}
            <span className="l dim">→ reviewed with you before the next stage</span>
          </pre>
        </div>
      </div>
    </section>
  );
}
