# 33 Pearl Atelier

[中文說明 / Traditional Chinese](/Users/sandyhsueh/pearl33atelier/README.zh-TW.md)

Monorepo for the 33 Pearl Atelier digital system: a brand-led storefront, an operations-focused admin app, shared domain utilities, and Supabase-backed data workflows.

## Why This Repo Exists

This project is not just a website plus a dashboard. It is designed as one connected operating system for a small jewelry brand:

- `public-web` presents the brand, products, and checkout experience
- `inventory-admin` supports daily operations, product publishing, inventory, sales, and shipping
- `packages/shared` keeps both apps aligned on the same domain rules
- `supabase` holds the database and persistence layer that both apps depend on

The goal is to keep the customer-facing experience calm and refined while making the internal workflow practical and reliable.

## System Design Thinking

The system follows a few consistent ideas:

- Brand-first storefront: the public app is designed to feel editorial and trustworthy, not like a generic marketplace.
- Operations-first admin: the back office is treated as a real working tool, not a demo CMS.
- One source of truth: product, order, and inventory data live in Supabase and are shared across both apps.
- Automation where it reduces manual work: checkout, payment confirmation, order sync, email sending, and availability calculations are handled by the system instead of by hand.
- Shared domain rules: availability, slugs, image URLs, and typed database access are centralized so the two apps do not drift apart.

## High-Level Architecture

```text
Customer
  -> public-web
  -> Stripe Checkout
  -> Stripe webhook
  -> Supabase orders / order_items / sales
  -> confirmation email

Admin
  -> inventory-admin
  -> Supabase catalog / inventory / sales / orders

Both apps
  -> packages/shared
  -> shared types, utilities, availability logic, storage helpers
```

## Repository Structure

```text
.
├── apps/
│   ├── public-web/
│   └── inventory-admin/
├── packages/
│   └── shared/
├── supabase/
├── 33pearlatelier/
└── package.json
```

## Read The Right README

- [apps/public-web/README.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/README.md): storefront purpose, user flow, routes, env, integrations
- [apps/inventory-admin/README.md](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/README.md): admin workflows, auth model, operational APIs
- [packages/shared/README.md](/Users/sandyhsueh/pearl33atelier/packages/shared/README.md): shared domain layer and why it exists
- [packages/shared/types/README.md](/Users/sandyhsueh/pearl33atelier/packages/shared/types/README.md): generated types workflow
- [33pearlatelier/README.md](/Users/sandyhsueh/pearl33atelier/33pearlatelier/README.md): nested workspace notes and Notion inventory import script

## Main Components

### `apps/public-web`

Public storefront running on `http://localhost:3000`.

Responsibility:

- communicate brand and product value
- show only published product data
- support cart and checkout
- trigger paid order lifecycle through Stripe
- send customer-facing order confirmation email

### `apps/inventory-admin`

Internal admin running on `http://localhost:3001`.

Responsibility:

- manage products and publishing state
- manage raw inventory and material allocation
- review sales and orders
- update shipping information
- enforce admin-only operational access

### `packages/shared`

Shared domain package used by both apps.

Responsibility:

- typed Supabase access
- common storage and slug helpers
- product availability logic based on material allocation
- shared types so both apps read the same schema

## Automated Behaviors

The system intentionally automates the repetitive parts of running the shop:

- checkout creates `orders` and `order_items` before redirecting to Stripe
- Stripe webhook marks orders as paid and syncs payment totals
- paid orders are synced into downstream sales workflows
- confirmation emails are sent after payment when email config is present
- admin shipping emails can be triggered from admin flows
- product availability can be derived from material inventory instead of only manual status toggles
- inventory admin includes an AI product draft workflow that turns uploaded product images into a reviewable draft product
- inventory admin includes an AI blog workflow that generates, reviews, and packages blog content before saving it into `public-web`

## Recent Feature Areas

The repo now includes two notable AI-assisted editorial and merchandising workflows inside `inventory-admin`:

- `Create Product with AI`
  Upload product images, inspect extraction / normalization / enrichment artifacts, validate the draft, then open the standard product form for final editing.
- `Write with AI`
  Create a blog article brief, run the planner or full editorial pipeline, inspect stage artifacts, then save the final Markdown and schema into the public blog content folder.

If you are orienting yourself to the AI workflows specifically, also see:

- [docs/ai-product-draft-poc.md](/Users/sandyhsueh/pearl33atelier/docs/ai-product-draft-poc.md)
- [docs/ai-blog-system-spec.md](/Users/sandyhsueh/pearl33atelier/docs/ai-blog-system-spec.md)
- [apps/public-web/content/blog-pipeline/ai-blog-pipeline.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/ai-blog-pipeline.md)

## Local Development

Install dependencies:

```bash
npm install
```

Run both apps in separate terminals:

```bash
npm run dev:public-web
npm run dev:inventory-admin
```

## Build And Start

```bash
npm run build:public-web
npm run build:inventory-admin
npm run start:public-web
npm run start:inventory-admin
```

## Environment Overview

The storefront and admin app each use their own `.env.local`.

Shared foundations:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Storefront-only operational keys:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`

Shared app URL setting:

- `NEXT_PUBLIC_SITE_URL`

See each app README for the exact env list and usage.

## Schema And Type Workflow

When the public schema changes:

```bash
npm run gen:types
```

Generated file:

- [packages/shared/types/database.types.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/database.types.ts)

## Notes

- `public-web` and `inventory-admin` are separate apps, but they are meant to behave like one coherent system.
- Keep database schema changes and generated types in sync.
- Keep operational logic in shared helpers when both apps depend on the same rule.
