"use client";
import { createContext, useContext, useRef, useState } from "react";
import { EMAIL } from "../data";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useContactDialog = () => useContext(Ctx);

const TOPICS = ["Internship", "Collaboration", "A project", "Just saying hi"];

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const open = () => {
    setSentMessage(null);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSentMessage(null);

    const f = new FormData(e.currentTarget);
    const topic = (f.get("topic") as string) || "General";
    const name = (f.get("name") as string) || "";
    const email = (f.get("email") as string) || "";
    const message = (f.get("message") as string) || "";

    try {
      const { createClient } = await import("../../utils/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("contact_messages").insert({
        topic,
        name,
        email,
        message,
      });

      if (error) {
        throw error;
      }

      setSentMessage("Message sent successfully! It has been delivered to Abim's inbox.");
      formRef.current?.reset();
    } catch {
      // Graceful fallback to mailto if database connection fails
      const subject = `[abim.run] ${topic} — ${name}`;
      const body = `${message}\n\n— ${name}\n${email}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSentMessage("Opening your mail app to send the message...");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <dialog ref={dialog} className="msg" aria-labelledby="msg-title" data-lenis-prevent {...{ closedby: "any" }}>
        <div className="msg-bar mono small">
          <i /><i /><i /><span>new-message.md</span>
          <button type="button" className="pill mono small" onClick={close}>close <span className="muted">esc</span></button>
        </div>
        <form ref={formRef} className="msg-body" onSubmit={submit}>
          <p className="mono small muted">[hello] get in touch</p>
          <h2 id="msg-title">Tell me what you&apos;re building.</h2>
          <p className="msg-sub">Open to internships and collaborations. Send a note and I&apos;ll reply by email.</p>

          <fieldset className="msg-topics">
            <legend className="mono small muted">WHAT&apos;S IT ABOUT</legend>
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
            <button type="submit" className="btn dark" disabled={submitting}>
              {submitting ? "Sending..." : "Send message"} <span aria-hidden="true">→</span>
            </button>
            <a className="link-u mono" href={`mailto:${EMAIL}`}>or write directly to {EMAIL}</a>
          </div>
          <p className="msg-note mono small" role="status" aria-live="polite">
            {sentMessage ? sentMessage : " "}
          </p>
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
