"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { ContactTrigger } from "./ContactDialog";
import { Magnetic, NavLinks } from "./Extras";
import { scrollToTarget } from "./scroll";
import { usePageTransition } from "./PageTransition";
import { siGithub } from "simple-icons";
import { GITHUB, LINKEDIN } from "../data";

const DEFAULT_NAV_LINKS: [string, string][] = [
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Stack", "#stack"],
  ["Projects", "#projects"],
  ["Certificates", "#certificates"],
];

interface NavbarProps {
  links?: [string, string][];
}

// Section numbers shown in the collapsed menu; the entries themselves come from the navbar's own links.
const SECTION_NUM: Record<string, string> = { "#about": "02", "#experience": "03", "#stack": "04", "#projects": "05", "#work": "05", "#certificates": "06", "#process": "07", "#contact": "08" };

const LINKEDIN_PATH = "M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.54h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.07c0-1.21-.02-2.77-1.69-2.77-1.69 0-1.95 1.32-1.95 2.68V21h-4V9.75Z";

function Socials() {
  return (
    <>
      <a className="nav-social" href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={siGithub.path} fill="currentColor" /></svg>
      </a>
      <a className="nav-social" href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn (opens in a new tab)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={LINKEDIN_PATH} fill="currentColor" /></svg>
      </a>
    </>
  );
}

function EnvelopeIcon() {
  return (
    <span className="hire-btn-ico hire-envelope-ico" aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    </span>
  );
}

// Per-slice slide animations:
// In: Slides from right to left (x: 100% -> 0%), stacking from bottom to top
// Out: Slides from top-left to bottom-right (x: 0 -> 100%, y: 0 -> 35px), stacking from top to bottom
const sliceVariants = (count: number) => ({
  initial: {
    x: "100%",
  },
  animate: (index: number) => ({
    x: "0%",
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      // Stacking from bottom to top on entrance:
      delay: (count - 1 - index) * 0.04,
    },
  }),
  exit: (index: number) => ({
    x: "100%",
    y: 35,
    transition: {
      duration: 0.34,
      ease: [0.32, 0, 0.67, 0] as [number, number, number, number],
      // Dissolve stacking from top-left to bottom-right on exit:
      delay: index * 0.035,
    },
  }),
});

const headerVariants = {
  initial: { y: -80 },
  animate: {
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    y: -80,
    transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
  },
};

const overlayVariants = (count: number) => ({
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: {
    opacity: 1,
    transition: {
      // Delay unmounting until all slices have finished exiting (8 * 0.035s + 0.34s = ~0.62s)
      delay: count * 0.035 + 0.34,
    },
  },
});

export default function Navbar({ links = DEFAULT_NAV_LINKS }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { go } = usePageTransition();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const items = links.map(([label, href]) => ({ num: SECTION_NUM[href] ?? "", label, href }));
  const slice = sliceVariants(items.length);
  const overlay = overlayVariants(items.length);

  // Active link indicator for subpages
  const activeHref = pathname === "/all-certificates"
    ? "#certificates"
    : pathname === "/all-projects"
    ? "#projects"
    : undefined;

  // Detect when user reaches section 1 "how I think" (#statement) or scrolled down
  useEffect(() => {
    const checkScroll = () => {
      const statementEl = document.getElementById("statement");
      if (statementEl) {
        const rect = statementEl.getBoundingClientRect();
        // Reached when section 1 header gets close to the top of viewport
        setIsScrolled(rect.top <= 120);
      } else {
        // Fallback for subpages: past top header
        setIsScrolled(window.scrollY >= 500);
      }
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  // Lock body scroll when fullscreen menu is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHome) {
      if (typeof window !== "undefined") {
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }
      sessionStorage.setItem("lastSection", "#top");
      scrollToTarget("#top", false);
    } else {
      const returnTarget = pathname === "/all-certificates"
        ? "#certificates"
        : pathname === "/all-projects"
        ? "#projects"
        : "#top";
      go("/" + (returnTarget.startsWith("#") ? returnTarget : "#" + returnTarget), "home");
    }
  };

  const handleNavigate = (href: string, instant = false) => {
    if (isHome) {
      if (href.startsWith("#")) {
        const hash = href === "#top" ? "" : href;
        if (typeof window !== "undefined") {
          window.history.replaceState(window.history.state, "", hash ? `${window.location.pathname}${hash}` : window.location.pathname);
        }
        sessionStorage.setItem("lastSection", href);
      }
      scrollToTarget(href, instant);
    } else {
      const isCertSubpage = pathname === "/all-certificates";
      const isProjSubpage = pathname === "/all-projects";

      if ((isCertSubpage && href === "#certificates") ||
          (isProjSubpage && (href === "#projects" || href === "#work"))) {
        window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
      } else if (href === "#top") {
        go("/#top", "home");
      } else {
        go("/" + href, "home");
      }
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Normal top bar */}
      <header
        className={`nav ${isScrolled ? "nav-hidden" : ""}`}
        aria-label="Main navigation"
        aria-hidden={isScrolled}
      >
        <a
          className="logo"
          href={isHome ? "#top" : "/"}
          onClick={handleLogoClick}
        >
          <Logo />
        </a>
        <NavLinks links={links} activeHref={activeHref} onNavigate={(h) => handleNavigate(h, false)} />
        <i className="nav-progress" aria-hidden="true" />
        <ThemeToggle />
        <Socials />
        <Magnetic>
          <ContactTrigger className="btn small-btn nav-hire-btn">
            Hire Abim <EnvelopeIcon />
          </ContactTrigger>
        </Magnetic>
      </header>

      {/* 2. Top-Right floating button (visible when reached Section 1 & below) */}
      <aside
        className={`top-right-nav ${isScrolled && !isOpen ? "is-visible" : ""}`}
        aria-hidden={!isScrolled || isOpen}
      >
        <button
          type="button"
          className="top-right-menu-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          tabIndex={isScrolled && !isOpen ? 0 : -1}
        >
          <Logo size={40} />
        </button>
      </aside>

      {/* 3. Fullscreen menu overlay with per-slice slide animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fullscreen-menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Sections navigation"
            variants={overlay}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header row */}
            <motion.div className="fullscreen-menu-header" variants={headerVariants}>
              <button
                type="button"
                className="logo"
                onClick={() => handleNavigate("#top", true)}
                style={{ cursor: "pointer" }}
              >
                <Logo />
              </button>

              <div className="fullscreen-menu-actions">
                <ThemeToggle />
                <Socials />
                <Magnetic>
                  <ContactTrigger className="btn small-btn nav-hire-btn" onClick={handleClose}>
                    Hire Abim <EnvelopeIcon />
                  </ContactTrigger>
                </Magnetic>
                <button
                  type="button"
                  className="menu-close-btn"
                  onClick={handleClose}
                  aria-label="Close menu"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            </motion.div>

            {/* Section slices container */}
            <div className="fullscreen-menu-content">
              <ul className="fullscreen-menu-list">
                {items.map((item, index) => (
                  <motion.li
                    key={item.href}
                    className="fullscreen-menu-slice"
                    custom={index}
                    variants={slice}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <button
                      type="button"
                      className="fullscreen-menu-link"
                      onClick={() => handleNavigate(item.href, true)}
                    >
                      <div className="link-right">
                        <span className="link-index mono">[{item.num}]</span>
                        <span className="link-title">{item.label}</span>
                        <span className="link-arrow mono" aria-hidden="true">
                          →
                        </span>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
