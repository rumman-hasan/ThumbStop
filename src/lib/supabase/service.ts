import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * SERVER ONLY. Uses the service-role key, which bypasses Row Level Security.
 * Import this only from API routes / server code that has already checked who the caller is.
 * Never import it into a file that starts with "use client".
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key || key.startsWith("your-")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function isServiceClientConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(supabaseUrl && key && !key.startsWith("your-"));
}
