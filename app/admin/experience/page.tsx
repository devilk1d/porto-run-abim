"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";
import { reorderItems } from "../../../utils/supabase/reorder";
import OrderControl from "../components/OrderControl";
import AdminModal from "../components/AdminModal";

type ExpRow = Database["public"]["Tables"]["experiences"]["Row"];

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<ExpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExpRow | null>(null);
  const [form, setForm] = useState({
    label: "NOW",
    chapter_num: "chapter 01",
    title: "",
    description: "",
    tagsStr: "web, ml",
    is_branch: false,
    order_index: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchExperiences = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setExperiences(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    setForm({
      label: "BUILD",
      chapter_num: `chapter ${String(experiences.length + 1).padStart(2, "0")}`,
      title: "",
      description: "",
      tagsStr: "web, ml, mobile",
      is_branch: false,
      order_index: experiences.length,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (exp: ExpRow) => {
    setEditingExp(exp);
    setForm({
      label: exp.label,
      chapter_num: exp.chapter_num,
      title: exp.title,
      description: exp.description,
      tagsStr: exp.tags.join(", "),
      is_branch: exp.is_branch,
      order_index: exp.order_index,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const tagsArray = form.tagsStr
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      if (editingExp) {
        const { error } = await supabase
          .from("experiences")
          .update({
            label: form.label,
            chapter_num: form.chapter_num,
            title: form.title,
            description: form.description,
            tags: tagsArray,
            is_branch: Boolean(form.is_branch),
            order_index: Number(form.order_index),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingExp.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("experiences").insert({
          label: form.label,
          chapter_num: form.chapter_num,
          title: form.title,
          description: form.description,
          tags: tagsArray,
          is_branch: Boolean(form.is_branch),
          order_index: Number(form.order_index),
        });

        if (error) throw error;
      }

      setModalOpen(false);
      fetchExperiences();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirm deletion of chapter "${title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (!error) {
      fetchExperiences();
    } else {
      alert("Error deleting record: " + error.message);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(true);
    const prev = experiences;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < experiences.length) {
      const swapped = [...experiences];
      const tmp = swapped[index];
      swapped[index] = swapped[targetIndex];
      swapped[targetIndex] = tmp;
      setExperiences(swapped.map((it, idx) => ({ ...it, order_index: idx })));
    }
    const res = await reorderItems("experiences", prev, index, direction);
    if (res.success) {
      setExperiences(res.newItems);
    } else {
      setExperiences(prev);
      alert(res.error || "Failed to reorder experiences.");
    }
    setReordering(false);
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[03] data table</p>
          <h1 className="h2 admin-title">Experience & Timeline.</h1>
          <p className="sub">Manage career and research chapters plotted as an interactive git log graph.</p>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={openCreateModal} className="admin-btn primary">
            + Add Commit Chapter
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
            <span>~/database/public.experiences</span>
          </div>
          <span className="mono small">{experiences.length} COMMITS</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Querying table public.experiences...
          </div>
        ) : experiences.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Zero records found. Use [+ Add Commit Chapter] to insert.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Idx</th>
                  <th>Chapter</th>
                  <th>Commit Title & Scope</th>
                  <th>Graph Topology</th>
                  <th>Stack Tags</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp, i) => (
                  <tr key={exp.id}>
                    <td>
                      <OrderControl
                        index={i}
                        total={experiences.length}
                        disabled={reordering}
                        onMoveUp={() => handleReorder(i, "up")}
                        onMoveDown={() => handleReorder(i, "down")}
                      />
                    </td>
                    <td>
                      <span className="chip accent" style={{ marginRight: "6px" }}>{exp.label}</span>
                      <span className="mono small muted">{exp.chapter_num}</span>
                    </td>
                    <td>
                      <b style={{ display: "block" }}>{exp.title}</b>
                      <p className="muted mono small" style={{ marginTop: "4px" }}>
                        {exp.description}
                      </p>
                    </td>
                    <td>
                      {exp.is_branch ? (
                        <span className="mono small" style={{ color: "var(--accent)", fontWeight: "600" }}>
                          [lane: branch]
                        </span>
                      ) : (
                        <span className="mono small muted">[lane: trunk]</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {exp.tags.map((tg) => (
                          <span key={tg} className="chip dark" style={{ padding: "2px 6px" }}>
                            {tg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(exp)}
                          className="admin-btn sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exp.id, exp.title)}
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

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`~/experience/${editingExp ? "edit" : "new"}-commit.form`}
      >
        {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="e-label">Label Code</label>
                    <input
                      id="e-label"
                      required
                      className="mono"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. NOW, THESIS, RESEARCH"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="e-chap">Chapter Num</label>
                    <input
                      id="e-chap"
                      required
                      className="mono"
                      value={form.chapter_num}
                      onChange={(e) => setForm({ ...form, chapter_num: e.target.value })}
                      placeholder="chapter 04"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="e-title">Commit Title / Institution</label>
                  <input
                    id="e-title"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Student at Management and Science University"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="e-desc">Chapter Narrative</label>
                  <textarea
                    id="e-desc"
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="e-tags">Tags (comma-separated)</label>
                  <input
                    id="e-tags"
                    required
                    className="mono"
                    value={form.tagsStr}
                    onChange={(e) => setForm({ ...form, tagsStr: e.target.value })}
                    placeholder="web, ml, mobile"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "14px" }}>
                  <div className="admin-field" style={{ justifyContent: "center" }}>
                    <label className="admin-check-label" style={{ marginTop: "18px" }}>
                      <input
                        type="checkbox"
                        checked={form.is_branch}
                        onChange={(e) => setForm({ ...form, is_branch: e.target.checked })}
                      />
                      <span>Branch off trunk (curved git lane)</span>
                    </label>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="e-order">Order</label>
                    <input
                      id="e-order"
                      type="number"
                      required
                      className="mono"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    />
                  </div>
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
                    {saving ? "Writing to database..." : editingExp ? "Commit Update" : "Insert Record"}
                  </button>
                </div>
              </form>
      </AdminModal>
    </div>
  );
}
