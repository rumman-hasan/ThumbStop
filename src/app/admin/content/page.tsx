import { Flash, PageHeader } from "@/components/app-ui";
import { Check, IdField } from "@/components/admin-fields";
import { requireRole } from "@/lib/auth";
import type { Row } from "@/lib/types";
import { deletePortfolioAction, deleteTestimonialAction, savePortfolioAction, saveTestimonialAction } from "./actions";

function PortfolioForm({ p, imageUrl }: { p?: Row; imageUrl?: string | null }) {
  const key = `pf-${p?.id ?? "new"}`;
  return (
    <form action={savePortfolioAction} className="grid gap-4 p-5 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <IdField idPrefix={key} label="Project title" name="title" required defaultValue={p?.title} />
      <IdField idPrefix={key} label="Client name (show only with permission)" name="client_name" defaultValue={p?.client_name} />
      <div className="sm:col-span-2">
        <IdField idPrefix={key} label="Short description" name="summary" textarea defaultValue={p?.summary} />
      </div>
      <IdField idPrefix={key} label="Link (optional, https://…)" name="link" defaultValue={p?.link} />
      <IdField idPrefix={key} label="Image (PNG, JPG or WebP, max 5 MB)" name="image">
        <input id={`image-${key}`} name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
      </IdField>
      {imageUrl && (
        <div className="sm:col-span-2">
          <p className="label">Current image</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-32 w-auto rounded-md border border-white/10 object-cover" />
        </div>
      )}
      <Check name="is_published" label="Publish on the Portfolio page" defaultChecked={p ? p.is_published : false} />
      <div className="sm:col-span-2"><button className="btn-primary">{p ? "Save item" : "Add item"}</button></div>
    </form>
  );
}

function TestimonialForm({ t }: { t?: Row }) {
  const key = `tm-${t?.id ?? "new"}`;
  return (
    <form action={saveTestimonialAction} className="grid gap-4 p-5 sm:grid-cols-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      <IdField idPrefix={key} label="Person's name" name="author_name" required defaultValue={t?.author_name} />
      <IdField idPrefix={key} label="Role / business" name="author_role" defaultValue={t?.author_role} />
      <div className="sm:col-span-2">
        <IdField idPrefix={key} label="What they said (their real words)" name="quote" textarea rows={4} required defaultValue={t?.quote} />
      </div>
      <Check name="is_published" label="Publish on the Reviews page" defaultChecked={t ? t.is_published : false} />
      <div className="sm:col-span-2"><button className="btn-primary">{t ? "Save review" : "Add review"}</button></div>
    </form>
  );
}

export default async function ContentPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase } = await requireRole(["admin"]);
  const [pfRes, tmRes] = await Promise.all([
    supabase.from("portfolio_items").select("id,title,client_name,summary,image_path,link,is_published").order("created_at", { ascending: false }),
    supabase.from("testimonials").select("id,author_name,author_role,quote,is_published").order("created_at", { ascending: false }),
  ]);
  const items = (pfRes.data ?? []) as Row[];
  const reviews = (tmRes.data ?? []) as Row[];
  const urlFor = (path: string | null) => (path ? supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl : null);

  return (
    <>
      <PageHeader title="Portfolio & Reviews" text="Shown on the public website only when published. Add only real client work and real reviews, with the client's permission." />
      <Flash searchParams={searchParams} />

      <h2 className="mb-3 font-display text-xl font-bold text-white">Portfolio</h2>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-brand-muted">Nothing here yet.</p>}
        {items.map((p) => (
          <details key={p.id} className="card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="font-semibold text-white">{p.title}</span>
              <span className="text-xs text-brand-muted">{p.is_published ? "Published" : "Draft"}</span>
            </summary>
            <div className="border-t border-white/10">
              <PortfolioForm p={p} imageUrl={urlFor(p.image_path)} />
              <form action={deletePortfolioAction} className="px-5 pb-5">
                <input type="hidden" name="id" value={p.id} />
                <button className="btn-danger btn-sm">Delete this item</button>
              </form>
            </div>
          </details>
        ))}
        <details className="card">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-brand-cyan">+ Add a portfolio item</summary>
          <div className="border-t border-white/10"><PortfolioForm /></div>
        </details>
      </div>

      <h2 className="mb-3 mt-12 font-display text-xl font-bold text-white">Client reviews</h2>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-brand-muted">Nothing here yet.</p>}
        {reviews.map((t) => (
          <details key={t.id} className="card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="font-semibold text-white">{t.author_name}</span>
              <span className="text-xs text-brand-muted">{t.is_published ? "Published" : "Draft"}</span>
            </summary>
            <div className="border-t border-white/10">
              <TestimonialForm t={t} />
              <form action={deleteTestimonialAction} className="px-5 pb-5">
                <input type="hidden" name="id" value={t.id} />
                <button className="btn-danger btn-sm">Delete this review</button>
              </form>
            </div>
          </details>
        ))}
        <details className="card">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-brand-cyan">+ Add a review</summary>
          <div className="border-t border-white/10"><TestimonialForm /></div>
        </details>
      </div>
    </>
  );
}
