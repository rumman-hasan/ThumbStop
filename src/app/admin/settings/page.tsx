import { Field, Flash, PageHeader } from "@/components/app-ui";
import { requireRole } from "@/lib/auth";
import { site } from "@/lib/site-config";
import type { Row } from "@/lib/types";
import { saveMyProfileAction, saveSettingsAction } from "./actions";

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const { supabase, profile } = await requireRole(["admin"]);
  const { data } = await supabase.from("site_settings").select("key,value");
  const m: Record<string, string> = {};
  ((data ?? []) as Row[]).forEach((r) => {
    m[r.key] = r.value;
  });
  const v = (key: string, fallback = "") => m[key] || fallback;

  return (
    <>
      <PageHeader title="Website Settings" text="Contact details shown in the footer, contact page and WhatsApp button." />
      <Flash searchParams={searchParams} />

      <section className="card p-6">
        <h2 className="font-display text-xl font-bold text-white">Contact details</h2>
        <form action={saveSettingsAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Phone (as shown)" name="phone_display" required defaultValue={v("phone_display", site.phoneDisplay)} />
          <Field label="Phone (for tap-to-call, e.g. +8801…)" name="phone_tel" required defaultValue={v("phone_tel", site.phoneTel)} />
          <Field label="WhatsApp number (digits only, with country code)" name="whatsapp_number" required defaultValue={v("whatsapp_number", site.whatsappNumber)} />
          <Field label="Email" name="email" type="email" required defaultValue={v("email", site.email)} />
          <div className="sm:col-span-2"><Field label="Address" name="address" required defaultValue={v("address", site.address)} /></div>
          <Field label="Facebook page link" name="facebook" placeholder="https://facebook.com/…" defaultValue={v("facebook")} />
          <Field label="Instagram link" name="instagram" placeholder="https://instagram.com/…" defaultValue={v("instagram")} />
          <Field label="YouTube link" name="youtube" placeholder="https://youtube.com/…" defaultValue={v("youtube")} />
          <Field label="LinkedIn link" name="linkedin" placeholder="https://linkedin.com/…" defaultValue={v("linkedin")} />
          <div className="sm:col-span-2"><button className="btn-primary">Save settings</button></div>
        </form>
      </section>

      <section className="card mt-8 p-6">
        <h2 className="font-display text-xl font-bold text-white">My profile</h2>
        <p className="mt-1 text-sm text-brand-muted">Signed in as {profile.email}. Change your password from the “Forgot password?” link on the login page.</p>
        <form action={saveMyProfileAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="full_name" required defaultValue={profile.full_name} />
          <Field label="Phone" name="phone" defaultValue={profile.phone} />
          <div className="sm:col-span-2"><button className="btn-outline">Save profile</button></div>
        </form>
      </section>
    </>
  );
}
