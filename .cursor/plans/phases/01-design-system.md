# Phase 1: Design System Foundation

## Objective
Establish the complete visual foundation: color tokens, typography scale, spacing system, all UI primitives, animation presets, and responsive grid — so every subsequent page can be built consistently.

---

## 1.1 Color Token Architecture

### File: `apps/storefront/src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* ── Brand Category Colors ─────────────────────────────── */
  --color-brand-trophy: oklch(0.45 0.15 25);        /* Burgundy red */
  --color-brand-trophy-light: oklch(0.65 0.12 25);  /* Lighter variant */
  --color-brand-trophy-dark: oklch(0.32 0.15 25);   /* Darker variant */
  
  --color-brand-furniture: oklch(0.25 0.04 250);     /* Midnight blue */
  --color-brand-furniture-light: oklch(0.4 0.04 250);
  --color-brand-furniture-dark: oklch(0.15 0.04 250);
  
  --color-brand-artwork: oklch(0.38 0.08 90);        /* Olive/Brass */
  --color-brand-artwork-light: oklch(0.55 0.07 90);
  --color-brand-artwork-dark: oklch(0.28 0.08 90);

  /* ── Neutral Palette ───────────────────────────────────── */
  --color-background: oklch(0.985 0.005 85);         /* #FBFBF7 champagne */
  --color-foreground: oklch(0.2 0.05 50);            /* #331207 walnut */
  --color-card: oklch(0.97 0.01 85);                 /* #F5F1E8 cream card */
  --color-card-foreground: oklch(0.25 0.04 50);
  --color-muted: oklch(0.93 0.015 85);               /* Subtle bg */
  --color-muted-foreground: oklch(0.5 0.03 70);      /* #867A67 stone */
  --color-border: oklch(0.88 0.015 80);
  --color-ring: oklch(0.72 0.13 75);                 /* Gold focus ring */

  /* ── Semantic Colors ───────────────────────────────────── */
  --color-primary: oklch(0.72 0.13 75);              /* Heritage gold */
  --color-primary-foreground: oklch(0.2 0.04 50);
  --color-accent: oklch(0.45 0.15 25);               /* Matches trophy red */
  --color-accent-foreground: oklch(0.97 0.005 85);
  --color-success: oklch(0.7 0.14 150);
  --color-warning: oklch(0.78 0.14 80);
  --color-destructive: oklch(0.55 0.2 25);

  /* ── Typography ────────────────────────────────────────── */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Playfair Display", "Fraunces", ui-serif, Georgia, serif;
  --font-display: "Playfair Display", ui-serif, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* ── Fluid Type Scale (clamp-based) ────────────────────── */
  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
  --text-2xl: clamp(1.4rem, 1.1rem + 1.5vw, 1.5rem);
  --text-3xl: clamp(1.7rem, 1.3rem + 2vw, 1.875rem);
  --text-4xl: clamp(2rem, 1.5rem + 2.5vw, 2.25rem);
  --text-5xl: clamp(2.5rem, 1.8rem + 3.5vw, 3rem);
  --text-6xl: clamp(3rem, 2rem + 5vw, 3.75rem);
  --text-hero: clamp(3.5rem, 2rem + 7vw, 6rem);

  /* ── Spacing ───────────────────────────────────────────── */
  --spacing-section: clamp(4rem, 3rem + 5vw, 8rem);
  --spacing-subsection: clamp(2rem, 1.5rem + 2.5vw, 4rem);

  /* ── Radius ────────────────────────────────────────────── */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ── Shadows ───────────────────────────────────────────── */
  --shadow-sm: 0 1px 2px oklch(0.2 0.02 50 / 0.05);
  --shadow-md: 0 4px 12px oklch(0.2 0.02 50 / 0.08);
  --shadow-lg: 0 8px 30px oklch(0.2 0.02 50 / 0.12);
  --shadow-xl: 0 20px 60px oklch(0.2 0.02 50 / 0.15);
  --shadow-card: 0 2px 8px oklch(0.2 0.02 50 / 0.04), 0 0 1px oklch(0.2 0.02 50 / 0.06);
  --shadow-card-hover: 0 8px 30px oklch(0.2 0.02 50 / 0.1), 0 0 1px oklch(0.2 0.02 50 / 0.08);

  /* ── Transitions ───────────────────────────────────────── */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-enter: 400ms;
  --duration-exit: 200ms;
}
```

### Dark Mode (Future — tokens structured for it)
The OKLCH system allows easy dark mode by adjusting lightness channels. Reserve `--color-*` prefix for automatic dark mode switching later.

---

## 1.2 Typography System

### Font Loading Strategy (layout.tsx)

| Font | Weight | Style | Subset | Display |
|------|--------|-------|--------|---------|
| Inter | 300–700 | normal | latin | swap |
| Playfair Display | 400, 500, 700 | normal + italic | latin | swap |

### Type Scale Application

| Element | Font | Size Token | Weight | Tracking | Line Height |
|---------|------|-----------|--------|----------|-------------|
| Hero headline | serif/display | --text-hero | 500 | -0.02em | 1.0 |
| Page title (h1) | serif | --text-5xl | 500 | -0.015em | 1.1 |
| Section title (h2) | serif | --text-4xl | 500 | -0.01em | 1.15 |
| Subsection (h3) | sans | --text-2xl | 600 | -0.01em | 1.25 |
| Card title | sans | --text-lg | 600 | 0 | 1.3 |
| Body | sans | --text-base | 400 | 0 | 1.6 |
| Small/caption | sans | --text-sm | 400 | 0.01em | 1.5 |
| Button label | sans | --text-sm | 500 | 0.02em | 1 |
| Nav link | sans | --text-sm | 500 | 0.04em (uppercase) | 1 |
| Price | sans | --text-xl | 600 | 0 | 1 |
| Badge | sans | --text-xs | 600 | 0.05em (uppercase) | 1 |

---

## 1.3 Spacing & Layout Grid

### Container
```
max-width: 1440px
padding-inline: clamp(1rem, 2vw, 2rem)
margin: 0 auto
```

### Grid System
- 12-column CSS grid with `gap: 1.5rem` (mobile `gap: 1rem`)
- Named areas for complex layouts
- Sub-grids within cards/sections

### Section Spacing
- Between major sections: `var(--spacing-section)` → 64–128px
- Between subsections: `var(--spacing-subsection)` → 32–64px
- Component internal: 16–24px
- Element spacing: 8–12px

---

## 1.4 UI Primitives Inventory

Every component uses CVA (class-variance-authority) for variants and `cn()` for composition.

| # | Component | Variants | Sizes | States |
|---|-----------|----------|-------|--------|
| 1 | Button | default, accent, outline, ghost, link, trophy, furniture, artwork | sm, md, lg, icon | hover, active, disabled, loading |
| 2 | Card | default, elevated, bordered, glass | - | hover |
| 3 | Input | default, error, success | sm, md, lg | focus, disabled, readonly |
| 4 | Select | default | sm, md, lg | open, disabled |
| 5 | Textarea | default | sm, md, lg | focus, disabled |
| 6 | Checkbox | default | sm, md | checked, indeterminate |
| 7 | RadioGroup | default, card | - | checked |
| 8 | Slider | default | - | dragging |
| 9 | Dialog | default, fullscreen | sm, md, lg, xl | open/closed |
| 10 | Sheet | default | - | left, right, top, bottom |
| 11 | Tabs | default, underline, pills | - | active |
| 12 | Accordion | default, bordered | - | expanded |
| 13 | Carousel | default | - | dragging |
| 14 | Skeleton | default, circle, text | - | - |
| 15 | Toast | default, success, error, warning | - | entering, exiting |
| 16 | Tooltip | default | - | visible |
| 17 | DropdownMenu | default | - | open |
| 18 | Avatar | default | xs, sm, md, lg | - |
| 19 | Badge | default, trophy, furniture, artwork, outline | - | - |
| 20 | Separator | horizontal, vertical | - | - |
| 21 | AspectRatio | default | 1:1, 4:3, 3:4, 16:9 | - |
| 22 | ScrollArea | default | - | scrolling |
| 23 | Breadcrumb | default | - | - |
| 24 | Pagination | default | - | active, disabled |
| 25 | QuantityStepper | default | sm, md | - |

---

## 1.5 Animation Presets

### File: `apps/storefront/src/lib/animations.ts`

```ts
// Motion variant presets (Framer Motion)
export const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
export const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
export const fadeDown = { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } }
export const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }
export const slideInLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } }
export const slideInRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } }

// Stagger children
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

// Spring physics
export const springConfig = { type: "spring", stiffness: 300, damping: 30 }
export const gentleSpring = { type: "spring", stiffness: 120, damping: 20 }

// Scroll-triggered (used with whileInView)
export const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}
```

### CSS Animation Utilities (in globals.css)
```css
@layer utilities {
  .animate-fade-in { animation: fadeIn var(--duration-normal) var(--ease-out-expo) forwards; }
  .animate-slide-up { animation: slideUp var(--duration-enter) var(--ease-out-expo) forwards; }
  .animate-scale-in { animation: scaleIn var(--duration-normal) var(--ease-spring) forwards; }
  .animate-parallax { will-change: transform; }
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
```

---

## 1.6 Responsive Breakpoint Strategy

| Breakpoint | Width | Target | Layout Changes |
|-----------|-------|--------|----------------|
| `base` | 0–639px | Mobile phone | Single column, bottom nav, full-width cards |
| `sm` | 640px | Large phone / small tablet | 2-column product grids |
| `md` | 768px | Tablet portrait | Desktop nav appears, 3-col grids |
| `lg` | 1024px | Tablet landscape / laptop | Sidebar filters, 4-col grids, mega-menu |
| `xl` | 1280px | Desktop | Full mega-menu, 4-col grids max width |
| `2xl` | 1440px | Large desktop | Content max-width reached |

### Mobile-Specific Patterns
- Bottom sticky navigation (Home, Shop, Search, Cart, Account)
- Full-screen filter sheet (slides from bottom)
- Swipeable carousels (product images, testimonials)
- Sticky Add to Cart bar on PDP
- Collapsible header on scroll-down, reveal on scroll-up
- Touch-optimized: 44px min tap targets, swipe gestures

---

## 1.7 Deliverables Checklist

- [ ] `globals.css` — complete token rewrite
- [ ] `layout.tsx` — updated fonts, meta, providers
- [ ] `src/lib/utils.ts` — enhanced with animation helpers
- [ ] `src/lib/animations.ts` — motion presets
- [ ] `src/components/ui/button.tsx` — expanded variants
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/sheet.tsx`
- [ ] `src/components/ui/tabs.tsx`
- [ ] `src/components/ui/accordion.tsx`
- [ ] `src/components/ui/carousel.tsx`
- [ ] `src/components/ui/skeleton.tsx`
- [ ] `src/components/ui/toast.tsx`
- [ ] `src/components/ui/tooltip.tsx`
- [ ] `src/components/ui/dropdown-menu.tsx`
- [ ] `src/components/ui/avatar.tsx`
- [ ] `src/components/ui/badge.tsx` — category variants
- [ ] `src/components/ui/separator.tsx`
- [ ] `src/components/ui/aspect-ratio.tsx`
- [ ] `src/components/ui/scroll-area.tsx`
- [ ] `src/components/ui/breadcrumb.tsx`
- [ ] `src/components/ui/pagination.tsx`
- [ ] `src/components/ui/quantity-stepper.tsx`
- [ ] `src/components/ui/slider.tsx`
- [ ] `src/components/ui/checkbox.tsx`
- [ ] `src/components/ui/radio-group.tsx`
- [ ] `src/components/ui/textarea.tsx`
- [ ] `src/components/layout/mobile-nav.tsx`
