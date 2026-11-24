"use client";
import { useEffect, useState } from "react";
import PixelName from "./PixelName";

// The boot screen is for the first load only: coming back to the home page by client navigation skips it.
let booted = false;

// A 16 × 9 board of dark cells covers the screen. The name assembles, a percentage counts up, then the board
// is swept away diagonally (each cell flashes lime and shrinks), uncovering the hero underneath. All timing is CSS
// (see "boot screen" in globals.css); the counter is the only script, and the screen never blocks the page.
const COLS = 16, ROWS = 9;
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => (i % COLS) + Math.floor(i / COLS)); // diagonal index

export default function Boot() {
  const [show] = useState(() => !booted); // false on later mounts; the first mount matches the server render
  const [pct, setPct] = useState(0);
  useEffect(() => { booted = true; }, []);
  useEffect(() => {
    if (!show) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      setPct(Math.round((1 - (1 - k) ** 3) * 100)); // ease-out
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);
  if (!show) return null;
  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-cells">{CELLS.map((d, i) => <i key={i} style={{ "--d": d } as React.CSSProperties} />)}</div>
      <div className="boot-core">
        <PixelName className="boot-name" fill="var(--block-ink)" dotFill="var(--accent)" />
        <div className="boot-meta mono small"><span>$ boot abim.run</span><b>{String(pct).padStart(3, "0")}%</b></div>
        <div className="boot-bar"><i /></div>
        <p className="mono small boot-log">loading sections…</p>
      </div>
      <span className="boot-corner mono small">© 2026 abim.run</span>
    </div>
  );
}
