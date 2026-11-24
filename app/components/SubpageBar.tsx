import Navbar from "./Navbar";

/** Top bar shared by the standalone pages (/projects, /certificates).
 * Renders the reusable unified Navbar so design, position and size stay consistent across all pages. */
export default function SubpageBar({ path }: { path?: string }) {
  return <Navbar />;
}
