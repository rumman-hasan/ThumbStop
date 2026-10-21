import type { Metadata } from "next";
import { Notice, PageHero } from "@/components/ui";
import { getSite } from "@/lib/data";

export const metadata: Metadata = { title: "Terms and Conditions", description: "Terms of using ThumbStop's website and services." };

export default async function TermsPage() {
  const s = await getSite();
  const h = "font-display text-xl font-bold text-white";
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms and Conditions" />
      <section className="py-16">
        <div className="container-page max-w-3xl space-y-6 leading-relaxed text-brand-muted">
          <Notice tone="warn">This is a starter draft. Please have it reviewed and finalised before the site goes live.</Notice>
          <h2 className={h}>Services</h2>
          <p>Scope, deliverables, timelines and fees are agreed with each client in writing before work begins.</p>
          <h2 className={h}>Payments</h2>
          <p>Invoices are payable by the due date stated. Work may be paused for overdue invoices.</p>
          <h2 className={h}>Client content</h2>
          <p>Clients confirm they have the right to use any materials they provide to us.</p>
          <h2 className={h}>Results</h2>
          <p>Marketing outcomes depend on many factors, so we cannot guarantee specific results.</p>
          <h2 className={h}>Contact</h2>
          <p>{s.email} · {s.phoneDisplay}</p>
        </div>
      </section>
    </>
  );
}
