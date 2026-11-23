// The abim.run mark: a pixel arrow pointing up and out ("ship it") on a rounded square. Colours come from CSS (.logo-mark),
// so it flips with the theme and can be inverted on dark blocks like the footer.
const ARROW = [[3, 2], [4, 2], [5, 2], [6, 2], [6, 3], [6, 4], [6, 5], [5, 3], [4, 4], [3, 5], [2, 6]];

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo-mark" viewBox="0 0 9 9" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      <rect className="lm-badge" width="9" height="9" rx="1.2" />
      {ARROW.map(([x, y], i) => <rect key={`${x}-${y}`} style={{ "--i": i } as React.CSSProperties} className="lm-arrow" x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" />)}
    </svg>
  );
}

/** The logo's pixel arrow on its own (no badge), for buttons. Its cells reuse the launch animation on hover. */
export function PixelArrow({ size = 22 }: { size?: number }) {
  return (
    <svg className="px-arrow" viewBox="1 1 7 7" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {ARROW.map(([x, y], i) => <rect key={`${x}-${y}`} style={{ "--i": i } as React.CSSProperties} className="lm-arrow" x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" />)}
    </svg>
  );
}
