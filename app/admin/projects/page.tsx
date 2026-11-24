"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    label: "",
    tagline: "",
    desc: "",
    role: "",
    type: "",
    stack: "",
    context: "",
    built: "",
    live_url: "",
    github_url: "",
    accent_color: "#F2701C",
    order_index: 0,
    is_featured: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setForm({
      slug: "",
      title: "",
      label: "WEB · PROJECT",
      tagline: "",
      desc: "",
      role: "full-stack",
      type: "web app",
      stack: "next.js · typescript",
      context: "",
      built: "",
      live_url: "",
      github_url: "",
      accent_color: "#F2701C",
      order_index: projects.length,
      is_featured: true,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (p: ProjectRow) => {
    setEditingProject(p);
    setForm({
      slug: p.slug,
      title: p.title,
      label: p.label,
      tagline: p.tagline,
      desc: p.desc,
      role: p.role,
      type: p.type,
      stack: p.stack,
      context: p.context,
      built: p.built,
      live_url: p.live_url || "",
      github_url: p.github_url || "",
      accent_color: p.accent_color || "#F2701C",
      order_index: p.order_index,
      is_featured: p.is_featured,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update({
            slug: form.slug,
            title: form.title,
            label: form.label,
            tagline: form.tagline,
            desc: form.desc,
            role: form.role,
            type: form.type,
            stack: form.stack,
            context: form.context,
            built: form.built,
            live_url: form.live_url || null,
            github_url: form.github_url || null,
            accent_color: form.accent_color || null,
            order_index: Number(form.order_index),
            is_featured: Boolean(form.is_featured),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert({
          slug: form.slug,
          title: form.title,
          label: form.label,
          tagline: form.tagline,
          desc: form.desc,
          role: form.role,
          type: form.type,
          stack: form.stack,
          context: form.context,
          built: form.built,
          live_url: form.live_url || null,
          github_url: form.github_url || null,
          accent_color: form.accent_color || null,
          order_index: Number(form.order_index),
          is_featured: Boolean(form.is_featured),
        });

        if (error) throw error;
      }

      setModalOpen(false);
      fetchProjects();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirm deletion of project "${title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      fetchProjects();
    } else {
      alert("Error deleting record: " + error.message);
    }
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[01] data table</p>
          <h1 className="h2 admin-title">Projects Catalogue.</h1>
          <p className="sub">Manage portfolio cards, live deployments, and write-ups.</p>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={openCreateModal} className="admin-btn primary">
            + Add Project
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
            <span>~/database/public.projects</span>
          </div>
          <span className="mono small">{projects.length} RECORDS</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Querying table public.projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Zero records found. Use [+ Add Project] to insert.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Idx</th>
                  <th>Title & Slug</th>
                  <th>Type</th>
                  <th>Tech Stack</th>
                  <th>Deployment</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="mono muted">{String(p.order_index).padStart(2, "0")}</td>
                    <td>
                      <b style={{ display: "block" }}>{p.title}</b>
                      <span className="mono small muted">slug: {p.slug}</span>
                    </td>
                    <td>
                      <span className="chip dark">{p.type}</span>
                    </td>
                    <td className="mono small muted">{p.stack}</td>
                    <td>
                      {p.live_url ? (
                        <a href={p.live_url} target="_blank" rel="noreferrer" className="link-u mono small">
                          Live ↗
                        </a>
                      ) : (
                        <span className="muted mono small">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="admin-btn sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
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
              <span>~/projects/edit.form</span>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="f-title">Title</label>
                    <input
                      id="f-title"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Next Lap"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="f-slug">Slug (URL Key)</label>
                    <input
                      id="f-slug"
                      required
                      className="mono"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="e.g. nextlap"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="f-label">Card Label Strip</label>
                    <input
                      id="f-label"
                      required
                      className="mono"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. WEB · THESIS"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="f-type">Filter Type</label>
                    <input
                      id="f-type"
                      required
                      className="mono"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      placeholder="web / data · ml / hardware"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="f-tagline">Tagline</label>
                  <input
                    id="f-tagline"
                    required
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="Short punchy summary"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="f-stack">Tech Stack (bullet separated)</label>
                  <input
                    id="f-stack"
                    required
                    className="mono"
                    value={form.stack}
                    onChange={(e) => setForm({ ...form, stack: e.target.value })}
                    placeholder="e.g. next.js · python · lstm/gru"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="f-desc">Short Description</label>
                  <textarea
                    id="f-desc"
                    required
                    rows={2}
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="f-role">Role</label>
                  <input
                    id="f-role"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. full-stack, solo"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="f-context">Problem Context</label>
                  <textarea
                    id="f-context"
                    required
                    rows={3}
                    value={form.context}
                    onChange={(e) => setForm({ ...form, context: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="f-built">Solution Built</label>
                  <textarea
                    id="f-built"
                    required
                    rows={3}
                    value={form.built}
                    onChange={(e) => setForm({ ...form, built: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="f-live">Live Demo URL</label>
                    <input
                      id="f-live"
                      type="url"
                      className="mono"
                      value={form.live_url}
                      onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="f-accent">Accent Color</label>
                    <input
                      id="f-accent"
                      className="mono"
                      value={form.accent_color}
                      onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                      placeholder="#F2701C"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="f-order">Order</label>
                    <input
                      id="f-order"
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
                    {saving ? "Writing to database..." : editingProject ? "Commit Update" : "Insert Record"}
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
