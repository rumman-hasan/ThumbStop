# ThumbStop Website and Admin

Next.js + TypeScript + Tailwind, with Supabase for login, database and files.

**First time? Follow `docs/SETUP-BANGLA.md`** (Supabase project, `.env.local`, first admin account).

## Run on Windows (VS Code)
1. Open the `thumbstop` folder in VS Code (File → Open Folder).
2. Complete `docs/SETUP-BANGLA.md` once (steps 1 to 4 and 6).
3. In the VS Code terminal (`Ctrl + ~`):
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000. The admin panel is at http://localhost:3000/admin.

Other commands: `npm run typecheck`, `npm run build`. Restart `npm run dev` after changing `.env.local`.

## Where to edit things
- Contact details, social links, services, packages, portfolio, reviews: **Admin panel** (no code needed).
- Fallback contact details used before the database is connected: `src/lib/site-config.ts`.
- Brand colours: `tailwind.config.ts`. Logo: `public/brand/thumbstop-logo.png` (used unmodified).

## Status
Nothing below has been run or built by the developer assistant yet: the sandbox it worked in could not download npm packages. The code was syntax-checked and its local imports were verified, but the first `npm run build` on your PC is the real test. Send any error message back for a fix.

| Area | Status |
|---|---|
| Public website (11 pages), WhatsApp button, SEO, sitemap | Written |
| Enquiry form saved to database, spam trap, rate limit | Written (needs Supabase keys) |
| Login, register, forgot/reset password (Supabase Auth) | Written (needs Supabase keys) |
| Admin: overview, enquiries, clients, projects, invoices, manual payments | Written |
| Admin: reports, services and packages, portfolio and reviews, users and roles, website settings | Written |
| Database schema, security rules (RLS), storage buckets | Written in `supabase/migrations` |
| Client portal (`/portal`) | **Not built** |
| Online payment (SSLCommerz) | **Not built** (manual payment recording only) |
| WhatsApp Cloud API alerts | Code present, needs Meta credentials |
| Email sending | Not configured |

First admin is created with one SQL line (see the setup guide); no one can make themselves admin from the website.
