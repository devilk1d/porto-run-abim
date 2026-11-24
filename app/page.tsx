import Navbar from "./components/Navbar";
import Statement from "./components/Statement";
import About from "./components/About";
import Certificates from "./components/Certificates";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import StackSection from "./components/StackSection";
import Process from "./components/Process";
import Marquee from "./components/Marquee";
import { ContactBlock, SiteFooter } from "./components/SiteEnd";
import Boot from "./components/Boot";
import PosterField from "./components/PosterField";
import StackPile from "./components/StackPile";
import SectionTracker from "./components/SectionTracker";
import { ContactTrigger } from "./components/ContactDialog";
import { PixelArrow } from "./components/Logo";
import { Magnetic, ScrollLink } from "./components/Extras";
import { stackMarquee, outputsMarquee } from "./data";
import { getProjects, getCertificates, getExperiences, getAboutChapters } from "../utils/supabase/queries";

const nav: [string, string][] = [["About", "#about"], ["Experience", "#experience"], ["Stack", "#stack"], ["Projects", "#projects"], ["Certificates", "#certificates"]];

export default async function Home() {
  const [projectsData, certificatesData, experiencesData, aboutChaptersData] = await Promise.all([
    getProjects(),
    getCertificates(),
    getExperiences(),
    getAboutChapters(),
  ]);

  return (
    <>
      <Boot />
      <SectionTracker />

      <a className="skip" href="#main">Skip to content</a>

      <Navbar links={nav} />

      <main id="main">
        {/* S0 Hero: contribution poster. Copy + aside on top, then the name drawn as a contribution grid. */}
        <section id="top" className="hero">
          <div className="hero-in wrap">
            <div className="hero-head">
              <div className="hero-copy">
                <p className="mono hello intro" style={{ "--i": -2 } as React.CSSProperties}>{"// hello, i'm Abim"}</p>
                <h1 className="headline">
                  <span className="line"><span style={{ "--i": 0 } as React.CSSProperties}>I build software that ships,</span></span>
                  <span className="line"><span style={{ "--i": 1 } as React.CSSProperties}>scales, and stays readable.</span></span>
                </h1>
                <div className="hero-ctas intro" style={{ "--i": 3 } as React.CSSProperties}>
                  <Magnetic><ContactTrigger className="hire-hero"><span className="hire-t">Hire Abim</span><span className="hire-ico"><PixelArrow /></span></ContactTrigger></Magnetic>
                  <ScrollLink className="link-u mono" href="#projects">SEE THE PROJECTS ↓</ScrollLink>
                </div>
              </div>
              <div className="hero-aside intro" style={{ "--i": 4 } as React.CSSProperties}>
                <p className="hero-sub">Web apps, mobile apps and ML-backed tools — from the database to the interface. Based in Kuala Lumpur, studying at MSU.</p>
                <StackPile />
              </div>
            </div>
            <PosterField />
          </div>
          <div className="hero-bottom wrap row mono small"><span>[00] index</span><span>one cell = one commit. this one is me.</span><span>scroll to explore ↓</span></div>
        </section>

        <Statement />
        <About items={aboutChaptersData} />

        <Experience items={experiencesData} />

        {/* S4 Stack */}
        <StackSection>
          <div className="tapes" aria-label="Stack and outputs">
            <Marquee items={stackMarquee} sep="//" className="m-stack" />
            <Marquee items={outputsMarquee} sep="·" className="m-out" />
          </div>
        </StackSection>

        {/* Hidden, not deleted: "Why work with me" lives in components/Principles.tsx. To bring it back, import it and render <Principles /> here. */}
        <Projects items={projectsData} />
        <Certificates items={certificatesData} />

        {/* S7 Process */}
        <Process />

        <ContactBlock />
      </main>

      <SiteFooter home />
    </>
  );
}
