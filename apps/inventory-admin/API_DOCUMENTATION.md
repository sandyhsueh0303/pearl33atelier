# API Documentation

## API Structure Overview

```text
/api/products
├── GET     /api/products
├── POST    /api/products
├── GET     /api/products/[id]
├── PATCH   /api/products/[id]
├── DELETE  /api/products/[id]
├── POST    /api/products/[id]/publish
├── DELETE  /api/products/[id]/publish
├── POST    /api/products/[id]/images
├── PATCH   /api/products/[id]/images/[imageId]
└── DELETE  /api/products/[id]/images/[imageId]
```

## Products

### `GET /api/products`
Returns all products for admin.

### `POST /api/products`
Creates a new product in draft mode.

Required fields:
- `title`
- `pearl_type`
- `availability`

## Single Product

### `GET /api/products/[id]`
Returns one product, including related images.

### `PATCH /api/products/[id]`
Updates editable fields for one product.

Notes:
- `slug` cannot be changed after creation.

### `DELETE /api/products/[id]`
Deletes a product and related image records.

## Publish Management

### `POST /api/products/[id]/publish`
Publishes a product.

Effects:
- `published = true`
- `published_at = now()`

### `DELETE /api/products/[id]/publish`
Unpublishes a product.

Effects:
- `published = false`
- `published_at = null`

## Image Management

### `POST /api/products/[id]/images`
Uploads one or more images.

Behavior:
- Stores files in Supabase Storage
- Creates DB records in `product_images`
- New images default to draft (`published = false`)

### `PATCH /api/products/[id]/images/[imageId]`
Updates image properties.

Supported fields:
- `published`
- `is_primary`
- `sort_order`

Note:
- Setting `is_primary = true` automatically clears primary from other images of the same product.

### `DELETE /api/products/[id]/images/[imageId]`
Deletes image from Storage and database.

## Typical Workflow

1. Create product (draft)
2. Upload images
3. Mark desired images as published
4. Set primary image
5. Publish product

## Authentication Status

Current status:
- API behavior is intended for admin usage.
- Full production hardening should include strict auth enforcement and RLS review.

## Related Files

- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`
- `app/api/products/[id]/publish/route.ts`
- `app/api/products/[id]/images/route.ts`
- `app/api/products/[id]/images/[imageId]/route.ts`
