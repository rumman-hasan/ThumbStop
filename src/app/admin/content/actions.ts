"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { checked, done, fail, logActivity, str } from "@/lib/actions";
import { portfolioSchema, testimonialSchema } from "@/lib/validation";

const BASE = "/admin/content";
const UUID = /^[0-9a-f-]{36}$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function refreshPublic() {
  revalidatePath(BASE);
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/testimonials");
}

/** Checks the real file contents (not just the name the browser sent). */
async function detectImage(file: File): Promise<{ ext: string; type: string } | null> {
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return null;
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", type: "image/png" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return { ext: "webp", type: "image/webp" };
  }
  return null;
}

export async function savePortfolioAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = portfolioSchema.safeParse({
    id: str(fd, "id"),
    title: str(fd, "title"),
    client_name: str(fd, "client_name"),
    summary: str(fd, "summary"),
    link: str(fd, "link"),
  });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);
  const d = parsed.data;

  let oldPath: string | null = null;
  if (d.id) {
    const { data: existing } = await supabase.from("portfolio_items").select("image_path").eq("id", d.id).maybeSingle();
    oldPath = existing?.image_path ?? null;
  }

  let newPath: string | null = null;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    const kind = await detectImage(file);
    if (!kind) fail(BASE, "The image must be a real PNG, JPG or WebP file, 5 MB or smaller.");
    newPath = `${randomUUID()}.${kind.ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(newPath, file, { contentType: kind.type, upsert: false });
    if (upErr) fail(BASE, "The image could not be uploaded. Check that the database setup (storage) was completed.");
  }

  const row = {
    title: d.title,
    client_name: d.client_name,
    summary: d.summary,
    link: d.link,
    is_published: checked(fd, "is_published"),
    ...(newPath ? { image_path: newPath } : {}),
  };
  const { error } = d.id
    ? await supabase.from("portfolio_items").update(row).eq("id", d.id)
    : await supabase.from("portfolio_items").insert(row);
  if (error) {
    if (newPath) await supabase.storage.from("portfolio").remove([newPath]);
    fail(BASE, "Could not save the portfolio item.");
  }
  if (newPath && oldPath) await supabase.storage.from("portfolio").remove([oldPath]);

  await logActivity(supabase, user.id, d.id ? "portfolio.update" : "portfolio.create", "portfolio", d.id, { title: d.title });
  refreshPublic();
  done(BASE, "Portfolio item saved.");
}

export async function deletePortfolioAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const id = str(fd, "id");
  if (!UUID.test(id)) fail(BASE, "Invalid request.");
  const { data: existing } = await supabase.from("portfolio_items").select("image_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) fail(BASE, "Could not delete the item.");
  if (existing?.image_path) await supabase.storage.from("portfolio").remove([existing.image_path]);
  await logActivity(supabase, user.id, "portfolio.delete", "portfolio", id);
  refreshPublic();
  done(BASE, "Portfolio item deleted.");
}

export async function saveTestimonialAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const parsed = testimonialSchema.safeParse({
    id: str(fd, "id"),
    author_name: str(fd, "author_name"),
    author_role: str(fd, "author_role"),
    quote: str(fd, "quote"),
  });
  if (!parsed.success) fail(BASE, parsed.error.issues[0].message);
  const d = parsed.data;
  const row = {
    author_name: d.author_name,
    author_role: d.author_role,
    quote: d.quote,
    is_published: checked(fd, "is_published"),
  };
  const { error } = d.id
    ? await supabase.from("testimonials").update(row).eq("id", d.id)
    : await supabase.from("testimonials").insert(row);
  if (error) fail(BASE, "Could not save the review.");
  await logActivity(supabase, user.id, d.id ? "testimonial.update" : "testimonial.create", "testimonial", d.id);
  refreshPublic();
  done(BASE, "Review saved.");
}

export async function deleteTestimonialAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const id = str(fd, "id");
  if (!UUID.test(id)) fail(BASE, "Invalid request.");
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) fail(BASE, "Could not delete the review.");
  await logActivity(supabase, user.id, "testimonial.delete", "testimonial", id);
  refreshPublic();
  done(BASE, "Review deleted.");
}
