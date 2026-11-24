"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    certificates: 0,
    experiences: 0,
    about: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const [
        { count: projCount },
        { count: certCount },
        { count: expCount },
        { count: aboutCount },
        { count: msgCount },
        { count: unreadMsgCount },
      ] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("experiences").select("*", { count: "exact", head: true }),
        supabase.from("about_chapters").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false),
      ]);

      setStats({
        projects: projCount || 0,
        certificates: certCount || 0,
        experiences: expCount || 0,
        about: aboutCount || 0,
        messages: msgCount || 0,
        unreadMessages: unreadMsgCount || 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div>
      <div className="admin-head">
        <div>
          <p className="mono small muted">[00] console overview</p>
          <h1 className="h2 admin-title">System Control.</h1>
          <p className="sub">
            Direct interface to database state on Supabase <code>abim-run</code>. All mutations propagate in real-time to the public portfolio.
          </p>
        </div>
        <div className="admin-head-actions">
          <Link href="/" target="_blank" className="admin-btn dark">
            Live Preview ↗
          </Link>
        </div>
      </div>

      <dl className="admin-stats-ledger" aria-label="System database metrics">
        <Link href="/admin/projects" className="admin-stat-cell">
          <dt className="mono small muted">[01] PROJECTS</dt>
          <dd className="admin-stat-num">{loading ? "–" : pad(stats.projects)}</dd>
          <div className="admin-stat-foot">
            <span>portfolio cards</span>
            <span>→</span>
          </div>
        </Link>

        <Link href="/admin/certificates" className="admin-stat-cell">
          <dt className="mono small muted">[02] CERTS</dt>
          <dd className="admin-stat-num">{loading ? "–" : pad(stats.certificates)}</dd>
          <div className="admin-stat-foot">
            <span>validity tracking</span>
            <span>→</span>
          </div>
        </Link>

        <Link href="/admin/experience" className="admin-stat-cell">
          <dt className="mono small muted">[03] EXPERIENCE</dt>
          <dd className="admin-stat-num">{loading ? "–" : pad(stats.experiences)}</dd>
          <div className="admin-stat-foot">
            <span>git graph chapters</span>
            <span>→</span>
          </div>
        </Link>

        <Link href="/admin/about" className="admin-stat-cell">
          <dt className="mono small muted">[04] ABOUT</dt>
          <dd className="admin-stat-num">{loading ? "–" : pad(stats.about)}</dd>
          <div className="admin-stat-foot">
            <span>narrative highlights</span>
            <span>→</span>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className={`admin-stat-cell${stats.unreadMessages > 0 ? " has-unread" : ""}`}
        >
          <dt className="mono small muted">[05] INBOX</dt>
          <dd className="admin-stat-num">{loading ? "–" : pad(stats.messages)}</dd>
          <div className="admin-stat-foot">
            <span style={{ color: stats.unreadMessages > 0 ? "light-dark(#4b6300, var(--accent))" : undefined, fontWeight: stats.unreadMessages > 0 ? 700 : undefined }}>
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} UNREAD` : "all read"}
            </span>
            <span>→</span>
          </div>
        </Link>
      </dl>

      <div className="admin-box">
        <div className="admin-box-bar">
          <div className="bar-title">
            <div className="dots">
              <i />
              <i />
              <i />
            </div>
            <span>~/database/cluster-architecture.sql</span>
          </div>
          <span className="mono small">POSTGRES v17 · RLS POLICIES ACTIVE</span>
        </div>

        <div style={{ padding: "28px" }}>
          <p className="mono small" style={{ marginBottom: "20px", color: "var(--muted)" }}>
            <b>$</b> psql -h db.vgvtsuhmrbunkdphbywh.supabase.co -U postgres -d postgres
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ background: "light-dark(#fafafa, #111315)", border: "1px solid var(--line)", padding: "20px" }}>
              <div className="mono small" style={{ fontWeight: 700, marginBottom: "8px" }}>
                01 // ROW LEVEL SECURITY
              </div>
              <p className="mono small muted" style={{ lineHeight: 1.6 }}>
                Anon role is restricted to SELECT on public portfolios and INSERT on contact messages. UPDATE/DELETE commands require authenticated admin JWT.
              </p>
            </div>

            <div style={{ background: "light-dark(#fafafa, #111315)", border: "1px solid var(--line)", padding: "20px" }}>
              <div className="mono small" style={{ fontWeight: 700, marginBottom: "8px" }}>
                02 // DYNAMIC HIGHLIGHTS
              </div>
              <p className="mono small muted" style={{ lineHeight: 1.6 }}>
                Under About Chapters, specify comma-separated phrases to control which words ignite with the neon marker during user scroll.
              </p>
            </div>

            <div style={{ background: "light-dark(#fafafa, #111315)", border: "1px solid var(--line)", padding: "20px" }}>
              <div className="mono small" style={{ fontWeight: 700, marginBottom: "8px" }}>
                03 // CREDENTIAL EXPIRATION
              </div>
              <p className="mono small muted" style={{ lineHeight: 1.6 }}>
                Certificates support expiration date tracking and automatic calculation of remaining validity or lifetime status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
