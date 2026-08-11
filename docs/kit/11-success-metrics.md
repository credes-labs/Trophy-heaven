# 11. Success Metrics & KPIs

Instrument these from Phase 1 where possible so baselines exist before optimization. Targets are directional; refine against real baselines.

## 11.1 Business metrics
- **AOV** (Average Order Value) — overall and split by standard vs custom vs bulk.
- **Conversion rate** — visit → purchase.
- **Customization completion rate** — start customizing → finish → add to cart (the engine's headline metric).
- **Cart abandonment rate** — overall and at each checkout step.
- **Bulk order percentage** — share of revenue from corporate/bulk.
- **CAC** and **LTV** — acquisition cost vs lifetime value; watch LTV:CAC.
- **Return rate** — standard products only (custom are non-returnable); flag if custom disputes rise.
- **MRR** — where subscription/repeat corporate programs exist (post-MVP).

## 11.2 Technical metrics
- **Core Web Vitals** — LCP, INP (interaction latency; INP is the current responsiveness metric), CLS on key pages.
- **3D viewer load time** — time-to-first-frame after gesture, by device tier.
- **2D editor Time-to-Interactive.**
- **API response time** — p50/p95/p99 per critical endpoint.
- **Uptime** — target 99.9%.
- **Error rate** — target < 0.1% (Sentry).
- **Mobile vs desktop conversion ratio** — mobile is 60%+ of traffic; watch the gap.

## 11.3 Product metrics
- **Designs created per user** and per session.
- **Template usage rate** — % of designs cloned from presets.
- **Share design rate** — proxy for virality/word-of-mouth.
- **AR preview usage rate** — on supported devices.
- **Bulk upload success rate** — % of uploads confirmed without manual fixes.
- **Design approval turnaround** — submit → approved/rejected, by reviewer.

## 11.4 Instrumentation notes
- Emit design-funnel events (`design_started`, `design_saved`, `design_added_to_cart`, `design_shared`) to Mixpanel/Amplitude; e-commerce events to GA4.
- Tag each custom order with its `complexity` and mode (2D/3D) so production and product analytics can correlate design choices with fulfillment cost and conversion.
