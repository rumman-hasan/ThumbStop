import Link from "next/link";
import type { ReactNode } from "react";
import { getSite } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-brand-muted">{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-brand-navy">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="container-page relative py-16 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-muted">{text}</p>}
      </div>
    </section>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const styles =
    tone === "warn"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
      : "border-brand-cyan/30 bg-brand-cyan/10 text-brand-mist";
  return (
    <div role="note" className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-brand-surface/50 px-6 py-12 text-center">
      <p className="font-display text-lg font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">{text}</p>
    </div>
  );
}

export async function ConsultationCta() {
  const s = await getSite();
  return (
    <section className="border-t border-white/10 bg-gradient-to-br from-brand-royal to-brand-navy">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to make your brand impossible to ignore?
          </h2>
          <p className="mt-3 text-white/80">Tell us about your business. We will reply with a clear next step.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Book a Free Consultation</Link>
          <a href={whatsappLink(undefined, s.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
