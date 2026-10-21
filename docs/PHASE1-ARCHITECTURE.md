# ThumbStop — Phase 1: Architecture & Plan

## 1. Stack (as requested)
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Server-side routes keep secrets off the browser; good SEO |
| Styling | Tailwind CSS 3 | Fast, consistent brand tokens |
| Auth / DB / Files | Supabase (Auth, Postgres, Storage) | One service, Row Level Security built in |
| Validation | Zod | Same schema on client and server |
| Hosting (recommended) | Vercel (free tier to start) | Zero-config for Next.js; env vars kept server-side |

## 2. Decisions that affect cost / security / scope
1. **Hosting:** Vercel free tier is enough to start. Paid plans only when traffic or commercial-use terms require it.
2. **Supabase free tier:** fine for development and early production. Projects pause after inactivity on the free plan; upgrade before relying on it for client data.
3. **Admin creation:** nobody can self-register as admin. Registration always creates `client` role. Admin role is granted only by an existing admin (server-side action) or by a one-time SQL statement you run yourself.
4. **Email:** no email is claimed to be sent until a provider (e.g. Resend) is configured and tested. Supabase's built-in auth emails are rate-limited; plan a custom SMTP before launch.
5. **Language:** English first. Copy lives in `src/lib` data files so a Bengali dictionary (e.g. `next-intl`) can be added later without rewriting pages.

## 3. Payment provider recommendation (Bangladesh)
| | SSLCommerz | bKash Merchant (Tokenized Checkout) |
|---|---|---|
| Covers | Cards, bKash, Nagad, Rocket, internet banking | bKash wallet only |
| Eligibility | Needs trade licence + business bank account; onboarding by SSLCommerz | Needs merchant account approved by bKash, trade licence, NID, bank account |
| Integration | Hosted payment page; server validates via Validation API + IPN | Server-to-server create/execute/query APIs |
| Sandbox | Free sandbox account | Sandbox credentials given after merchant application |

**Recommendation:** start with **SSLCommerz** (one integration covers most local methods, and the sandbox is easy to get). Add bKash later if clients prefer it.
Rules we will follow in Phase 6: server creates the session; server verifies with the provider's validation API; IPN authenticity is checked; unique `tran_id` per attempt; idempotent update; invoice is **never** marked paid from a browser redirect; no card data is stored.
Credentials you will need: SSLCommerz Store ID + Store Password (sandbox first), later live credentials after approval and end-to-end tests.

## 4. Folder structure
```
thumbstop/
  docs/                    architecture, checklists
  public/brand/            thumbstop-logo.png  <-- YOUR ORIGINAL LOGO (never edited)
  src/
    app/                   routes (App Router)
      (public pages)       page.tsx, about, services, portfolio, pricing,
                           testimonials, contact, login, register,
                           privacy-policy, terms
      admin/               [Phase 4] protected dashboard
      portal/              [Phase 4] client portal
      api/                 [Phase 5-6] enquiry, payment, webhooks
    components/            Header, Footer, Logo, WhatsAppButton, UI pieces
    lib/                   site-config, services data, whatsapp helper
    (later) lib/supabase/, lib/validation/, middleware.ts
  supabase/migrations/     [Phase 3] SQL files
```

## 5. Planned data model (Phase 3)
profiles(role) · clients · services · packages · projects · milestones · deliverables · enquiries · invoices · invoice_items · payments · notifications · activity_log.
All tables: UUID PK, timestamps, FKs, indexes; RLS: clients see only rows tied to their own `client_id`; admins/staff via role check function; service-role key only in server code.

## 6. Roadmap
1. Phase 1 — this document. ✅
2. Phase 2 — public website (logo, brand, 11 pages, WhatsApp link). ✅ in this delivery
3. Phase 3 — Supabase schema, auth, RLS.
4. Phase 4 — admin dashboard + client portal.
5. Phase 5 — enquiries API, projects, files, invoices.
6. Phase 6 — WhatsApp Cloud API (optional) + SSLCommerz sandbox.
7. Phase 7 — tests, security review, accessibility, deployment docs.

## 7. Design direction
Layout rhythm borrowed from the references: bold hero with two CTAs, clear section blocks with generous whitespace, trust/credibility strip, simple course-style cards (here: service cards), big closing CTA, dense but tidy footer, floating contact button. Colours and type come from the ThumbStop logo; nothing is copied from the reference sites.
