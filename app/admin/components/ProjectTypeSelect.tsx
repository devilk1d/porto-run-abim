"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { type Database } from "../../../types/database.types";
import { parseProjectTypes } from "../../../utils/projectTypes";

type TypeRow = Database["public"]["Tables"]["project_types"]["Row"];

export default function ProjectTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [types, setTypes] = useState<TypeRow[]>([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseProjectTypes(value);

  const fetchTypes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_types")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data) {
      setTypes(data);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const toggleType = (name: string) => {
    const norm = name.trim().toLowerCase();
    const next = selected.includes(norm)
      ? selected.filter((item) => item !== norm)
      : [...selected, norm];
    onChange(next.join(" · "));
  };

  const handleAddType = async () => {
    const norm = newName.trim().toLowerCase();
    if (!norm) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const existing = types.find((t) => t.name.toLowerCase() === norm);
      if (!existing) {
        const { data, error } = await supabase
          .from("project_types")
          .insert({ name: norm })
          .select("*")
          .single();
        if (error) throw error;
        if (data) {
          setTypes((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        }
      }
      if (!selected.includes(norm)) {
        onChange([...selected, norm].join(" · "));
      }
      setNewName("");
    } catch (e: unknown) {
      setErr((e as Error).message || "Failed to add type.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (row: TypeRow) => {
    const norm = editingName.trim().toLowerCase();
    if (!norm || norm === row.name) {
      setEditingId(null);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("project_types")
        .update({ name: norm })
        .eq("id", row.id);
      if (error) throw error;

      setTypes((prev) =>
        prev
          .map((t) => (t.id === row.id ? { ...t, name: norm } : t))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      if (selected.includes(row.name.toLowerCase())) {
        onChange(
          selected.map((s) => (s === row.name.toLowerCase() ? norm : s)).join(" · ")
        );
      }
      setEditingId(null);
    } catch (e: unknown) {
      setErr((e as Error).message || "Failed to update type.");
    } finally {
      setBusy(false);
    }
  };

  const allOptionNames = Array.from(
    new Set([...types.map((t) => t.name.toLowerCase()), ...selected])
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          minHeight: "42px",
          padding: "6px 10px",
          border: "1px solid var(--ink)",
          background: "var(--paper)",
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flex: 1 }}>
          {selected.length === 0 ? (
            <span className="mono small muted">Select filter types...</span>
          ) : (
            selected.map((s) => (
              <span
                key={s}
                className="chip dark mono"
                style={{
                  fontSize: "11px",
                  padding: "2px 7px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {s}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${s}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleType(s);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleType(s);
                    }
                  }}
                  style={{ cursor: "pointer", fontWeight: 700, opacity: 0.8 }}
                >
                  ×
                </span>
              </span>
            ))
          )}
        </div>
        <span className="mono small muted" style={{ fontSize: "11px", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--card)",
            border: "1px solid var(--ink)",
            boxShadow: "6px 6px 0 var(--ink)",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "6px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <input
              type="text"
              className="mono small"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddType();
                }
              }}
              placeholder="New type (e.g. desktop)"
              style={{ flex: 1, padding: "6px 8px", fontSize: "12px" }}
            />
            <button
              type="button"
              onClick={handleAddType}
              disabled={busy || !newName.trim()}
              className="admin-btn sm primary"
              style={{ flexShrink: 0 }}
            >
              + Add
            </button>
          </div>

          {err && (
            <p className="mono small" style={{ color: "#ff4d4f", margin: 0, fontSize: "11px" }}>
              [ERR] {err}
            </p>
          )}

          <div
            data-lenis-prevent
            style={{
              maxHeight: "190px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {allOptionNames.map((name) => {
              const row = types.find((t) => t.name.toLowerCase() === name);
              const isChecked = selected.includes(name);
              const isEditing = row && editingId === row.id;

              return (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "5px 6px",
                    background: isChecked ? "var(--paper2)" : "transparent",
                    border: "1px solid transparent",
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: "flex", gap: "5px", flex: 1 }}>
                      <input
                        type="text"
                        className="mono small"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEdit(row);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        style={{ flex: 1, padding: "3px 6px", fontSize: "12px" }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(row)}
                        disabled={busy}
                        className="admin-btn sm primary"
                        style={{ padding: "2px 8px", fontSize: "11px" }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="admin-btn sm"
                        style={{ padding: "2px 6px", fontSize: "11px" }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          flex: 1,
                          margin: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleType(name)}
                          style={{ width: "14px", height: "14px", accentColor: "var(--ink)" }}
                        />
                        <span className="mono small" style={{ fontSize: "12px" }}>
                          {name}
                        </span>
                      </label>
                      {row && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(row.id);
                            setEditingName(row.name);
                          }}
                          className="admin-btn sm"
                          style={{ padding: "2px 7px", fontSize: "10px" }}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
