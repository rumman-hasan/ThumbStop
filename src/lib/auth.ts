import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type Role = "admin" | "staff" | "client";
export type SessionProfile = { id: string; email: string; full_name: string | null; phone: string | null; role: Role };

export async function getSessionProfile() {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id,email,full_name,phone,role").eq("id", user.id).single();
  if (!data) return null;
  return { supabase, user, profile: data as SessionProfile };
}

/** Use at the top of every protected page and server action. */
export async function requireRole(roles: Role[]) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!roles.includes(session.profile.role)) {
    redirect(session.profile.role === "client" ? "/portal" : "/admin");
  }
  return session;
}
