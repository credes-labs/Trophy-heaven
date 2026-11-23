# Deployment Guide

Storefront on **Vercel**. Backend, database, Redis and search on **Render** (Singapore).
Customer files on **Cloudflare R2**. Follow the steps in order; the first deploy takes
about an hour, most of it waiting for builds and DNS.

## Why this hosting

| Piece | Host | Reason |
|-------|------|--------|
| Next.js storefront | Vercel `sin1` | Native Next.js host with ISR and image optimisation |
| Medusa API + admin | Render web, Docker, 2 GB | Long-running Node process with background jobs, which serverless cannot run. Medusa recommends at least 2 GB |
| Postgres 16 | Render, private network | Same region as the API, with managed backups |
| Redis | Render Key Value, `noeviction` | Event and workflow queues must never lose keys |
| Meilisearch | Render private service + disk | Not reachable from the internet, and the index survives deploys |
| Uploads | Cloudflare R2 | Render's disk is wiped on deploy. R2 has no egress fees |

Render has no India region, so Singapore is the closest. Vercel functions run in the same
city, which keeps storefront-to-API calls short.

### Expected monthly cost

| Item | Plan | Approx. USD |
|------|------|-------------|
| Medusa web | `1c-2g` | 25 |
| Meilisearch | `0.5c-512mb` + 2 GB disk | 7.50 |
| Key Value | `256mb` | 10 |
| Postgres | `basic-1gb` + 10 GB storage | about 20–25 |
| Vercel | Pro (Hobby is non-commercial only) | 20 per seat |
| R2 | Free tier covers 10 GB | 0 to start |

Total is roughly **$85–90 a month**. The Postgres figure is an estimate, so confirm it on
Render's pricing page when the Blueprint shows its summary.

## Client test site

The steps below deploy a **test site**: everything works except real payment.

- `ALLOW_TEST_PAYMENTS=true`: orders are placed with no money taken.
- `OTP_TEST_MODE=true`: the login page shows the sign-in code, so no email or SMS setup is
  needed. Anyone could enter any account this way, so testers must use dummy details.
- Customer designs and documents appear on each order in the admin, under **Customer files**.
- Email is optional. To get owner order emails without a domain, create a Resend account, set
  `RESEND_FROM` to `Trophy Heaven <onboarding@resend.dev>` and `ORDER_NOTIFY_EMAIL` to the
  address you signed up to Resend with. Resend's test sender only delivers to that address.

**Before real customers:** clear both flags, verify a Resend domain, and follow
"Turn on payments". Test mode also switches itself off if live Razorpay keys are added.

## Short preview without R2

For a brief client preview, Railway can hold uploads on a volume instead of R2. Use branch
`client-preview`, set `ALLOW_LOCAL_FILE_STORAGE=true` on Medusa, leave every `S3_*` and CDN
variable unset, and mount a volume at `/app/apps/medusa/.medusa/server/static`. Files are then
served from `https://<medusa-domain>/static/`. Do not use this for launch.

## What you need first

- GitHub access to `credes-labs/Trophy-heaven`, for both Render and Vercel.
- A Cloudflare account, a Render account, a Vercel account.
- The storefront URL, which can be a `*.vercel.app` address.

## Step 1: Cloudflare R2

1. R2 → **Create bucket**, name `trophy-heaven-uploads`.
2. Bucket → Settings → **Public access**: connect a custom domain such as
   `files.yourdomain.com`, or enable the `r2.dev` URL for testing.
3. R2 → **Manage API tokens** → create a token with *Object Read & Write* on this bucket.
4. Keep these for Step 2:

| Render variable | Value |
|-----------------|-------|
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_BUCKET` | `trophy-heaven-uploads` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | From the token |
| `CDN_BASE_URL` | The public bucket URL, no trailing slash |

Anyone holding a file's link can open it, because the owner's order email uses these links.

## Step 2: Render Blueprint

1. Render → **New → Blueprint** → pick the repo, branch `main`. It reads `render.yaml`.
2. Fill in the prompted values:

| Variable | Value |
|----------|-------|
| `STORE_CORS` | Storefront origin, e.g. `https://trophy-heaven.vercel.app` |
| `S3_*`, `CDN_BASE_URL` | From Step 1 |
| `ALLOW_TEST_PAYMENTS` | `true` |
| `OTP_TEST_MODE` | `true` |
| `RESEND_*`, `ORDER_NOTIFY_EMAIL` | Blank, or see "Client test site" |
| `MSG91_*`, `RAZORPAY_*` | Blank |

3. **Apply** and wait for `trophy-heaven-medusa` to go live. Migrations run automatically
   before each deploy.
4. Open the `trophy-heaven-medusa` **Shell** tab and run:

```bash
cd /app/apps/medusa/.medusa/server
medusa exec ./src/scripts/bootstrap.js
medusa user -e owner@yourdomain.com -p 'choose-a-strong-password'
```

5. From the bootstrap output, copy `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_…`.
6. From the service's Environment tab, copy `STOREFRONT_SERVER_KEY`.
7. Check `https://<medusa>.onrender.com/health` returns `OK`, and sign in to the admin at
   `https://<medusa>.onrender.com/app`.

Bootstrap is safe to re-run.

## Step 3: Vercel

1. **Add New → Project** → import the repo.
2. Set **Root Directory** to `apps/storefront`. Keep "include files outside the root
   directory" on. Install and build commands come from `vercel.json`.
3. Add environment variables for Production:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://<medusa>.onrender.com` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | From Step 2 |
| `NEXT_PUBLIC_BASE_URL` | Storefront URL |
| `NEXT_PUBLIC_DEFAULT_REGION` | `in` |
| `NEXT_PUBLIC_CDN_BASE_URL` | Same as `CDN_BASE_URL` |
| `STOREFRONT_SERVER_KEY` | Same value as Render |
| `NEXT_PUBLIC_RAZORPAY_ENABLED` | `false` until payments are on |

4. **Deploy.** `NEXT_PUBLIC_*` values are built in, so changing one needs a redeploy.
5. If the final URL differs from `STORE_CORS`, update it on Render. List several origins
   with commas and no spaces.

## Step 4: Check the live site

- [ ] Home, `/shop` and a product page show products and images.
- [ ] Search finds "crystal", and also the typo "crystl".
- [ ] The login page shows a test code, and it signs you in.
- [ ] Add 2 trophies, upload 3 images: the third is refused.
- [ ] Upload 2 images and a PDF: the mapping dialog opens for the images only.
- [ ] Place a test order: it appears in your account and in the admin.
- [ ] The admin order page lists the uploaded files under **Customer files**.
- [ ] A contact form submission shows its confirmation.

## Turn on payments

Do this before real customers. Start with `rzp_test_` keys, then repeat with live keys.

1. Razorpay → Webhooks → add `https://<medusa>.onrender.com/webhooks/razorpay` with events
   `payment.captured` and `payment.failed`, and choose a secret.
2. Render: set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and
   **clear `ALLOW_TEST_PAYMENTS` and `OTP_TEST_MODE`**. Wait for the redeploy.
3. Render Shell:

```bash
cd /app/apps/medusa/.medusa/server
medusa exec ./src/scripts/enable-razorpay.js
```

4. Vercel: set `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (the storefront verifies
   the payment signature) and `NEXT_PUBLIC_RAZORPAY_ENABLED=true`, then redeploy.
5. Pay for one test order and confirm it is marked paid in the admin.

With no Razorpay keys and no `ALLOW_TEST_PAYMENTS`, the backend refuses to complete orders,
so the shop cannot take unpaid orders by accident.

## Custom domain

1. Vercel → Domains: add the storefront domain.
2. Update `NEXT_PUBLIC_BASE_URL` on Vercel and redeploy.
3. Update `STORE_CORS` on Render.
4. Optional API domain such as `api.yourdomain.com`: add it on Render, set
   `MEDUSA_BACKEND_URL` to it, and update `NEXT_PUBLIC_MEDUSA_BACKEND_URL` on Vercel.

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| Backend exits with "S3_ENDPOINT … is required" | R2 values missing |
| Migration hangs or fails on SSL | `DATABASE_SSL` must be `false` |
| Browser shows CORS errors | `STORE_CORS` must match the origin exactly, with no trailing slash |
| Product pages 404 under load | `STOREFRONT_SERVER_KEY` differs between Render and Vercel |
| No code on the login page | `OTP_TEST_MODE` is not `true`, or live Razorpay keys are set |
| Admin login returns to the login page | Open the admin on its `https://` URL |
| "Online payment is not available yet" at order | Add Razorpay or set `ALLOW_TEST_PAYMENTS=true` |
| Search is empty | Re-run bootstrap, or `POST /admin/search/reindex` |
| Uploaded images do not display | `NEXT_PUBLIC_CDN_BASE_URL` missing on Vercel |

## Operations

- Liveness: `GET /health`. Logs are in each Render service and in Vercel.
- Errors reach Sentry when `SENTRY_DSN` is set. Analytics load when their keys are set.
- Rate limits are in memory per instance, so keep Medusa at **one instance** until they
  move to Redis. To add capacity, first split out a worker (see the end of `render.yaml`).
- Pushes to `main` redeploy both Vercel and Render.

## Sources

- Render Blueprint spec: https://render.com/docs/blueprint-spec
- Render regions: https://render.com/docs/regions
- Render pricing: https://render.com/pricing
- Medusa deployment: https://docs.medusajs.com/learn/deployment/general
- Vercel monorepos: https://vercel.com/docs/monorepos
