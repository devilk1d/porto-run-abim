import { certificates, type Certificate } from "../data";
import { TransitionLink } from "./PageTransition";

// A blank certificate drawn in SVG, shown until a real picture is set in data.ts.
function BlankCert() {
  return (
    <svg className="cert-blank" viewBox="0 0 300 212" aria-hidden="true">
      <rect x="10" y="10" width="280" height="192" /><rect x="17" y="17" width="266" height="178" className="thin" />
      <path d="M92 52h116M62 74h176M78 90h144M100 106h100" /><path d="M54 168c10-14 18 8 28-6s16 4 26-2" className="thin" /><path d="M192 168h54" className="thin" />
      <circle cx="150" cy="150" r="17" className="fill" /><path d="M143 150l5 5 9-11" className="tick" />
    </svg>
  );
}

// Certificates as paper tickets: the certificate itself is pinned in a window at the top (crop marks, a "kind" tab, a stamped seal), and a perforated stub below holds the credential id.
const TILTS = ["-1.6deg", "1.1deg", "-0.8deg", "1.5deg"];

export function CertificateCard({ c, i }: { c: Certificate; i: number }) {
  const doc = c.img
    ? <img src={c.img} alt={`${c.title}, ${c.issuer}`} width={1200} height={848} loading="lazy" decoding="async" />
    : <BlankCert />;
  return (
    <li className="cert" style={{ "--tilt": TILTS[i % TILTS.length] } as React.CSSProperties}>
      <span className="cert-tape" aria-hidden="true" />
      <div className="cert-media">
        {c.img
          ? <a className="cert-doc" href={c.img} target="_blank" rel="noreferrer" aria-label={`Open the ${c.title} certificate image`}>{doc}<span className="cert-zoom mono" aria-hidden="true">VIEW ↗</span></a>
          : <div className="cert-doc">{doc}</div>}
        <i className="cross tl" /><i className="cross tr" /><i className="cross bl" /><i className="cross br" />
        <span className="cert-kind mono small">CERTIFICATE · {c.year}{c.is_lifetime ? " · LIFETIME" : c.valid_until ? ` · VALID: ${c.valid_until}` : ""}</span>
        <span className="cert-seal" aria-hidden="true">✓</span>
      </div>
      <div className="cert-top">
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

export default function Certificates({ items = certificates }: { items?: Certificate[] }) {
  const list = items && items.length > 0 ? items : certificates;
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
        {list.map((c, i) => (
          <CertificateCard key={`${c.id}-${i}`} c={c} i={i} />
        ))}
      </ol>

      <div className="cert-more">
        <TransitionLink href="/all-certificates" label="all certificates" className="cert-all">
          <span className="cert-all-n mono">{String(list.length).padStart(2, "0")}</span>
          <span className="cert-all-t">View all certificates</span>
          <span className="cert-all-go" aria-hidden="true">→</span>
        </TransitionLink>
      </div>
    </section>
  );
}
