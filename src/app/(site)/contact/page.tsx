import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/ui";
import { getServices, getSite } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact ThumbStop for a free consultation. Call, WhatsApp, email or visit us in Savar, Dhaka.",
};

// The page reads ?service=..., so it is rendered per request.
export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: { service?: string } }) {
  const [services, s] = await Promise.all([getServices(), getSite()]);
  const match = services.find((sv) => sv.slug === searchParams.service);

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk about your brand" text="Send an enquiry and we will get back to you." />
      <section className="py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm
            services={services.map((sv) => sv.title)}
            defaultService={match?.title ?? ""}
            whatsappHref={whatsappLink(undefined, s.whatsappNumber)}
          />
          <aside>
            <div className="card p-7">
              <h2 className="font-display text-xl font-bold text-white">Contact details</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="label">Phone / WhatsApp</dt>
                  <dd><a className="text-brand-cyan" href={`tel:${s.phoneTel}`}>{s.phoneDisplay}</a></dd>
                </div>
                <div>
                  <dt className="label">Email</dt>
                  <dd><a className="break-all text-brand-cyan" href={`mailto:${s.email}`}>{s.email}</a></dd>
                </div>
                <div>
                  <dt className="label">Address</dt>
                  <dd className="leading-relaxed text-white/80">{s.address}</dd>
                </div>
              </dl>
              <a href={whatsappLink(undefined, s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7 w-full">
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
