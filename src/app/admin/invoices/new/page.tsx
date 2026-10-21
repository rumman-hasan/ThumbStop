import Link from "next/link";
import { Field, Flash, PageHeader } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import type { Row } from "@/lib/types";
import { createInvoiceAction } from "../actions";

export default async function NewInvoicePage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin", "staff"]);
  const [clients, projects] = await Promise.all([
    supabase.from("clients").select("id,name").is("archived_at", null).order("name"),
    supabase.from("projects").select("id,title,client_id").is("archived_at", null).order("title"),
  ]);
  const clientRows = (clients.data ?? []) as Row[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <p className="mb-3 text-sm"><Link href="/admin/invoices" className="text-brand-cyan">← All invoices</Link></p>
      <PageHeader title="New invoice" text="Saved as a draft first. The client only sees it after you mark it as sent." />
      <Flash searchParams={searchParams} />

      {clientRows.length === 0 ? (
        <p className="text-sm text-brand-muted">Add a client first.</p>
      ) : (
        <form action={createInvoiceAction} className="card max-w-3xl space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" name="client_id" required>
              <select id="client_id" name="client_id" required className="input">
                {clientRows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Project (optional)" name="project_id">
              <select id="project_id" name="project_id" className="input">
                <option value="">— none —</option>
                {((projects.data ?? []) as Row[]).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            <Field label="Issue date" name="issue_date" type="date" defaultValue={today} required />
            <Field label="Due date" name="due_date" type="date" />
          </div>

          <fieldset>
            <legend className="label">Line items (BDT)</legend>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_90px_140px]">
                  <input name="item_desc" placeholder={i === 0 ? "Description" : "Description (optional)"} className="input" aria-label={`Item ${i + 1} description`} />
                  <input name="item_qty" type="number" min="0.01" step="0.01" defaultValue="1" className="input" aria-label={`Item ${i + 1} quantity`} />
                  <input name="item_price" type="number" min="0" step="0.01" placeholder="Unit price" className="input" aria-label={`Item ${i + 1} unit price`} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-brand-muted">Empty rows are ignored. The total is calculated by the database.</p>
          </fieldset>

          <Field label="Notes (shown on the invoice)" name="notes" textarea />
          <button className="btn-primary">Create draft invoice</button>
        </form>
      )}
    </>
  );
}
