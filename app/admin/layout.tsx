"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "./admin.css";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARN_BEFORE_MS = 60 * 1000; // warn 60s before logout
const ACTIVITY_STORAGE_KEY = "admin_last_activity";

const TABS = [
  { href: "/admin", code: "[00]", label: "overview" },
  { href: "/admin/projects", code: "[01]", label: "projects" },
  { href: "/admin/certificates", code: "[02]", label: "certificates" },
  { href: "/admin/experience", code: "[03]", label: "experience" },
  { href: "/admin/about", code: "[04]", label: "about" },
  { href: "/admin/messages", code: "[05]", label: "messages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number | null>(null);
  const lastWriteRef = useRef<number>(0);
  const loggingOutRef = useRef<boolean>(false);
  const isLoginPage = pathname === "/admin/login";

  const performSignOut = useCallback(
    async (reason?: "timeout") => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
      try {
        localStorage.removeItem(ACTIVITY_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(reason === "timeout" ? "/admin/login?reason=timeout" : "/admin/login");
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    if (isLoginPage) return;
    loggingOutRef.current = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    supabase
      .from("contact_messages")
      .select("id", { count: "exact" })
      .eq("is_read", false)
      .then(({ count }) => {
        if (count) setUnreadCount(count);
      });
  }, [isLoginPage, pathname]);

  useEffect(() => {
    if (isLoginPage) return;

    const getLastActivity = (): number => {
      try {
        const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        const parsed = raw ? Number(raw) : 0;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
      } catch {
        return Date.now();
      }
    };

    const recordActivity = (force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < 5000) return;
      lastWriteRef.current = now;
      try {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
      } catch {
        // ignore storage errors
      }
      setIdleSecondsLeft(null);
    };

    // Initialize timestamp if missing; if already expired, log out immediately
    try {
      const existing = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (existing && Date.now() - Number(existing) >= IDLE_TIMEOUT_MS) {
        performSignOut("timeout");
        return;
      }
      if (!existing) recordActivity(true);
    } catch {
      // ignore
    }

    const onActivity = () => recordActivity(false);
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        setIdleSecondsLeft(null);
      }
    };
    window.addEventListener("storage", onStorage);

    const checkIdle = () => {
      const elapsed = Date.now() - getLastActivity();
      const remaining = IDLE_TIMEOUT_MS - elapsed;
      if (remaining <= 0) {
        performSignOut("timeout");
      } else if (remaining <= WARN_BEFORE_MS) {
        setIdleSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setIdleSecondsLeft(null);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") checkIdle();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = window.setInterval(checkIdle, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [isLoginPage, performSignOut]);

  const handleLogout = async () => {
    await performSignOut();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell" data-lenis-prevent>
      <header className="admin-nav-bar">
        <div className="admin-nav-pill">
          <Link href="/admin" className="logo" aria-label="Console home">
            <Logo />
          </Link>

          <nav className="admin-nav-links" aria-label="Console navigation">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`admin-nav-link${active ? " active" : ""}`}
                >
                  <span className="code">{tab.code}</span>
                  <span>{tab.label}</span>
                  {tab.href === "/admin/messages" && unreadCount > 0 && (
                    <span className="tab-badge">{unreadCount}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="admin-nav-ctrls">
            <ThemeToggle />
            {userEmail && (
              <span className="admin-user-pill mono">
                {userEmail}
              </span>
            )}
            <Link href="/" className="admin-btn sm dark" target="_blank">
              Site ↗
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-signout-btn"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="wrap">
        {idleSecondsLeft !== null && (
          <div
            className="admin-alert error"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <span className="mono small">
              Inactive session timeout in {idleSecondsLeft}s. Move cursor or click to stay signed in.
            </span>
            <button
              type="button"
              className="admin-btn sm primary"
              onClick={() => {
                try {
                  localStorage.setItem(ACTIVITY_STORAGE_KEY, String(Date.now()));
                } catch {
                  // ignore
                }
                setIdleSecondsLeft(null);
              }}
            >
              Stay signed in
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
