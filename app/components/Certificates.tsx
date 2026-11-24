import { certificates } from "../data";
import { TransitionLink } from "./PageTransition";

// Certificates as paper tickets: taped to the page at a slight angle, with a perforated stub holding the credential id.
const TILTS = ["-1.6deg", "1.1deg", "-0.8deg", "1.5deg"];

export function CertificateCard({ c, i }: { c: (typeof certificates)[number]; i: number }) {
  return (
    <li className="cert" style={{ "--tilt": TILTS[i % TILTS.length] } as React.CSSProperties}>
      <span className="cert-tape" aria-hidden="true" />
      <div className="cert-top">
        <div className="row mono small"><span className="muted">CERTIFICATE</span><span>{c.year}</span></div>
        <span className="cert-seal" aria-hidden="true">✓</span>
        <h3>{c.title}</h3>
        <p className="cert-issuer">{c.issuer}</p>
      </div>
      <div className="cert-stub">
        <div>
          <p className="mono small muted">CREDENTIAL ID</p>
          <p className="mono cert-id">{c.id}</p>
        </div>
        <a className="link-u mono" href={c.url} target="_blank" rel="noreferrer">VERIFY ↗</a>
      </div>
    </li>
  );
}

export default function Certificates() {
  return (
    <section id="certificates" tabIndex={-1} className="certs wrap">
      <div className="stack-head">
        <div>
          <p className="mono small muted">[06] certificates</p>
          <h2 className="h2">On paper.</h2>
        </div>
        <div>
          <p className="mono small muted count">06 / 08</p>
          <p className="sub">Courses, certifications and credentials, each with an id you can verify.</p>
        </div>
      </div>

      <ol className="cert-grid">
        {certificates.map((c, i) => (
          <CertificateCard key={c.id} c={c} i={i} />
        ))}
      </ol>

      <div className="cert-more">
        <TransitionLink href="/all-certificates" label="all certificates" className="cert-all">
          <span className="cert-all-n mono">{String(certificates.length).padStart(2, "0")}</span>
          <span className="cert-all-t">View all certificates</span>
          <span className="cert-all-go" aria-hidden="true">→</span>
        </TransitionLink>
      </div>
    </section>
  );
}
