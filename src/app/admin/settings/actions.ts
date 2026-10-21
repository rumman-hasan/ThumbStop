"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, str } from "@/lib/actions";
import { titleCase } from "@/lib/format";
import { profileSchema, settingsKeys, settingsSchema } from "@/lib/validation";

const BASE = "/admin/settings";

export async function saveSettingsAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = settingsSchema.safeParse(Object.fromEntries(settingsKeys.map((k) => [k, str(fd, k)])));
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);
  const d = parsed.data;

  for (const k of ["facebook", "instagram", "youtube", "linkedin"] as const) {
    const v = d[k];
    if (v && !/^https:\/\//i.test(v)) fail(BASE, `${titleCase(k)} link must start with https://`);
  }

  const now = new Date().toISOString();
  const rows = settingsKeys.map((k) => ({ key: k, value: String(d[k] ?? ""), updated_at: now }));
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) fail(BASE, "Could not save the settings.");

  await logActivity(supabase, user.id, "settings.update", "settings", null);
  revalidatePath("/", "layout");
  done(BASE, "Website settings saved.");
}

export async function saveMyProfileAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = profileSchema.safeParse({ full_name: str(fd, "full_name"), phone: str(fd, "phone") });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone })
    .eq("id", user.id);
  if (error) fail(BASE, "Could not save your profile.");
  revalidatePath("/admin", "layout");
  done(BASE, "Profile saved.");
}
