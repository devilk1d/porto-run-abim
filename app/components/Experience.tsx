import { timeline } from "../data";

// Experience as a `git log --graph`: each chapter is a commit, and the thesis/research ones branch off the main line and merge back.
const BRANCH = new Set([1, 2]);

// Short stable hex id derived from the title (decorative, like a commit hash).
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

export default function Experience() {
  const last = timeline.length - 1;
  return (
    <section id="experience" tabIndex={-1} className="xp paper2">
      <div className="wrap xp-grid">
        <div className="xp-side">
          <p className="mono small muted">[03] experience</p>
          <h2 className="h2">Where I&apos;ve<br />been so far.</h2>
          <p className="sub">Study, research and the projects that came out of them, newest first.</p>
          <p className="xp-cmd mono" aria-hidden="true"><b>$</b> git log --graph --oneline</p>
          <p className="chapters"><span className="cond">{String(timeline.length).padStart(2, "0")}</span><span className="mono small muted">chapters</span></p>
        </div>

        <ol className="xp-log">
          {timeline.map((t, i) => {
            const branch = BRANCH.has(i);
            const main = i === 0 ? "M20 36 V100" : i === last ? "M20 0 V36" : "M20 0 V100";
            return (
              <li key={t.title} className={`xp-commit${i === 0 ? " head" : ""}${branch ? " branch" : ""}`}>
                <svg className="xp-graph" viewBox="0 0 72 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d={main} className="main" />
                  {branch && <path d="M20 0 C20 16 48 10 48 30 V70 C48 90 20 84 20 100" className="lane" />}
                </svg>
                <i className="xp-node" aria-hidden="true" />
                <div className="xp-card">
                  <div className="row mono small">
                    <span className="xp-hash">commit <b>{hash(t.title)}</b>{i === 0 && <em> (HEAD → main)</em>}</span>
                    <span className="muted">{t.num}</span>
                  </div>
                  <div className="xp-title"><span className={`chip${i === 0 ? " accent" : ""}`}>{t.label}</span><h3>{t.title}</h3></div>
                  <p className="muted">{t.desc}</p>
                  <ul className="tags">{t.tags.map((g) => <li key={g} className="mono">{g}</li>)}</ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
