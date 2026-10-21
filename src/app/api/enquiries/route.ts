import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { createServiceClient, isServiceClientConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { sendAdminAlert } from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";

const MAX_PER_HOUR = 5;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  // Same-site requests only (blocks simple cross-site form posts).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ error: "Forbidden." }, 403);

  if (!isSupabaseConfigured || !isServiceClientConfigured()) {
    return json({ error: "Enquiry saving is not set up yet." }, 503);
  }
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
    return json({ error: "Unsupported request." }, 415);
  }

  const raw = await req.text();
  if (raw.length > 10_000) return json({ error: "Request too large." }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: bots fill the hidden field. Pretend success so they do not retry.
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ ok: true });

  const parsed = enquirySchema.safeParse({
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    service: String(body.service ?? ""),
    budget: String(body.budget ?? ""),
    details: String(body.details ?? ""),
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return json({ error: "Please check the highlighted fields.", fields }, 400);
  }

  // Rate limit by hashed IP, stored in the database so it also works on serverless hosting.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? "thumbstop"}:${ip}`)
    .digest("hex");

  const db = createServiceClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return json({ error: "Too many enquiries from your connection. Please try again later or use WhatsApp." }, 429);
  }

  const d = parsed.data;
  const { error } = await db.from("enquiries").insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    service: d.service || null,
    budget: d.budget || null,
    details: d.details,
    ip_hash: ipHash,
  });
  if (error) return json({ error: "Could not save your enquiry. Please use WhatsApp." }, 500);

  // Optional admin alert; never blocks or fails the visitor's request.
  void sendAdminAlert(`New ThumbStop enquiry from ${d.name} (${d.phone}) about ${d.service || "general"}`);

  return json({ ok: true });
}
