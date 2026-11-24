import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { CertificateCard } from "../components/Certificates";
import BackHome from "../components/BackHome";
import { ContactBlock, SiteFooter } from "../components/SiteEnd";
import { certificates } from "../data";

export const metadata: Metadata = {
  title: "All certificates — abim.run",
  description: "Courses, certifications and credentials Abim has earned.",
};

const pad = (n: number) => String(n).padStart(2, "0");

// Group by year, newest first, keeping the original order inside a year.
const years = [...new Set(certificates.map((c) => c.year))].sort((a, b) => Number(b) - Number(a));
const groups = years.map((y) => ({ year: y, items: certificates.filter((c) => c.year === y) }));
const issuers = new Set(certificates.map((c) => c.issuer)).size;
const span = years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : years[0];

function Seal() {
  return (
    <div className="cp-seal" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs><path id="seal-ring" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
        <circle cx="100" cy="100" r="96" className="ring" />
        <text className="ring-text"><textPath href="#seal-ring" startOffset="0" textLength="462" lengthAdjust="spacing">VERIFIED ✓ ON PAPER ✓ VERIFIED ✓ ON PAPER ✓ </textPath></text>
      </svg>
      <span>✓</span>
    </div>
  );
}

export default function AllCertificates() {
  return (
    <>
    <div className="cp">
      <Navbar />
      <BackHome href="/#certificates" />

      <main className="wrap cp-main">
        <header className="cp-hero">
          <div>
            <p className="mono small muted">[00] all certificates</p>
            <h1 className="cp-h">All<br />certificates.</h1>
            <p className="sub">Courses, certifications and credentials, each with an id you can verify.</p>
          </div>
          <Seal />
        </header>

        <dl className="cp-stats">
          <div><dt className="mono small muted">CERTIFICATES</dt><dd className="cond">{pad(certificates.length)}</dd></div>
          <div><dt className="mono small muted">ISSUERS</dt><dd className="cond">{pad(issuers)}</dd></div>
          <div><dt className="mono small muted">YEARS</dt><dd className="cond">{span}</dd></div>
        </dl>

        <div className="cp-ledger">
          {groups.map((g) => (
            <section key={g.year} className="cp-year" aria-label={`Certificates from ${g.year}`}>
              <div className="cp-year-label">
                <span className="cond">{g.year}</span>
                <span className="mono small muted">{pad(g.items.length)} {g.items.length === 1 ? "certificate" : "certificates"}</span>
              </div>
              <ol className="cp-cards">
                {g.items.map((c, i) => <CertificateCard key={c.id} c={c} i={i} />)}
              </ol>
            </section>
          ))}
        </div>
      </main>
    </div>

    <ContactBlock />
    <SiteFooter />
    </>
  );
}
