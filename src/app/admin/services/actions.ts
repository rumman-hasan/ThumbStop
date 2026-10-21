"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { checked, done, fail, lines, logActivity, str } from "@/lib/actions";
import { packageSchema, serviceSchema } from "@/lib/validation";

const BASE = "/admin/services";
const UUID = /^[0-9a-f-]{36}$/i;

function slugify(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function refreshPublic() {
  revalidatePath(BASE);
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/pricing");
}

export async function saveServiceAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = serviceSchema.safeParse({
    id: str(fd, "id"),
    title: str(fd, "title"),
    slug: str(fd, "slug"),
    summary: str(fd, "summary"),
    sort_order: str(fd, "sort_order") || "0",
  });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);

  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  if (!slug) fail(BASE, "Could not make a web address from that title. Please type a slug.");

  const row = {
    title: d.title,
    slug,
    summary: d.summary,
    deliverables: lines(fd, "deliverables"),
    is_active: checked(fd, "is_active"),
    sort_order: d.sort_order,
  };
  const { error } = d.id
    ? await supabase.from("services").update(row).eq("id", d.id)
    : await supabase.from("services").insert(row);
  if (error) fail(BASE, error.code === "23505" ? "Another service already uses that slug." : "Could not save the service.");

  await logActivity(supabase, user.id, d.id ? "service.update" : "service.create", "service", d.id, { title: d.title });
  refreshPublic();
  done(BASE, "Service saved.");
}

export async function savePackageAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = packageSchema.safeParse({
    id: str(fd, "id"),
    name: str(fd, "name"),
    description: str(fd, "description"),
    price_bdt: str(fd, "price_bdt"),
    service_id: str(fd, "service_id"),
    sort_order: str(fd, "sort_order") || "0",
  });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);

  const d = parsed.data;
  const row = {
    name: d.name,
    description: d.description,
    price_bdt: d.price_bdt,
    service_id: d.service_id,
    features: lines(fd, "features"),
    is_published: checked(fd, "is_published"),
    sort_order: d.sort_order,
  };
  const { error } = d.id
    ? await supabase.from("packages").update(row).eq("id", d.id)
    : await supabase.from("packages").insert(row);
  if (error) fail(BASE, "Could not save the package.");

  await logActivity(supabase, user.id, d.id ? "package.update" : "package.create", "package", d.id, { name: d.name });
  refreshPublic();
  done(BASE, "Package saved.");
}

export async function deletePackageAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const id = str(fd, "id");
  if (!UUID.test(id)) fail(BASE, "Invalid request.");
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) fail(BASE, "Could not delete the package.");
  await logActivity(supabase, user.id, "package.delete", "package", id);
  refreshPublic();
  done(BASE, "Package deleted.");
}
