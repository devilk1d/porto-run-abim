import type { Metadata } from "next";
import Figure from "../components/Figures";
import SubpageBar from "../components/SubpageBar";
import { TransitionLink } from "../components/PageTransition";
import { projects, GITHUB } from "../data";

export const metadata: Metadata = {
  title: "All projects — abim.run",
  description: "Every project Abim has built: web apps, ML research and hardware.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function AllProjects() {
  return (
    <>
      <SubpageBar path="~/work" />

      <main className="wrap ap">
        <p className="mono small muted">[00] all projects</p>
        <h1 className="h2 ap-h">All projects.</h1>
        <p className="sub">Everything I&apos;ve built so far — web apps, ML research and hardware, from thesis to side project. {pad(projects.length)} in total.</p>

        <ol className="ap-grid">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <article className="ap-card" aria-labelledby={`ap-${p.slug}`}>
                <Figure slug={p.slug} label={p.fig} />
                <div className="ap-info">
                  <div className="row"><span className="chip accent">{p.label}</span><span className="mono small muted">{pad(i + 1)} / {pad(projects.length)}</span></div>
                  <h2 id={`ap-${p.slug}`}>{p.title}</h2>
                  <p className="tagline">{p.tagline}</p>
                  <dl className="meta">
                    <dt>ROLE</dt><dd>{p.role}</dd>
                    <dt>TYPE</dt><dd>{p.type}</dd>
                    <dt>STACK</dt>
                    <dd><ul className="chips">{p.stack.split(" · ").map((t) => <li key={t} className="mono">{t}</li>)}</ul></dd>
                  </dl>
                  <h3 className="mono small muted">## context</h3>
                  <p className="ap-p">{p.context}</p>
                  <h3 className="mono small muted">## what I built</h3>
                  <p className="ap-p">{p.built}</p>
                  <div className="card-actions">
                    <a className="btn dark" href={GITHUB} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
                    {/* shortcut: only Next Lap has a known live URL; add the others when they exist */}
                    {p.slug === "nextlap" && <a className="btn ghost" href="https://nextlap.live" target="_blank" rel="noreferrer">Visit live <span aria-hidden="true">↗</span></a>}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="ap-end">
          <p className="mono small muted">// end of list</p>
          <TransitionLink href="/" label="home" className="btn accent">Back to the home page <span aria-hidden="true">→</span></TransitionLink>
        </div>
      </main>
    </>
  );
}
