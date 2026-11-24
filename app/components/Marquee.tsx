export default function Marquee({ items, sep, className }: { items: string[]; sep: string; className: string }) {
  const run = items.flatMap((t) => [t, sep]);
  // enough repeats that one copy is wider than any screen, so the loop has no visible gap
  const reps = Math.max(1, Math.ceil(2800 / (run.join("").length * 13)));
  const copy = Array.from({ length: reps }, () => run).flat();
  return (
    <div className={`marquee ${className}`}>
      <p className="sr-only">{items.join(", ")}</p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((k) => <span key={k}>{copy.map((t, i) => <b key={i} className={t === sep ? "sep" : undefined}>{t}</b>)}</span>)}
      </div>
    </div>
  );
}
