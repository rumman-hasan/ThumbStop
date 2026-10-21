import { createPublicClient } from "@/lib/supabase/public";
import { site, type SiteInfo } from "@/lib/site-config";
import { services as staticServices, type Service } from "@/lib/services";
import type { Row } from "@/lib/types";

/** Public data helpers. Every one falls back to safe defaults when the database is unavailable. */

export async function getSite(): Promise<SiteInfo> {
  const base: SiteInfo = {
    phoneDisplay: site.phoneDisplay,
    phoneTel: site.phoneTel,
    whatsappNumber: site.whatsappNumber,
    email: site.email,
    address: site.address,
    social: { ...site.social },
  };
  const db = createPublicClient();
  if (!db) return base;
  try {
    const { data } = await db.from("site_settings").select("key,value");
    const m: Record<string, string> = {};
    (data ?? []).forEach((r: Row) => {
      m[r.key] = r.value;
    });
    return {
      phoneDisplay: m.phone_display || base.phoneDisplay,
      phoneTel: m.phone_tel || base.phoneTel,
      whatsappNumber: m.whatsapp_number || base.whatsappNumber,
      email: m.email || base.email,
      address: m.address || base.address,
      social: {
        facebook: m.facebook || "",
        instagram: m.instagram || "",
        youtube: m.youtube || "",
        linkedin: m.linkedin || "",
      },
    };
  } catch {
    return base;
  }
}

export async function getServices(): Promise<Service[]> {
  const db = createPublicClient();
  if (!db) return staticServices;
  try {
    const { data, error } = await db
      .from("services")
      .select("slug,title,summary,deliverables")
      .eq("is_active", true)
      .order("sort_order");
    if (error || !data || data.length === 0) return staticServices;
    return data as Service[];
  } catch {
    return staticServices;
  }
}

export async function getPackages(): Promise<Row[]> {
  const db = createPublicClient();
  if (!db) return [];
  try {
    const { data } = await db
      .from("packages")
      .select("id,name,description,price_bdt,features")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Row[];
  } catch {
    return [];
  }
}

export async function getPortfolio(limit = 50): Promise<Row[]> {
  const db = createPublicClient();
  if (!db) return [];
  try {
    const { data } = await db
      .from("portfolio_items")
      .select("id,title,client_name,summary,image_path,link")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(limit);
    return ((data ?? []) as Row[]).map((r) => ({
      ...r,
      image_url: r.image_path ? db.storage.from("portfolio").getPublicUrl(r.image_path).data.publicUrl : null,
    }));
  } catch {
    return [];
  }
}

export async function getTestimonials(): Promise<Row[]> {
  const db = createPublicClient();
  if (!db) return [];
  try {
    const { data } = await db
      .from("testimonials")
      .select("id,author_name,author_role,quote")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data ?? []) as Row[];
  } catch {
    return [];
  }
}
