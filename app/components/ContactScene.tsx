"use client";
import { m, useTransform, type MotionValue } from "motion/react";

// Contact's own backdrop: a pixel city under a lime sky, with a pixel rocket that lifts off as the section scrolls in ("ship it").
// All squares sit on the same grid language as the ABIM mark.

const ROCKET = [
  ".....#.....",
  "....###....",
  "...#####...",
  "...##o##...",
  "...#ooo#...",
  "...##o##...",
  "...#####...",
  "..#######..",
  ".##.###.##.",
  "##..###..##",
  "#...###...#",
];
const CLOUD = ["...####....", ".########..", "###########"];
const PX = 18;

// Deterministic "random" so the server and client render the same skyline.
function rng(seed: number) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function buildCity() {
  const r = rng(42);
  const out: { x: number; w: number; h: number; windows: { x: number; y: number; lit: boolean; blink: boolean }[] }[] = [];
  let x = -10;
  while (x < 1610) {
    const w = 56 + Math.floor(r() * 56), h = 70 + Math.floor(r() * 130);
    const windows: { x: number; y: number; lit: boolean; blink: boolean }[] = [];
    for (let wy = 16; wy < h - 12; wy += 20) for (let wx = 10; wx < w - 14; wx += 18) {
      const v = r();
      if (v < 0.34) windows.push({ x: wx, y: wy, lit: true, blink: v < 0.03 });
    }
    out.push({ x, w, h, windows });
    x += w + 2;
  }
  return out;
}
const CITY = buildCity();

function Pixels({ rows, className }: { rows: string[]; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${rows[0].length * PX} ${rows.length * PX}`} width={rows[0].length * PX} height={rows.length * PX} shapeRendering="crispEdges">
      {rows.flatMap((row, y) => [...row].map((c, x) => c === "." ? null : <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX - 1} height={PX - 1} className={c === "o" ? "ct-win" : "ct-ink"} />))}
    </svg>
  );
}

export default function ContactScene({ progress }: { progress: MotionValue<number> }) {
  const lift = useTransform(progress, [0.15, 1], [300, -110]);
  return (
    <div className="ct-scene" aria-hidden="true">
      <div className="ct-dots" />
      <span className="ct-cloud c1"><Pixels rows={CLOUD} /></span>
      <span className="ct-cloud c2"><Pixels rows={CLOUD} /></span>
      <span className="ct-cloud c3"><Pixels rows={CLOUD} /></span>

      <m.div className="ct-rocket" style={{ y: lift }}>
        <Pixels rows={ROCKET} />
        <span className="ct-flame">
          <i /><i /><i />
        </span>
        <span className="ct-trail"><i /><i /><i /><i /></span>
      </m.div>

      <svg className="ct-city" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        {CITY.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${220 - b.h})`}>
            <rect width={b.w} height={b.h + 2} className="ct-bld" />
            {b.windows.map((w, j) => <rect key={j} x={w.x} y={w.y} width="8" height="10" className={w.blink ? "ct-lit blink" : "ct-lit"} />)}
          </g>
        ))}
      </svg>
    </div>
  );
}
