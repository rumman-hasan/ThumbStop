import { EmptyRow, Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";
import { setEnquiryStatusAction } from "./actions";

const STATUSES = ["new", "contacted", "qualified", "won", "lost", "spam"];

export default async function EnquiriesPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin", "staff"]);
  const { data } = await supabase
    .from("enquiries")
    .select("id,name,email,phone,service,budget,details,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Enquiries" text="Messages sent from the website contact form." />
      <Flash searchParams={searchParams} />
      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr><th>Received</th><th>Contact</th><th>Interest</th><th>Details</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={5} text="No enquiries yet." />}
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap">{formatDate(e.created_at)}</td>
                <td>
                  <p className="font-semibold text-white">{e.name}</p>
                  <a href={`mailto:${e.email}`} className="block text-brand-cyan">{e.email}</a>
                  <a href={`tel:${e.phone}`} className="text-brand-cyan">{e.phone}</a>
                </td>
                <td>
                  <p>{e.service ?? "—"}</p>
                  <p className="text-xs text-brand-muted">{e.budget ?? ""}</p>
                </td>
                <td className="max-w-sm whitespace-pre-wrap text-brand-muted">{e.details}</td>
                <td>
                  <StatusBadge value={e.status} />
                  <form action={setEnquiryStatusAction} className="mt-2 flex gap-2">
                    <input type="hidden" name="id" value={e.id} />
                    <select name="status" defaultValue={e.status} className="input !py-1.5 text-xs" aria-label="Change status">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button type="submit" className="btn-outline btn-sm">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
