# Sales Management

## Overview

Sales Management lets admins:
- Create sales records
- Edit or delete records
- Review revenue, cost, and profit metrics
- Search and sort sales history

## Main Screens

- `app/admin/sales/page.tsx`
- `app/admin/sales/components/SalesForm.tsx`
- `app/admin/sales/components/SalesList.tsx`

## Workflow

1. Open Sales from the admin navigation.
2. Click `+ Record New Sale`.
3. Select product and enter quantity, unit price, and unit cost.
4. Optional: add customer, order number, platform, and notes.
5. Save to create the record.

## Data Model (Core Fields)

- `product_id`
- `quantity`
- `unit_price`
- `unit_cost`
- `total_price`
- `total_cost`
- `profit`
- `profit_margin`
- `sale_date`
- `customer_name`
- `order_number`
- `platform`
- `notes`

## Notes

- Profit and margin are calculated from entered values.
- Historical records should keep cost snapshots for reporting stability.
- Use sorting and search for reconciliation and reporting.
