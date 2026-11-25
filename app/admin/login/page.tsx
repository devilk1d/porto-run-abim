"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/client";
import ThemeToggle from "../../components/ThemeToggle";
import Logo from "../../components/Logo";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "timeout") {
        setErrorMsg("Session expired due to 15 minutes of inactivity. Please sign in again.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      try {
        localStorage.setItem("admin_last_activity", String(Date.now()));
      } catch {
        // ignore storage errors
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div style={{ position: "fixed", top: "20px", right: "24px", zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div className="admin-login-term">
        <div className="admin-modal-bar">
          <i />
          <i />
          <i />
          <span>~/auth/login.sh</span>
          <span className="mono small muted" style={{ marginLeft: "auto" }}>
            [auth gate]
          </span>
        </div>

        <div className="admin-login-body">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Logo size={28} />
            <span className="mono small muted">[00] admin authentication</span>
          </div>

          <h1>Console Access.</h1>
          <p className="sub">
            Direct database console for Supabase <code>abim-run</code>.
          </p>

          {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="email">Operator Identity (Email)</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                className="mono"
                placeholder="testing@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="password">Passkey (Password)</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="mono"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ marginTop: "28px" }}>
              <button
                type="submit"
                className="admin-btn primary"
                style={{ width: "100%", padding: "14px" }}
                disabled={loading}
              >
                {loading ? "Authenticating session..." : "Verify Credentials →"}
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px dashed var(--line)",
              textAlign: "center",
            }}
          >
            <Link href="/" className="mono small muted link-u">
              ← Return to public portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
