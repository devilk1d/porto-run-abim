"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";
import { reorderItems } from "../../../utils/supabase/reorder";
import { optimizeImageToWebP } from "../../../utils/image";
import OrderControl from "../components/OrderControl";
import AdminModal from "../components/AdminModal";

type CertRow = Database["public"]["Tables"]["certificates"]["Row"];

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertRow | null>(null);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    year: "2026",
    valid_until: "",
    is_lifetime: false,
    credential_id: "",
    credential_url: "",
    image_url: "",
    order_index: 0,
    is_featured: true,
    status: "published" as "published" | "draft",
    is_hidden: false,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const optimized = await optimizeImageToWebP(file, {
        maxDimension: 1600,
        quality: 0.88,
      });
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const filePath = `certs/${Date.now()}-${cleanName}.${optimized.ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("certificates")
        .upload(filePath, optimized.file, {
          upsert: true,
          contentType: optimized.contentType,
          cacheControl: "31536000",
        });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (err: unknown) {
      setUploadError((err as Error).message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const fetchCerts = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setCerts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const openCreateModal = () => {
    setEditingCert(null);
    setForm({
      title: "",
      issuer: "",
      year: new Date().getFullYear().toString(),
      valid_until: "",
      is_lifetime: false,
      credential_id: "",
      credential_url: "",
      image_url: "",
      order_index: certs.length,
      is_featured: true,
      status: "published",
      is_hidden: false,
    });
    setErrorMsg(null);
    setUploadError(null);
    setUploading(false);
    setModalOpen(true);
  };

  const openEditModal = (c: CertRow) => {
    setEditingCert(c);
    setForm({
      title: c.title,
      issuer: c.issuer,
      year: c.year,
      valid_until: c.valid_until || "",
      is_lifetime: c.is_lifetime,
      credential_id: c.credential_id,
      credential_url: c.credential_url,
      image_url: c.image_url || "",
      order_index: c.order_index,
      is_featured: c.is_featured,
      status: c.status === "draft" ? "draft" : "published",
      is_hidden: c.is_hidden ?? false,
    });
    setErrorMsg(null);
    setUploadError(null);
    setUploading(false);
    setModalOpen(true);
  };

  const saveCert = async (targetStatus: "published" | "draft") => {
    setSaving(true);
    setErrorMsg(null);

    const supabase = createClient();
    const safeTitle = form.title.trim() || "Untitled Draft";

    try {
      if (editingCert) {
        const { error } = await supabase
          .from("certificates")
          .update({
            title: safeTitle,
            issuer: form.issuer,
            year: form.year,
            valid_until: form.valid_until || null,
            is_lifetime: Boolean(form.is_lifetime),
            credential_id: form.credential_id,
            credential_url: form.credential_url,
            image_url: form.image_url || null,
            order_index: Number(form.order_index),
            is_featured: Boolean(form.is_featured),
            status: targetStatus,
            is_hidden: Boolean(form.is_hidden),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCert.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("certificates").insert({
          title: safeTitle,
          issuer: form.issuer,
          year: form.year,
          valid_until: form.valid_until || null,
          is_lifetime: Boolean(form.is_lifetime),
          credential_id: form.credential_id,
          credential_url: form.credential_url,
          image_url: form.image_url || null,
          order_index: Number(form.order_index),
          is_featured: Boolean(form.is_featured),
          status: targetStatus,
          is_hidden: Boolean(form.is_hidden),
        });

        if (error) throw error;
      }

      setModalOpen(false);
      fetchCerts();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCert("published");
  };

  const handleToggleHide = async (c: CertRow) => {
    const supabase = createClient();
    const nextHidden = !c.is_hidden;
    const { error } = await supabase
      .from("certificates")
      .update({ is_hidden: nextHidden, updated_at: new Date().toISOString() })
      .eq("id", c.id);
    if (!error) {
      setCerts((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, is_hidden: nextHidden } : item))
      );
    } else {
      alert("Error updating visibility: " + error.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirm deletion of certificate "${title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (!error) {
      fetchCerts();
    } else {
      alert("Error deleting record: " + error.message);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (reordering) return;
    setReordering(true);
    const prev = certs;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < certs.length) {
      const swapped = [...certs];
      const tmp = swapped[index];
      swapped[index] = swapped[targetIndex];
      swapped[targetIndex] = tmp;
      setCerts(swapped.map((it, idx) => ({ ...it, order_index: idx })));
    }
    const res = await reorderItems("certificates", prev, index, direction);
    if (res.success) {
      setCerts(res.newItems);
    } else {
      setCerts(prev);
      alert(res.error || "Failed to reorder certificates.");
    }
    setReordering(false);
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[02] data table</p>
          <h1 className="h2 admin-title">Certificates & Credentials.</h1>
          <p className="sub">Manage paper ticket credentials, verification endpoints, and validity dates.</p>
        </div>
        <div className="admin-head-actions">
          <button type="button" onClick={openCreateModal} className="admin-btn primary">
            + Add Certificate
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
            <span>~/database/public.certificates</span>
          </div>
          <span className="mono small">{certs.length} CREDENTIALS</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Querying table public.certificates...
          </div>
        ) : certs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="mono muted">
            Zero records found. Use [+ Add Certificate] to insert.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-tbl">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Idx</th>
                  <th>Title & Issuer</th>
                  <th>Year / Validity</th>
                  <th>Credential ID</th>
                  <th>Verification</th>
                  <th style={{ textAlign: "right" }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c, i) => (
                  <tr key={c.id} style={{ opacity: c.is_hidden ? 0.55 : 1 }}>
                    <td>
                      <OrderControl
                        index={i}
                        total={certs.length}
                        disabled={reordering}
                        onMoveUp={() => handleReorder(i, "up")}
                        onMoveDown={() => handleReorder(i, "down")}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <b>{c.title}</b>
                        {c.status === "draft" && (
                          <span className="chip mono" style={{ fontSize: "10px", padding: "2px 6px", borderStyle: "dashed" }}>
                            DRAFT
                          </span>
                        )}
                        {c.is_hidden && (
                          <span className="chip dark mono" style={{ fontSize: "10px", padding: "2px 6px" }}>
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <span className="mono small muted">{c.issuer}</span>
                    </td>
                    <td>
                      <span className="mono small">{c.year}</span>
                      {c.is_lifetime ? (
                        <span className="chip accent" style={{ marginLeft: "8px" }}>
                          LIFETIME
                        </span>
                      ) : c.valid_until ? (
                        <span className="mono small muted" style={{ display: "block" }}>
                          exp: {c.valid_until}
                        </span>
                      ) : null}
                    </td>
                    <td className="mono small">{c.credential_id}</td>
                    <td>
                      <a href={c.credential_url} target="_blank" rel="noreferrer" className="link-u mono small">
                        Verify ↗
                      </a>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleHide(c)}
                          className="admin-btn sm"
                        >
                          {c.is_hidden ? "Show" : "Hide"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="admin-btn sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.title)}
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
        title={`~/certificates/${editingCert ? "edit" : "new"}.form`}
      >
        {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
                <div className="admin-field">
                  <label htmlFor="c-title">Certificate Title</label>
                  <input
                    id="c-title"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Meta Front-End Developer"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="c-issuer">Issuer Organization</label>
                    <input
                      id="c-issuer"
                      required
                      value={form.issuer}
                      onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                      placeholder="e.g. Google Cloud / Coursera"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="c-year">Issue Year</label>
                    <input
                      id="c-year"
                      required
                      className="mono"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="c-valid">Valid Until (Expiration Date)</label>
                    <input
                      id="c-valid"
                      type="date"
                      disabled={form.is_lifetime}
                      className="mono"
                      value={form.valid_until}
                      onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    />
                  </div>

                  <div className="admin-field" style={{ justifyContent: "center" }}>
                    <label className="admin-check-label" style={{ marginTop: "20px" }}>
                      <input
                        type="checkbox"
                        checked={form.is_lifetime}
                        onChange={(e) => setForm({ ...form, is_lifetime: e.target.checked, valid_until: e.target.checked ? "" : form.valid_until })}
                      />
                      <span>Lifetime (No expiration)</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="admin-field">
                    <label htmlFor="c-id">Credential ID</label>
                    <input
                      id="c-id"
                      required
                      className="mono"
                      value={form.credential_id}
                      onChange={(e) => setForm({ ...form, credential_id: e.target.value })}
                      placeholder="CREDENTIAL-ID-0001"
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="c-url">Verification URL</label>
                    <input
                      id="c-url"
                      type="url"
                      required
                      className="mono"
                      value={form.credential_url}
                      onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label>Certificate Image / Document Asset</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <label
                        className={`admin-btn ${uploading ? "disabled" : "primary"}`}
                        style={{ cursor: uploading ? "wait" : "pointer" }}
                      >
                        {uploading ? "Uploading to Supabase..." : "↑ Upload Asset to Storage Bucket"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                          disabled={uploading}
                          onChange={handleFileUpload}
                        />
                      </label>
                      {form.image_url && (
                        <button
                          type="button"
                          className="admin-btn sm danger"
                          onClick={() => setForm({ ...form, image_url: "" })}
                        >
                          Remove Asset
                        </button>
                      )}
                    </div>

                    {uploadError && (
                      <div className="admin-alert error" style={{ padding: "8px 12px", margin: 0 }}>
                        {uploadError}
                      </div>
                    )}

                    {form.image_url && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          background: "var(--paper)",
                          border: "1px solid var(--line)",
                        }}
                      >
                        {form.image_url.endsWith(".pdf") ? (
                          <div
                            className="mono small bold"
                            style={{
                              padding: "8px 12px",
                              background: "var(--paper2)",
                              border: "1px solid var(--line)",
                            }}
                          >
                            [PDF DOCUMENT]
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={form.image_url}
                            alt="Certificate Preview"
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: "60px",
                              height: "44px",
                              objectFit: "cover",
                              border: "1px solid var(--line)",
                              background: "#fff",
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="mono small muted" style={{ display: "block" }}>
                            Bucket Asset Link:
                          </span>
                          <a
                            href={form.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mono small link-u"
                            style={{ wordBreak: "break-all", display: "inline-block", maxWidth: "100%" }}
                          >
                            {form.image_url}
                          </a>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "14px" }}>
                      <div className="admin-field" style={{ marginBottom: 0 }}>
                        <label htmlFor="c-img">Direct Path / External URL</label>
                        <input
                          id="c-img"
                          className="mono"
                          value={form.image_url}
                          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                          placeholder="/certs/meta-cert.webp or https://..."
                        />
                      </div>

                      <div className="admin-field" style={{ marginBottom: 0 }}>
                        <label htmlFor="c-order">Order</label>
                        <input
                          id="c-order"
                          type="number"
                          required
                          className="mono"
                          value={form.order_index}
                          onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                        />
                      </div>
                    </div>
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
                      checked={form.is_hidden}
                      onChange={(e) => setForm({ ...form, is_hidden: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "var(--ink)" }}
                    />
                    <span className="mono small bold">HIDE FROM PUBLIC WEBSITE</span>
                    <span className="mono small muted" style={{ fontSize: "11px" }}>
                      (Kept in database, hidden from visitors)
                    </span>
                  </label>
                </div>

                <div className="admin-modal-foot">
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={saving}
                    onClick={() => saveCert("draft")}
                  >
                    {saving ? "Saving..." : "Save as Draft"}
                  </button>
                  <button type="submit" className="admin-btn primary" disabled={saving}>
                    {saving ? "Publishing..." : editingCert?.status === "draft" ? "Publish Certificate" : editingCert ? "Update & Publish" : "Publish"}
                  </button>
                </div>
              </form>
      </AdminModal>
    </div>
  );
}
