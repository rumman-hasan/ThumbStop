"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, notifyClient, str } from "@/lib/actions";
import { invoiceHeaderSchema, invoiceItemSchema, manualPaymentSchema } from "@/lib/validation";
import { formatBDT } from "@/lib/format";

const LIST = "/admin/invoices";
const NEW = "/admin/invoices/new";
const detail = (id: string) => `${LIST}/${id}`;
const UUID = /^[0-9a-f-]{36}$/i;

export async function createInvoiceAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);

  const header = invoiceHeaderSchema.safeParse({
    client_id: str(fd, "client_id"),
    project_id: str(fd, "project_id"),
    issue_date: str(fd, "issue_date"),
    due_date: str(fd, "due_date"),
    notes: str(fd, "notes"),
  });
  if (!header.success) fail(NEW, header.error.issues[0].message);

  const descs = fd.getAll("item_desc").map((v) => String(v));
  const qtys = fd.getAll("item_qty").map((v) => String(v));
  const prices = fd.getAll("item_price").map((v) => String(v));
  const items: { description: string; quantity: number; unit_price: number }[] = [];
  for (let i = 0; i < descs.length; i++) {
    if (!descs[i].trim() && !prices[i]?.trim()) continue; // skip empty rows
    const parsed = invoiceItemSchema.safeParse({ description: descs[i], quantity: qtys[i] || "1", unit_price: prices[i] });
    if (!parsed.success) fail(NEW, `Row ${i + 1}: ${parsed.error.issues[0].message}`);
    items.push(parsed.data);
  }
  if (items.length === 0) fail(NEW, "Add at least one line item.");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({ ...header.data, created_by: user.id })
    .select("id")
    .single();
  if (error || !invoice) fail(NEW, "Could not create the invoice.");

  const { error: itemsError } = await supabase.from("invoice_items").insert(items.map((it) => ({ ...it, invoice_id: invoice.id })));
  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoice.id); // only works for admins; staff leave an empty draft
    fail(NEW, "Could not save the line items.");
  }
  await logActivity(supabase, user.id, "invoice.create", "invoice", invoice.id);
  revalidatePath(LIST);
  redirect(`${detail(invoice.id)}?ok=${encodeURIComponent("Invoice created as a draft. Mark it as sent when ready.")}`);
}

export async function setInvoiceStatusAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  const next = str(fd, "status");
  if (!UUID.test(id) || !["sent", "cancelled"].includes(next)) fail(LIST, "Invalid request.");

  const { data: inv } = await supabase.from("invoices").select("status,number,total,client_id").eq("id", id).single();
  if (!inv) fail(LIST, "Invoice not found.");
  const allowed = next === "sent" ? inv.status === "draft" : ["draft", "sent", "partial", "overdue"].includes(inv.status);
  if (!allowed) fail(detail(id), "That change is not allowed for this invoice.");
  if (next === "sent" && Number(inv.total) <= 0) fail(detail(id), "An invoice needs a total above 0 before it is sent.");

  const { error } = await supabase.from("invoices").update({ status: next }).eq("id", id);
  if (error) fail(detail(id), "Could not update the invoice.");
  await logActivity(supabase, user.id, `invoice.${next}`, "invoice", id);
  if (next === "sent") {
    await notifyClient(supabase, inv.client_id, "New invoice", `Invoice ${inv.number} for ${formatBDT(inv.total)} is ready.`, `/portal/invoices/${id}`);
  }
  revalidatePath(detail(id));
  done(detail(id), next === "sent" ? "Invoice marked as sent and the client notified." : "Invoice cancelled.");
}

/** Records cash / bank / manual mobile-banking money you received outside the online gateway. */
export async function recordManualPaymentAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = manualPaymentSchema.safeParse({
    invoice_id: str(fd, "invoice_id"),
    amount: str(fd, "amount"),
    method: str(fd, "method"),
  });
  if (!parsed.success) fail(LIST, parsed.error.issues[0].message);
  const id = parsed.data.invoice_id;

  const { data: inv } = await supabase
    .from("invoices")
    .select("status,total,payments(amount,status)")
    .eq("id", id)
    .single();
  if (!inv) fail(LIST, "Invoice not found.");
  if (!["sent", "partial", "overdue"].includes(inv.status)) fail(detail(id), "Payments can only be recorded on sent invoices.");

  const paidSoFar = ((inv.payments ?? []) as { amount: number; status: string }[])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);
  const due = Number(inv.total) - paidSoFar;
  if (parsed.data.amount > due + 0.001) fail(detail(id), `Amount is more than the balance due (${formatBDT(due)}).`);

  const { error } = await supabase.from("payments").insert({
    invoice_id: id,
    tran_id: `MAN-${randomUUID()}`,
    provider: "manual",
    method: parsed.data.method,
    amount: parsed.data.amount,
    status: "paid",
    paid_at: new Date().toISOString(),
    created_by: user.id,
  });
  if (error) fail(detail(id), "Could not record the payment.");
  await logActivity(supabase, user.id, "payment.manual", "invoice", id, { amount: parsed.data.amount, method: parsed.data.method });
  revalidatePath(detail(id));
  done(detail(id), "Payment recorded.");
}
