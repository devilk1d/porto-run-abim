"use client";

// Two-state toggle: "system" (no stored value) or the opposite of system, stored literally.
function rendered(): "light" | "dark" {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')!;
  if (meta.content === "light" || meta.content === "dark") return meta.content;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  function toggle() {
    const target = rendered() === "dark" ? "light" : "dark";
    const system = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const value = target === system ? null : target;
    try {
      if (value) localStorage.setItem("color-scheme", value);
      else localStorage.removeItem("color-scheme");
    } catch {}
    document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')!.content = value ?? "light dark";
  }

  return (
    <button type="button" className="theme" onClick={toggle}>
      <span className="theme-dark" aria-hidden="true">☾</span>
      <span className="theme-light" aria-hidden="true">☀</span>
      <span className="sr-only theme-dark">Switch to dark theme</span>
      <span className="sr-only theme-light">Switch to light theme</span>
    </button>
  );
}
