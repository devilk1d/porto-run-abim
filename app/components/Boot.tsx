"use client";
import { useEffect, useState } from "react";
import PixelName from "./PixelName";

// The boot screen is for the first load only: coming back to the home page by client navigation skips it.
let booted = false;

// A 16 × 9 board of dark cells covers the screen. The name assembles, a segmented pixel bar & terminal log
// step up, then the board is swept away diagonally (each cell flashes lime and shrinks), uncovering the hero.
const COLS = 16, ROWS = 9;
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => (i % COLS) + Math.floor(i / COLS));
const SEGMENTS = 20;

function getBootLog(pct: number): string {
  if (pct < 25) return "> initializing kernel & theme tokens...";
  if (pct < 55) return "> connecting supabase edge & data...";
  if (pct < 85) return "> hydrating projects & certificates...";
  if (pct < 100) return "> calibrating scroll & motion engine...";
  return "> system ready. launching interface";
}

export default function Boot() {
  const [show] = useState(() => !booted); // false on later mounts; the first mount matches the server render
  const [pct, setPct] = useState(0);

  useEffect(() => {
    booted = true;
  }, []);

  useEffect(() => {
    if (!show) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1380);
      setPct(Math.round((1 - (1 - k) ** 3) * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  if (!show) return null;

  const litSegments = Math.round((pct / 100) * SEGMENTS);
  const ready = pct >= 100;

  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-cells">
        {CELLS.map((d, i) => (
          <i key={i} style={{ "--d": d } as React.CSSProperties} />
        ))}
      </div>

      <div className="boot-grid" />

      <div className="boot-hud boot-tl mono small">[SYS.INIT]</div>
      <div className="boot-hud boot-tr mono small">UTC+8 · ID / MY</div>
      <div className="boot-hud boot-bl mono small">PORTFOLIO</div>
      <div className="boot-hud boot-br mono small">© 2026 abiem.codes</div>

      <div className="boot-core">
        <div className="boot-panel">
          <div className="boot-panel-bar mono small">
            <span className="boot-dots">
              <i />
              <i />
              <i />
            </span>
            <span>~/boot/abiem.codes</span>
            <b className={`boot-status${ready ? " ready" : ""}`}>
              {ready ? "READY" : "LOADING"}
            </b>
          </div>

          <div className="boot-panel-body">
            <PixelName
              className="boot-name"
              fill="var(--block-ink)"
              dotFill="var(--accent)"
            />

            <div className="boot-meta mono small">
              <span>$ boot --strict</span>
              <b>{String(pct).padStart(3, "0")}%</b>
            </div>

            <div className="boot-segs" role="presentation">
              {Array.from({ length: SEGMENTS }, (_, idx) => (
                <i key={idx} className={idx < litSegments ? "on" : undefined} />
              ))}
            </div>

            <p className="mono small boot-log">
              <span>{getBootLog(pct)}</span>
              <i className="boot-cursor" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
