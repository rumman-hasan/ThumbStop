import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clean } from "./validation";

/** Redirect back to a page with an error message shown by <Flash />. */
export function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

/** Redirect back to a page with a success message shown by <Flash />. */
export function done(path: string, message = "Saved."): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(message)}`);
}

export function str(fd: FormData, key: string): string {
  return clean(String(fd.get(key) ?? ""));
}

export function lines(fd: FormData, key: string): string[] {
  return String(fd.get(key) ?? "")
    .split("\n")
    .map((l) => clean(l))
    .filter(Boolean)
    .slice(0, 30);
}

export function checked(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

export async function logActivity(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  meta: Record<string, unknown> = {},
) {
  // Best effort: a logging failure must never block the real action.
  await supabase.from("activity_log").insert({ actor_id: actorId, action, entity, entity_id: entityId, meta });
}

/** Sends an in-portal notification to the portal user linked to a client (if any). */
export async function notifyClient(
  supabase: SupabaseClient,
  clientId: string,
  title: string,
  body: string,
  link: string,
) {
  const { data } = await supabase.from("clients").select("profile_id").eq("id", clientId).single();
  if (data?.profile_id) {
    await supabase.from("notifications").insert({ user_id: data.profile_id, title, body, link });
  }
}

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+/, "").slice(-80) || "file";
}
