import { EmptyRow, PageHeader, Stat, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatBDT, formatDate, titleCase } from "@/lib/format";
import type { Row } from "@/lib/types";

const one = (v: unknown): Row | undefined => (Array.isArray(v) ? (v[0] as Row | undefined) : (v as Row | undefined));

function dhakaMonth(iso: string | null): string {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Dhaka" });
}

function monthLabel(key: string): string {
  const d = new Date(`${key}-01T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function tally(rows: Row[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((m, r) => {
    const k = String(r.status);
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
}

export default async function ReportsPage() {
  const { supabase } = await requireRole(["admin", "staff"]);

  const [paymentsRes, invoicesRes, enquiriesRes] = await Promise.all([
    supabase
      .from("payments")
      .select("id,amount,method,paid_at,created_at,invoices(number,clients(name))")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(500),
    supabase.from("invoices").select("status,total"),
    supabase.from("enquiries").select("status"),
  ]);

  const payments = (paymentsRes.data ?? []) as Row[];
  const invoices = (invoicesRes.data ?? []) as Row[];
  const enquiries = (enquiriesRes.data ?? []) as Row[];

  const collected = payments.reduce((s, p) => s + Number(p.amount), 0);
  const invoiced = invoices
    .filter((i) => i.status !== "draft" && i.status !== "cancelled")
    .reduce((s, i) => s + Number(i.total), 0);
  const outstanding = Math.max(0, invoiced - collected);

  const byMonth = new Map<string, number>();
  const byMethod = new Map<string, number>();
  payments.forEach((p) => {
    const m = dhakaMonth(p.paid_at ?? p.created_at);
    byMonth.set(m, (byMonth.get(m) ?? 0) + Number(p.amount));
    byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + Number(p.amount));
  });
  const months = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const methods = Array.from(byMethod.entries()).sort((a, b) => b[1] - a[1]);

  const invoiceCounts = tally(invoices);
  const enquiryCounts = tally(enquiries);

  return (
    <>
      <PageHeader title="Reports" text="Money in, invoice status and enquiry pipeline. Figures come from recorded (paid) payments." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invoiced" value={formatBDT(invoiced)} hint="Sent, partial, paid and overdue invoices" />
        <Stat label="Collected" value={formatBDT(collected)} hint="All paid payments" />
        <Stat label="Outstanding" value={formatBDT(outstanding)} hint="Invoiced minus collected" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card overflow-x-auto">
          <h2 className="px-4 pt-4 font-display text-lg font-bold text-white">Collected per month</h2>
          <table className="data mt-2">
            <thead><tr><th>Month</th><th>Amount</th></tr></thead>
            <tbody>
              {months.length === 0 && <EmptyRow colSpan={2} text="No payments recorded yet." />}
              {months.map(([key, amount]) => (
                <tr key={key}><td>{monthLabel(key)}</td><td>{formatBDT(amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card overflow-x-auto">
          <h2 className="px-4 pt-4 font-display text-lg font-bold text-white">Collected by method</h2>
          <table className="data mt-2">
            <thead><tr><th>Method</th><th>Amount</th></tr></thead>
            <tbody>
              {methods.length === 0 && <EmptyRow colSpan={2} text="No payments recorded yet." />}
              {methods.map(([method, amount]) => (
                <tr key={method}><td>{titleCase(method)}</td><td>{formatBDT(amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card p-4">
          <h2 className="font-display text-lg font-bold text-white">Invoices by status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(invoiceCounts).length === 0 && <li className="text-brand-muted">No invoices yet.</li>}
            {Object.entries(invoiceCounts).map(([k, n]) => (
              <li key={k} className="flex items-center justify-between"><StatusBadge value={k} /><span className="text-white">{n}</span></li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="font-display text-lg font-bold text-white">Enquiries by status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(enquiryCounts).length === 0 && <li className="text-brand-muted">No enquiries yet.</li>}
            {Object.entries(enquiryCounts).map(([k, n]) => (
              <li key={k} className="flex items-center justify-between"><StatusBadge value={k} /><span className="text-white">{n}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-10 overflow-x-auto">
        <h2 className="px-4 pt-4 font-display text-lg font-bold text-white">Transaction history</h2>
        <p className="px-4 text-xs text-brand-muted">Latest 50 paid payments.</p>
        <table className="data mt-2">
          <thead><tr><th>Date</th><th>Invoice</th><th>Client</th><th>Method</th><th>Amount</th></tr></thead>
          <tbody>
            {payments.length === 0 && <EmptyRow colSpan={5} text="No transactions yet." />}
            {payments.slice(0, 50).map((p) => {
              const inv = one(p.invoices);
              const client = one(inv?.clients);
              return (
                <tr key={p.id}>
                  <td>{formatDate(p.paid_at ?? p.created_at)}</td>
                  <td>{inv?.number ?? "—"}</td>
                  <td>{client?.name ?? "—"}</td>
                  <td>{titleCase(p.method)}</td>
                  <td>{formatBDT(p.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
