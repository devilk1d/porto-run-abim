"use client";
import { createContext, useContext, useRef, useState } from "react";
import { EMAIL } from "../data";

// "Get in touch" pop-up. There is no backend: submitting composes the message and opens the visitor's mail app (mailto:),
// so nothing is stored or sent from this site.
const Ctx = createContext<{ open: () => void }>({ open: () => {} });
const useContactDialog = () => useContext(Ctx);

const TOPICS = ["Internship", "Collaboration", "A project", "Just saying hi"];

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [sent, setSent] = useState(false);

  const open = () => { setSent(false); dialog.current?.showModal(); };
  const close = () => dialog.current?.close();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `[abim.run] ${f.get("topic")} — ${f.get("name")}`;
    const body = `${f.get("message")}\n\n— ${f.get("name")}\n${f.get("email")}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <dialog ref={dialog} className="msg" aria-labelledby="msg-title" data-lenis-prevent {...{ closedby: "any" }}>
        <div className="msg-bar mono small">
          <i /><i /><i /><span>new-message.md</span>
          <button type="button" className="pill mono small" onClick={close}>close <span className="muted">esc</span></button>
        </div>
        <form className="msg-body" onSubmit={submit}>
          <p className="mono small muted">[hello] get in touch</p>
          <h2 id="msg-title">Tell me what you&apos;re building.</h2>
          <p className="msg-sub">Open to internships and collaborations. Send a note and I&apos;ll reply by email.</p>

          <fieldset className="msg-topics">
            <legend className="mono small muted">WHAT'S IT ABOUT</legend>
            {TOPICS.map((t, i) => (
              <label key={t}><input type="radio" name="topic" value={t} defaultChecked={i === 0} /><span className="mono">{t}</span></label>
            ))}
          </fieldset>

          <div className="msg-row">
            <label className="msg-field"><span className="mono small muted">NAME</span><input name="name" required autoComplete="name" placeholder="Your name" /></label>
            <label className="msg-field"><span className="mono small muted">EMAIL</span><input name="email" type="email" required autoComplete="email" placeholder="name@company.com" /></label>
          </div>
          <label className="msg-field"><span className="mono small muted">MESSAGE</span><textarea name="message" required rows={5} placeholder="A few lines about what you have in mind." /></label>

          <div className="msg-actions">
            <button type="submit" className="btn dark">Send message <span aria-hidden="true">→</span></button>
            <a className="link-u mono" href={`mailto:${EMAIL}`}>or write to {EMAIL}</a>
          </div>
          <p className="msg-note mono small" role="status" aria-live="polite">{sent ? "Your mail app should open with the message ready. Nothing is sent until you press send there." : " "}</p>
        </form>
      </dialog>
    </Ctx.Provider>
  );
}

/** A button that opens the pop-up. Extra onClick (e.g. closing a menu) runs first. */
export function ContactTrigger({ onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useContactDialog();
  return <button type="button" {...rest} onClick={(e) => { onClick?.(e); open(); }} />;
}
