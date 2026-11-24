// Hero poster: "ABIM." drawn with cells of a GitHub-style contribution grid. The other cells are a fixed pseudo-random
// pattern (same on server and client), not real GitHub data. The name lives in columns 8–30, so narrow containers can drop the outer columns.
const COLS = 40, ROWS = 14, X0 = 8, Y0 = 3;
const GLYPHS: [number, string[]][] = [
  [0, [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"]],
  [6, ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."]],
  [12, ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"]],
  [16, ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"]],
];
const NAME = new Set<number>();
GLYPHS.forEach(([x0, g]) => g.forEach((row, y) => [...row].forEach((c, x) => c === "#" && NAME.add((Y0 + y) * COLS + X0 + x0 + x))));
const DOT = (Y0 + 6) * COLS + X0 + 22; // the blinking full stop
const HOT = 2 * COLS + 32; // the cell the tooltip points at

let seed = 31;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const v = rnd(), x = i % COLS;
  const k = i === DOT ? "d" : i === HOT ? "h" : NAME.has(i) ? "n" : v < 0.62 ? "l0" : v < 0.86 ? "l1" : "l2";
  return `${k}${x < 6 || x > 32 ? " o" : ""}${i < COLS ? " t" : ""}${i >= 11 * COLS ? (i >= 12 * COLS ? " b" : " c") : ""}`; // o: outer column; t, c, b: top / bottom rows that short screens drop
});
// column / row of a cell: the intro animation staggers on them
const at = (i: number) => ({ "--x": i % COLS, "--y": Math.floor(i / COLS) }) as React.CSSProperties;
const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export default function PosterField() {
  return (
    <div className="poster">
      <div className="mo mono" aria-hidden="true">{MONTHS.map((m) => <span key={m}>{m}</span>)}</div>
      <div className="fld-wrap">
        <div className="fld" role="img" aria-label="ABIM">
          {CELLS.map((c, i) => i === HOT
            ? <i key={i} className={c} style={at(i)}><span className="tip mono"><b>e4a1c07</b> ship nextlap.live</span></i>
            : <i key={i} className={c} style={at(i)} />)}
        </div>
        <div className="sel" aria-hidden="true"><i /><i /><i /><i /><span className="mono">abim.tsx</span></div>
        <p className="stk mono">OPEN TO<br />INTERNSHIPS<br />&amp; COLLABS
          <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M3 13L13 3M5 3h8v8" stroke="#101213" strokeWidth="2.4" fill="none" /></svg></span>
        </p>
      </div>
      <div className="leg mono" aria-hidden="true">less <i className="l0" /><i className="l1" /><i className="l2" /><i className="n" /> more</div>
    </div>
  );
}
