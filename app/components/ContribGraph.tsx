// Decorative GitHub-style contribution grid: a fixed pseudo-random pattern (same on server and client), not real GitHub data.
const WEEKS = 53;
let seed = 7;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const CELLS = Array.from({ length: WEEKS * 7 }, () => { const v = rnd(); return v < 0.6 ? 0 : v < 0.78 ? 1 : v < 0.9 ? 2 : v < 0.97 ? 3 : 4; });

export default function ContribGraph() {
  return (
    <div className="contrib-card" aria-hidden="true">
      <div className="contrib-head mono small muted">
        <span>ACTIVITY</span>
        <span className="contrib-legend">less {[0, 1, 2, 3, 4].map((l) => <i key={l} data-l={l} />)} more</span>
      </div>
      <div className="contrib">{CELLS.map((l, i) => <i key={i} data-l={l} />)}</div>
    </div>
  );
}
