import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, Flash, PageHeader, StatusBadge } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Row } from "@/lib/types";
import {
  addLinkDeliverableAction,
  addMilestoneAction,
  deleteDeliverableAction,
  toggleMilestoneAction,
  updateProjectAction,
  uploadDeliverableAction,
} from "../actions";

const STATUSES = ["planning", "in_progress", "review", "completed", "on_hold", "cancelled"];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase, profile } = await requireRole(["admin", "staff"]);
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id,title,description,status,progress,start_date,deadline,clients(name)")
    .eq("id", params.id)
    .maybeSingle();
  if (!project) notFound();

  const [milestones, deliverables] = await Promise.all([
    supabase.from("milestones").select("id,title,due_date,is_done").eq("project_id", params.id).order("sort_order").order("created_at"),
    supabase.from("deliverables").select("id,title,kind,url,storage_path,created_at").eq("project_id", params.id).order("created_at", { ascending: false }),
  ]);

  const p = project as Row;
  const ms = (milestones.data ?? []) as Row[];
  const ds = (deliverables.data ?? []) as Row[];

  return (
    <>
      <p className="mb-3 text-sm"><Link href="/admin/projects" className="text-brand-cyan">← All projects</Link></p>
      <PageHeader title={p.title} text={`Client: ${p.clients?.name ?? "—"}`}>
        <StatusBadge value={p.status} />
      </PageHeader>
      <Flash searchParams={searchParams} />
      {p.description && <p className="mb-8 max-w-3xl whitespace-pre-wrap text-sm text-brand-muted">{p.description}</p>}

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold text-white">Status & progress</h2>
          <form action={updateProjectAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={p.id} />
            <div className="sm:col-span-2"><Field label="Title" name="title" defaultValue={p.title} required /></div>
            <Field label="Status" name="status">
              <select id="status" name="status" defaultValue={p.status} className="input">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Progress (%)" name="progress" type="number" min={0} max={100} step={1} defaultValue={p.progress} required />
            <Field label="Deadline" name="deadline" type="date" defaultValue={p.deadline} />
            <div className="flex items-end"><button className="btn-primary w-full">Save & notify client</button></div>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-bold text-white">Milestones</h2>
          <ul className="mt-4 space-y-2">
            {ms.length === 0 && <li className="text-sm text-brand-muted">No milestones yet.</li>}
            {ms.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2">
                <div>
                  <p className={`text-sm ${m.is_done ? "text-white/50 line-through" : "text-white"}`}>{m.title}</p>
                  <p className="text-xs text-brand-muted">Due {formatDate(m.due_date)}</p>
                </div>
                <form action={toggleMilestoneAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  <input type="hidden" name="done" value={m.is_done ? "0" : "1"} />
                  <button className="btn-outline btn-sm">{m.is_done ? "Reopen" : "Mark done"}</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addMilestoneAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input type="hidden" name="project_id" value={p.id} />
            <input name="title" required placeholder="New milestone" className="input" aria-label="Milestone title" />
            <input name="due_date" type="date" className="input" aria-label="Milestone due date" />
            <button className="btn-primary">Add</button>
          </form>
        </section>

        <section className="card p-6 xl:col-span-2">
          <h2 className="font-display text-xl font-bold text-white">Deliverables</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="data">
              <thead><tr><th>Title</th><th>Type</th><th>Added</th><th /></tr></thead>
              <tbody>
                {ds.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-brand-muted">Nothing shared yet.</td></tr>}
                {ds.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {d.kind === "link" ? (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">{d.title}</a>
                      ) : (
                        d.title
                      )}
                    </td>
                    <td>{d.kind === "link" ? "Link" : "File"}</td>
                    <td>{formatDate(d.created_at)}</td>
                    <td>
                      {profile.role === "admin" && (
                        <form action={deleteDeliverableAction}>
                          <input type="hidden" name="id" value={d.id} />
                          <input type="hidden" name="project_id" value={p.id} />
                          <button className="btn-danger btn-sm">Delete</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form action={addLinkDeliverableAction} className="space-y-3">
              <h3 className="eyebrow">Share a link (Drive, YouTube…)</h3>
              <input type="hidden" name="project_id" value={p.id} />
              <input name="title" required placeholder="Title" className="input" aria-label="Link title" />
              <input name="url" type="url" required placeholder="https://…" className="input" aria-label="Link address" />
              <button className="btn-primary">Add link</button>
            </form>
            <form action={uploadDeliverableAction} className="space-y-3">
              <h3 className="eyebrow">Upload a file (max 4 MB)</h3>
              <input type="hidden" name="project_id" value={p.id} />
              <input name="title" required placeholder="Title" className="input" aria-label="File title" />
              <input name="file" type="file" required className="input" aria-label="File" />
              <button className="btn-primary">Upload</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
