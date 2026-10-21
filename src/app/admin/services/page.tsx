import { Flash, PageHeader } from "@/components/app-ui";
import { Check, IdField } from "@/components/admin-fields";
import { requireRole } from "@/lib/auth";
import { formatBDT } from "@/lib/format";
import type { Row } from "@/lib/types";
import { deletePackageAction, savePackageAction, saveServiceAction } from "./actions";

function ServiceForm({ s }: { s?: Row }) {
  const key = s?.id ?? "new";
  return (
    <form action={saveServiceAction} className="grid gap-4 p-5 sm:grid-cols-2">
      {s && <input type="hidden" name="id" value={s.id} />}
      <IdField idPrefix={key} label="Title" name="title" required defaultValue={s?.title} />
      <IdField idPrefix={key} label="Slug (web address part)" name="slug" defaultValue={s?.slug} placeholder="auto from title" />
      <div className="sm:col-span-2">
        <IdField idPrefix={key} label="Short summary" name="summary" textarea required defaultValue={s?.summary} />
      </div>
      <div className="sm:col-span-2">
        <IdField idPrefix={key} label="Deliverables (one per line)" name="deliverables" textarea rows={5} defaultValue={((s?.deliverables ?? []) as string[]).join("\n")} />
      </div>
      <IdField idPrefix={key} label="Order" name="sort_order" type="number" min={0} max={1000} defaultValue={s?.sort_order ?? 0} />
      <Check name="is_active" label="Show on the website" defaultChecked={s ? s.is_active : true} />
      <div className="sm:col-span-2"><button className="btn-primary">{s ? "Save service" : "Add service"}</button></div>
    </form>
  );
}

function PackageForm({ p, services }: { p?: Row; services: Row[] }) {
  const key = p?.id ?? "new";
  return (
    <form action={savePackageAction} className="grid gap-4 p-5 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <IdField idPrefix={`pkg-${key}`} label="Package name" name="name" required defaultValue={p?.name} />
      <IdField idPrefix={`pkg-${key}`} label="Price (৳) — empty = price on request" name="price_bdt" type="number" min={0} defaultValue={p?.price_bdt} />
      <div className="sm:col-span-2">
        <IdField idPrefix={`pkg-${key}`} label="Description" name="description" textarea defaultValue={p?.description} />
      </div>
      <div className="sm:col-span-2">
        <IdField idPrefix={`pkg-${key}`} label="What is included (one per line)" name="features" textarea rows={5} defaultValue={((p?.features ?? []) as string[]).join("\n")} />
      </div>
      <IdField idPrefix={`pkg-${key}`} label="Related service" name="service_id">
        <select id={`service_id-pkg-${key}`} name="service_id" className="input" defaultValue={p?.service_id ?? ""}>
          <option value="">— none —</option>
          {services.map((s) => (<option key={s.id} value={s.id}>{s.title}</option>))}
        </select>
      </IdField>
      <IdField idPrefix={`pkg-${key}`} label="Order" name="sort_order" type="number" min={0} max={1000} defaultValue={p?.sort_order ?? 0} />
      <Check name="is_published" label="Publish on the Pricing page" defaultChecked={p ? p.is_published : false} />
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button className="btn-primary">{p ? "Save package" : "Add package"}</button>
      </div>
    </form>
  );
}

export default async function ServicesAdminPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin"]);
  const [svcRes, pkgRes] = await Promise.all([
    supabase.from("services").select("id,slug,title,summary,deliverables,is_active,sort_order").order("sort_order"),
    supabase.from("packages").select("id,service_id,name,description,price_bdt,features,is_published,sort_order").order("sort_order"),
  ]);
  const services = (svcRes.data ?? []) as Row[];
  const packages = (pkgRes.data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Services & Packages" text="Controls the Services and Pricing pages. Only published packages are shown to visitors." />
      <Flash searchParams={searchParams} />

      <h2 className="mb-3 font-display text-xl font-bold text-white">Services</h2>
      <div className="space-y-3">
        {services.map((s) => (
          <details key={s.id} className="card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="font-semibold text-white">{s.title}</span>
              <span className="text-xs text-brand-muted">{s.is_active ? "Visible" : "Hidden"}</span>
            </summary>
            <div className="border-t border-white/10"><ServiceForm s={s} /></div>
          </details>
        ))}
        <details className="card">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-brand-cyan">+ Add a service</summary>
          <div className="border-t border-white/10"><ServiceForm /></div>
        </details>
      </div>

      <h2 className="mb-3 mt-12 font-display text-xl font-bold text-white">Pricing packages</h2>
      <div className="space-y-3">
        {packages.length === 0 && <p className="text-sm text-brand-muted">No packages yet. The Pricing page shows “price on request” until you publish one.</p>}
        {packages.map((p) => (
          <details key={p.id} className="card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="font-semibold text-white">{p.name}</span>
              <span className="text-xs text-brand-muted">
                {p.price_bdt === null ? "Price on request" : formatBDT(p.price_bdt)} · {p.is_published ? "Published" : "Draft"}
              </span>
            </summary>
            <div className="border-t border-white/10">
              <PackageForm p={p} services={services} />
              <form action={deletePackageAction} className="px-5 pb-5">
                <input type="hidden" name="id" value={p.id} />
                <button className="btn-danger btn-sm">Delete this package</button>
              </form>
            </div>
          </details>
        ))}
        <details className="card">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-brand-cyan">+ Add a package</summary>
          <div className="border-t border-white/10"><PackageForm services={services} /></div>
        </details>
      </div>
    </>
  );
}
