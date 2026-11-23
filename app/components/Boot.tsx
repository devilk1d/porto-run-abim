"use client";
import { useEffect, useState } from "react";
import PixelName from "./PixelName";

// The boot screen is for the first load only: coming back to the home page by client navigation skips it.
let booted = false;

export default function Boot() {
  const [show] = useState(() => !booted); // false on later mounts; the first mount matches the server render
  useEffect(() => { booted = true; }, []);
  if (!show) return null;
  return (
    <div className="boot" aria-hidden="true">
      <PixelName className="boot-name" fill="var(--block-ink)" dotFill="var(--accent)" />
      <p className="mono small">booting abim.run — loading sections</p>
      <div className="boot-bar"><i /></div>
    </div>
  );
}
