"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";
import { reorderItems } from "../../../utils/supabase/reorder";
import { optimizeImageToWebP } from "../../../utils/image";
import OrderControl from "../components/OrderControl";
import AdminModal from "../components/AdminModal";

type AboutRow = Database["public"]["Tables"]["about_chapters"]["Row"];

export default function AdminAboutPage() {
  const [chapters, setChapters] = useState<AboutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoAlt, setPhotoAlt] = useState<string>("Abim portrait");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSavedMsg, setPhotoSavedMsg] = useState<string | null>(null);
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

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("about_profile")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setProfileId(data.id);
      setPhotoUrl(data.photo_url || "");
      setPhotoAlt(data.photo_alt || "Abim portrait");
    }
  };

  useEffect(() => {
    fetchChapters();
    fetchProfile();
  }, []);

  const upsertAboutProfile = async (nextUrl: string | null, nextAlt: string) => {
    const supabase = createClient();
    if (profileId) {
      const { error } = await supabase
        .from("about_profile")
        .update({
          photo_url: nextUrl,
          photo_alt: nextAlt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("about_profile")
        .insert({
          photo_url: nextUrl,
          photo_alt: nextAlt,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (data) setProfileId(data.id);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError(`File "${file.name}" exceeds 10MB limit.`);
      return;
    }

    setPhotoUploading(true);
    setPhotoError(null);
    setPhotoSavedMsg(null);

    try {
      const supabase = createClient();
      const optimized = await optimizeImageToWebP(file, {
        maxDimension: 1200,
        quality: 0.88,
      });
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const filePath = `portrait/${Date.now()}-${cleanName}.${optimized.ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("about")
        .upload(filePath, optimized.file, {
          upsert: true,
          contentType: optimized.contentType,
          cacheControl: "31536000",
        });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("about")
        .getPublicUrl(filePath);

      await upsertAboutProfile(urlData.publicUrl, photoAlt.trim() || "Abim portrait");
      setPhotoUrl(urlData.publicUrl);
      setPhotoSavedMsg("Photo converted to WebP and saved to database.");
    } catch (err: unknown) {
      setPhotoError((err as Error).message || "Failed to upload About photo.");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleSavePhotoMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoSaving(true);
    setPhotoError(null);
    setPhotoSavedMsg(null);
    try {
      await upsertAboutProfile(photoUrl || null, photoAlt.trim() || "Abim portrait");
      setPhotoSavedMsg("Photo metadata saved.");
    } catch (err: unknown) {
      setPhotoError((err as Error).message || "Failed to save photo metadata.");
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Remove the current About ID card photo?")) return;
    setPhotoSaving(true);
    setPhotoError(null);
    setPhotoSavedMsg(null);
    try {
      await upsertAboutProfile(null, photoAlt.trim() || "Abim portrait");
      setPhotoUrl("");
      setPhotoSavedMsg("Photo removed from database.");
    } catch (err: unknown) {
      setPhotoError((err as Error).message || "Failed to remove photo.");
    } finally {
      setPhotoSaving(false);
    }
  };

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

  const [reordering, setReordering] = useState(false);

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(true);
    const prev = chapters;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < chapters.length) {
      const swapped = [...chapters];
      const tmp = swapped[index];
      swapped[index] = swapped[targetIndex];
      swapped[targetIndex] = tmp;
      setChapters(swapped.map((it, idx) => ({ ...it, order_index: idx })));
    }
    const res = await reorderItems("about_chapters", prev, index, direction);
    if (res.success) {
      setChapters(res.newItems);
    } else {
      setChapters(prev);
      alert(res.error || "Failed to reorder chapters.");
    }
    setReordering(false);
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

      <div className="admin-box" style={{ marginBottom: "28px" }}>
        <div className="admin-box-bar">
          <div className="bar-title">
            <div className="dots">
              <i />
              <i />
              <i />
            </div>
            <span>~/database/public.about_profile</span>
          </div>
          <span className="mono small">{photoUrl ? "PHOTO SET" : "NO PHOTO"}</span>
        </div>

        <form
          onSubmit={handleSavePhotoMeta}
          style={{
            padding: "20px 24px",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "102px",
              height: "112px",
              border: "1px solid var(--ink)",
              background: "var(--paper2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={photoAlt}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span className="mono small muted" style={{ fontSize: "10px", textAlign: "center", padding: "8px" }}>
                NO PHOTO
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "240px", display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <label className="admin-btn primary" style={{ cursor: photoUploading ? "wait" : "pointer" }}>
                {photoUploading ? "Converting & Uploading..." : photoUrl ? "Replace Photo (WebP)" : "Upload Photo (WebP)"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={photoUploading || photoSaving}
                  style={{ display: "none" }}
                />
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading || photoSaving}
                  className="admin-btn sm danger"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {photoUrl && (
              <a
                href={photoUrl}
                target="_blank"
                rel="noreferrer"
                className="mono small link-u"
                style={{ wordBreak: "break-all", fontSize: "11px" }}
              >
                {photoUrl}
              </a>
            )}

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div className="admin-field" style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}>
                <label htmlFor="about-photo-alt">Photo Alt Text (Accessibility)</label>
                <input
                  id="about-photo-alt"
                  value={photoAlt}
                  onChange={(e) => setPhotoAlt(e.target.value)}
                  placeholder="Abim portrait"
                />
              </div>
              <button
                type="submit"
                disabled={photoUploading || photoSaving}
                className="admin-btn sm"
                style={{ height: "40px" }}
              >
                {photoSaving ? "Saving..." : "Save Alt"}
              </button>
            </div>

            {photoError && (
              <p className="mono small" style={{ color: "#ff4d4f", margin: 0 }}>
                [ERR] {photoError}
              </p>
            )}
            {photoSavedMsg && (
              <p className="mono small" style={{ color: "var(--ink)", margin: 0 }}>
                [OK] {photoSavedMsg}
              </p>
            )}
          </div>
        </form>
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
                  <th style={{ width: "80px" }}>Idx</th>
                  <th style={{ width: "130px" }}>Key</th>
                  <th>Narrative Paragraph</th>
                  <th>Target Highlights (Neon Marker)</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((ch, i) => (
                  <tr key={ch.id}>
                    <td>
                      <OrderControl
                        index={i}
                        total={chapters.length}
                        disabled={reordering}
                        onMoveUp={() => handleReorder(i, "up")}
                        onMoveDown={() => handleReorder(i, "down")}
                      />
                    </td>
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

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`~/about/${editingChapter ? "edit" : "new"}-chapter.form`}
      >
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
      </AdminModal>
    </div>
  );
}
