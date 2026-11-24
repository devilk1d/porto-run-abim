import PixelName from "./components/PixelName";
import Navbar from "./components/Navbar";
import Statement from "./components/Statement";
import About from "./components/About";
import Certificates from "./components/Certificates";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import StackSection from "./components/StackSection";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Boot from "./components/Boot";
import ContribGraph from "./components/ContribGraph";
import SectionTracker from "./components/SectionTracker";
import { ContactTrigger } from "./components/ContactDialog";
import Logo, { PixelArrow } from "./components/Logo";
import { LocalTime, Magnetic } from "./components/Extras";
import { stackMarquee, outputsMarquee, availableMarquee, projects, GITHUB, LINKEDIN, EMAIL } from "./data";

function Marquee({ items, sep, className }: { items: string[]; sep: string; className: string }) {
  const run = items.flatMap((t) => [t, sep]);
  // enough repeats that one copy is wider than any screen, so the loop has no visible gap
  const reps = Math.max(1, Math.ceil(2800 / (run.join("").length * 13)));
  const copy = Array.from({ length: reps }, () => run).flat();
  return (
    <div className={`marquee ${className}`}>
      <p className="sr-only">{items.join(", ")}</p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((k) => <span key={k}>{copy.map((t, i) => <b key={i} className={t === sep ? "sep" : undefined}>{t}</b>)}</span>)}
      </div>
    </div>
  );
}

const nav: [string, string][] = [["About", "#about"], ["Experience", "#experience"], ["Stack", "#stack"], ["Projects", "#projects"], ["Certificates", "#certificates"], ["Process", "#process"], ["Contact", "#contact"]];

export default function Home() {
  return (
    <>
      <Boot />
      <SectionTracker />

      <a className="skip" href="#main">Skip to content</a>

      <Navbar links={nav} />

      <main id="main">
        {/* S0 Hero: copy on the left, name card + live widgets on the right; one column below 62rem. */}
        <section id="top" className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-in wrap">
            <div className="hero-copy">
              <p className="mono hello intro" style={{ "--i": -2 } as React.CSSProperties}>{"// hello, i'm Abim"}</p>
              <h1 className="headline">
                <span className="line"><span style={{ "--i": 0 } as React.CSSProperties}>I build software that ships,</span></span>
                <span className="line"><span style={{ "--i": 1 } as React.CSSProperties}>scales, and <span className="muted2">stays readable.</span></span></span>
              </h1>
              <p className="hero-sub intro" style={{ "--i": 3 } as React.CSSProperties}>Web apps, mobile apps and ML-backed tools — from the database to the interface. Based in Kuala Lumpur, studying at MSU.</p>
              <div className="hero-ctas intro" style={{ "--i": 4 } as React.CSSProperties}>
                <Magnetic><ContactTrigger className="hire-hero"><span className="hire-t">Hire Abim</span><span className="hire-ico"><PixelArrow /></span></ContactTrigger></Magnetic>
                <a className="link-u mono" href="#projects">SEE THE PROJECTS ↓</a>
              </div>
              <ul className="hero-tags mono intro" style={{ "--i": 5 } as React.CSSProperties} aria-label="What I work on">
                <li>web apps</li><li>mobile</li><li>machine learning</li><li className="accent">ship it ✓</li>
              </ul>
            </div>

            <div className="hero-visual">
              <div className="hero-mark intro" style={{ "--i": -1 } as React.CSSProperties}>
                <span className="sel-tag mono" aria-hidden="true">abim.tsx</span>
                <div className="sel-box">
                  <PixelName className="hero-name" fill="var(--ink)" dotFill="var(--accent)" />
                  <i className="h tl" /><i className="h tr" /><i className="h bl" /><i className="h br" />
                </div>
              </div>
              <div className="hero-widgets">
                <div className="widget time intro" style={{ "--i": 5 } as React.CSSProperties}>
                  <p className="mono small muted"><i className="live" />LOCAL TIME</p>
                  <p className="v"><LocalTime /></p>
                </div>
                <div className="widget commit intro" style={{ "--i": 6 } as React.CSSProperties}>
                  <p className="mono small">LATEST COMMIT</p>
                  <p className="mono"><span className="hash">e4a1c07</span> ship nextlap.live</p>
                </div>
              </div>
              <div className="intro" style={{ "--i": 7 } as React.CSSProperties}><ContribGraph /></div>
            </div>
          </div>
          <div className="hero-bottom wrap row mono small muted"><span>[00] index</span><span>scroll to explore ↓</span></div>
        </section>

        <Statement />
        <About />

        <Experience />

        {/* S4 Stack */}
        <StackSection>
          <div className="tapes" aria-label="Stack and outputs">
            <Marquee items={stackMarquee} sep="//" className="m-stack" />
            <Marquee items={outputsMarquee} sep="·" className="m-out" />
          </div>
        </StackSection>

        {/* Hidden, not deleted: "Why work with me" lives in components/Principles.tsx. To bring it back, import it and render <Principles /> here. */}
        <Projects />
        <Certificates />

        {/* S7 Process */}
        <Process />

        {/* S8 Contact */}
        <Contact>
          <Marquee items={availableMarquee} sep="■" className="m-avail" />
        </Contact>
      </main>

      {/* S9 Footer */}
      <footer className="footer block-section">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <p className="logo"><Logo size={50} /></p>
              <p className="muted">Web apps, ML tools and the<br />unglamorous parts in between.</p>
            </div>
            <nav aria-label="Footer"><h2 className="mono small">NAVIGATE</h2><ul>{[["About", "#about"], ["Projects", "#projects"], ["Stack", "#stack"], ["Process", "#process"], ["Contact", "#contact"]].map(([l, h]) => <li key={h}><a href={h}>{l}</a></li>)}</ul></nav>
            <nav aria-label="Projects"><h2 className="mono small">PROJECTS</h2><ul>{projects.slice(0, 5).map((p) => <li key={p.slug}><a href="#projects">{p.title}</a></li>)}</ul></nav>
            <nav aria-label="Connect"><h2 className="mono small">CONNECT</h2><ul><li><a href={GITHUB}>GitHub ↗</a></li><li><a href={LINKEDIN}>LinkedIn ↗</a></li><li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li></ul></nav>
          </div>
          <PixelName className="bigname" />
          <div className="footer-bottom row mono small muted">
            <span>© 2026 Abim</span>
            <span>designed in FigCraft · built with Next.js</span>
            <a href="#top">BACK TO TOP ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}
