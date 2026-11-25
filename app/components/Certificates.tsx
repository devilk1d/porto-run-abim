"use client";
import { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      document.body.style.overflow = "";
    };
    d.addEventListener("close", onClose);
    return () => {
      d.removeEventListener("close", onClose);
      document.body.style.overflow = "";
    };
  }, []);

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dialogRef.current) {
      document.body.style.overflow = "hidden";
      dialogRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const doc = c.img
    ? <img src={c.img} alt={`${c.title}, ${c.issuer}`} width={1200} height={848} loading="lazy" decoding="async" />
    : <BlankCert />;
  return (
    <li className="cert" style={{ "--tilt": TILTS[i % TILTS.length] } as React.CSSProperties}>
      <span className="cert-tape" aria-hidden="true" />
      <div className="cert-media">
        {c.img ? (
          <button
            type="button"
            className="cert-doc"
            onClick={openModal}
            aria-label={`Open ${c.title} certificate image preview`}
          >
            {doc}
            <span className="cert-zoom mono" aria-hidden="true">VIEW ↗</span>
          </button>
        ) : (
          <div className="cert-doc">{doc}</div>
        )}
        <i className="cross tl" /><i className="cross tr" /><i className="cross bl" /><i className="cross br" />
        <span className="cert-kind mono small">CERTIFICATE · {c.year}</span>
        <span className="cert-seal" aria-hidden="true">✓</span>
      </div>
      <div className="cert-top">
        <h3>{c.title}</h3>
        <p className="cert-issuer">{c.issuer}</p>
      </div>
      <div className="cert-stub">
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap", minWidth: 0, flex: 1 }}>
          <div style={{ minWidth: "90px" }}>
            <p className="mono small muted">CREDENTIAL ID</p>
            <p className="mono cert-id">{c.id}</p>
          </div>
          {(c.valid_until || c.is_lifetime) && (
            <div>
              <p className="mono small muted">VALID DATE</p>
              <p className="mono cert-id">{c.is_lifetime ? "LIFETIME" : c.valid_until}</p>
            </div>
          )}
        </div>
        <a className="link-u mono" href={c.url} target="_blank" rel="noreferrer">VERIFY ↗</a>
      </div>

      {c.img && (
        <dialog
          ref={dialogRef}
          className="msg cert-preview-dialog"
          aria-labelledby={`cert-modal-title-${i}`}
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === dialogRef.current) closeModal();
          }}
        >
          <div className="msg-bar mono small">
            <i /><i /><i />
            <span>~/certificates/{c.id ? c.id.toLowerCase() : "preview"}.img</span>
            <button
              type="button"
              className="pill mono small"
              onClick={closeModal}
              aria-label="Close certificate preview"
            >
              close <span className="muted">esc</span>
            </button>
          </div>

          <div className="cert-preview-body">
            <div className="cert-preview-img-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.img}
                alt={`${c.title}, ${c.issuer}`}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>

            <div className="cert-preview-meta">
              <div style={{ flex: 1, minWidth: "240px" }}>
                <p className="mono small muted" style={{ marginBottom: "4px" }}>
                  {c.issuer.toUpperCase()} · {c.year}
                </p>
                <h3 id={`cert-modal-title-${i}`} style={{ fontSize: "20px", fontWeight: "700", lineHeight: 1.25 }}>
                  {c.title}
                </h3>
                <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
                  <div>
                    <span className="mono small muted" style={{ display: "block" }}>
                      CREDENTIAL ID
                    </span>
                    <span className="mono small bold">{c.id}</span>
                  </div>
                  {(c.valid_until || c.is_lifetime) && (
                    <div>
                      <span className="mono small muted" style={{ display: "block" }}>
                        VALIDITY
                      </span>
                      <span className="mono small bold">
                        {c.is_lifetime ? "LIFETIME" : c.valid_until}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn dark"
                    style={{ textDecoration: "none", fontSize: "13px" }}
                  >
                    Verify Credential <span aria-hidden="true">↗</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn ghost"
                  onClick={closeModal}
                  style={{ fontSize: "13px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </li>
  );
}

export default function Certificates({ items = certificates }: { items?: Certificate[] }) {
  const list = items && items.length > 0 ? items : certificates;
  const displayList = list.slice(0, 3);
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
        {displayList.map((c, i) => (
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
