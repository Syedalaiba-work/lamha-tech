# LAMHA Website — Production Deployment Runbook

## Current production state (2026-09-28)

| Item | Value |
| --- | --- |
| Production URL | **https://lamhatechnologies.com** (bought 2026-09-28 via Vercel registrar, Vercel nameservers, auto-renew $11.25/yr). `www.lamhatechnologies.com` and `lamha-tech.vercel.app` 308-redirect to it. |
| Vercel project | `lamha-tech` in team `syedalaibawork-8834` (Hobby) |
| Source | https://github.com/ahmedmajid640-create/lamha-tech (branch `main`) |
| Deploy method | `vercel deploy --prod` from the repo (CLI). Connecting the GitHub repo in the Vercel dashboard enables automatic deploys on push. |
| Blob storage | `lamha-uploads` (store_nnjDkArwWH6hmHMl), private, linked; `BLOB_READ_WRITE_TOKEN` set for all environments |
| Database | Neon PostgreSQL `neon-blue-sail` via Vercel Marketplace, connected to the project; `DATABASE_URL` (pooled) injected, `DIRECT_URL` set to the unpooled URL in all environments; migration `20260927202909_init` applied by the production build |
| Email | `EMAIL_TO=syedalaibawork@gmail.com` and interim `EMAIL_FROM=LAMHA Website <onboarding@resend.dev>` are set. **`EMAIL_API_KEY` must be added by the account owner** in Vercel → Settings → Environment Variables (Production), then redeploy. Until the domain is verified in Resend, `onboarding@resend.dev` can only deliver to the Resend account owner's own address. After verification, set `EMAIL_FROM` to an `@lamhatechnologies.com` address. Failures are visible in the portal (dashboard banner + audit action `notification.failed`); records are never lost. |
| Local note | Outbound port 5432 is blocked on the dev machine; use the Neon HTTP driver or the Vercel build for migrations |
| `NEXT_PUBLIC_SITE_URL` | `https://lamhatechnologies.com` (Production + Preview) |
| `.vercelignore` | excludes `.env*`, `.data`, `node_modules`, `.next`, doc binaries |

Target platform: **Vercel** (Next.js 16). Database: **PostgreSQL** (any provider; Neon via the Vercel
Marketplace is the fastest). Uploads: **Vercel Blob (private)**. Email: **Resend**.

The application degrades safely: without `DATABASE_URL` it stores submissions in local JSON files,
without `BLOB_READ_WRITE_TOKEN` it stores uploads on local disk, without `EMAIL_API_KEY` it logs
instead of emailing. On Vercel those fallbacks are **ephemeral** (`/tmp`), so all three must be
configured for a real production site. `GET /api/health` reports which backends are active.

---

## 0. One-time accounts (≈10 minutes)

| Need | Where | Output |
| --- | --- | --- |
| Vercel account + CLI login | `vercel login` → open the printed URL, enter the code | CLI authenticated |
| PostgreSQL | Vercel Dashboard → Storage → **Create Database → Neon** (or Supabase / any Postgres) | `DATABASE_URL` (pooled) + `DIRECT_URL` (direct) |
| Blob store | Vercel Dashboard → Storage → **Create → Blob**, connect to the project | `BLOB_READ_WRITE_TOKEN` (auto-added) |
| Resend | resend.com → API Keys → Create | `EMAIL_API_KEY` |
| Resend sender domain | resend.com → Domains → add `lamhatech.com` (or the real domain) → add the DNS records shown | verified `EMAIL_FROM` |

Until the sender domain is verified, Resend only delivers from `onboarding@resend.dev` **to the
email address that owns the Resend account**. Set `EMAIL_TO` to that address for the first test.

## 1. Link the project

```bash
cd WEBSITE
vercel login
vercel link          # "Set up and deploy?" → yes, scope → your team, create new project "lamha-website"
```

## 2. Environment variables (Production)

Set in Vercel Dashboard → Project → Settings → Environment Variables, or via CLI:

```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add EMAIL_API_KEY production
vercel env add EMAIL_FROM production          # e.g. "LAMHA Website <notifications@lamhatech.com>"
vercel env add EMAIL_TO production            # comma-separated internal recipients
vercel env add EMAIL_REPLY_TO production      # optional: inbox that receives answers to portal replies (default: first EMAIL_TO)
vercel env add NEXT_PUBLIC_SITE_URL production   # e.g. https://lamha-website.vercel.app (or the custom domain)
vercel env add ADMIN_SETUP_TOKEN production      # one-time: bootstrap the first portal Owner, then remove (docs/ADMIN_PORTAL.md)
```

`BLOB_READ_WRITE_TOKEN` is added automatically when the Blob store is connected to the project.
If the database was created through the Vercel Marketplace, `DATABASE_URL` / `DIRECT_URL` (or
`POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`) are added automatically; map them to the two
names above if the provider used different names.

## 3. Deploy

```bash
vercel --prod
```

The build runs `scripts/prebuild.mjs` → `prisma generate` → `prisma migrate deploy` (applies
`prisma/migrations/*` to the production database) → `next build`.

## 4. Verify

```bash
curl https://<domain>/api/health
# expect: {"ok":true,"persistence":"postgres","database":"ok","storage":"vercel-blob","email":"configured"}
```

Then submit one inquiry at `/start-a-project` with a small PDF, one message at `/contact`, and
one application at `/careers/qa-engineer`. Each returns a reference id; the same id is the
primary key in `ProjectInquiry` / `ContactMessage` / `JobApplication`, and the notification email
subject starts with "New project inquiry" / "New contact message" / "New job application".

Optional: `npm run db:seed` locally with the production `DATABASE_URL` to populate the `Job` table
(the applications route also upserts the job on first application, so this is not required).

## 5. Custom domain (after purchase)

Nothing in the app hard-codes the vercel.app hostname: canonicals, sitemap, robots, Open Graph and
JSON-LD all derive from `NEXT_PUBLIC_SITE_URL`. Flow: **domain → DNS → Vercel → LAMHA site**.

1. Buy the domain at any registrar (not done; no domain has been purchased yet).
2. `vercel domains add <domain>` (or Dashboard → Project → Settings → Domains → Add). Vercel then prints the
   exact DNS records it needs; typical values are an `A` record for the apex pointing at Vercel and a `CNAME`
   for `www`, but use the records Vercel reports, not these examples.
3. Add those records at the registrar; Vercel verifies and issues TLS automatically.
4. `vercel env rm NEXT_PUBLIC_SITE_URL production && vercel env add NEXT_PUBLIC_SITE_URL production`
   with `https://<domain>`, then `vercel deploy --prod` so canonical/OG URLs switch to the new domain.
5. In Resend, verify the same domain and change `EMAIL_FROM` to an address on it.

## Rollback

Vercel Dashboard → Deployments → previous deployment → **Promote to Production**. Database
migrations are additive (no destructive migration exists yet), so rolling back the app is safe.

## Local development against Postgres

```bash
docker run -d --name lamha-postgres -e POSTGRES_USER=lamha -e POSTGRES_PASSWORD=lamha_dev_pw -e POSTGRES_DB=lamha -p 5434:5432 postgres:16-alpine
# .env: DATABASE_URL / DIRECT_URL = postgresql://lamha:lamha_dev_pw@localhost:5434/lamha?schema=public
npm run db:migrate:dev && npm run db:seed && npm run dev
```

---

## Release: owner dashboard (2026-10-19)

Adds website-content editing, team profiles with portrait upload, password recovery, session management and an Owner integrations page (details: `docs/ADMIN_PORTAL.md`).

**Requirements before deploying**

| Item | Action |
| --- | --- |
| Database migration | `20261019120000_owner_dashboard` is additive (3 new tables, 2 nullable columns) and is applied automatically by `prisma migrate deploy` in the Vercel build. Take a portal backup first (Backups → Run backup now). |
| New environment variables | None required. `NEXT_PUBLIC_SITE_URL` must be the public origin (reset links are built from it). |
| Server action body limit | `next.config.ts` raises `experimental.serverActions.bodySizeLimit` to 4 MB for portrait uploads (3 MB cap enforced in code). |
| Reset emails | Sent through Resend. Until the sender domain is verified in Resend and `EMAIL_FROM` uses it, Resend delivers only to the Resend account owner's address, so self-service reset reaches only that inbox. The break-glass CLI (`npm run admin:recovery`) works regardless. |
| First Owner | If no portal account exists yet, follow *First-time setup* in `docs/ADMIN_PORTAL.md` in order; remove `ADMIN_SETUP_TOKEN` only after sign-in and recovery are confirmed and a second Owner exists. |
| Secrets hygiene (recommended) | Re-create `BACKUP_ENCRYPTION_KEY`, `DATABASE_URL`, `DIRECT_URL`, `POSTGRES_PASSWORD`, `PGPASSWORD` and `BLOB_READ_WRITE_TOKEN` as **Sensitive** variables (`vercel env add NAME production --sensitive`) so they cannot be read back from the dashboard or `vercel env pull`. Keep an offline copy of `BACKUP_ENCRYPTION_KEY`. |

**Behaviour changes to expect**

- Sessions now also end after 12 hours without activity; existing sessions older than that end once after the deploy.
- `/services/*`, `/solutions/*`, `/careers/*` and `/about/leadership/*` now use `dynamicParams = true`; `src/proxy.ts` returns 404 for unknown slugs before rendering.
- The company GitHub link is empty until an Owner/Admin saves it in the portal; GitHub must confirm the account exists before it is published.

**After deploying**

1. `GET /api/health` → `database: ok`.
2. Sign in, open Website content, save one section, and confirm the change on the public page and that `/services/software-development` and `/about/leadership/syeda-laiba-haider` still return 200.
3. Visit a made-up URL such as `/services/does-not-exist` and confirm status 404.
