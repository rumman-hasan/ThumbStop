import Link from "next/link";
import { EmptyRow, Field, Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";
import { createProjectAction } from "./actions";

const STATUSES = ["planning", "in_progress", "review", "completed", "on_hold", "cancelled"];

export default async function ProjectsPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin", "staff"]);
  const [projects, clients, services] = await Promise.all([
    supabase.from("projects").select("id,title,status,progress,deadline,clients(name)").is("archived_at", null).order("created_at", { ascending: false }),
    supabase.from("clients").select("id,name").is("archived_at", null).order("name"),
    supabase.from("services").select("id,title").order("sort_order"),
  ]);
  const rows = (projects.data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Projects" text="Set status, progress and deadlines. Clients see updates in their portal." />
      <Flash searchParams={searchParams} />

      <div className="card overflow-x-auto">
        <table className="data">
          <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Deadline</th></tr></thead>
          <tbody>
            {rows.length === 0 && <EmptyRow colSpan={5} text="No projects yet." />}
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/projects/${p.id}`} className="font-semibold text-brand-cyan hover:underline">{p.title}</Link></td>
                <td>{p.clients?.name ?? "—"}</td>
                <td><StatusBadge value={p.status} /></td>
                <td>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-brand-cyan" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs text-brand-muted">{p.progress}%</span>
                </td>
                <td>{formatDate(p.deadline)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card mt-10 p-6">
        <h2 className="font-display text-xl font-bold text-white">Create a project</h2>
        {((clients.data ?? []) as Row[]).length === 0 ? (
          <p className="mt-4 text-sm text-brand-muted">Add a client first, then create their project.</p>
        ) : (
          <form action={createProjectAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Client" name="client_id" required>
              <select id="client_id" name="client_id" required className="input">
                {((clients.data ?? []) as Row[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Service" name="service_id">
              <select id="service_id" name="service_id" className="input">
                <option value="">— none —</option>
                {((services.data ?? []) as Row[]).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2"><Field label="Title" name="title" required /></div>
            <div className="sm:col-span-2"><Field label="Description" name="description" textarea /></div>
            <Field label="Status" name="status">
              <select id="status" name="status" className="input" defaultValue="planning">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date" name="start_date" type="date" />
              <Field label="Deadline" name="deadline" type="date" />
            </div>
            <div className="sm:col-span-2"><button className="btn-primary">Create project</button></div>
          </form>
        )}
      </section>
    </>
  );
}
