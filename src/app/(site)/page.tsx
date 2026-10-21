import Image from "next/image";
import Link from "next/link";
import { ConsultationCta, EmptyState, SectionHeading } from "@/components/ui";
import { processSteps, whyChoose } from "@/lib/services";
import { getPortfolio, getServices, getSite, getTestimonials } from "@/lib/data";
import { site } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const [s, services, portfolio, testimonials] = await Promise.all([
    getSite(),
    getServices(),
    getPortfolio(3),
    getTestimonials(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-brand-navy">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-14 py-20 lg:grid-cols-[1.35fr_0.65fr] lg:py-28">
          <div>
            <p className="eyebrow">Digital Marketing Agency · Savar, Dhaka</p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Make Your Brand{" "}
              <span className="bg-gradient-to-r from-brand-cyan to-brand-royalBright bg-clip-text text-transparent">
                Impossible
              </span>{" "}
              to Ignore.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">{site.description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">Book a Free Consultation</Link>
              <Link href="/services" className="btn-outline">Explore Services</Link>
              <a href={whatsappLink(undefined, s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-2xl bg-white p-10 shadow-2xl shadow-black/40">
              <Image src="/brand/thumbstop-logo.png" alt="ThumbStop logo" width={536} height={563} priority className="h-auto w-full" />
            </div>
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
              Strategy · Video · Design · Ads
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Services"
            title="Everything your brand needs to be seen"
            text="Pick one service or combine them. Every service starts with a conversation about your goals."
          />
          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {services.map((sv, i) => (
              <Link
                key={sv.slug}
                href={`/services#${sv.slug}`}
                className="group grid items-center gap-3 py-7 transition-colors hover:bg-white/[0.03] md:grid-cols-[72px_1fr_1.3fr_32px] md:gap-8 md:px-4"
              >
                <span className="font-display text-sm font-bold text-brand-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-xl font-bold text-white group-hover:text-brand-cyan">{sv.title}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{sv.summary}</p>
                <span aria-hidden="true" className="hidden text-xl text-brand-cyan transition-transform group-hover:translate-x-1 md:block">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="border-y border-white/10 bg-brand-surface/40 py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Featured Work" title="Selected projects" />
            <Link href="/portfolio" className="btn-outline">View all work</Link>
          </div>
          <div className="mt-12">
            {portfolio.length === 0 ? (
              <EmptyState
                title="Portfolio items coming soon"
                text="Real client projects appear here once they are uploaded and approved for display."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {portfolio.map((p) => (
                  <article key={p.id} className="card overflow-hidden">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold text-white">{p.title}</h3>
                      {p.client_name && <p className="mt-1 text-xs uppercase tracking-wider text-brand-cyan">{p.client_name}</p>}
                      {p.summary && <p className="mt-3 text-sm text-brand-muted">{p.summary}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-24">
        <div className="container-page grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Why ThumbStop"
            title="A partner, not just a vendor"
            text="We keep things simple: clear scope, clear communication, honest advice."
          />
          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {whyChoose.map((w, i) => (
              <div key={w.title} className="bg-brand-ink p-7">
                <span className="font-display text-sm font-bold text-brand-cyan">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-white/10 bg-brand-navy py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Our Working Process" title="Simple steps, clear communication" />
          <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-white/15 lg:block" aria-hidden="true" />
            {processSteps.map((p, i) => (
              <li key={p.title} className="relative">
                <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cyan font-display text-sm font-bold text-brand-ink">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Client Reviews" title="What clients say" />
          <div className="mt-12">
            {testimonials.length === 0 ? (
              <EmptyState
                title="No reviews published yet"
                text="We only show genuine reviews from real clients. They appear here once collected and approved."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.slice(0, 3).map((t) => (
                  <figure key={t.id} className="card p-6">
                    <blockquote className="text-sm leading-relaxed text-white/85">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 text-xs text-brand-muted">
                      <span className="font-semibold text-white">{t.author_name}</span>
                      {t.author_role ? ` · ${t.author_role}` : ""}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ConsultationCta />
    </>
  );
}
