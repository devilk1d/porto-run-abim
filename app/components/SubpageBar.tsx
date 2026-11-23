import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { TransitionLink } from "./PageTransition";

/** Top bar shared by the standalone pages (/projects, /certificates): logo, current path, theme toggle, way back home. */
export default function SubpageBar({ path }: { path: string }) {
  return (
    <header className="ap-bar">
      <TransitionLink href="/" label="home" className="logo"><Logo /></TransitionLink>
      <span className="mono small muted ap-path">{path}</span>
      <ThemeToggle />
      <TransitionLink href="/" label="home" className="btn dark small-btn">← Back home</TransitionLink>
    </header>
  );
}
