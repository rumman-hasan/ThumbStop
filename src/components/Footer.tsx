import Link from "next/link";
import { Logo } from "./Logo";
import { navLinks } from "@/lib/site-config";
import { getServices, getSite } from "@/lib/data";

export async function Footer() {
  const [s, services] = await Promise.all([getSite(), getServices()]);
  const socials = Object.entries(s.social).filter(([, url]) => url);

  return (
    <footer className="border-t border-white/10 bg-brand-navy">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-brand-muted">
            A digital marketing agency helping businesses grow through strategy, video, design and campaigns.
          </p>
        </div>

        <div>
          <h2 className="eyebrow">Company</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Services</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {services.map((sv) => (
              <li key={sv.slug}>
                <Link href={`/services#${sv.slug}`} className="hover:text-white">{sv.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li><a href={`tel:${s.phoneTel}`} className="hover:text-white">{s.phoneDisplay}</a></li>
            <li><a href={`mailto:${s.email}`} className="break-all hover:text-white">{s.email}</a></li>
            <li className="leading-relaxed">{s.address}</li>
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-white">{name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-xs text-brand-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ThumbStop. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
