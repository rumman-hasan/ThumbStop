import Link from "next/link";
import { EmptyRow, Field, Flash, PageHeader } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import type { Row } from "@/lib/types";
import { createClientAction, linkPortalAccountAction, toggleArchiveClientAction, unlinkPortalAccountAction } from "./actions";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string; show?: string };
}) {
  const { supabase } = await requireRole(["admin", "staff"]);
  const archived = searchParams.show === "archived";

  let query = supabase.from("clients").select("id,name,company,email,phone,profile_id,archived_at").order("created_at", { ascending: false });
  query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  const profileIds = rows.map((r) => r.profile_id).filter(Boolean);
  const emails: Record<string, string> = {};
  if (profileIds.length) {
    const { data: profs } = await supabase.from("profiles").select("id,email").in("id", profileIds);
    ((profs ?? []) as Row[]).forEach((p) => {
      emails[p.id] = p.email;
    });
  }

  return (
    <>
      <PageHeader title="Clients" text="Businesses you work with. Archive instead of deleting to keep history.">
        <Link href={archived ? "/admin/clients" : "/admin/clients?show=archived"} className="btn-outline btn-sm">
          {archived ? "Show active" : "Show archived"}
        </Link>
      </PageHeader>
      <Flash searchParams={searchParams} />

      <div className="card overflow-x-auto">
        <table className="data">
          <thead><tr><th>Client</th><th>Contact</th><th>Portal account</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={4} text={archived ? "No archived clients." : "No clients yet. Add the first one below."} />}
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-brand-muted">{c.company ?? ""}</p>
                </td>
                <td>
                  <p>{c.email ?? "—"}</p>
                  <p className="text-xs text-brand-muted">{c.phone ?? ""}</p>
                </td>
                <td>
                  {c.profile_id ? (
                    <div>
                      <p className="text-emerald-300">Linked: {emails[c.profile_id] ?? "account"}</p>
                      <form action={unlinkPortalAccountAction} className="mt-1">
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-xs text-brand-muted underline">Unlink</button>
                      </form>
                    </div>
                  ) : (
                    <form action={linkPortalAccountAction} className="flex gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input name="email" type="email" required placeholder="Client's login email" className="input !py-1.5 text-xs" aria-label="Portal account email" />
                      <button className="btn-outline btn-sm">Link</button>
                    </form>
                  )}
                </td>
                <td>
                  <form action={toggleArchiveClientAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="archive" value={archived ? "0" : "1"} />
                    <button className="btn-outline btn-sm">{archived ? "Restore" : "Archive"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card mt-10 p-6">
        <h2 className="font-display text-xl font-bold text-white">Add a client</h2>
        <form action={createClientAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Company" name="company" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" />
          <div className="sm:col-span-2"><Field label="Address" name="address" /></div>
          <div className="sm:col-span-2"><Field label="Notes (internal)" name="notes" textarea /></div>
          <div className="sm:col-span-2"><button className="btn-primary">Save client</button></div>
        </form>
      </section>
    </>
  );
}
