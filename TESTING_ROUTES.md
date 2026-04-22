# Testing Routes

This document is a lightweight regression checklist for the routes and workflows that actually exist in the repo today.

It is not limited to health pages. It is meant to help validate the main operational flows after route, auth, schema, or UI changes.

## Public Web

Default local port: `3000`

### Core Pages

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/about`
- `/faq`
- `/contact`
- `/custom-services`
- `/care-guide`
- `/blog`
- `/blog/[slug]`

### Main Public APIs

- `POST /api/checkout/session`
- `POST /api/stripe/webhook`
- `POST /api/contact`

### Public Web Regression Checks

- product list loads and only shows publishable catalog data
- product detail page resolves correctly by slug
- cart page renders without crashing when cart is empty
- blog index loads existing Markdown content
- a known blog article renders correctly from `content/blog`
- contact flow still accepts requests

## Inventory Admin

Default local port: `3001`

### Core Admin Pages

- `/admin/login`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/products/ai-draft`
- `/admin/inventory`
- `/admin/inventory/new`
- `/admin/inventory/[id]`
- `/admin/sales`
- `/admin/orders`
- `/admin/blog`
- `/admin/blog/new`

### Main Admin APIs

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Products:

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/[id]`
- `PATCH /api/products/[id]`
- `DELETE /api/products/[id]`
- `GET /api/products/next-sku`
- `POST /api/products/ai-draft`
- `POST /api/products/ai-draft/create`
- `GET /api/products/[id]/materials`
- `POST /api/products/[id]/materials`
- `POST /api/products/[id]/seo`
- `POST /api/products/[id]/videos`

Inventory:

- `GET /api/inventory`
- `POST /api/inventory`
- `GET /api/inventory/[id]`
- `PATCH /api/inventory/[id]`
- `DELETE /api/inventory/[id]`

Sales:

- `GET /api/sales`
- `POST /api/sales`
- `PATCH /api/sales/[id]`
- `DELETE /api/sales/[id]`
- `GET /api/sales/product-cost/[productId]`

Orders:

- `GET /api/orders`
- `POST /api/orders/[id]/ship`

Blog:

- `GET /api/blog/posts`
- `POST /api/blog/generate`
- `POST /api/blog/save`

## Recommended Regression Flow

### 1. App Boot Check

Confirm both apps start successfully:

```bash
npm run dev:public-web
npm run dev:inventory-admin
```

Then open:

- `http://localhost:3000`
- `http://localhost:3001/admin/login`

### 2. Public Web Sanity Check

Verify:

- product listing page loads
- at least one product page resolves by slug
- blog index page loads
- at least one blog article page renders
- cart page renders

### 3. Admin Auth Check

Verify:

- unauthenticated access redirects or blocks protected admin pages
- valid admin login succeeds
- non-admin users cannot access protected admin routes

### 4. Product Workflow Check

Verify:

- products list loads with filters and pagination
- create product page still saves drafts correctly
- existing product edit page loads
- material list loads for an existing product
- SEO generation still returns a draft

### 5. AI Product Draft Check

Verify:

- `/admin/products/ai-draft` renders
- image upload UI accepts files
- draft generation returns a preview
- extraction / normalization / enrichment cards display
- create draft action opens the standard product edit flow

### 6. Inventory Check

Verify:

- inventory list renders
- inventory detail page loads
- create inventory flow still works

### 7. Sales and Orders Check

Verify:

- sales list renders
- recording a new sale still works
- product cost lookup still resolves
- orders list renders
- shipping action updates an order and attempts email send

### 8. AI Blog Workflow Check

Verify:

- `/admin/blog` lists existing articles
- `/admin/blog/new` renders correctly
- planner-only mode returns stage output
- full pipeline mode returns planner, writer, reviewer, rewriter, and packaging artifacts when applicable
- final save writes `.md` and `.schema.json` files into `apps/public-web/content/blog`

## Database / Permission Regression Focus

After schema or auth changes, focus especially on:

- `requireAdmin()` still blocking unauthorized admin API access
- public web still reading only publishable product content
- admin app still reading and mutating protected operational data
- blog save flow still writing files only after successful admin validation

## Suggested Smoke Test URLs

```bash
open http://localhost:3000/products
open http://localhost:3000/blog
open http://localhost:3001/admin/products
open http://localhost:3001/admin/products/ai-draft
open http://localhost:3001/admin/sales
open http://localhost:3001/admin/orders
open http://localhost:3001/admin/blog
open http://localhost:3001/admin/blog/new
```

## Notes

- This file intentionally no longer references old `products-test`, `publish-test`, or legacy health-only test pages.
- Prefer testing current operational pages and APIs that are actually used in day-to-day workflows.
