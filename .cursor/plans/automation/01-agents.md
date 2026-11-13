# Multi-Agent Automation Setup

---

## Automation File

**Path:** `.cursor/automations/build-trophy-heaven.md`

This automation is the single entry point. When triggered, it reads the plan and orchestrates the full build using parallel subagents.

---

## Agent Roles & Responsibilities

### Agent 1: Design System Builder
- **Model:** inherit (Claude Opus)
- **Scope:** `apps/storefront/src/app/globals.css`, `src/components/ui/*`, `src/lib/animations.ts`, `src/lib/utils.ts`
- **Tasks:**
  1. Rewrite globals.css with complete token system
  2. Build all 25 UI primitives
  3. Set up animation presets
  4. Create responsive utilities
  5. Verify with typecheck

### Agent 2: Page Builder (Landing + Shop)
- **Model:** inherit (Claude Opus)
- **Depends on:** Agent 1 (design system must exist)
- **Scope:** `src/app/page.tsx`, `src/app/(shop)/shop/`, `src/components/sections/`, `src/components/layout/`
- **Tasks:**
  1. Rewrite landing page with all 10 sections
  2. Build shop page with filter system
  3. Create reusable section components
  4. Implement mega-menu header
  5. Redesign footer

### Agent 3: Category & Product Pages
- **Model:** inherit (Claude Opus)
- **Depends on:** Agent 1
- **Scope:** `src/app/(shop)/trophies/`, `furniture/`, `artwork/`, `products/[handle]/`
- **Tasks:**
  1. Category page template + 3 instances
  2. PDP redesign with gallery, variants, tabs
  3. Related products carousel

### Agent 4: Cart & Checkout
- **Model:** inherit (Claude Opus)
- **Depends on:** Agent 1
- **Scope:** `src/app/(shop)/cart/`, `checkout/`, `src/lib/data/checkout.ts`
- **Tasks:**
  1. Cart page redesign
  2. 4-step checkout wizard
  3. Razorpay Checkout.js integration (frontend)
  4. Order confirmation page

### Agent 5: Account Pages
- **Model:** inherit (Claude Opus)
- **Depends on:** Agent 1
- **Scope:** `src/app/(account)/`
- **Tasks:**
  1. Account layout with sidebar
  2. Dashboard, orders, addresses pages
  3. Wishlist, coupons, designs pages
  4. Settings page
  5. Auth pages redesign (login/register)

### Agent 6: Blog & Content
- **Model:** inherit (Claude Opus)
- **Depends on:** Agent 1 + Agent 8 (backend blog module)
- **Scope:** `src/app/(shop)/blog/`, `about/`, `faq/`, `contact/`
- **Tasks:**
  1. Blog listing + article pages
  2. About page
  3. FAQ, Contact, Shipping/Returns, Terms, Privacy
  4. Newsletter component

### Agent 7: Image Generator
- **Model:** Gemini (for image generation)
- **Scope:** `public/images/`
- **Tasks:**
  1. Generate product images (8 trophies, 8 furniture, 8 artwork)
  2. Generate hero/lifestyle images (3)
  3. Generate blog cover images (6)
  4. Generate category hero images (3)
  5. Generate brand value icons
  6. All in the moody/premium PDF style

### Agent 8: Backend Extensions
- **Model:** inherit (Claude Opus)
- **Scope:** `apps/medusa/src/modules/blog/`, `wishlist/`, `reviews/`, `src/api/webhooks/`
- **Tasks:**
  1. Blog module (model, service, migrations)
  2. Wishlist module (model, service, migrations)
  3. Reviews module (model, service, migrations)
  4. All API routes (store + admin)
  5. Razorpay webhook route
  6. Run migrations
  7. Seed blog content + sample reviews

### Agent 9: Animation & Polish
- **Model:** inherit (Claude Opus)
- **Depends on:** Agents 2–6 (all pages built)
- **Scope:** All page files + `src/lib/animations.ts`
- **Tasks:**
  1. Add scroll-triggered reveal animations to all sections
  2. Page transitions (AnimatePresence)
  3. Product card hover effects
  4. Loading skeletons for all data surfaces
  5. Micro-interactions (buttons, toggles, counters)
  6. Parallax effects on hero sections
  7. Mobile-specific animations (swipe, spring)

### Agent 10: QA & Testing
- **Model:** inherit (Claude Opus)
- **Depends on:** All other agents
- **Scope:** `e2e/`, `src/**/*.test.ts`, Lighthouse
- **Tasks:**
  1. Playwright E2E: browse → cart → checkout flow
  2. Playwright E2E: account login → order history
  3. Playwright E2E: blog listing → article
  4. Mobile viewport screenshots (375px, 768px)
  5. Lighthouse CI audit (target 90+ all categories)
  6. Typecheck + lint pass
  7. Fix any issues found

---

## Execution Phases

### Phase A: Foundation (Sequential)
```
Agent 1 (Design System) → verify typecheck passes
```

### Phase B: Pages (Parallel, depends on Phase A)
```
Agent 2 (Landing + Shop) ─┐
Agent 3 (Category + PDP)  ├── All run in parallel
Agent 4 (Cart + Checkout) ┤
Agent 5 (Account)         ┤
Agent 7 (Images)          ┤
Agent 8 (Backend)         ┘
```

### Phase C: Content (Depends on B)
```
Agent 6 (Blog + Content) — needs backend blog module from Agent 8
```

### Phase D: Polish (Depends on B + C)
```
Agent 9 (Animations) — touches all page files
```

### Phase E: QA (Depends on D)
```
Agent 10 (Testing + Fixes)
```

---

## Verification Between Phases

After each phase, the orchestrator runs:
```bash
cd apps/storefront && pnpm typecheck && pnpm lint
cd apps/medusa && pnpm typecheck
curl -sf http://localhost:3000 | head -1  # storefront up
curl -sf http://localhost:9000/health     # medusa up
```

If any check fails, the responsible agent is re-invoked with the error output.

---

## Commit Strategy

| Phase | Commit Message |
|-------|---------------|
| A | `feat: design system — tokens, 25 UI primitives, animation presets` |
| B | `feat: core pages — landing, shop, categories, PDP, cart, checkout, account` |
| B | `feat: backend — blog, wishlist, reviews modules + Razorpay webhook` |
| C | `feat: content — blog pages, about, FAQ, contact, static pages` |
| D | `feat: animations — scroll reveals, page transitions, micro-interactions` |
| E | `test: E2E tests, Lighthouse audit, mobile QA` |
