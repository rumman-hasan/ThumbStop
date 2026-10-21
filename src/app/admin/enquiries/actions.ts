"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, str } from "@/lib/actions";

const STATUSES = ["new", "contacted", "qualified", "won", "lost", "spam"];

export async function setEnquiryStatusAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !STATUSES.includes(status)) fail("/admin/enquiries", "Invalid request.");
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) fail("/admin/enquiries", "Could not update the enquiry.");
  await logActivity(supabase, user.id, "enquiry.status", "enquiry", id, { status });
  revalidatePath("/admin/enquiries");
  done("/admin/enquiries", "Enquiry updated.");
}
