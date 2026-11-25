import type { Project } from "../data";

// Up to three app screenshots fanned on a coloured panel (the panel's colour is the project's `accent`). Decorative: the cards describe them in text.
export default function Shots({ pr }: { pr: Project }) {
  const shots = pr.shots || [];
  const [a, b, c] = shots;
  const isSingle = shots.length === 1;
  const isDouble = shots.length === 2;

  return (
    <div className="pk-shots" style={{ backgroundColor: pr.accent }} aria-hidden="true">
      <span className="pk-fig-k mono">{pr.fig} · live app</span>
      {isSingle && a ? (
        <img
          className="pk-shot single"
          src={a.src}
          alt={a.alt || ""}
          width={1100}
          height={619}
          loading="lazy"
          decoding="async"
        />
      ) : isDouble && a && b ? (
        <>
          <img className="pk-shot d1" src={a.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />
          <img className="pk-shot d2" src={b.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />
        </>
      ) : (
        <>
          {a && <img className="pk-shot s1" src={a.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
          {b && <img className="pk-shot s2" src={b.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
          {c && <img className="pk-shot s3" src={c.src} alt="" width={1100} height={619} loading="lazy" decoding="async" />}
        </>
      )}
    </div>
  );
}
