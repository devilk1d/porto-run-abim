import Contact from "./Contact";
import Marquee from "./Marquee";
import Logo from "./Logo";
import PixelName from "./PixelName";
import { ScrollLink } from "./Extras";
import { TransitionLink } from "./PageTransition";
import { availableMarquee, projects as defaultProjects, GITHUB, LINKEDIN, EMAIL, type Project } from "../data";
import { getProjects } from "../../utils/supabase/queries";

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

const FOOTER_NAV: [string, string][] = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Stack", "#stack"],
  ["Projects", "#projects"],
  ["Certificates", "#certificates"],
  ["Process", "#process"],
  ["Contact", "#contact"],
];

export async function SiteFooter({ home = false, projects: items }: { home?: boolean; projects?: Project[] }) {
  const projectList = items ?? (await getProjects());
  const visibleProjects = (projectList.length > 0 ? projectList : defaultProjects).slice(0, 5);

  return (
    <footer className="footer block-section">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <p className="logo"><Logo size={50} /></p>
            <p className="muted">Web apps, ML tools and the<br />unglamorous parts in between.</p>
          </div>
          <nav aria-label="Footer"><h2 className="mono small">NAVIGATE</h2><ul>{FOOTER_NAV.map(([l, h]) => <li key={h}><FooterLink href={h} home={home}>{l}</FooterLink></li>)}</ul></nav>
          <nav aria-label="Projects"><h2 className="mono small">PROJECTS</h2><ul>{visibleProjects.map((p) => <li key={p.slug}><FooterLink href="#projects" home={home}>{p.title}</FooterLink></li>)}</ul></nav>
          <nav aria-label="Connect"><h2 className="mono small">CONNECT</h2><ul><li><a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a></li><li><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn ↗</a></li><li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li></ul></nav>
        </div>
        <PixelName className="bigname" />
        <div className="footer-bottom row mono small muted">
          <span>© 2026 Abim</span>
          <span>designed in Figma · built with Next.js</span>
          <ScrollLink href="#top">BACK TO TOP ↑</ScrollLink>
        </div>
      </div>
    </footer>
  );
}
