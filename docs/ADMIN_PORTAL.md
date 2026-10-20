# Owner / Admin Portal

Internal console for LAMHA staff at **`/admin`** on the production domain (https://lamhatechnologies.com/admin). It reads and writes the same PostgreSQL database that the public website forms write to, so nothing is duplicated or synchronised: a submission on the website is visible in the portal immediately.

`/admin` is excluded from `robots.txt`, every portal page carries `noindex`, and it is never linked from the public site.

## Roles

| Role | Can do |
| --- | --- |
| **Viewer** | Read dashboard, inquiries, applications, contact messages, customers. No downloads, no changes. |
| **Staff** | Viewer + add internal notes, reply to requesters by email, download CVs/attachments, view reports. |
| **Manager** | Staff + change statuses, assign owners, export CSV. |
| **Admin** | Manager + audit log, create/deactivate users and reset passwords for Manager/Staff/Viewer, edit website content, company links and team profiles. |
| **Owner** | Everything, including managing Admins and other Owners, email routing and integration status. There must always be one active Owner. |

Permissions are enforced on the server in every server action and route handler (`src/lib/server/rbac.ts`, `requirePermission()` in `src/lib/server/auth.ts`). The UI only hides controls as a convenience.

## Authentication

- Email + password. Passwords are hashed with Node's built-in **scrypt** (N=16384, r=8, p=1, 16-byte random salt). Policy: 12+ characters with upper, lower and a digit.
- Sessions are random 256-bit tokens stored **hashed (SHA-256)** in the `Session` table; the browser only holds the raw token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `/admin`. A session ends after **7 days** (absolute) or **12 hours without activity** (idle; `Session.lastSeenAt`, refreshed at most every 5 minutes). Expired and idle sessions are deleted when next presented.
- **Account → Active sessions** lists the signed-in user's own sessions (device, IP, last activity) with per-session sign-out and "Sign out other sessions". These actions only ever match the caller's own sessions.
- New and reset accounts receive a generated temporary password (shown once) and are forced to change it at first sign-in.
- Changing a password or deactivating a user revokes that user's other sessions; completing a password reset revokes all of them.
- Changing the sign-in email (Account page) requires the current password.
- Login is rate-limited per IP + email (10 attempts / 15 minutes); failed attempts are audited.
- Cross-site request forgery is mitigated by Next.js Server Actions' origin checks plus the `SameSite=Lax` cookie; the site CSP sets `form-action 'self'`.

## First-time setup (bootstrap the first Owner)

`POST /admin/api/setup` creates the first **Owner**. It requires `ADMIN_SETUP_TOKEN` (constant-time compare, 5 attempts per 15 minutes), refuses permanently once any account exists (HTTP 409), and returns a generated temporary password **once**; the password is never logged and must be changed at first sign-in. No default production credentials exist.

Follow this order, and do not remove recovery access before sign-in is proven:

1. Generate a token without printing it; keep it only in Vercel (Sensitive) and a password manager:
   ```bash
   node -e "process.stdout.write(require('crypto').randomBytes(24).toString('base64url'))" > setup-token.txt
   vercel env add ADMIN_SETUP_TOKEN production --sensitive < setup-token.txt
   ```
   Redeploy so the token is active.
2. Create the Owner. The response contains the temporary password; copy it straight into a password manager:
   ```bash
   curl -X POST https://lamhatechnologies.com/admin/api/setup \
     -H "content-type: application/json" \
     -d "{\"token\":\"$(cat setup-token.txt)\",\"email\":\"owner@example.com\",\"name\":\"Owner Name\"}"
   ```
3. Sign in at `/admin/login`, set a permanent password when prompted, then sign out and in again.
4. Confirm recovery works: use **Forgot password?** and check the link arrives (see *Email delivery* below), or test the break-glass CLI.
5. Create a **second Owner** from **Users**, so one lost password can never lock the company out.
6. Only then remove the token and redeploy: `vercel env rm ADMIN_SETUP_TOKEN production`, and delete `setup-token.txt`. The Integrations page warns Owners while the variable is still set.

Further users are created from **Users** inside the portal; no other setup route exists.

## Password recovery

**Self-service (`/admin/forgot` → email → `/admin/reset`).** The request page gives the same answer whether or not the address has an account; the lookup and email happen after the response, so timing does not reveal accounts either. Rate limits: 3 requests per address per 15 minutes, 10 per IP per hour, and 10 completion attempts per IP per 15 minutes. The token is 256 random bits and only its SHA-256 is stored (`PasswordResetToken`). It expires after **30 minutes**, works **once** (claimed atomically), only for an active account, and requesting a new link revokes older ones. Completing a reset sets the new password (same policy), clears any temporary-password flag and signs out every session. Links are built from `NEXT_PUBLIC_SITE_URL`, never from the request's Host header, and the reset page sends no Referer.

*Email delivery:* reset emails use the configured provider (Resend). While `EMAIL_FROM` is Resend's test sender (`onboarding@resend.dev`), Resend only delivers to the Resend account owner's address, so self-service reset works only for that address until the sender domain is verified in Resend.

**Break-glass (lost password and lost mailbox).** Someone holding the production database credentials can issue a one-time link; there is no web endpoint for this:

```bash
DATABASE_URL=... NEXT_PUBLIC_SITE_URL=https://lamhatechnologies.com npm run admin:recovery -- --list
DATABASE_URL=... NEXT_PUBLIC_SITE_URL=https://lamhatechnologies.com npm run admin:recovery -- --reset owner@example.com --confirm
```

It prints the link once (same 30-minute, single-use rules), never sets or prints a password, refuses deactivated accounts, never reads `.env` files (the database must be named explicitly), and writes an audit entry (`cli@admin-recovery`).

## Features

- **Dashboard** – live counts (new/7-day/30-day inquiries, applications, messages), pipeline breakdown, latest records, items assigned to you.
- **Inquiries** – search (name, email, company, project), filter by status/service/owner/date, paginated. Detail: all fields, private attachments (audited download), email replies, status, assignment, internal notes, activity.
- **Applications** – search/filter by status and role; detail with protected CV download, email replies, status, assignment, notes.
- **Contact messages** – search/filter, email replies, status, notes.
- **Email replies** (Staff+) – every inquiry, application and contact detail page has an "Email replies" card. Staff write a subject and message; the portal sends it through the configured email provider from `EMAIL_FROM`, signed with the staff member's name, and stores the outcome in the `Reply` table (SENT or FAILED with the provider's error). The recipient address always comes from the record, never from the form. The recipient's answer goes to `EMAIL_REPLY_TO` (fallback: first `EMAIL_TO` address, then the published company email). A first successful reply moves a NEW contact message to REPLIED and a NEW inquiry to CONTACTED (audited). Limit: 30 replies per user per hour. Requires `EMAIL_API_KEY`; until the sender domain is verified in Resend, delivery is restricted to the Resend account owner's address.
- **Customers & leads** – derived view: one row per unique email across inquiries and messages with counts, latest status, first/last activity, segments (open, won, contact-only). Nothing is stored or invented.
- **Reports** – period selector; inquiries by month/status/service/budget/industry/country, applications by role/stage, messages by topic, win rate, period-over-period delta; CSV exports (Manager+).
- **Audit log** – append-only: sign-ins (incl. failures), sign-outs, password changes, status changes, assignments, notes, downloads, exports, user administration. Filter by actor, action, record type.
- **Users** – invite, change role, deactivate/reactivate, reset password (scoped by role hierarchy).
- **Account** – change your name, sign-in email (requires the current password) and password; view and sign out active sessions.
- **Owner profile** (`/admin/profile`, every user) – private summary of your account. Admins and Owners also link their account to a public team profile and edit it there (photo, role, biography, personal LinkedIn and GitHub, featured projects), together with the company contact details and official company links.
- **Website content** (`/admin/content`, Admin+) – company information (tagline, descriptions, about text, mission, vision), contact details (business emails, phone, delivery note) and official company links (LinkedIn company page, GitHub, Facebook, Instagram, X).
- **Team profiles** (`/admin/content/team`, Admin+) – edit each leadership profile, upload a portrait, publish or hide it.
- **Integrations** (`/admin/settings`, Owner) – email routing overrides (notification recipients replace `EMAIL_TO`; reply-to replaces `EMAIL_REPLY_TO`) and integration status. Secrets appear only as "configured / not configured"; their values never reach the browser.

## Website content editing

Edits are stored in `SiteContent` (one row per section: `company`, `contact`, `social`, `team`, `integrations`) and overlay the code defaults in `src/data/`.

- Every save re-checks the permission on the server (`content:edit` and `team:edit` = Admin+, `integrations:manage` = Owner), validates with `src/lib/content/schema.ts`, and is audited (`content.updated`). Every **read** validates again: a malformed row is ignored and the site shows the defaults (the content page flags it).
- Concurrent edits are rejected rather than overwritten (row `version` check).
- URLs must be `https` on the expected host and are normalised (e.g. `https://github.com/<user>`, `https://www.linkedin.com/company/<name>/`). **GitHub links are verified against the public GitHub API before they are saved**: the account or repository must exist and be public, and if GitHub cannot be reached the save is refused (fail closed). Unchanged links are not re-checked.
- Portraits: JPEG, PNG or WebP up to 3 MB, detected from the file's bytes (SVG and everything else refused), stored privately under a server-generated key and served by `/media/<id>` after a `MediaAsset` lookup.
- A save revalidates every public page (`revalidatePath("/", "layout")`); pages rebuild on their next visit. The company name, legal name and site URL stay in code.
- The four detail routes (`/services`, `/solutions`, `/careers` and `/about/leadership/[slug]`) use `dynamicParams = true`, because Next 16 answers an expired `dynamicParams = false` page with 404 after site-wide revalidation. `src/proxy.ts` keeps unknown slugs at a real 404 status.

## Files & data

- Uploaded CVs/attachments stay private (Vercel Blob `access: "private"` in production, local disk in development). The portal streams them through `GET /admin/api/file?kind=cv|attachment&id=<record>` after an auth + permission check; storage keys are never accepted from the client.
- CSV exports neutralise spreadsheet formula injection (`= + - @` prefixes are quoted).
- No production data is ever seeded, deleted or rewritten by tooling. Status changes are the only mutation on website records; notes and audit entries are append-only.

## Database changes

Migration `20260928104724_owner_portal` (additive only): enums `Role`, `NoteEntity`; tables `User`, `Session`, `Note`, `AuditLog`; nullable `assignedToId` on `ProjectInquiry` and `JobApplication` (FK → `User`, `ON DELETE SET NULL`). Applied by `prisma migrate deploy` during the Vercel build (see `scripts/prebuild.mjs`). Rollback: revert the commit and redeploy; the new tables can be left in place or dropped manually.

Migration `20260929_portal_replies` (additive only): enum `ReplyStatus`; table `Reply` (outbound email replies, FK `authorId` → `User`, `ON DELETE SET NULL`).

Migration `20261019120000_owner_dashboard` (additive only): tables `PasswordResetToken`, `SiteContent`, `MediaAsset`; nullable `User.leaderSlug` and `Session.lastSeenAt`. Existing sessions have no `lastSeenAt`, so any session older than 12 hours ends once after this deploys (users sign in again).

## Optional: `admin.lamhatechnologies.com`

Not configured. If wanted later: add the subdomain to the Vercel project, then add a `next.config.ts` rewrite/redirect from the subdomain root to `/admin` (or a middleware host check). Until then the portal lives at `/admin` on the main domain.

## Local development

```bash
# .env.local
DATABASE_URL=postgresql://lamha:lamha_dev_pw@localhost:5434/lamha?schema=public
DIRECT_URL=postgresql://lamha:lamha_dev_pw@localhost:5434/lamha?schema=public
ADMIN_SETUP_TOKEN=local-setup-token
```

`npm run db:migrate:dev` → `npm run dev` → POST `/admin/api/setup` as above → `/admin/login`.
