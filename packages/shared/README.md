# @pearl33atelier/shared Package

共享的 types 和 Supabase client 配置

## 📊 資料庫結構

### Enums
- **pearl_type**: WhiteAkoya | GreyAkoya | WhiteSouthSea | GoldenSouthSea | Tahitian | Freshwater | Other
- **availability_kind**: IN_STOCK | PREORDER

### Tables

1. **admin_users** - 管理員權限控制
   - 檢查使用者是否為管理員
   - RLS: authenticated 使用者可查看自己的記錄

2. **inventory_items** - 內部庫存（僅管理員）
   - 供應商、採購日期、成本
   - on_hand, reserved 數量管理
   - RLS: 僅管理員可存取

3. **catalog_products** - 公開產品目錄
   - **quality** - 唯一的公開識別碼（取代 slug）
   - title, description, pearl_type, size_mm, shape, material
   - sell_price, original_price, availability
   - published, published_at - 發布狀態
   - RLS: 公開僅能查看 published=true

4. **product_images** - 產品圖片
   - published - 是否公開
   - is_primary - 是否為主圖（每產品僅一張）
   - storage_path, sort_order
   - RLS: 公開僅能查看 published=true

### Relationships
```
admin_users (auth control)

inventory_items (1) ────< (many) catalog_products (1) ────< (many) product_images
   (admin only)               (public if published)            (public if published)
```

## 🚀 使用方法

### PUBLIC WEB（未驗證 - anon key）

```typescript
import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import type { CatalogProduct } from '@pearl33atelier/shared/types'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 列出已發布產品（RLS 自動過濾）
const { data } = await supabase
  .from('catalog_products')
  .select('*')

// 根據 quality 查詢（用於 /products/[quality] 路由）
const { data } = await supabase
  .from('catalog_products')
  .select(`
    *,
    images:product_images(*)
  `)
  .eq('quality', 'premium-white-akoya-8mm')
  .single()

// 查詢公開圖片
const { data } = await supabase
  .from('product_images')
  .select('*')
  .eq('product_id', productId)
  .eq('published', true)
  .order('sort_order')
```

### INVENTORY ADMIN（已驗證）

```typescript
// 檢查管理員權限
const { data: { user } } = await supabase.auth.getUser()
const { data } = await supabase
  .from('admin_users')
  .select('user_id')
  .eq('user_id', user.id)
  .single()

// 創建庫存
await supabase.from('inventory_items').insert({
  name: 'Supplier A',
  purchase_date: '2026-01-30',
  cost: 1000,
  on_hand: 10,
  reserved: 0
})

// 創建產品
await supabase.from('catalog_products').insert({
  inventory_item_id: 'xxx',
  title: 'Premium White Akoya Pearl Necklace',
  quality: 'premium-white-akoya-8mm', // 唯一識別碼
  pearl_type: 'WhiteAkoya',
  sell_price: 2500,
  availability: 'IN_STOCK',
  published: false
})

// 發布產品
await supabase
  .from('catalog_products')
  .update({
    published: true,
    published_at: new Date().toISOString()
  })
  .eq('id', productId)

// 設定主圖
await supabase
  .from('product_images')
  .update({ is_primary: false })
  .eq('product_id', productId)

await supabase
  .from('product_images')
  .update({ is_primary: true })
  .eq('id', imageId)
```

## 🔄 遷移指南

### ❌ 舊的（不再使用）
- `products` 表 → 改用 `catalog_products`
- `slug` 欄位 → 改用 `quality`
- `/products/[slug]` → 改用 `/products/[quality]`

### ✅ 新的
- `catalog_products` - 公開產品目錄
- `quality` - 唯一公開識別碼
- `published` + `published_at` - 發布控制
- `is_primary` - 主圖控制
- RLS 自動過濾權限

## 📝 完整範例

查看 `USAGE_EXAMPLE.ts` 獲取完整的查詢範例。
