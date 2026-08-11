# 8. Third-Party Services & Cost Analysis

> **Pricing caveat:** figures below are **indicative planning ranges**, not quotes. Vendor pricing, free-tier limits, and region-specific rates change frequently — verify each vendor's current pricing page before committing. The durable value here is the *service catalog and the cost model*, not point-in-time numbers.

## 8.1 Service catalog

| Service | Purpose | Free tier (indicative) | Paid (indicative) | When to upgrade |
|---------|---------|------------------------|-------------------|-----------------|
| Vercel | Storefront hosting | Hobby (non-commercial) | Pro ~$20/mo/seat + usage | Commercial use, team, more bandwidth |
| Railway / Render | Medusa backend hosting | Trial credits | ~$25–$50/mo | Always-on production |
| Managed Postgres (RDS/Neon) | Primary DB | Neon free tier | ~$15–$30/mo | Production data + backups |
| Upstash Redis | Cache/sessions/queue | Small free tier | ~$10–$20/mo | Sessions + cart + reservations |
| Cloudinary | Image/video/3D optimize | Free credits | ~$25/mo+ | Asset volume + transforms |
| S3 / Cloudflare R2 | File storage | R2 has a free tier; S3 pay-as-you-go | ~$5–$15/mo | 3D models + backups (R2 = no egress fees) |
| Meilisearch (self-host) / Algolia | Search | Meilisearch self-host = infra cost only | Algolia paid tiers | Catalog grows / want managed |
| Razorpay | India payments | — | ~2% per txn (varies by method) | India market (required) |
| Stripe | International payments | — | ~2.9% + fixed fee (varies) | International expansion |
| Resend / SendGrid | Transactional email | Free monthly allotment | ~$20/mo+ | Volume beyond free tier |
| Twilio / MSG91 | SMS / OTP | Trial credits | Pay-as-you-go | OTP + status SMS |
| Sentry | Error tracking | Free error allotment | ~$26/mo+ | Production monitoring |
| Cloudflare | CDN + security | Generous free tier | Pro ~$20/mo | Advanced rules/WAF |
| GA4 / Mixpanel | Analytics | Free tiers | Usage-based | Deeper funnel analysis |

## 8.2 Cost model — MVP stage

At MVP (low volume), most services sit in free/entry tiers. Indicative fixed monthly floor: **roughly $80–$150/mo** for hosting + DB + Redis + Cloudinary + error tracking, plus **transaction fees** (~2% India / ~2.9% international) which scale with revenue, not a fixed cost. Email/SMS stay near-free within allotments.

## 8.3 Cost model — scale stage (~10K orders/mo)

At scale the drivers shift from fixed hosting to (a) payment processing fees (dominant, revenue-linked), (b) asset delivery (3D model + image bandwidth), and (c) search/DB tier bumps. Indicative fixed infra: **roughly $250–$500/mo** before payment fees, sensitive to 3D asset traffic and search choice (self-hosted Meilisearch vs managed Algolia).

## 8.4 Cost-optimization strategies

- **Cloudflare R2 instead of S3** for 3D models/images — zero egress fees materially cut bandwidth cost as 3D traffic grows.
- **Self-host Meilisearch** on the backend host instead of managed Algolia until catalog/query volume justifies managed search.
- **Cloudinary `f_auto,q_auto`** + Next `<Image>` to minimize image bytes; aggressive long-cache on immutable hashed assets and 3D models.
- **Draco + KTX2 + LOD** shrink 3D payloads (both bandwidth and mobile performance) — the single biggest lever for asset cost.
- **ISR + edge caching** reduce backend load, deferring the need for larger Medusa/DB tiers.
- Keep preview generation asynchronous/batched to avoid over-provisioning render capacity.
