import type { Metadata } from "next";
import { ConsultationCta, EmptyState, PageHero } from "@/components/ui";
import { getPortfolio } from "@/lib/data";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected ThumbStop projects and case studies.",
};

export default async function PortfolioPage() {
  const items = await getPortfolio();
  return (
    <>
      <PageHero eyebrow="Portfolio" title="Our work" text="Projects and case studies, published with client approval." />
      <section className="py-20">
        <div className="container-page">
          {items.length === 0 ? (
            <EmptyState title="No projects published yet" text="Only real, client-approved work is displayed here." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <article key={p.id} className="card overflow-hidden">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  )}
                  <div className="p-5">
                    <h2 className="font-display text-lg font-bold text-white">{p.title}</h2>
                    {p.client_name && <p className="mt-1 text-xs uppercase tracking-wider text-brand-cyan">{p.client_name}</p>}
                    {p.summary && <p className="mt-3 text-sm text-brand-muted">{p.summary}</p>}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-brand-cyan">
                        View project →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <ConsultationCta />
    </>
  );
}
