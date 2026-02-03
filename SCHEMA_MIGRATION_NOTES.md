# Database Schema Migration: quality → slug + note field

## Overview
This document records the database schema changes where:
1. The `quality` field was renamed to `slug` (URL-friendly identifier)
2. A new `note` field was added for internal admin notes

## Database Changes Required

### Table: catalog_products

```sql
-- Rename quality column to slug
ALTER TABLE catalog_products 
RENAME COLUMN quality TO slug;

-- Add note column for admin internal notes
ALTER TABLE catalog_products 
ADD COLUMN note TEXT;

-- Update any constraints/indexes that reference quality
-- (Check your Supabase dashboard for existing constraints)
```

## Code Changes Completed

### 1. Type Definitions
**File:** `packages/shared/types/index.ts`
- ✅ Updated `CatalogProduct` interface:
  - Changed `quality: string` → `slug: string`
  - Added `note: string | null // internal notes for admin`

### 2. Admin Form Component
**File:** `apps/inventory-admin/app/admin/products/components/ProductForm.tsx`
- ✅ Updated state variables: `quality` → `slug`, added `note`
- ✅ Updated form labels: "Quality (唯一識別碼)" → "Slug (URL 識別碼)"
- ✅ Added new "內部備註" textarea field (admin-only)
- ✅ Updated product data submission to include slug and note

### 3. Admin Product List
**File:** `apps/inventory-admin/app/admin/products/page.tsx`
- ✅ Updated table header: "Quality" → "Slug"
- ✅ Updated product display: `product.quality` → `product.slug`

### 4. API Routes
**File:** `apps/inventory-admin/app/api/products/route.ts`
- ✅ POST endpoint: Updated productData to use `slug` and `note` fields

**File:** `apps/inventory-admin/app/api/products/[id]/route.ts`
- ✅ PATCH endpoint: Updated updates object to include `note` field

### 5. Public Web Routes
**File:** `apps/public-web/app/products/page.tsx`
- ✅ Updated product link: `href={/products/${product.slug}}`

**Folder:** `apps/public-web/app/products/[quality]/` → `[slug]/`
- ✅ Renamed directory from `[quality]` to `[slug]`

**File:** `apps/public-web/app/products/[slug]/page.tsx`
- ✅ Updated function params: `{ quality: string }` → `{ slug: string }`
- ✅ Updated database query: `.eq('quality', quality)` → `.eq('slug', slug)`
- ✅ Updated product display: `product.quality` → `product.slug`

### 6. Test Pages
**File:** `apps/public-web/app/products-test/page.tsx`
- ✅ Updated table header and display to use `slug`

**File:** `apps/inventory-admin/app/admin/products-test/page.tsx`
- ✅ Updated table header and display to use `slug`

**File:** `apps/inventory-admin/app/admin/publish-test/page.tsx`
- ✅ Updated form to use `slug` instead of `quality`
- ✅ Updated labels and descriptions

## Deployment Checklist

### Before Deploying Code Changes:

1. **Update Supabase Database Schema**
   - [ ] Backup your database
   - [ ] Run the SQL migration to rename `quality` → `slug`
   - [ ] Run the SQL migration to add `note` column
   - [ ] Verify existing data is preserved
   - [ ] Update any database constraints or indexes

2. **Verify RLS Policies**
   - [ ] Check that RLS policies still work with `slug` field
   - [ ] Ensure `note` field is only accessible to authenticated admins

3. **Test Data**
   - [ ] Ensure existing products have valid slugs (URL-friendly)
   - [ ] Consider backfilling slugs if they were previously using special characters

### After Deploying Code Changes:

1. **Test Admin Panel**
   - [ ] Create new product with slug and note
   - [ ] Edit existing product's note field
   - [ ] Verify slug is displayed correctly in product list
   - [ ] Test image upload and publishing workflow

2. **Test Public Web**
   - [ ] Access product via new URL: `/products/[slug]`
   - [ ] Verify old URLs redirect or return 404 appropriately
   - [ ] Check product list links work correctly

3. **Test APIs**
   - [ ] Test POST /api/products with slug and note
   - [ ] Test PATCH /api/products/[id] with note updates
   - [ ] Verify publish/unpublish still works

## URL Structure Change

### Before:
```
/products/premium-white-akoya-8mm  (using quality field)
```

### After:
```
/products/premium-white-akoya-8mm  (using slug field)
```

*Note: The URL structure looks the same, but now uses the `slug` field instead of `quality`*

## Field Purpose

- **slug**: URL-friendly unique identifier for products
  - Used in public URLs: `/products/[slug]`
  - Cannot be changed after product creation (disabled in edit mode)
  - Should be lowercase with hyphens (e.g., "premium-white-akoya-8mm")

- **note**: Internal admin notes (not visible to public)
  - Optional field for internal reference
  - Examples: "庫存來源：日本直送", "注意：限量商品"
  - Background color: Light yellow (#fffef0) to distinguish from public fields

## Migration Impact

✅ **No breaking changes to URLs** - The slug field serves the same purpose as quality
✅ **Backward compatible** - All existing functionality preserved
✅ **Enhanced features** - Added note field for better inventory management

## Next Steps

1. Update the Supabase database schema
2. Test the entire workflow end-to-end
3. Consider adding validation for slug format (lowercase, hyphens only)
4. Update any external documentation or API docs
