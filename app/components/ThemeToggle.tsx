"use client";

// Two-state toggle: "system" (no stored value) or the opposite of system, stored literally.
function rendered(): "light" | "dark" {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')!;
  if (meta.content === "light" || meta.content === "dark") return meta.content;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let latest = 0; // id of the newest transition: an interrupted older one must not clean up after the newer one has started
let shrink = false; // alternates: one click grows the new theme out of the button, the next shrinks the old one back into it

export default function ThemeToggle() {
  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const target = rendered() === "dark" ? "light" : "dark";
    const system = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const value = target === system ? null : target;
    const apply = () => {
      try {
        if (value) localStorage.setItem("color-scheme", value);
        else localStorage.removeItem("color-scheme");
      } catch {}
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')!.content = value ?? "light dark";
    };
    // The new theme is revealed as a circle growing from the button (View Transitions); without support or with reduced motion it just switches.
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    const back = shrink, id = ++latest;
    shrink = !shrink;
    root.classList.toggle("vt-back", back);
    root.style.setProperty("--vt-c", `${x}px ${y}px`); // the CSS starts the circle from here, so no frame shows the whole new page before the animation begins
    root.style.setProperty("--vt-r", `${r}px`);
    const vt = document.startViewTransition(apply);
    let anim: Animation | undefined;
    vt.ready.then(() => {
      const circle = (rad: number) => `circle(${rad}px at ${x}px ${y}px)`;
      anim = root.animate(
        { clipPath: back ? [circle(r), circle(0)] : [circle(0), circle(r)] },
        { duration: 700, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards", pseudoElement: back ? "::view-transition-old(root)" : "::view-transition-new(root)" },
      );
    }).catch(() => {});
    vt.finished.finally(() => {
      anim?.cancel(); // a filled animation would otherwise stay on the next transition's pseudo-element and blank it
      if (id !== latest) return;
      root.classList.remove("vt-back"); root.style.removeProperty("--vt-c"); root.style.removeProperty("--vt-r");
    });
  }

  return (
    <button type="button" className="theme" aria-label="Toggle color theme" onClick={toggle}>
      <span className="theme-dark" aria-hidden="true">☾</span>
      <span className="theme-light" aria-hidden="true">☀</span>
      <span className="sr-only theme-dark">Switch to dark theme</span>
      <span className="sr-only theme-light">Switch to light theme</span>
    </button>
  );
}
