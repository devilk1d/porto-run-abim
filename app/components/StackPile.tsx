"use client";
import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";

// A pile of draggable stack stickers. Each one is dragged by the outer motion.div (so the drag offset is not skewed by the tilt);
// the tilt and look live on the inner .pile-s. Dragging is limited to the hero; the last one touched is raised to the top. No momentum: a sticker stays exactly where it is dropped.
// Real logos from Devicon (MIT), see public/stack/README.txt. x, y, s in rem (left, top, size); r in degrees.
const ITEMS = [
  { id: "next", label: "Next.js", x: 0.3, y: 2.2, s: 3.9, r: -8 },
  { id: "ts", label: "TypeScript", x: 3.9, y: 0.2, s: 3.2, r: 7 },
  { id: "react", label: "React", x: 6.6, y: 3.2, s: 3.5, r: -4 },
  { id: "js", label: "JavaScript", x: 10.6, y: 0.5, s: 2.6, r: 12 },
  { id: "py", label: "Python", x: 12.4, y: 3.3, s: 3.9, r: -10 },
  { id: "node", label: "Node.js", x: 1.9, y: 5.3, s: 2.7, r: 9 },
  { id: "pg", label: "PostgreSQL", x: 9.3, y: 5.4, s: 3.1, r: 6 },
  { id: "supa", label: "Supabase", x: 15.6, y: 0, s: 2.5, r: -6 },
  { id: "sk", label: "scikit-learn", x: 5.1, y: 5.6, s: 2.8, r: -7 },
  { id: "pd", label: "pandas", x: 15.8, y: 5, s: 3, r: 8 },
];
const FILES: Record<string, string> = { next: "nextjs", ts: "typescript", react: "react", js: "javascript", py: "python", node: "nodejs", pg: "postgresql", supa: "supabase", sk: "scikitlearn", pd: "pandas" };

export default function StackPile() {
  const root = useRef<HTMLDivElement>(null);
  const bounds = useRef<Element | null>(null);
  const [z, setZ] = useState(() => ITEMS.map((_, i) => i));
  const [round, setRound] = useState(0); // bumping it remounts the pile, which puts every sticker back

  useEffect(() => { bounds.current = root.current?.closest(".hero") ?? null; }, []);
  const raise = (i: number) => setZ((v) => { const top = Math.max(...v); return v[i] === top ? v : v.map((n, j) => (j === i ? top + 1 : n)); });

  return (
    <div>
      <ul className="sr-only" aria-label="Stack">{ITEMS.map((t) => <li key={t.id}>{t.label}</li>)}</ul>
      <div className={`pile${round ? " re" : ""}`} ref={root} aria-hidden="true">
        {ITEMS.map((t, i) => (
          <m.div key={`${t.id}-${round}`} className="pile-i" drag dragConstraints={bounds as React.RefObject<Element>} dragElastic={0.12}
            dragMomentum={false} whileHover={{ scale: 1.06 }} whileDrag={{ scale: 1.14 }}
            onPointerDown={() => raise(i)}
            style={{ left: `${t.x}rem`, top: `${t.y}rem`, width: `${t.s}rem`, height: `${t.s}rem`, zIndex: 20 + z[i] }}>
            <div className="pile-s" style={{ rotate: `${t.r}deg`, "--k": i } as React.CSSProperties}><img src={`/stack/${FILES[t.id]}.svg`} alt="" width={64} height={64} decoding="async" draggable={false} /></div>
          </m.div>
        ))}
      </div>
      <div className="pile-foot mono">
        <span aria-hidden="true">you can move this btw :D</span>
        <button type="button" onClick={() => { setRound((n) => n + 1); setZ(ITEMS.map((_, i) => i)); }}>↺ reset</button>
      </div>
    </div>
  );
}
