import { TransitionLink } from "./PageTransition";

// The abim.run arrow, pointing left, as pixel cells [x, y]. On hover the cells fly out to the left and slide back in from the right.
const ARROW_LEFT = [[0, 3], [1, 2], [1, 3], [1, 4], [2, 1], [2, 3], [2, 5], [3, 3], [4, 3], [5, 3], [6, 3]];

/** Floating, icon-only "back to the home page" button, fixed at the left edge and centred vertically. */
export default function BackHome({ href }: { href: string }) {
  return (
    <TransitionLink href={href} label="home" className="back-home" aria-label="Back to the home page">
      <svg viewBox="0 0 7 7" width="26" height="26" shapeRendering="crispEdges" aria-hidden="true">
        {ARROW_LEFT.map(([x, y]) => <rect key={`${x}-${y}`} style={{ "--i": x } as React.CSSProperties} x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" />)}
      </svg>
    </TransitionLink>
  );
}
