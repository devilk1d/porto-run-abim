"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { Magnetic } from "./Extras";
import ContactScene from "./ContactScene";
import { ContactTrigger } from "./ContactDialog";
import { EMAIL, GITHUB, LINKEDIN } from "../data";

// Contact as a small JSON file: every value is a real link, and the email has a copy button.
export default function Contact({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end end"] });
  const timer = useRef<number>(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${EMAIL}`; // clipboard blocked: fall back to opening the mail app
    }
  }

  return (
    <section ref={section} id="contact" tabIndex={-1} className="contact ct">
      <ContactScene progress={scrollYProgress} />
      {children}
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <p className="mono small muted">[08] contact</p>
          <h2 className="contact-h">Let&apos;s build<br />something <span className="accent-text">that runs.</span></h2>
          <p className="contact-sub">Open to internships and collaborations. Tell me what you&apos;re building and I&apos;ll tell you how I&apos;d approach it.</p>
          <div className="contact-ctas">
            <Magnetic><ContactTrigger className="btn accent">Start a conversation <span aria-hidden="true">→</span></ContactTrigger></Magnetic>
          </div>
        </div>

        <div className="cj">
          <div className="cj-bar mono small"><i /><i /><i /><span>contact.json</span></div>
          <dl className="cj-body mono">
            <div className="cj-l"><dt>&quot;status&quot;</dt><dd><span className="live" /><span className="s">&quot;open to internships&quot;</span></dd></div>
            <div className="cj-l">
              <dt>&quot;email&quot;</dt>
              <dd>
                <a className="s" href={`mailto:${EMAIL}`}>&quot;{EMAIL}&quot;</a>
                <button type="button" className="cj-copy" onClick={copy} aria-label={copied ? "Email copied" : "Copy email address"}>{copied ? "copied ✓" : "copy"}</button>
              </dd>
            </div>
            <div className="cj-l"><dt>&quot;github&quot;</dt><dd><a className="s" href={GITHUB} target="_blank" rel="noreferrer">&quot;{GITHUB}&quot; ↗</a></dd></div>
            <div className="cj-l"><dt>&quot;linkedin&quot;</dt><dd><a className="s" href={LINKEDIN} target="_blank" rel="noreferrer">&quot;{LINKEDIN}&quot; ↗</a></dd></div>
            <div className="cj-l"><dt>&quot;based_in&quot;</dt><dd><span className="s">&quot;Malaysia · UTC+8&quot;</span></dd></div>
          </dl>
          <p className="sr-only" role="status" aria-live="polite">{copied ? "Email address copied" : ""}</p>
        </div>
      </div>
    </section>
  );
}
