"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, str } from "@/lib/actions";
import { clientSchema } from "@/lib/validation";

const BASE = "/admin/clients";

export async function createClientAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = clientSchema.safeParse({
    name: str(fd, "name"),
    company: str(fd, "company"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    address: str(fd, "address"),
    notes: str(fd, "notes"),
  });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();
  if (error || !data) fail(BASE, "Could not save the client.");
  await logActivity(supabase, user.id, "client.create", "client", data.id, { name: parsed.data.name });
  revalidatePath(BASE);
  done(BASE, "Client created.");
}

export async function toggleArchiveClientAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  const archive = str(fd, "archive") === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) fail(BASE, "Invalid request.");
  const { error } = await supabase
    .from("clients")
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) fail(BASE, "Could not update the client.");
  await logActivity(supabase, user.id, archive ? "client.archive" : "client.restore", "client", id);
  revalidatePath(BASE);
  done(BASE, archive ? "Client archived." : "Client restored.");
}

/** Connects a client record to a registered portal account so the client can see their own data. */
export async function linkPortalAccountAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  const email = str(fd, "email").toLowerCase();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !email) fail(BASE, "Enter the account email.");

  const { data: profile } = await supabase.from("profiles").select("id,role").eq("email", email).maybeSingle();
  if (!profile) fail(BASE, "No registered account has that email. Ask the client to register first.");
  if (profile.role !== "client") fail(BASE, "That account is a team account, not a client account.");

  const { error } = await supabase.from("clients").update({ profile_id: profile.id }).eq("id", id);
  if (error) fail(BASE, "Could not link. That account may already be linked to another client.");
  await logActivity(supabase, user.id, "client.link", "client", id);
  revalidatePath(BASE);
  done(BASE, "Portal account linked.");
}

export async function unlinkPortalAccountAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  if (!/^[0-9a-f-]{36}$/i.test(id)) fail(BASE, "Invalid request.");
  const { error } = await supabase.from("clients").update({ profile_id: null }).eq("id", id);
  if (error) fail(BASE, "Could not unlink.");
  await logActivity(supabase, user.id, "client.unlink", "client", id);
  revalidatePath(BASE);
  done(BASE, "Portal account unlinked.");
}
