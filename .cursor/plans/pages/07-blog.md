# Blog & Content Pages — Complete Specification

---

## Blog Listing (`/blog`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ [Hero]: "The Legacy Journal" (serif, text-5xl)      │
│ "Stories of craft, design, and material"            │
├─────────────────────────────────────────────────────┤
│ [Category Tabs]: All | Craftsmanship | Materials |  │
│                  Design | Behind the Scenes         │
├─────────────────────────────────────────────────────┤
│ [Featured Post — large card, full width]            │
│ ┌───────────────────────────────────────────────┐   │
│ │ [Large Image (16:9)]                          │   │
│ │ [Category] • [Date] • [Read time]            │   │
│ │ [Title — serif, text-3xl]                    │   │
│ │ [Excerpt — 2 lines]                          │   │
│ │ [Read More →]                                │   │
│ └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ [Post Grid — 3 columns, 2 rows]                     │
│ ┌──────┐ ┌──────┐ ┌──────┐                         │
│ │ img  │ │ img  │ │ img  │                         │
│ │ cat  │ │ cat  │ │ cat  │                         │
│ │title │ │title │ │title │                         │
│ │date  │ │date  │ │date  │                         │
│ └──────┘ └──────┘ └──────┘                         │
│ ... 3 more ...                                       │
├─────────────────────────────────────────────────────┤
│ [Load More]                                          │
└─────────────────────────────────────────────────────┘
```

### Blog Card Design
```
┌──────────────────────────────┐
│ [Cover Image — 16:9]         │
├──────────────────────────────┤
│ [Category] • Aug 15, 2026    │ text-xs, muted
│ [Title — serif, text-xl]     │ max 2 lines
│ [Excerpt — sans, text-sm]    │ max 3 lines, muted
│ [Read More →]                │ text link, accent
└──────────────────────────────┘
```

---

## Blog Article (`/blog/[slug]`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ [Breadcrumb]: Home > Blog > [Category] > [Title]    │
├─────────────────────────────────────────────────────┤
│ [Category Badge] • Aug 15, 2026 • 5 min read       │
│ [Title — serif, text-5xl, max-w-4xl, centered]     │
│ [Author: avatar + name + role]                      │
├─────────────────────────────────────────────────────┤
│ [Hero Image — full width, rounded-xl, 21:9]        │
├────────────┬────────────────────────────────────────┤
│ [TOC       │ [Article Content — prose styling]      │
│  sticky]   │                                        │
│            │ ## Heading 2                           │
│ 1. Intro   │ Paragraph text with proper line        │
│ 2. Process │ height, max-width for readability.     │
│ 3. Result  │                                        │
│            │ [Inline Image — full bleed]            │
│            │                                        │
│            │ > Blockquote styled with gold left     │
│            │ > border and italic serif text         │
│            │                                        │
│            │ ## Another Heading                     │
│            │ More content...                        │
├────────────┴────────────────────────────────────────┤
│ [Share Bar]: [Twitter] [WhatsApp] [Copy Link]       │
├─────────────────────────────────────────────────────┤
│ [Author Bio Card]                                    │
│ [Related Posts — 3 cards]                            │
├─────────────────────────────────────────────────────┤
│ [Newsletter CTA]                                     │
└─────────────────────────────────────────────────────┘
```

### Article Typography (prose)
- Max width: 720px (centered)
- Headings: serif
- Body: sans, 18px/1.7
- Links: accent color, underline
- Lists: custom bullet styling (gold dots)
- Code: mono, muted bg
- Images: full-bleed (break out of max-width)
- Blockquotes: gold left border, serif italic

---

## Blog Content Plan (6 Initial Posts)

| # | Title | Category | Summary |
|---|-------|----------|---------|
| 1 | "The Art of Trophy Making: From Raw Metal to Polished Award" | Craftsmanship | Process of creating crystal/metal trophies |
| 2 | "Choosing the Right Wood: A Guide to Our Materials" | Materials | Oak, walnut, teak — properties and uses |
| 3 | "5 Ways to Style Your Living Space with Handcrafted Decor" | Design | Interior styling tips with Legacy Crafts products |
| 4 | "Behind the Workshop: Meet Our Artisans" | Behind the Scenes | Profiles of craftsmen, their techniques |
| 5 | "Corporate Gifting Made Personal: Bulk Customization Guide" | Design | How to use the bulk order system |
| 6 | "The Legacy of Indian Craftsmanship: Past Meets Present" | Craftsmanship | Cultural heritage, modern interpretation |

---

## Static Pages

### About Page (`/about`)
```
[Hero]: Workshop panoramic image
[Brand Story]: History, vision, mission (split layout)
[Values]: 4-column values section
[Team]: Key people cards (photo + name + role)
[Materials]: Interactive material showcase
[CTA]: "Explore Our Collection"
```

### FAQ Page (`/faq`)
```
[Header]: "Frequently Asked Questions"
[Category Tabs]: Orders | Customization | Shipping | Returns | Payments
[Accordion]: Question/answer pairs (8-10 per category)
[Contact CTA]: "Still have questions? [Contact Us]"
```

### Contact Page (`/contact`)
```
[Header]: "Get in Touch"
[Split Layout]:
  Left: Contact form (name, email, subject, message, submit)
  Right: Contact info + map
    - Email: hello@legacycrafts.com
    - Phone: +91 80 1234 5678
    - Address: Bangalore, India
    - Hours: Mon-Sat, 10am-6pm IST
[Map]: Embedded Google Maps (Bangalore)
```

### Shipping & Returns (`/shipping-returns`)
```
[Tabs]: Shipping | Returns & Exchanges
Shipping:
  - Standard: 5-7 days, Free above ₹5,000
  - Express: 2-3 days, ₹299
  - Same-day (Bangalore only): ₹499
Returns:
  - 7-day return window (non-custom items)
  - Custom items: non-returnable (quality guarantee)
  - Process: request → pickup → refund in 5-7 days
```

### Terms & Privacy
- Standard legal content pages
- Accordion sections for readability
- Last updated date

---

## SEO Strategy

### Per-Page Meta
| Page | Title Pattern | JSON-LD |
|------|--------------|---------|
| /blog | "The Legacy Journal — Legacy Crafts" | Blog |
| /blog/[slug] | "[Title] — Legacy Crafts Journal" | BlogPosting |
| /about | "About Us — Legacy Crafts" | Organization |
| /faq | "FAQ — Legacy Crafts" | FAQPage |
| /contact | "Contact Us — Legacy Crafts" | LocalBusiness |

### Sitemap Additions
```xml
<url><loc>/blog</loc><changefreq>daily</changefreq></url>
<url><loc>/blog/art-of-trophy-making</loc><lastmod>2026-08-15</lastmod></url>
<!-- ... all posts ... -->
<url><loc>/about</loc><changefreq>monthly</changefreq></url>
<url><loc>/faq</loc><changefreq>monthly</changefreq></url>
<url><loc>/contact</loc><changefreq>yearly</changefreq></url>
```
