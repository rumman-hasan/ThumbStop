// Default business details. Live values come from the `site_settings` table
// (editable in Admin > Settings); these are the fallback when the database is not connected.

export type SocialLinks = { facebook: string; instagram: string; youtube: string; linkedin: string };

export type SiteInfo = {
  phoneDisplay: string;
  phoneTel: string;
  whatsappNumber: string; // international format, no + or spaces
  email: string;
  address: string;
  social: SocialLinks;
};

export const site = {
  name: "ThumbStop",
  tagline: "Make Your Brand Impossible to Ignore.",
  description:
    "ThumbStop helps businesses grow through strategic digital marketing, professional video production, creative content, and performance-focused campaigns.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  phoneDisplay: "+880 1778-854463",
  phoneTel: "+8801778854463",
  whatsappNumber: "8801778854463",
  email: "thumbstop870@gmail.com",
  address: "9/15, Junayed Complex, Delta Mor, Rajashon Road, Savar-1340, Dhaka, Bangladesh",
  social: { facebook: "", instagram: "", youtube: "", linkedin: "" } as SocialLinks,
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;
