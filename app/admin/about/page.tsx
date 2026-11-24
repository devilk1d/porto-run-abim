"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";

type AboutRow = Database["public"]["Tables"]["about_chapters"]["Row"];

export default function AdminAboutPage() {
  const [chapters, setChapters] = useState<AboutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AboutRow | null>(null);
  const [form, setForm] = useState({
    chapter_key: "01 / WHO",
    paragraph: "",
    highlightsStr: "",
    order_index: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChapters = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("about_chapters")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setChapters(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const openCreateModal = () => {
    setEditingChapter(null);
    setForm({
      chapter_key: `0${chapters.length + 1} / NEW`,
      paragraph: "",
      highlightsStr: "",
      order_index: chapters.length,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (ch: AboutRow) => {
    setEditingChapter(ch);
    setForm({
      chapter_key: ch.chapter_key,
      paragraph: ch.paragraph,
      highlightsStr: ch.highlights.join(", "),
      order_index: ch.order_index,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const highlightsArray = form.highlightsStr
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    try {
      if (editingChapter) {
        const { error } = await supabase
          .from("about_chapters")
          .update({
            chapter_key: form.chapter_key,
            paragraph: form.paragraph,
            highlights: highlightsArray,
            order_index: Number(form.order_index),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingChapter.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("about_chapters").insert({
          chapter_key: form.chapter_key,
          paragraph: form.paragraph,
          highlights: highlightsArray,
          order_index: Number(form.order_index),
        });

        if (error) throw error;
      }

      setModalOpen(false);
      fetchChapters();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Confirm deletion of chapter "${key}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("about_chapters").delete().eq("id", id);
    if (!error) {
      fetchChapters();
    } else {
      alert("Error deleting record: " + error.message);
    }
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[04] data table</p>
          <h1 className="h2 admin-title">About Narrative Chapters.</h1>
          <p className="sub">
            Controls narrative text and explicit marker pen highlight targets triggered on scroll.
          </p>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={openCreateModal} className="admin-btn primary">
            + Add About Chapter
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
            <span>~/database/public.about_chapters</span>
          </div>
          <span className="mono small">{chapters.length} CHAPTERS</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Querying table public.about_chapters...
          </div>
        ) : chapters.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Zero records found. Use [+ Add About Chapter] to insert.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Idx</th>
                  <th style={{ width: "130px" }}>Key</th>
                  <th>Narrative Paragraph</th>
                  <th>Target Highlights (Neon Marker)</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((ch) => (
                  <tr key={ch.id}>
                    <td className="mono muted">{String(ch.order_index).padStart(2, "0")}</td>
                    <td className="mono bold">{ch.chapter_key}</td>
                    <td style={{ maxWidth: "440px", lineHeight: 1.5 }}>{ch.paragraph}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {ch.highlights.map((h) => (
                          <span
                            key={h}
                            className="chip accent"
                            style={{ padding: "3px 8px" }}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(ch)}
                          className="admin-btn sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ch.id, ch.chapter_key)}
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

      {modalOpen && (
        <div className="admin-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-window">
            <div className="admin-modal-bar">
              <i />
              <i />
              <i />
              <span>~/about/chapter.form</span>
              <button
                type="button"
                className="close-pill"
                onClick={() => setModalOpen(false)}
              >
                [close esc]
              </button>
            </div>

            <div className="admin-modal-content">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="ch-key">Chapter Key Header</label>
                    <input
                      id="ch-key"
                      required
                      className="mono"
                      value={form.chapter_key}
                      onChange={(e) => setForm({ ...form, chapter_key: e.target.value })}
                      placeholder="e.g. 01 / WHO"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="ch-order">Order</label>
                    <input
                      id="ch-order"
                      type="number"
                      required
                      className="mono"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="ch-para">Paragraph Narrative Text</label>
                  <textarea
                    id="ch-para"
                    required
                    rows={4}
                    value={form.paragraph}
                    onChange={(e) => setForm({ ...form, paragraph: e.target.value })}
                    placeholder="Text that animates on scroll..."
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="ch-hl">Highlighted Phrases (comma-separated)</label>
                  <input
                    id="ch-hl"
                    className="mono"
                    value={form.highlightsStr}
                    onChange={(e) => setForm({ ...form, highlightsStr: e.target.value })}
                    placeholder="full-stack developer, Indonesia, TypeScript"
                  />
                  <span className="mono small muted" style={{ marginTop: "4px" }}>
                    Matches exact strings inside the paragraph to highlight with neon ink during scroll reveal.
                  </span>
                </div>

                <div className="admin-modal-foot">
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? "Writing to database..." : editingChapter ? "Commit Update" : "Insert Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
