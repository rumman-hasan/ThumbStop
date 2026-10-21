import type { Metadata } from "next";
import { Notice, PageHero } from "@/components/ui";
import { getSite } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy Policy", description: "How ThumbStop handles your personal information." };

export default async function PrivacyPage() {
  const s = await getSite();
  const h = "font-display text-xl font-bold text-white";
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="py-16">
        <div className="container-page max-w-3xl space-y-6 leading-relaxed text-brand-muted">
          <Notice tone="warn">This is a starter draft. Please have it reviewed and finalised before the site goes live.</Notice>
          <h2 className={h}>Information we collect</h2>
          <p>Details you give us when you contact us or create an account, such as your name, email, phone number and project information.</p>
          <h2 className={h}>How we use it</h2>
          <p>To respond to enquiries, deliver projects, manage invoices and payments, and provide support. We do not sell your personal information.</p>
          <h2 className={h}>Payments</h2>
          <p>Online payments are processed by a third-party payment provider. ThumbStop does not see or store your card details.</p>
          <h2 className={h}>Your choices</h2>
          <p>You may ask us to correct or delete your personal information by contacting us.</p>
          <h2 className={h}>Contact</h2>
          <p>{s.email} · {s.phoneDisplay} · {s.address}</p>
        </div>
      </section>
    </>
  );
}
