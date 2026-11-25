// Small illustrative charts for the project cards (fig.01 – fig.06). Decorative: aria-hidden.
import PixelName from "./PixelName";

const lap = [56, 58, 57, 59, 52, 56, 54, 57, 55, 58, 59, 30, 26, 32, 33, 31, 27, 31, 30, 26, 32, 28, 31, 32, 29, 8, 12, 11, 14, 12, 18, 13, 9];
const pts = (ys: number[], dy = 0) => ys.map((y, i) => `${(i / (ys.length - 1)) * 366},${y * 2.6 + 50 + dy}`).join(" ");

function NextLap() {
  return (
    <svg viewBox="0 0 366 260">
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" x2="366" y1={30 + i * 56} y2={30 + i * 56} className="fig-grid" />)}
      <polyline points={pts(lap)} className="fig-line" />
      <polyline points={pts(lap.map((v, i) => v + ((i * 7) % 5) - 2), 3)} className="fig-line accent dashed" />
    </svg>
  );
}

const shap = [["tenure", 1], ["complaints", 0.86], ["monthly_usage", 0.74], ["plan_type", 0.62], ["support_calls", 0.48], ["sentiment", 0.38]] as const;
function Arka() {
  return (
    <ul className="fig-bars">
      {shap.map(([f, v], i) => (
        <li key={f}><span>{f}</span><b style={{ width: `${v * 100}%` }} className={i === 0 ? "accent" : undefined} /></li>
      ))}
    </ul>
  );
}

function Apex() {
  return (
    <svg viewBox="0 0 366 260">
      <path d="M60 200 C 20 120, 70 40, 150 50 S 260 110, 300 60 S 360 150, 300 210 S 120 240, 60 200 Z" className="fig-track" />
      <path d="M70 196 C 34 124, 80 52, 150 62 S 258 120, 296 74 S 344 152, 294 200 S 124 228, 70 196 Z" className="fig-line accent" />
      {[[42, 130], [150, 56], [312, 92], [190, 224]].map(([x, y]) => <rect key={x} x={x - 4} y={y - 4} width="8" height="8" className="fig-apex" />)}
    </svg>
  );
}

function Iot() {
  return (
    <div className="fig-iot">
      {[["TEMP", "28.4", "°C"], ["HUMIDITY", "71", "%"], ["LIGHT", "640", "lx"]].map(([k, v, u]) => (
        <div key={k}><span className="mono small">{k}</span><strong>{v}<small>{u}</small></strong></div>
      ))}
      <svg viewBox="0 0 366 80" className="fig-spark">
        <polyline className="fig-line accent" points={Array.from({ length: 30 }, (_, i) => `${i * 12.6},${40 + Math.sin(i / 2.3) * 18 + ((i * 13) % 7) - 3}`).join(" ")} />
      </svg>
    </div>
  );
}

const clusters = [[90, 80], [250, 90], [170, 190]];
function Dm() {
  return (
    <svg viewBox="0 0 366 260">
      {clusters.flatMap(([cx, cy], c) =>
        Array.from({ length: 18 }, (_, i) => {
          const a = i * 2.4 + c, r = 10 + ((i * 17) % 34);
          return <circle key={`${c}-${i}`} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r="4" className={`fig-dot c${c}`} />;
        }),
      )}
      {clusters.map(([cx, cy]) => <rect key={cx} x={cx - 6} y={cy - 6} width="12" height="12" className="fig-apex" />)}
    </svg>
  );
}

function Site() {
  return (
    <div className="fig-site">
      <i className="fig-site-nav" />
      <PixelName className="fig-site-name" dotFill="var(--accent)" />
      <i className="fig-site-l1" /><i className="fig-site-l2" />
      <i className="fig-site-block" />
    </div>
  );
}

function DefaultFig() {
  return (
    <svg viewBox="0 0 320 140" className="fig-svg" style={{ width: "100%", height: "100%" }}>
      <rect x="12" y="12" width="296" height="116" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeDasharray="4 4" />
      <rect x="28" y="28" width="128" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="172" y="28" width="120" height="44" fill="var(--accent)" fillOpacity="0.85" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="90" x2="292" y2="90" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <line x1="28" y1="104" x2="210" y2="104" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="40" cy="50" r="6" fill="var(--accent)" />
      <line x1="56" y1="46" x2="136" y2="46" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="56" y1="56" x2="112" y2="56" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
    </svg>
  );
}

const FIGS: Record<string, { el: React.ReactNode; foot: React.ReactNode }> = {
  nextlap: { el: <NextLap />, foot: <><span>lap 1</span><span>lap 40</span></> },
  arka: { el: <Arka />, foot: <span>mean |SHAP value| → churn</span> },
  apex: { el: <Apex />, foot: <span>apex ■ &nbsp; racing line —</span> },
  iot: { el: <Iot />, foot: <span>● streaming — last 30 readings</span> },
  dm: { el: <Dm />, foot: <span>k-means, k = 3</span> },
  site: { el: <Site />, foot: <span>this page, at 30% scale</span> },
};

export default function Figure({ slug, label }: { slug: string; label: string }) {
  const f = FIGS[slug] ?? { el: <DefaultFig />, foot: <span>system · preview</span> };
  return (
    <div className="fig" aria-hidden="true">
      <div className="row mono small">
        <span>{label}</span>
        {slug === "nextlap" && <span className="legend"><i />actual <i className="accent" />predicted</span>}
      </div>
      <div className="fig-body">{f.el}</div>
      <div className="row mono small">{f.foot}</div>
    </div>
  );
}
