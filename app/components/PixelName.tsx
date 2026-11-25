import { ABIM_GLYPHS } from "./glyphs";

// "ABIM." in the 5×7 block font from the design. Dot is drawn only when dotFill is set.
const glyphs = ABIM_GLYPHS.map(([x0, g]) => {
  const cells: [number, number][] = [];
  g.forEach((row, y) => [...row].forEach((c, x) => c === "#" && cells.push([x, y])));
  return { x0, w: g[0].length, cells };
});

export default function PixelName({
  fill = "currentColor",
  dotFill,
  className,
}: {
  fill?: string;
  dotFill?: string;
  className?: string;
}) {
  const cols = dotFill ? 23 : 21;
  const rows = 7;
  const dotPos: [number, number] = [22, 6];

  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols * 28 - 4} ${rows * 28 - 4}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="ABIM"
    >
      <g fill={fill}>
        {glyphs.map((g, i) => (
          <g key={i} className="glyph">
            {/* invisible hit area so the gaps between pixels don't flicker the hover state */}
            <rect
              className="hit"
              x={g.x0 * 28 - 4}
              y={-4}
              width={g.w * 28 + 4}
              height={7 * 28 + 4}
              fill="transparent"
            />
            {g.cells.map(([x, y]) => (
              <rect
                key={`${x}-${y}`}
                x={(g.x0 + x) * 28}
                y={y * 28}
                width="24"
                height="24"
                style={{ "--d": x + y } as React.CSSProperties}
              />
            ))}
          </g>
        ))}
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