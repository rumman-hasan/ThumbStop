import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatBDT, formatDate, titleCase } from "@/lib/format";
import type { Row } from "@/lib/types";
import { recordManualPaymentAction, setInvoiceStatusAction } from "../actions";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase } = await requireRole(["admin", "staff"]);
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();

  const { data } = await supabase
    .from("invoices")
    .select("id,number,status,total,issue_date,due_date,notes,clients(name,email,phone),projects(title)")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) notFound();
  const inv = data as Row;

  const [items, payments] = await Promise.all([
    supabase.from("invoice_items").select("id,description,quantity,unit_price,amount").eq("invoice_id", params.id),
    supabase.from("payments").select("id,tran_id,method,amount,status,paid_at,created_at").eq("invoice_id", params.id).order("created_at", { ascending: false }),
  ]);
  const itemRows = (items.data ?? []) as Row[];
  const payRows = (payments.data ?? []) as Row[];
  const paid = payRows.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const due = Math.max(0, Number(inv.total) - paid);
  const canPay = ["sent", "partial", "overdue"].includes(inv.status) && due > 0;

  return (
    <>
      <p className="mb-3 text-sm"><Link href="/admin/invoices" className="text-brand-cyan">← All invoices</Link></p>
      <PageHeader title={`Invoice ${inv.number}`} text={`${inv.clients?.name ?? ""}${inv.projects?.title ? ` · ${inv.projects.title}` : ""}`}>
        <StatusBadge value={inv.status} />
      </PageHeader>
      <Flash searchParams={searchParams} />

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="label">Issued</dt><dd>{formatDate(inv.issue_date)}</dd></div>
            <div><dt className="label">Due</dt><dd>{formatDate(inv.due_date)}</dd></div>
            <div><dt className="label">Client contact</dt><dd>{inv.clients?.email ?? inv.clients?.phone ?? "—"}</dd></div>
          </dl>
          <div className="mt-6 overflow-x-auto">
            <table className="data">
              <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {itemRows.map((it) => (
                  <tr key={it.id}>
                    <td>{it.description}</td>
                    <td>{Number(it.quantity)}</td>
                    <td>{formatBDT(it.unit_price)}</td>
                    <td className="text-right">{formatBDT(it.amount)}</td>
                  </tr>
                ))}
                <tr><td colSpan={3} className="text-right font-semibold">Total</td><td className="text-right font-semibold text-white">{formatBDT(inv.total)}</td></tr>
                <tr><td colSpan={3} className="text-right">Paid</td><td className="text-right">{formatBDT(paid)}</td></tr>
                <tr><td colSpan={3} className="text-right font-semibold">Balance due</td><td className="text-right font-semibold text-brand-cyan">{formatBDT(due)}</td></tr>
              </tbody>
            </table>
          </div>
          {inv.notes && <p className="mt-5 whitespace-pre-wrap text-sm text-brand-muted">{inv.notes}</p>}
        </section>

        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-white">Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {inv.status === "draft" && (
                <form action={setInvoiceStatusAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <input type="hidden" name="status" value="sent" />
                  <button className="btn-primary">Mark as sent</button>
                </form>
              )}
              {["draft", "sent", "partial", "overdue"].includes(inv.status) && (
                <form action={setInvoiceStatusAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <button className="btn-danger">Cancel invoice</button>
                </form>
              )}
              {["paid", "cancelled"].includes(inv.status) && <p className="text-sm text-brand-muted">No further actions.</p>}
            </div>
          </section>

          {canPay && (
            <section className="card p-6">
              <h2 className="font-display text-xl font-bold text-white">Record a manual payment</h2>
              <p className="mt-2 text-xs text-brand-muted">For cash, bank or manual bKash/Nagad money received outside the online gateway.</p>
              <form action={recordManualPaymentAction} className="mt-4 grid gap-3">
                <input type="hidden" name="invoice_id" value={inv.id} />
                <input name="amount" type="number" min="0.01" step="0.01" max={due} defaultValue={due} required className="input" aria-label="Amount" />
                <select name="method" className="input" aria-label="Method" defaultValue="cash">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank transfer</option>
                  <option value="bkash_manual">bKash (manual)</option>
                  <option value="nagad_manual">Nagad (manual)</option>
                </select>
                <button className="btn-primary">Record payment</button>
              </form>
            </section>
          )}

          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-white">Payments</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {payRows.length === 0 && <li className="text-brand-muted">No payments yet.</li>}
              {payRows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2">
                  <div>
                    <p className="text-white">{formatBDT(p.amount)} · {titleCase(p.method)}</p>
                    <p className="text-xs text-brand-muted">{formatDate(p.paid_at ?? p.created_at)}</p>
                  </div>
                  <StatusBadge value={p.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
