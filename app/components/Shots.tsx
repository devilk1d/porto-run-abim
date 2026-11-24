import type { Project } from "../data";

// Up to three app screenshots fanned on a coloured panel (the panel's colour is the project's `accent`). Decorative: the cards describe them in text.
export default function Shots({ pr }: { pr: Project }) {
  const [a, b, c] = pr.shots!;
  return (
    <div className="pk-shots" style={{ backgroundColor: pr.accent }} aria-hidden="true">
      <span className="pk-fig-k mono">{pr.fig} · live app</span>
      {a && <img className="pk-shot s1" src={a.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
      {b && <img className="pk-shot s2" src={b.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
      {c && <img className="pk-shot s3" src={c.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
    </div>
  );
}
