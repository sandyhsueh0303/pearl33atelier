# API Documentation

This document summarizes the current operational API surface for `apps/inventory-admin`.

It is intended as a practical map of what exists now in the codebase, not as a full OpenAPI contract.

## API Areas

The admin API currently includes:

- auth
- products
- inventory
- sales
- orders
- blog

## Auth

### `POST /api/auth/login`

Authenticates an admin session through Supabase auth plus the `admin_users` permission check.

### `POST /api/auth/logout`

Clears the admin session.

### `GET /api/auth/session`

Returns the current session status for the admin app.

## Products

### `GET /api/products`

Returns product list data for the admin UI.

Current usage includes:

- pagination
- search
- status filters
- pearl type filter
- category filter
- sorting

The products page also uses the response to populate filter options and pagination metadata.

### `POST /api/products`

Creates a product draft.

### `GET /api/products/[id]`

Returns a single product with related admin editing context.

### `PATCH /api/products/[id]`

Updates a product.

### `DELETE /api/products/[id]`

Deletes a product.

### `GET /api/products/next-sku`

Returns the next sequential SKU suggestion.

### `POST /api/products/[id]/publish`

Publishes a product.

### `GET /api/products/[id]/materials`

Returns material rows for a product, including inventory context and remaining quantity information.

### `POST /api/products/[id]/materials`

Adds a material row to a product and syncs product availability snapshots.

### `DELETE /api/products/[id]/materials?materialId=...`

Deletes a material row and resyncs availability snapshots.

### `POST /api/products/[id]/images`

Uploads one or more product images.

### `PATCH /api/products/[id]/images/[imageId]`

Updates image metadata such as publish state, primary state, or sort order.

### `DELETE /api/products/[id]/images/[imageId]`

Deletes one product image.

### `POST /api/products/[id]/videos`

Uploads product videos.

Current constraints in code:

- supported types: `mp4`, `webm`, `quicktime`
- maximum size: 25MB

### `PATCH /api/products/[id]/videos/[videoId]`

Updates product video metadata.

### `DELETE /api/products/[id]/videos/[videoId]`

Deletes a product video.

### `POST /api/products/[id]/seo`

Generates SEO draft fields for a product, using product data plus preferred image context when available.

## AI Product Draft

### `POST /api/products/ai-draft`

Runs the AI product draft flow.

Current behavior:

1. receives uploaded image data plus admin notes
2. extracts structured product attributes
3. normalizes them into canonical values
4. enriches them with lightweight merchandising context
5. generates product draft copy
6. validates the draft
7. returns draft output plus debug artifacts

The response can include:

- `draft`
- `extraction`
- `normalized`
- `enriched`
- `pipelineDebug`
- `validation`
- `source`
- `debug`

### `POST /api/products/ai-draft/create`

Creates an unpublished `catalog_products` draft from the AI-generated product payload and redirects the admin flow back to the standard product edit page.

## Inventory

### `GET /api/inventory`

Returns inventory items with filtering, search, pagination, and summary information.

### `POST /api/inventory`

Creates a new inventory item.

### `GET /api/inventory/[id]`

Returns a single inventory item.

### `PATCH /api/inventory/[id]`

Updates one inventory item.

### `DELETE /api/inventory/[id]`

Deletes one inventory item.

## Sales

### `GET /api/sales`

Returns sales records for the admin sales page.

Current usage includes:

- pagination
- search
- sorting
- product title and slug search through joined product data

### `POST /api/sales`

Creates a sale record and applies material inventory allocation deltas.

### `PATCH /api/sales/[id]`

Updates a sale record.

### `DELETE /api/sales/[id]`

Deletes a sale record and reverses the related inventory delta when applicable.

### `GET /api/sales/product-cost/[productId]`

Calculates current unit cost for a product from `product_materials`.

## Orders

### `GET /api/orders`

Returns orders for the admin order management page.

### `POST /api/orders/[id]/ship`

Marks an order as shipped and attempts to send the shipping email.

Expected request fields include:

- `tracking_number`
- `shipping_carrier`
- optional `shipped_at`

## Blog

### `GET /api/blog/posts`

Returns blog article metadata visible to the admin blog list page.

### `POST /api/blog/generate`

Runs the AI blog pipeline.

Supported modes:

- `planner`
- `full`

The route validates the brief and then executes the pipeline stages used by the blog generator UI:

- planner
- writer
- reviewer
- rewriter when needed
- packaging

The response includes stage artifacts plus final package data for preview in the admin UI.

### `POST /api/blog/save`

Validates and saves the final article package into `apps/public-web/content/blog`.

Current save behavior writes:

- `slug.md`
- `slug.schema.json`

## Auth Model

These routes are intended for admin use.

In practice, the admin API relies on `requireAdmin()` to:

- verify auth session
- ensure the current user exists in `admin_users`

This model applies across the product, inventory, sales, order, and blog admin APIs.

## Related Files

- [app/utils/adminAuth.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/utils/adminAuth.ts)
- [app/api/products/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/products/route.ts)
- [app/api/products/ai-draft/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/products/ai-draft/route.ts)
- [app/api/inventory/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/inventory/route.ts)
- [app/api/sales/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/sales/route.ts)
- [app/api/orders/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/orders/route.ts)
- [app/api/blog/generate/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/blog/generate/route.ts)
- [app/api/blog/save/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/blog/save/route.ts)
