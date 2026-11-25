import { createClient } from "@supabase/supabase-js";
import { type Database } from "../../types/database.types";

/**
 * Cookie-less Supabase client for public read-only queries.
 * Avoids calling `cookies()`, allowing Next.js ISR / static caching.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
