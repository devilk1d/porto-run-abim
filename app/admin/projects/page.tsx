"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";
import { reorderItems } from "../../../utils/supabase/reorder";
import { optimizeImageToWebP } from "../../../utils/image";
import OrderControl from "../components/OrderControl";
import AdminModal from "../components/AdminModal";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const ACCENT_PRESETS = [
  { label: "Orange (Next Lap)", hex: "#F2701C" },
  { label: "Neon Mint", hex: "#00F5D4" },
  { label: "Terminal Lime", hex: "#52C41A" },
  { label: "Cyber Blue", hex: "#1890FF" },
  { label: "Magenta", hex: "#EB2F96" },
  { label: "Amber Gold", hex: "#FAAD14" },
  { label: "Electric Violet", hex: "#722ED1" },
  { label: "Crimson Red", hex: "#FF4D4F" },
  { label: "Dark Ink", hex: "#101213" },
];

export interface ShotItem {
  id?: string;
  src: string;
  alt: string;
  order_index: number;
}

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
    image_url: "",
    shots: [] as ShotItem[],
    order_index: 0,
    is_featured: true,
    is_private: false,
  });
  const [newUrlInput, setNewUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const uploaded: ShotItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 10MB limit.`);
        }
        const optimized = await optimizeImageToWebP(file, {
          maxDimension: 1600,
          quality: 0.88,
        });
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        const filePath = `shots/${Date.now()}-${i}-${cleanName}.${optimized.ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("projects")
          .upload(filePath, optimized.file, {
            upsert: true,
            contentType: optimized.contentType,
            cacheControl: "31536000",
          });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("projects")
          .getPublicUrl(filePath);

        uploaded.push({
          src: urlData.publicUrl,
          alt: form.title || "Project screenshot",
          order_index: form.shots.length + i,
        });
      }

      setForm((prev) => {
        const updated = [...prev.shots, ...uploaded].map((s, idx) => ({
          ...s,
          order_index: idx,
        }));
        return {
          ...prev,
          shots: updated,
          image_url: updated[0]?.src || prev.image_url,
        };
      });
    } catch (err: unknown) {
      setUploadError((err as Error).message || "Failed to upload project photo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    setForm((prev) => {
      const updated = [
        ...prev.shots,
        {
          src: newUrlInput.trim(),
          alt: prev.title || "Project screenshot",
          order_index: prev.shots.length,
        },
      ];
      return {
        ...prev,
        shots: updated,
        image_url: updated[0]?.src || prev.image_url,
      };
    });
    setNewUrlInput("");
  };

  const handleRemoveShot = (index: number) => {
    setForm((prev) => {
      const filtered = prev.shots.filter((_, i) => i !== index).map((s, idx) => ({
        ...s,
        order_index: idx,
      }));
      return {
        ...prev,
        shots: filtered,
        image_url: filtered[0]?.src || "",
      };
    });
  };

  const handleMoveShot = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= form.shots.length) return;
    setForm((prev) => {
      const copy = [...prev.shots];
      const tmp = copy[index];
      copy[index] = copy[target];
      copy[target] = tmp;
      const reindexed = copy.map((s, idx) => ({ ...s, order_index: idx }));
      return {
        ...prev,
        shots: reindexed,
        image_url: reindexed[0]?.src || prev.image_url,
      };
    });
  };

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
      image_url: "",
      shots: [],
      order_index: projects.length,
      is_featured: true,
      is_private: false,
    });
    setNewUrlInput("");
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = async (p: ProjectRow) => {
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
      image_url: p.image_url || "",
      shots: [],
      order_index: p.order_index,
      is_featured: p.is_featured,
      is_private: p.is_private ?? false,
    });
    setNewUrlInput("");
    setErrorMsg(null);
    setModalOpen(true);

    const supabase = createClient();
    const { data: shotsData } = await supabase
      .from("project_shots")
      .select("*")
      .eq("project_id", p.id)
      .order("order_index", { ascending: true });

    if (shotsData && shotsData.length > 0) {
      setForm((prev) => ({
        ...prev,
        shots: shotsData.map((s, idx) => ({
          id: s.id,
          src: s.src,
          alt: s.alt || "",
          order_index: s.order_index ?? idx,
        })),
      }));
    } else if (p.image_url) {
      setForm((prev) => ({
        ...prev,
        shots: [{ src: p.image_url!, alt: p.title, order_index: 0 }],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      const primaryImageUrl = form.shots[0]?.src || form.image_url || null;
      let projectId = editingProject?.id;

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
            live_url: form.is_private ? null : (form.live_url || null),
            github_url: form.is_private ? null : (form.github_url || null),
            accent_color: form.accent_color || null,
            image_url: primaryImageUrl,
            order_index: Number(form.order_index),
            is_featured: Boolean(form.is_featured),
            is_private: Boolean(form.is_private),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProject.id);

        if (error) throw error;
      } else {
        const { data: newProj, error } = await supabase
          .from("projects")
          .insert({
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
            live_url: form.is_private ? null : (form.live_url || null),
            github_url: form.is_private ? null : (form.github_url || null),
            accent_color: form.accent_color || null,
            image_url: primaryImageUrl,
            order_index: Number(form.order_index),
            is_featured: Boolean(form.is_featured),
            is_private: Boolean(form.is_private),
          })
          .select("id")
          .single();

        if (error) throw error;
        projectId = newProj.id;
      }

      if (projectId) {
        // Sync project_shots: clear old and insert current
        await supabase.from("project_shots").delete().eq("project_id", projectId);

        if (form.shots.length > 0) {
          const payload = form.shots.map((s, idx) => ({
            project_id: projectId!,
            src: s.src,
            alt: s.alt || form.title,
            order_index: idx,
          }));
          await supabase.from("project_shots").insert(payload);
        }
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

  const [reordering, setReordering] = useState(false);

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(true);
    const prev = projects;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < projects.length) {
      const swapped = [...projects];
      const tmp = swapped[index];
      swapped[index] = swapped[targetIndex];
      swapped[targetIndex] = tmp;
      setProjects(swapped.map((it, idx) => ({ ...it, order_index: idx })));
    }
    const res = await reorderItems("projects", prev, index, direction);
    if (res.success) {
      setProjects(res.newItems);
    } else {
      setProjects(prev);
      alert(res.error || "Failed to reorder projects.");
    }
    setReordering(false);
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
                  <th style={{ width: "80px" }}>Idx</th>
                  <th>Title & Slug</th>
                  <th>Type</th>
                  <th>Tech Stack</th>
                  <th>Deployment</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.id}>
                    <td>
                      <OrderControl
                        index={i}
                        total={projects.length}
                        disabled={reordering}
                        onMoveUp={() => handleReorder(i, "up")}
                        onMoveDown={() => handleReorder(i, "down")}
                      />
                    </td>
                    <td>
                      <b style={{ display: "block" }}>{p.title}</b>
                      <span className="mono small muted">slug: {p.slug}</span>
                      {p.image_url && (
                        <span className="mono small" style={{ display: "inline-block", marginTop: "4px", color: "var(--accent)", fontSize: "10px", fontWeight: "600" }}>
                          [photo attached]
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="chip dark">{p.type}</span>
                    </td>
                    <td className="mono small muted">{p.stack}</td>
                    <td>
                      {p.is_private ? (
                        <span className="chip" style={{ fontSize: "10px", padding: "3px 8px", borderStyle: "dashed" }}>
                          PRIVATE
                        </span>
                      ) : p.live_url ? (
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

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`~/projects/${editingProject ? "edit" : "new"}.form`}
      >
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

                <div className="admin-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <label style={{ margin: 0 }}>Project Screenshots & Photos (Gallery)</label>
                    <span className="mono small muted">{form.shots.length} ASSET{form.shots.length === 1 ? "" : "S"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <label
                        className={`admin-btn ${uploading ? "disabled" : "primary"}`}
                        style={{ cursor: uploading ? "wait" : "pointer" }}
                      >
                        {uploading ? "Uploading to Storage..." : "↑ Upload Photos (Supports Multiple)"}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          style={{ display: "none" }}
                          disabled={uploading}
                          onChange={handleFilesUpload}
                        />
                      </label>
                      <span className="mono small muted" style={{ fontSize: "11px" }}>
                        PNG, JPG, WEBP up to 10MB each
                      </span>
                    </div>

                    {uploadError && (
                      <div className="admin-alert error" style={{ padding: "8px 12px", margin: 0 }}>
                        {uploadError}
                      </div>
                    )}

                    {/* Direct URL input adder */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        className="mono small"
                        style={{ flex: 1, padding: "7px 10px", fontSize: "12px" }}
                        placeholder="Or paste external image URL (https://...)..."
                        value={newUrlInput}
                        onChange={(e) => setNewUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="admin-btn sm"
                        style={{ flexShrink: 0 }}
                      >
                        + Add URL
                      </button>
                    </div>

                    {/* List of uploaded shots */}
                    {form.shots.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          border: "1px dashed var(--line)",
                          background: "var(--paper)",
                        }}
                        className="mono small muted"
                      >
                        No photos added yet. Upload files or paste an image URL above.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {form.shots.map((shot, idx) => (
                          <div
                            key={shot.src + idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 10px",
                              background: "var(--paper)",
                              border: "1px solid var(--line)",
                            }}
                          >
                            <span className="mono small bold muted" style={{ minWidth: "22px", fontSize: "11px" }}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot.src}
                              alt={shot.alt || `Shot ${idx + 1}`}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: "56px",
                                height: "38px",
                                objectFit: "cover",
                                border: "1px solid var(--ink)",
                                background: "#000",
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                              <a
                                href={shot.src}
                                target="_blank"
                                rel="noreferrer"
                                className="mono small link-u"
                                style={{ wordBreak: "break-all", fontSize: "11px", display: "inline-block", maxWidth: "100%" }}
                              >
                                {shot.src}
                              </a>
                              <input
                                className="mono small"
                                placeholder="Caption / Alt text (optional)"
                                value={shot.alt || ""}
                                onChange={(e) => {
                                  const updated = [...form.shots];
                                  updated[idx] = { ...updated[idx], alt: e.target.value };
                                  setForm({ ...form, shots: updated });
                                }}
                                style={{
                                  fontSize: "11px",
                                  padding: "3px 6px",
                                  height: "22px",
                                  background: "var(--card)",
                                  border: "1px solid var(--line)",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveShot(idx, "up")}
                                className="admin-reorder-btn"
                                title="Move up"
                                aria-label="Move photo up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === form.shots.length - 1}
                                onClick={() => handleMoveShot(idx, "down")}
                                className="admin-reorder-btn"
                                title="Move down"
                                aria-label="Move photo down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveShot(idx)}
                                className="admin-btn sm danger"
                                style={{ padding: "0 8px", height: "22px", fontSize: "11px" }}
                                title="Delete photo"
                                aria-label="Delete photo"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    background: "var(--paper2)",
                    marginBottom: "14px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      margin: 0,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.is_private}
                      onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "var(--ink)" }}
                    />
                    <span className="mono small bold">PRIVATE / INTERNAL PROJECT</span>
                    <span className="mono small muted" style={{ fontSize: "11px" }}>
                      (Disables Live Demo & GitHub URLs)
                    </span>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field" style={{ opacity: form.is_private ? 0.5 : 1 }}>
                    <label htmlFor="f-live">Live Demo URL</label>
                    <input
                      id="f-live"
                      type="url"
                      className="mono"
                      disabled={form.is_private}
                      value={form.is_private ? "" : form.live_url}
                      onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                      placeholder={form.is_private ? "Disabled (Private Project)" : "https://..."}
                      style={{ cursor: form.is_private ? "not-allowed" : "text" }}
                    />
                  </div>

                  <div className="admin-field" style={{ opacity: form.is_private ? 0.5 : 1 }}>
                    <label htmlFor="f-github">GitHub Repository URL</label>
                    <input
                      id="f-github"
                      type="url"
                      className="mono"
                      disabled={form.is_private}
                      value={form.is_private ? "" : form.github_url}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                      placeholder={form.is_private ? "Disabled (Private Project)" : "https://github.com/..."}
                      style={{ cursor: form.is_private ? "not-allowed" : "text" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "14px" }}>

                  <div className="admin-field">
                    <label htmlFor="f-accent">Accent Color</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            position: "relative",
                            width: "38px",
                            height: "38px",
                            border: "1px solid var(--ink)",
                            background: form.accent_color || "#F2701C",
                            boxShadow: "2px 2px 0 var(--ink)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          title="Open color wheel picker"
                        >
                          <input
                            type="color"
                            id="f-color-picker"
                            aria-label="Pick color"
                            value={form.accent_color?.startsWith("#") && form.accent_color.length === 7 ? form.accent_color : "#F2701C"}
                            onChange={(e) => setForm({ ...form, accent_color: e.target.value.toUpperCase() })}
                            style={{
                              position: "absolute",
                              inset: 0,
                              opacity: 0,
                              cursor: "pointer",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <input
                          id="f-accent"
                          className="mono"
                          style={{ textTransform: "uppercase" }}
                          value={form.accent_color}
                          onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                          placeholder="#F2701C"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap", marginTop: "2px" }}>
                        <span className="mono small muted" style={{ fontSize: "10px" }}>PRESETS:</span>
                        {ACCENT_PRESETS.map((p) => {
                          const active = form.accent_color?.toUpperCase() === p.hex.toUpperCase();
                          return (
                            <button
                              key={p.hex}
                              type="button"
                              title={p.label}
                              aria-label={p.label}
                              onClick={() => setForm({ ...form, accent_color: p.hex })}
                              style={{
                                width: "18px",
                                height: "18px",
                                background: p.hex,
                                border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
                                outline: active ? "2px solid var(--accent)" : "none",
                                outlineOffset: "1px",
                                cursor: "pointer",
                                transform: active ? "scale(1.2)" : "none",
                                transition: "all 0.1s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
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
      </AdminModal>
    </div>
  );
}
