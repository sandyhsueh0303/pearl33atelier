# Checkout Material Reservations

This implementation prevents concurrent checkout overselling for products whose availability is derived from material inventory.

## Lifecycle

```text
pending order + order items
  -> reserve_order_materials
  -> active material reservation
  -> Stripe Checkout Session
       -> checkout.session.completed: consume_order_materials
       -> checkout.session.expired: release_order_materials
```

Available material quantity is calculated as:

```text
total_quantity - allocated_quantity - reserved_quantity
```

`reserved_quantity` represents material held by an active Stripe Checkout Session. `allocated_quantity` represents material consumed by a paid order.

## Database migration

Apply [20260803000100_checkout_material_reservations.sql](/Users/sandyhsueh/pearl33atelier/supabase/migrations/20260803000100_checkout_material_reservations.sql) before deploying the application code.

The migration adds:

- `inventory_items.reserved_quantity`
- `order_material_reservations`
- Quantity integrity constraints
- `reserve_order_materials(order_id, expires_at)`
- `consume_order_materials(order_id)`
- `release_order_materials(order_id)`

The functions lock all required inventory rows in ascending ID order before checking and changing quantities. If any material is unavailable, the function raises `INSUFFICIENT_INVENTORY` and the entire reservation transaction rolls back.

## Deployment order

1. Apply the database migration.
2. Regenerate Supabase types with `pnpm gen:types` if the project can access its linked Supabase schema.
3. Deploy the public web application and webhook handler together.
4. Confirm the Stripe endpoint receives both `checkout.session.completed` and `checkout.session.expired`.

Do not deploy the checkout reservation code without the matching webhook behavior: an active reservation must be either consumed after payment or released after expiration.

## Concurrency test

The integration test is intentionally disabled unless an explicit, isolated test database is configured:

```bash
SUPABASE_TEST_URL=https://your-test-project.supabase.co \
SUPABASE_TEST_SERVICE_ROLE_KEY=your-test-service-role-key \
pnpm test:checkout-reservations
```

The test creates disposable product, material, order, and order-item fixtures. It starts two reservations concurrently for one remaining material unit and asserts that exactly one reservation succeeds.

Never point these variables at the production project.

## Current guarantee

The system provides an atomic material reservation for the Checkout lifecycle:

- Concurrent checkout attempts cannot reserve the same remaining material capacity.
- A reservation is consumed at most once.
- A reservation is released at most once.
- A multi-material reservation either succeeds entirely or rolls back entirely.

This does not claim exactly-once delivery for every Stripe webhook side effect, such as email delivery. Stripe can retry webhooks; the reservation transitions themselves are idempotent.
