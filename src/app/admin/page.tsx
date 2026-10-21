import Link from "next/link";
import { PageHeader, Stat, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatBDT, formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";

export default async function AdminOverview() {
  const { supabase, profile } = await requireRole(["admin", "staff"]);
  const head = { count: "exact" as const, head: true };

  const [clients, projects, newEnq, outstanding, paid, recent] = await Promise.all([
    supabase.from("clients").select("id", head).is("archived_at", null),
    supabase.from("projects").select("id", head).in("status", ["planning", "in_progress", "review"]).is("archived_at", null),
    supabase.from("enquiries").select("id", head).eq("status", "new"),
    supabase.from("invoices").select("total, payments(amount,status)").in("status", ["sent", "partial", "overdue"]),
    supabase.from("payments").select("amount").eq("status", "paid"),
    supabase.from("enquiries").select("id,name,service,status,created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const outstandingTotal = ((outstanding.data ?? []) as Row[]).reduce((sum, inv) => {
    const paidSoFar = ((inv.payments ?? []) as Row[]).filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, Number(inv.total) - paidSoFar);
  }, 0);
  const collected = ((paid.data ?? []) as Row[]).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <PageHeader title="Overview" text={`Welcome, ${profile.full_name || profile.email}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Active clients" value={clients.count ?? 0} />
        <Stat label="Active projects" value={projects.count ?? 0} />
        <Stat label="New enquiries" value={newEnq.count ?? 0} />
        <Stat label="Outstanding" value={formatBDT(outstandingTotal)} hint="Sent, partial and overdue invoices" />
        <Stat label="Collected" value={formatBDT(collected)} hint="All recorded payments" />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-brand-cyan">View all</Link>
        </div>
        <div className="card overflow-x-auto">
          <table className="data">
            <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {((recent.data ?? []) as Row[]).length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-10 text-center text-brand-muted">No enquiries yet.</td></tr>
              ) : (
                ((recent.data ?? []) as Row[]).map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.service ?? "—"}</td>
                    <td><StatusBadge value={e.status} /></td>
                    <td>{formatDate(e.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
