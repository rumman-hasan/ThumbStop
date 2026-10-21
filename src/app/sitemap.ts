import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/about", "/services", "/portfolio", "/pricing", "/testimonials", "/contact", "/privacy-policy", "/terms"];
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date() }));
}
