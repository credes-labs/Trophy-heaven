# 1. Executive Summary

## 1.1 Vision

Trophy Heaven is a premium, mobile-first e-commerce platform for **custom trophies and awards**. Its defining capability is an in-browser **trophy customization engine** offering both a **2D canvas editor** and a **3D real-time simulator**, so a buyer designs and previews their exact trophy before paying. Everything else — catalog, cart, checkout, orders — exists to support high-intent, customization-led purchases and bulk/corporate awards programs.

## 1.2 The differentiator

Most trophy sellers show a static photo and collect engraving text in a free-text box. Trophy Heaven lets the customer:

- Pick a base shape, size, material, and finish.
- Add engraving text (fonts, effects, arch/curve) and upload a logo.
- See the result update live in **2D** (precise, print-accurate) and **3D** (realistic PBR materials, orbit/zoom, AR placement).
- Save, re-edit, and share the design, then add it to cart with the design bound to the line item.

This converts "hope it looks right" into "I designed exactly this," which is expected to lift conversion and average order value, and to reduce production rework from ambiguous specs.

## 1.3 Why a custom build (not Shopify)

The core workflows — 2D/3D simulation, design approval pipeline, production queue routing by material/complexity, bulk name-list engraving, corporate net-terms accounts — are difficult to implement cleanly on Shopify without heavy plugin sprawl and platform lock-in. **Medusa.js v2** gives full ownership of commerce logic, schema, API, and the ability to add first-class custom modules (customization, production, bulk, corporate). See [ADR-001](./14-appendices.md#c-architecture-decision-records-adr).

## 1.4 Target users

| Tier | Users | Primary need |
|------|-------|--------------|
| Primary | Event organizers, sports clubs, corporate HR, academic institutions | Bulk award orders with per-recipient engraving, predictable delivery, invoicing/PO. |
| Secondary | Individual consumers | Single custom trophies, plaques, and gifts for personal milestones. |
| Tertiary | Event organisers, corporate procurement | Recurring awards programmes, repeat/net-terms purchasing. |

## 1.5 Scope posture

- **In scope (MVP → Phase 6):** full commerce, 2D + 3D customization, bulk/corporate ordering, design approval + production pipeline, payments (India + international), search, content, admin.
- **Deferred:** detailed UI/UX specification (authored later from Figma). Native mobile app, marketplace, subscriptions, live consultation, 3D-printing integration — see [12-future-roadmap.md](./12-future-roadmap.md).
- **Non-negotiable guardrails:** UPI support (India), mobile-first (60%+ mobile traffic), graceful degradation (2D works if 3D/WebGL fails), custom orders are non-returnable, WCAG 2.1 AA.

## 1.6 Architecture at a glance

Next.js 16 storefront (RSC + interactive client islands for editor/viewer/cart) ↔ Medusa v2 backend (core commerce modules + four custom modules) ↔ PostgreSQL 18 / Redis 7 / Meilisearch, with S3+CDN and Cloudinary for assets, Razorpay/Stripe for payments, and ShipRocket/Delhivery for fulfillment. Full detail in [03-technical-architecture.md](./03-technical-architecture.md).

## 1.7 What "done" means for the platform

A development team can, after reading this set, stand up Medusa v2 with the four custom modules, build the Next.js storefront shell, ship the 2D then 3D customization engines behind clean design-state contracts, wire payments and fulfillment, and operate a design-approval → production → shipping pipeline — with data models, API contracts, test strategy, and risk mitigations all specified. Timelines are deliberately excluded per the brief.
