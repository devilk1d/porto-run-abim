"use client";
import { useState } from "react";
import { projects, GITHUB, type Project } from "../data";
import Figure from "./Figures";
import GitHubMark from "./GitHubMark";
import Shots from "./Shots";

const pad = (n: number) => String(n).padStart(2, "0");

const FILTERS: { id: string; label: string; test: (p: Project) => boolean }[] = [
  { id: "all", label: "all", test: () => true },
  { id: "web", label: "web", test: (p) => /web/.test(p.type) },
  { id: "data", label: "data · ml", test: (p) => /data|ml|research/.test(p.type) },
  { id: "hw", label: "hardware", test: (p) => /hardware/.test(p.type) },
];

// The project's card: screenshots (or the illustrative figure), the short text, links, and the longer write-up folded away.
function Preview({ p, index }: { p: Project; index: number }) {
  return (
    <article className="ap-pv">
      <div className="pk-bar mono"><span>{pad(index + 1)} · {p.title.toUpperCase()}</span><span>{p.label}</span></div>
      <div className="ap-fig">
        {p.shots ? <Shots pr={p} /> : <Figure slug={p.slug} label={p.fig} />}
        {p.shots && <p className="sr-only">{p.shots.map((x) => x.alt).join(". ")}</p>}
      </div>
      <div className="ap-pbody">
        <h2>{p.title}</h2>
        <p className="tagline">{p.tagline}</p>
        <p className="desc">{p.desc}</p>
        <ul className="chips">{p.stack.split(" · ").map((t) => <li key={t} className="mono">{t}</li>)}</ul>
        <div className="ap-act">
          {p.is_private ? (
            <span className="pk-private mono small" aria-label="Private or internal project">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              <span>PRIVATE · INTERNAL</span>
            </span>
          ) : (
            <>
              {p.live && <a className="btn dark" href={p.live} target="_blank" rel="noreferrer">View live <span aria-hidden="true">↗</span></a>}
              <a className="btn ghost" href={p.github || GITHUB} target="_blank" rel="noreferrer">
                <GitHubMark size={18} />View codebase
              </a>
            </>
          )}
        </div>
        <details className="ap-more">
          <summary className="mono small">context and what I built</summary>
          <h3 className="mono small muted">## role</h3><p>{p.role}</p>
          <h3 className="mono small muted">## context</h3><p>{p.context}</p>
          <h3 className="mono small muted">## what I built</h3><p>{p.built}</p>
        </details>
      </div>
    </article>
  );
}

// Filterable index. Wide screens: rows on the left, the active project previewed in a sticky card on the right.
// Narrow screens: the active row opens its card right under itself.
export default function ProjectIndex({ items = projects }: { items?: Project[] }) {
  const list = items && items.length > 0 ? items : projects;
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(list[0]?.slug ?? "");
  const visible = list.filter(FILTERS.find((f) => f.id === filter)!.test);
  const active = visible.find((p) => p.slug === sel) ?? visible[0] ?? list[0];

  return (
    <>
      <div className="ap-filters mono" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={f.id === filter} onClick={() => setFilter(f.id)}>
            {f.label} {pad(list.filter(f.test).length)}
          </button>
        ))}
      </div>

      <div className="ap-layout">
        <ol className="ap-list">
          {visible.map((p) => {
            const on = p === active;
            const idx = list.indexOf(p);
            return (
              <li key={p.slug}>
                <button type="button" className={`ap-row${on ? " on" : ""}`} aria-current={on ? "true" : undefined}
                  onMouseEnter={() => setSel(p.slug)} onFocus={() => setSel(p.slug)} onClick={() => setSel(p.slug)}>
                  <span className="n mono">{pad(idx + 1)}</span>
                  <span className="t"><b>{p.title}</b><span>{p.tagline}</span></span>
                  <span className="m mono">{p.type}<br />{p.stack}</span>
                </button>
                {on && <div className="ap-inline"><Preview p={p} index={idx} /></div>}
              </li>
            );
          })}
        </ol>
        <aside className="ap-aside" aria-label="Project preview" key={active?.slug}><Preview p={active} index={list.indexOf(active)} /></aside>
      </div>
    </>
  );
}
