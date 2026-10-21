import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationCta, PageHero } from "@/components/ui";
import { getServices, getSite } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Services",
  description: "Social media management, digital marketing strategy, video production, graphic design, paid advertising, content creation and website development.",
};

export default async function ServicesPage() {
  const [services, s] = await Promise.all([getServices(), getSite()]);
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What we do for your brand"
        text="Choose a single service or combine several. Pricing is agreed after we understand your needs."
      />
      <section className="py-20">
        <div className="container-page space-y-6">
          {services.map((sv, i) => (
            <article key={sv.slug} id={sv.slug} className="card scroll-mt-28 grid gap-8 p-8 md:grid-cols-2">
              <div>
                <span className="font-display text-sm font-bold text-brand-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">{sv.title}</h2>
                <p className="mt-3 leading-relaxed text-brand-muted">{sv.summary}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/contact?service=${sv.slug}`} className="btn-primary">Enquire about this service</Link>
                  <a
                    href={whatsappLink(`Hello ThumbStop, I would like to enquire about ${sv.title}.`, s.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div>
                <h3 className="eyebrow">Deliverables</h3>
                <ul className="mt-4 space-y-2.5">
                  {sv.deliverables.map((d) => (
                    <li key={d} className="flex gap-3 text-sm text-white/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ConsultationCta />
    </>
  );
}
