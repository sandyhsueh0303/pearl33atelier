# Supabase TypeScript Types

This directory contains TypeScript type definitions for the Supabase database schema.

## Files

- **`database.types.ts`** - Auto-generated types from Supabase schema (DO NOT EDIT MANUALLY)
- **`index.ts`** - Main types export file with type helpers and custom interfaces

## Regenerating Types

When you change the database schema (add/remove tables, columns, etc.), you need to regenerate the types:

### Prerequisites

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   npx supabase login
   ```

### Generate Types

```bash
# From project root
npx supabase gen types typescript --project-id xjrnyynfzbrhmotepzyl --schema public > packages/shared/types/database.types.ts
```

Or use the npm script:

```bash
npm run gen:types
```

## Usage Examples

### Basic Query with Type Safety

```typescript
import { createAdminClient } from '@/app/utils/supabase'
import type { Database } from '@pearl33atelier/shared/types'

const supabase = await createAdminClient()

// ✅ Fully typed - no (as any) needed!
const { data, error } = await supabase
  .from('catalog_products')
  .select('*')
  .eq('published', true)

// data is typed as CatalogProductRow[]
// TypeScript will catch typos in table/column names!
```

### Insert with Type Safety

```typescript
type ProductInsert = Database['public']['Tables']['catalog_products']['Insert']

const productData: ProductInsert = {
  title: 'New Product',
  slug: 'new-product',
  pearl_type: 'WhiteAkoya',
  // TypeScript will error if you forget required fields
  // or use wrong types!
}

const { data, error } = await supabase
  .from('catalog_products')
  .insert(productData)
  .select()
  .single()
```

### Update with Type Safety

```typescript
type ProductUpdate = Database['public']['Tables']['catalog_products']['Update']

const updates: ProductUpdate = {
  title: 'Updated Title',
  published: true,
  published_at: new Date().toISOString()
}

const { data, error } = await supabase
  .from('catalog_products')
  .update(updates)
  .eq('id', productId)
  .select()
  .single()
```

### Using Row Type Helpers

```typescript
import type { CatalogProductRow } from '@pearl33atelier/shared/types'

function processProduct(product: CatalogProductRow) {
  // product is fully typed
  console.log(product.title, product.pearl_type)
}
```

## Benefits

### ✅ Before (with `as any`)

```typescript
// ❌ No type safety
const { data, error } = await (supabase as any)
  .from('catalog_products')
  .insert({ tittle: 'Oops' }) // Typo not caught!
  .select()
```

### ✅ After (with generated types)

```typescript
// ✅ Full type safety
const { data, error } = await supabase
  .from('catalog_products')
  .insert({ tittle: 'Oops' }) // ❌ TypeScript error: 'tittle' doesn't exist
  .select()
```

## Type Helpers

The `index.ts` file exports helpful type aliases:

```typescript
// Row types (for query results)
export type AdminUserRow = Tables['admin_users']['Row']
export type InventoryItemRow = Tables['inventory_items']['Row']
export type CatalogProductRow = Tables['catalog_products']['Row']
export type ProductImageRow = Tables['product_images']['Row']

// Usage
import type { CatalogProductRow } from '@pearl33atelier/shared/types'

const products: CatalogProductRow[] = await fetchProducts()
```

## Common Patterns

### RPC Functions

```typescript
const { data, error} = await supabase
  .rpc('publish_product', { product_id: id })

// If RPC types are not generated correctly, you can still use as any for RPC only:
// const { data, error } = await (supabase as any).rpc('publish_product', { product_id: id })
```

### Complex Queries with Joins

```typescript
const { data, error } = await supabase
  .from('catalog_products')
  .select(`
    *,
    product_images (*)
  `)
  .eq('published', true)

// data is typed with nested product_images array
```

## Troubleshooting

### Error: "Property does not exist on type"

**Cause**: Database schema changed but types not regenerated.

**Solution**: Run `npm run gen:types` to regenerate types.

### Error: "Access token not provided"

**Cause**: Not logged into Supabase CLI.

**Solution**: Run `npx supabase login`.

### RPC Function Types Missing

**Cause**: Supabase type generation sometimes doesn't include RPC function parameter types.

**Solution**: For RPC calls only, you can use `(supabase as any).rpc()` and add a comment explaining why.

## Workflow

1. **Make database schema changes** (in Supabase Dashboard or via migrations)
2. **Regenerate types**: `npm run gen:types`
3. **Fix TypeScript errors** that appear (these are good! They show where code needs updating)
4. **Test your changes**
5. **Commit both code and updated `database.types.ts`**

## Additional Resources

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
