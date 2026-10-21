import type { Metadata } from "next";
import { ConsultationCta, EmptyState, PageHero } from "@/components/ui";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Client Reviews",
  description: "Genuine reviews from ThumbStop clients.",
};

export default async function TestimonialsPage() {
  const items = await getTestimonials();
  return (
    <>
      <PageHero eyebrow="Reviews" title="What clients say" text="We publish only genuine reviews, with the client's permission." />
      <section className="py-20">
        <div className="container-page">
          {items.length === 0 ? (
            <EmptyState
              title="No reviews published yet"
              text="Reviews appear here after they are collected from real clients and approved."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <figure key={t.id} className="card p-7">
                  <blockquote className="leading-relaxed text-white/90">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 text-sm text-brand-muted">
                    <span className="font-semibold text-white">{t.author_name}</span>
                    {t.author_role ? ` · ${t.author_role}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
      <ConsultationCta />
    </>
  );
}
