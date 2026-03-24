# 33 Pearl Atelier

[中文說明 / Traditional Chinese](./README.zh-TW.md)

## Overview

This is the monorepo for 33 Pearl Atelier, including:

- `apps/public-web` — the public storefront
- `apps/inventory-admin` — the internal admin system
- `packages/shared` — shared utilities and types
- `supabase` — schema and migration-related files

The current system includes:

- ready-to-wear product browsing and cart flow
- Stripe Checkout
- Stripe webhook order syncing
- Resend order confirmation emails
- inventory / BOM / sales / orders admin flows
- blog / journal content system

## Project Structure

```text
.
├── apps/
│   ├── public-web/
│   └── inventory-admin/
├── packages/
│   └── shared/
├── supabase/
├── package.json
└── README.md
```

## Apps

### `apps/public-web`

The public site, running on port `3000` in development.

Main features:

- homepage, brand pages, FAQ, contact
- product listing and product detail pages
- cart / Stripe Checkout / success flow
- custom services and custom inquiry
- blog / journal
- Stripe webhook handling
- Resend order confirmation email flow

### `apps/inventory-admin`

The internal admin app, running on port `3001` in development.

Main features:

- admin auth
- catalog product management
- product image management
- inventory management
- BOM / product materials
- sales records
- order management
- tracking and shipped status updates

### `packages/shared`

Shared code for both apps, including:

- Supabase / storage utilities
- shared types
- `database.types.ts`

## Requirements

- Node.js 20+
- npm 9+
- a Supabase project
- a Stripe account
- a Resend account

## Install

```bash
npm install
```

## Local Development

### Start the public site

```bash
npm run dev:public-web
```

Open: `http://localhost:3000`

### Start the admin app

```bash
npm run dev:inventory-admin
```

Open: `http://localhost:3001`

### Run both apps

```bash
# terminal 1
npm run dev:public-web

# terminal 2
npm run dev:inventory-admin
```

## Build

```bash
npm run build:public-web
npm run build:inventory-admin
```

## Common Scripts

```bash
npm run dev:public-web
npm run dev:inventory-admin
npm run build:public-web
npm run build:inventory-admin
npm run start:public-web
npm run start:inventory-admin
npm run gen:types
```

## Environment Variables

### `apps/public-web/.env.local`

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
```

Optional:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

### `apps/inventory-admin/.env.local`

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

If you want the admin app to send shipping emails:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
```

## Stripe Flow

Current payment flow:

1. The customer adds items to cart in `public-web`
2. `/api/checkout/session` creates a Stripe Checkout Session
3. The app also creates `orders` and `order_items`
4. Stripe sends `checkout.session.completed`
5. The webhook updates `orders.status = paid`
6. Shipping and tax are synced back to the database
7. The paid order is synced into sales records
8. Resend sends the order confirmation email

## Resend

There are currently two email flows:

- `public-web`
  - order confirmation email
- `inventory-admin`
  - shipping email

If your Resend account is still in testing mode, recipient delivery will be restricted. Before production, verify your sending domain and use a sender address on that verified domain.

## Supabase

### Regenerating Types

When the public schema changes:

```bash
npm run gen:types
```

Generated file:

- [packages/shared/types/database.types.ts](./packages/shared/types/database.types.ts)

### Important Note

- keep schema changes in sync with migrations whenever possible
- avoid making remote DB-only changes without updating the repo

## Key Data Model Notes

Important tables include:

- `catalog_products`
- `product_images`
- `inventory_items`
- `product_materials`
- `sales_records`
- `orders`
- `order_items`
- `admin_users`

`orders` currently supports fields such as:

- `order_number`
- `status`
- `shipping_fee_cents`
- `tax_amount_cents`
- `tracking_number`
- `shipping_carrier`
- `shipped_at`
- `confirmation_email_sent_at`
- `shipping_email_sent_at`

## Notes

- `apps/*/tsconfig.tsbuildinfo` are cache files and should not be committed
- if a webhook succeeds but email does not send, check:
  - Resend env vars
  - Resend testing mode restrictions
  - verified sending domain
- `public-web` and `inventory-admin` are separate apps and each needs its own env setup

## Recommended Testing

### public-web

- cart flow
- Stripe Checkout
- success page
- webhook flow
- order confirmation email
- blog / product linking

### inventory-admin

- login
- product CRUD
- sales record flow
- orders list
- shipped status updates

## Pre-deploy Checklist

- Supabase schema is in sync
- all required env vars are set
- Stripe webhook endpoint points to the correct environment
- Resend domain is verified
- `NEXT_PUBLIC_SITE_URL` uses the correct production domain

## Repository Notes

- keep the root README focused on overall setup and deployment
- keep app-specific implementation details close to each app
- for longer route and testing notes, see:
  - [TESTING_ROUTES.md](./TESTING_ROUTES.md)
