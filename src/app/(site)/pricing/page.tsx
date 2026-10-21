import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationCta, EmptyState, PageHero } from "@/components/ui";
import { getPackages } from "@/lib/data";
import { formatBDT } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pricing & Packages",
  description: "ThumbStop packages are tailored to each business. Request a quote.",
};

export default async function PricingPage() {
  const packages = await getPackages();
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Packages built around your business"
        text="Every business is different, so we quote after a short conversation."
      />
      <section className="py-20">
        <div className="container-page">
          {packages.length === 0 ? (
            <EmptyState
              title="Packages are not published yet"
              text="Please send an enquiry and we will prepare a quote for your needs."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((p) => (
                <div key={p.id} className="card flex flex-col p-7">
                  <h2 className="font-display text-xl font-bold text-white">{p.name}</h2>
                  {p.description && <p className="mt-3 text-sm leading-relaxed text-brand-muted">{p.description}</p>}
                  <ul className="mt-5 flex-1 space-y-2">
                    {(p.features as string[]).map((f) => (
                      <li key={f} className="flex gap-3 text-sm text-white/85">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 font-display text-2xl font-bold text-brand-cyan">
                    {p.price_bdt === null ? "Price on request" : formatBDT(p.price_bdt)}
                  </p>
                  <Link href="/contact" className="btn-primary mt-4">Request this package</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <ConsultationCta />
    </>
  );
}
