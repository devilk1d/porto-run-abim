"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "./admin.css";

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
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
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

      <main className="wrap">{children}</main>
    </div>
  );
}
