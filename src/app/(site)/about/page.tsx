import type { Metadata } from "next";
import { ConsultationCta, PageHero, SectionHeading } from "@/components/ui";
import { whyChoose } from "@/lib/services";
import { getSite } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description: "ThumbStop is a digital marketing agency based in Savar, Dhaka, helping businesses grow with strategy, video, design and campaigns.",
};

export default async function AboutPage() {
  const s = await getSite();
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A digital marketing agency built to help brands get noticed."
        text="We combine strategy, creative work and careful campaign management for businesses in Bangladesh."
      />
      <section className="py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who we are" title="ThumbStop" />
            <p className="mt-5 leading-relaxed text-brand-muted">
              ThumbStop is a digital marketing agency based in Savar, Dhaka. We help businesses build a clear online
              presence through social media management, video production, graphic design, paid advertising, content
              creation and websites.
            </p>
            <p className="mt-4 leading-relaxed text-brand-muted">Our name describes the goal: content that makes people stop scrolling.</p>
          </div>
          <div className="card p-8">
            <h2 className="font-display text-xl font-bold text-white">Find us</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">{s.address}</p>
            <p className="mt-4 text-sm"><a className="font-semibold text-brand-cyan" href={`tel:${s.phoneTel}`}>{s.phoneDisplay}</a></p>
            <p className="mt-1 text-sm"><a className="font-semibold text-brand-cyan" href={`mailto:${s.email}`}>{s.email}</a></p>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-brand-surface/40 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="How we work" title="Our principles" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((w) => (
              <div key={w.title} className="border-t-2 border-brand-cyan pt-5">
                <h3 className="font-display text-lg font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ConsultationCta />
    </>
  );
}
