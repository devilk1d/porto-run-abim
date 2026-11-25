"use client";
import { useEffect } from "react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  maxWidth,
  children,
}: AdminModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock background page scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="admin-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="admin-modal-window"
        data-lenis-prevent
        style={maxWidth ? { width: maxWidth } : undefined}
      >
        <div className="admin-modal-bar">
          <i />
          <i />
          <i />
          <span>{title}</span>
          <button
            type="button"
            className="close-pill"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            [close esc]
          </button>
        </div>

        <div className="admin-modal-content" data-lenis-prevent>
          {children}
        </div>
      </div>
    </div>
  );
}
