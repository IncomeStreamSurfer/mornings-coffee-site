# Mornings — coming-soon landing

A minimal coming-soon landing page for **Mornings**, a small-batch coffee brand.
Built with Astro (SSR on Vercel), Tailwind v4, Supabase for the waitlist, and
Resend for the welcome email.

## What was built

- Single-page hero with countdown timer to launch date
- Email waitlist form (`POST /api/waitlist`) that:
  - Validates the email
  - Inserts into the `waitlist` table in Supabase (idempotent on duplicate)
  - Sends a warm welcome email via Resend
- Warm cream + brown palette with grain texture, serif display type
- SEO: canonical tags, OpenGraph/Twitter tags, schema.org JSON-LD, sitemap, robots
- Harbor `content` table included in the schema (unused on the public site for now)

## Stack

- [Astro 6](https://astro.build/) (server output via `@astrojs/vercel`)
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [Supabase](https://supabase.com/) — `waitlist` and `content` tables, RLS enabled
- [Resend](https://resend.com/) — transactional welcome email (via REST)

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Name | Purpose |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `RESEND_API_KEY` | Resend API key for the welcome email |

## Local dev

```bash
npm install
npm run dev
```

## Customising

- **Launch date** — edit `LAUNCH_DATE_ISO` in `src/pages/index.astro`.
- **Palette** — edit the `@theme` block in `src/styles/global.css`.
- **From address** — once you verify your domain in Resend, change the `from`
  default in `src/lib/email.ts` (currently `onboarding@resend.dev`).

## Next steps (manual)

1. Point your real domain at Vercel.
2. Verify `mornings.coffee` (or your domain) in Resend and update the sender address.
3. Replace `LAUNCH_DATE_ISO` with your real launch timestamp.
4. Add a favicon / OG image to `public/` if you want branded previews.
