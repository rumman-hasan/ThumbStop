import Link from "next/link";
import { EmptyRow, Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatBDT, formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";

export default async function InvoicesPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin", "staff"]);
  const { data } = await supabase
    .from("invoices")
    .select("id,number,status,total,issue_date,due_date,clients(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  const today = new Date().toISOString().slice(0, 10);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Invoices" text="Create invoices, send them to clients and track payment.">
        <Link href="/admin/invoices/new" className="btn-primary">New invoice</Link>
      </PageHeader>
      <Flash searchParams={searchParams} />
      <div className="card overflow-x-auto">
        <table className="data">
          <thead><tr><th>Number</th><th>Client</th><th>Total</th><th>Status</th><th>Issued</th><th>Due</th></tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={6} text="No invoices yet." />}
            {rows.map((i) => {
              const late = i.due_date && i.due_date < today && ["sent", "partial"].includes(i.status);
              return (
                <tr key={i.id}>
                  <td><Link href={`/admin/invoices/${i.id}`} className="font-semibold text-brand-cyan hover:underline">{i.number}</Link></td>
                  <td>{i.clients?.name ?? "—"}</td>
                  <td>{formatBDT(i.total)}</td>
                  <td><StatusBadge value={late ? "overdue" : i.status} /></td>
                  <td>{formatDate(i.issue_date)}</td>
                  <td>{formatDate(i.due_date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
