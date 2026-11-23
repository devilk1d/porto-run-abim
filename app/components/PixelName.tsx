// "ABIM." in the 5×7 block font from the design. Dot is drawn only when dotFill is set.
const GLYPHS = [
  [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"], // A (w: 5)
  ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."], // B (w: 5)
  ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],               // I (w: 3)
  ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"], // M (w: 5)
];

const glyphs = GLYPHS.map((g) => {
  const cells: [number, number][] = [];
  g.forEach((row, y) => [...row].forEach((c, x) => c === "#" && cells.push([x, y])));
  return { w: g[0].length, cells };
});

// Posisi [x0, y0] per huruf untuk mode 1 baris (ABIM.) dan 2 baris (AB / IM.)
const LAYOUT_INLINE: [number, number][] = [
  [0, 0],  // A
  [6, 0],  // B
  [12, 0], // I
  [16, 0], // M
];

const LAYOUT_STACKED: [number, number][] = [
  [0, 0], // A
  [6, 0], // B
  [0, 9], // I (turun 7 + 2 spasi baris)
  [4, 9], // M
];

export default function PixelName({
  fill = "currentColor",
  dotFill,
  className,
  stacked = false,
}: {
  fill?: string;
  dotFill?: string;
  className?: string;
  stacked?: boolean;
}) {
  const layout = stacked ? LAYOUT_STACKED : LAYOUT_INLINE;
  const cols = stacked ? 11 : dotFill ? 23 : 21;
  const rows = stacked ? 16 : 7;
  const dotPos: [number, number] = stacked ? [10, 15] : [22, 6];

  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols * 28 - 4} ${rows * 28 - 4}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="ABIM"
    >
      <g fill={fill}>
        {glyphs.map((g, i) => {
          const [x0, y0] = layout[i];
          return (
            <g key={i} className="glyph">
              {/* invisible hit area so the gaps between pixels don't flicker the hover state */}
              <rect
                className="hit"
                x={x0 * 28 - 4}
                y={y0 * 28 - 4}
                width={g.w * 28 + 4}
                height={7 * 28 + 4}
                fill="transparent"
              />
              {g.cells.map(([x, y]) => (
                <rect
                  key={`${x}-${y}`}
                  x={(x0 + x) * 28}
                  y={(y0 + y) * 28}
                  width="24"
                  height="24"
                  style={{ "--d": x + y } as React.CSSProperties}
                />
              ))}
            </g>
          );
        })}
      </g>
      {dotFill && (
        <rect
          className="pixel-dot"
          x={dotPos[0] * 28}
          y={dotPos[1] * 28}
          width="24"
          height="24"
          fill={dotFill}
        />
      )}
    </svg>
  );
}