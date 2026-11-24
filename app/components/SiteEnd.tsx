import Contact from "./Contact";
import Marquee from "./Marquee";
import Logo from "./Logo";
import PixelName from "./PixelName";
import { ScrollLink } from "./Extras";
import { TransitionLink } from "./PageTransition";
import { availableMarquee, projects, GITHUB, LINKEDIN, EMAIL } from "../data";

/** The contact section: shared by the home page and the standalone pages. */
export function ContactBlock() {
  return (
    <Contact>
      <Marquee items={availableMarquee} sep="■" className="m-avail" />
    </Contact>
  );
}

// On the home page every link is an in-page anchor. Elsewhere only #contact is (the contact section is on every page); the rest go home.
function FooterLink({ href, home, children }: { href: string; home: boolean; children: React.ReactNode }) {
  if (home || href === "#contact") return <ScrollLink href={href}>{children}</ScrollLink>;
  return <TransitionLink href={`/${href}`} label="home">{children}</TransitionLink>;
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  return (
    <footer className="footer block-section">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <p className="logo"><Logo size={50} /></p>
            <p className="muted">Web apps, ML tools and the<br />unglamorous parts in between.</p>
          </div>
          <nav aria-label="Footer"><h2 className="mono small">NAVIGATE</h2><ul>{[["About", "#about"], ["Projects", "#projects"], ["Stack", "#stack"], ["Process", "#process"], ["Contact", "#contact"]].map(([l, h]) => <li key={h}><FooterLink href={h} home={home}>{l}</FooterLink></li>)}</ul></nav>
          <nav aria-label="Projects"><h2 className="mono small">PROJECTS</h2><ul>{projects.slice(0, 5).map((p) => <li key={p.slug}><FooterLink href="#projects" home={home}>{p.title}</FooterLink></li>)}</ul></nav>
          <nav aria-label="Connect"><h2 className="mono small">CONNECT</h2><ul><li><a href={GITHUB}>GitHub ↗</a></li><li><a href={LINKEDIN}>LinkedIn ↗</a></li><li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li></ul></nav>
        </div>
        <PixelName className="bigname" />
        <div className="footer-bottom row mono small muted">
          <span>© 2026 Abim</span>
          <span>designed in FigCraft · built with Next.js</span>
          <ScrollLink href="#top">BACK TO TOP ↑</ScrollLink>
        </div>
      </div>
    </footer>
  );
}
