"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, str } from "@/lib/actions";
import { roleSchema } from "@/lib/validation";

const BASE = "/admin/users";

export async function setRoleAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = roleSchema.safeParse({ target: str(fd, "target"), role: str(fd, "role") });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);
  const { target, role } = parsed.data;
  if (target === user.id) fail(BASE, "You cannot change your own role.");

  // The database function re-checks that the caller is an admin, so this cannot be bypassed from the browser.
  const { error } = await supabase.rpc("set_user_role", { target, new_role: role });
  if (error) fail(BASE, "Could not change the role. Only an administrator can do this.");

  await logActivity(supabase, user.id, "user.role", "profile", target, { role });
  revalidatePath(BASE);
  done(BASE, "Role updated.");
}
