# API Routes — Complete Specification

---

## New Store Routes (Customer-facing)

### Blog

| Route | Method | Auth | Description | Response |
|-------|--------|------|-------------|----------|
| `/store/blog/posts` | GET | No | List published posts | `{ posts, count, limit, offset }` |
| `/store/blog/posts/:slug` | GET | No | Get single post by slug | `{ post }` |
| `/store/blog/categories` | GET | No | List blog categories | `{ categories }` |

**Query params for listing:**
- `category` — filter by category slug
- `tag` — filter by tag
- `limit` — default 12
- `offset` — for pagination
- `q` — search in title/excerpt

### Wishlist

| Route | Method | Auth | Description | Response |
|-------|--------|------|-------------|----------|
| `/store/wishlist` | GET | Yes | Get customer's wishlist | `{ items, count }` |
| `/store/wishlist` | POST | Yes | Add item to wishlist | `{ item }` |
| `/store/wishlist/:id` | DELETE | Yes | Remove item | `204` |

**POST body:** `{ product_id, variant_id? }`

### Reviews

| Route | Method | Auth | Description | Response |
|-------|--------|------|-------------|----------|
| `/store/reviews` | GET | No | List reviews for a product | `{ reviews, count, average_rating, distribution }` |
| `/store/reviews` | POST | Yes | Submit a review | `{ review }` |
| `/store/reviews/:id/helpful` | POST | No | Mark review as helpful | `{ helpful_count }` |

**GET query params:**
- `product_id` (required)
- `sort` — `newest`, `highest`, `lowest`, `helpful`
- `rating` — filter by star count
- `limit`, `offset`

**POST body:** `{ product_id, rating, title?, body?, images? }`

**Response extras:**
```json
{
  "reviews": [...],
  "count": 24,
  "average_rating": 4.2,
  "distribution": { "5": 14, "4": 6, "3": 2, "2": 1, "1": 1 }
}
```

---

## New Admin Routes

### Blog CMS

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/admin/blog/posts` | GET | Admin | List all posts (any status) |
| `/admin/blog/posts` | POST | Admin | Create post |
| `/admin/blog/posts/:id` | GET | Admin | Get post with full detail |
| `/admin/blog/posts/:id` | PUT | Admin | Update post |
| `/admin/blog/posts/:id` | DELETE | Admin | Delete post |
| `/admin/blog/posts/:id/publish` | POST | Admin | Publish (set status + published_at) |
| `/admin/blog/categories` | GET | Admin | List categories |
| `/admin/blog/categories` | POST | Admin | Create category |
| `/admin/blog/categories/:id` | PUT | Admin | Update category |
| `/admin/blog/categories/:id` | DELETE | Admin | Delete category |

### Review Moderation

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/admin/reviews` | GET | Admin | List all reviews (filterable by status) |
| `/admin/reviews/:id/approve` | POST | Admin | Approve review |
| `/admin/reviews/:id/reject` | POST | Admin | Reject review |

---

## Webhook Routes

### Razorpay Webhook (`/webhooks/razorpay`)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/webhooks/razorpay` | POST | HMAC | Handle payment events |

**Events handled:**
- `payment.captured` → authorize payment in Medusa
- `payment.failed` → mark payment failed
- `refund.created` → confirm refund processing

**Security:**
- Verify `x-razorpay-signature` header using HMAC-SHA256
- Idempotency: check if event already processed (store event_id)
- Return 200 immediately, process async

```ts
// Signature verification
import crypto from "crypto"

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
```

---

## Enhanced Existing Routes

### Search Enhancement

Current `/store/search` improvements:
- Add facet counts in response
- Add filter by category, price range, material
- Add sort options
- Add highlight matches in results

**Enhanced response:**
```json
{
  "hits": [...],
  "totalHits": 45,
  "facets": {
    "categories": { "Trophies": 12, "Furniture": 20, "Artwork": 13 },
    "materials": { "Wood": 18, "Metal": 10, "Crystal": 8 },
    "price_range": { "0-2000": 5, "2000-5000": 15, "5000+": 25 }
  },
  "query": "oak table",
  "processingTimeMs": 12
}
```

---

## API Error Responses (Standardized)

All errors follow this shape:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "path": "email", "issue": "Required" }]
  }
}
```

Error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`

---

## Rate Limiting

| Route Pattern | Limit |
|---------------|-------|
| `/store/*` | 100 req/min per IP |
| `/store/reviews POST` | 5 req/min per customer |
| `/store/wishlist POST` | 30 req/min per customer |
| `/webhooks/*` | 1000 req/min (Razorpay IPs) |
| `/admin/*` | 200 req/min per user |
