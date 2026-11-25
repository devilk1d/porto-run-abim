import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only run auth session checks on /admin routes so public pages stay fast and cacheable.
  matcher: ["/admin/:path*"],
};
