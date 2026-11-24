import type { Metadata } from "next";
import ProjectIndex from "../components/ProjectIndex";
import Navbar from "../components/Navbar";
import BackHome from "../components/BackHome";
import { ContactBlock, SiteFooter } from "../components/SiteEnd";
import { projects } from "../data";

export const metadata: Metadata = {
  title: "All projects — abim.run",
  description: "Every project Abim has built: web apps, ML research and hardware.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function AllProjects() {
  return (
    <>
      <Navbar />
      <BackHome href="/#projects" />

      <main className="wrap ap">
        <div className="ap-head">
          <div>
            <p className="mono small muted">[00] all projects</p>
            <h1 className="h2 ap-h">All projects.</h1>
          </div>
          <p className="sub">Everything I&apos;ve built so far — web apps, ML research and hardware, from thesis to side project. {pad(projects.length)} in total.</p>
        </div>

        <ProjectIndex />
      </main>

      <ContactBlock />
      <SiteFooter />
    </>
  );
}
