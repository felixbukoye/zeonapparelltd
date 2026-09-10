import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the service-role key, which bypasses Row Level Security — it must
 * NEVER be exposed to the browser. The `server-only` import above makes the
 * build fail if this module is ever pulled into a client component.
 *
 * Env vars (set in Vercel → Settings → Environment Variables):
 *   SUPABASE_URL              e.g. https://abcdefg.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY project Settings → API → service_role (JWT)
 */

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "(see supabase/schema.sql and .env.local.example)."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
