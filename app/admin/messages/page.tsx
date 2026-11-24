"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";

type MessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (msg: MessageRow) => {
    const supabase = createClient();
    const nextRead = !msg.is_read;
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: nextRead })
      .eq("id", msg.id);

    if (!error) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: nextRead } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: nextRead });
      }
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Confirm deletion of this message record?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } else {
      alert("Error deleting record: " + error.message);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[05] data table</p>
          <h1 className="h2 admin-title">Inbound Inquiries.</h1>
          <p className="sub">
            Direct visitor inquiries submitted via the modal on the public portfolio.
          </p>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={fetchMessages} className="admin-btn">
            ↻ Sync Inbox
          </button>
        </div>
      </div>

      <div className="admin-box">
        <div className="admin-box-bar">
          <div className="bar-title">
            <div className="dots">
              <i />
              <i />
              <i />
            </div>
            <span>~/database/public.contact_messages</span>
          </div>
          <span className="mono small">
            {unreadCount > 0 ? `${unreadCount} UNREAD / ` : ""}{messages.length} ENTRIES
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Querying table public.contact_messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Zero messages logged. Inquiries from the contact dialog will appear here.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>State</th>
                  <th>Sender Identity</th>
                  <th>Topic</th>
                  <th>Snippet</th>
                  <th>Logged Date</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr
                    key={m.id}
                    style={{ background: !m.is_read ? "light-dark(rgba(201, 242, 77, 0.08), rgba(201, 242, 77, 0.05))" : undefined }}
                  >
                    <td>
                      {!m.is_read ? (
                        <span className="chip accent">UNREAD</span>
                      ) : (
                        <span className="mono small muted">Read</span>
                      )}
                    </td>
                    <td>
                      <b style={{ display: "block" }}>{m.name}</b>
                      <a href={`mailto:${m.email}`} className="mono small link-u">
                        {m.email}
                      </a>
                    </td>
                    <td>
                      <span className="chip dark">{m.topic}</span>
                    </td>
                    <td style={{ maxWidth: "360px" }}>
                      <p
                        className="mono small muted"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.message}
                      </p>
                    </td>
                    <td className="mono small muted">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(m);
                            if (!m.is_read) toggleRead(m);
                          }}
                          className="admin-btn sm"
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRead(m)}
                          className="admin-btn sm"
                        >
                          {m.is_read ? "Mark Unread" : "Mark Read"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMessage(m.id)}
                          className="admin-btn sm danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="admin-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-window">
            <div className="admin-modal-bar">
              <i />
              <i />
              <i />
              <span>~/messages/inquiry-details.md</span>
              <button
                type="button"
                className="close-pill"
                onClick={() => setSelectedMessage(null)}
              >
                [close esc]
              </button>
            </div>

            <div className="admin-modal-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "700" }}>{selectedMessage.name}</h2>
                  <p className="mono small muted" style={{ marginTop: "4px" }}>
                    Sender: <a href={`mailto:${selectedMessage.email}`} className="link-u">{selectedMessage.email}</a>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="chip accent" style={{ display: "block", marginBottom: "4px" }}>{selectedMessage.topic}</span>
                  <span className="mono small muted">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--ink)",
                  padding: "20px",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  fontSize: "14px",
                  boxShadow: "4px 4px 0 var(--line)",
                }}
              >
                {selectedMessage.message}
              </div>

              <div className="admin-modal-foot">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: [abim.run] ${selectedMessage.topic}`)}`}
                  className="admin-btn primary"
                >
                  Reply via Email ↗
                </a>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setSelectedMessage(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
