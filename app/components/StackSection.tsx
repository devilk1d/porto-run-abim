"use client";
import { useState } from "react";
import {
  siTypescript, siNextdotjs, siReact, siTailwindcss, siHtml5, siNodedotjs, siPython, siPostgresql,
  siSupabase, siScikitlearn, siPandas, siGithub, siVercel, siOpenjdk, siC,
} from "simple-icons";
import { stack } from "../data";

// Brand marks where simple-icons has one; a mono tag otherwise (same tile, so the row stays consistent).
const ICONS: Record<string, { path: string }> = {
  TypeScript: siTypescript, "Next.js": siNextdotjs, React: siReact, "Tailwind CSS": siTailwindcss, "HTML & CSS": siHtml5,
  "Node.js": siNodedotjs, Python: siPython, PostgreSQL: siPostgresql, Supabase: siSupabase, "scikit-learn": siScikitlearn,
  pandas: siPandas, "Git & GitHub": siGithub, Vercel: siVercel, Java: siOpenjdk, C: siC,
};
const TAGS: Record<string, string> = { SQL: "SQL", LightGBM: "LGBM", "LSTM / GRU": "LSTM", SHAP: "SHAP", FigCraft: "FC" };

const LAYERS = stack.map((s) => {
  const [n, title] = s.k.split(" — ");
  return { ...s, n, title: title.toLowerCase().replace(/(^|\s|&\s)(\w)/g, (m) => m.toUpperCase()) };
});

export default function StackSection({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const L = LAYERS[active];
  const slug = L.title.toLowerCase().replace(/[^a-z]+/g, "-");
  const cmd = `stack --layer ${slug}`;

  function onKey(e: React.KeyboardEvent) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + LAYERS.length) % LAYERS.length;
    setActive(next);
    document.getElementById(`sx-tab-${next}`)?.focus();
  }

  // Each tile gets its own pointer position so a soft spotlight follows the cursor across the row.
  function spot(e: React.PointerEvent<HTMLUListElement>) {
    for (const t of e.currentTarget.children) {
      const r = t.getBoundingClientRect();
      (t as HTMLElement).style.setProperty("--mx", `${e.clientX - r.left}px`);
      (t as HTMLElement).style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  }

  return (
    <section id="stack" tabIndex={-1} className="stack">
      <div className="wrap stack-head">
        <div>
          <p className="mono small muted">[04] stack</p>
          <h2 className="h2">What I work with.</h2>
        </div>
        <div>
          <p className="mono small muted count">04 / 08</p>
          <p className="sub">Tools I reach for first, grouped by where they sit in the stack — from the pixels down to the deploy.</p>
        </div>
      </div>

      <div className="wrap sx">
        <div className="sx-layers" role="tablist" aria-orientation="vertical" aria-label="Stack layers" onKeyDown={onKey}>
          {LAYERS.map((l, i) => (
            <button
              key={l.k} id={`sx-tab-${i}`} type="button" role="tab" aria-selected={i === active} aria-controls="sx-panel"
              tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(i); }}
            >
              <span className="sx-n cond">{l.n}</span>
              <span className="sx-t">{l.title}</span>
              <span className="sx-c mono">↳ {l.cap}</span>
              <span className="sx-pips" aria-hidden="true">{l.items.map((it) => <i key={it} />)}</span>
            </button>
          ))}
        </div>

        <div id="sx-panel" className="sx-term" role="tabpanel" aria-labelledby={`sx-tab-${active}`}>
          <div className="sx-bar mono">
            <i /><i /><i />
            <span>~/stack/{slug}.ts</span>
            <span className="sx-count">{L.items.length} tools</span>
          </div>
          <div className="sx-body" key={active}>
            <p className="sx-cmd mono" aria-hidden="true">
              <b>$</b> <span className="sx-typed" style={{ "--n": cmd.length } as React.CSSProperties}>{cmd}</span><i className="sx-caret" />
            </p>
            <ul className="sx-grid" onPointerMove={spot} aria-label={`${L.title} tools`}>
              {L.items.map((it, i) => {
                const icon = ICONS[it];
                return (
                  <li key={it} className="sx-tile" style={{ "--i": i } as React.CSSProperties}>
                    <span className="sx-idx mono" aria-hidden="true">0{i + 1}</span>
                    <span className="sx-ic" aria-hidden="true">
                      {icon ? <svg viewBox="0 0 24 24"><path d={icon.path} fill="currentColor" /></svg> : <b className="mono">{TAGS[it] ?? it.slice(0, 3).toUpperCase()}</b>}
                    </span>
                    <span className="sx-name">{it}</span>
                  </li>
                );
              })}
            </ul>
            <p className="sx-foot mono small muted">// {L.cap}</p>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}
