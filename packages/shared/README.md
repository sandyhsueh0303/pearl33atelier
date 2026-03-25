# @pearl33atelier/shared

這個 package 是前台與後台之間的 shared domain layer。它把兩個 app 都依賴的規則放在同一個地方。

## 為什麼它重要

如果前台和後台各自理解「產品可售」、「產品網址」、「圖片 URL」或「資料表型別」的方式不同，系統很快就會分裂。這個 package 的存在，就是為了防止這件事。

它集中處理：

- typed Supabase client
- generated database types 與 helper aliases
- `slugify`
- storage URL helpers
- material inventory 與 product availability 計算

## 設計定位

這一層不是 UI layer，也不是 app-specific service layer。它比較像跨 app 的 domain contract：

- 前台依賴它來讀取一致的資料型別與圖片 URL
- 後台依賴它來共享 slug 規則與 availability logic
- schema 改動後，兩個 app 都透過這裡一起收斂

## 目前收斂的關鍵規則

- 公開產品使用 `slug` 作為 URL identifier
- inventory 使用 `total_quantity` 與 `allocated_quantity`
- availability 支援 `IN_STOCK`、`PREORDER`、`OUT_OF_STOCK`
- 若商品有材料配置，實際可售狀態可以由材料可用數量推導

## 主要輸出

- [types/index.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/index.ts)
- [supabase/client.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/supabase/client.ts)
- [utils/slugify.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/utils/slugify.ts)
- [utils/storage.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/utils/storage.ts)
- [utils/materialInventory.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/utils/materialInventory.ts)

## Material Availability Logic

這裡有一個很重要的設計點：商品 availability 不一定只是人工輸入欄位。

當商品綁定材料時，shared helper 會：

- 讀取每個材料的 `total_quantity`
- 扣掉 `allocated_quantity`
- 依 `quantity_per_unit` 推導可生產數量
- 找出限制產量的那個材料
- 回傳整體商品的 `availableQuantity` 與實際 availability

這讓前台 checkout 與後台列表可以共用同一套判斷方式。

## Example

```ts
import { createSupabaseClient, computeProductInventorySummary } from '@pearl33atelier/shared'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const summary = computeProductInventorySummary([
  {
    inventory_item_id: 'item-1',
    quantity_per_unit: 2,
    inventory_item: {
      total_quantity: 10,
      allocated_quantity: 4,
      name: 'Akoya pearl pair',
    },
  },
])
```

## 何時應該改這裡

- 前後台都要依賴同一個規則時
- schema 改變導致 shared types 需要同步時
- 產品、圖片、availability、slug 等共用行為需要更新時

## 相關文件

- [types/README.md](/Users/sandyhsueh/pearl33atelier/packages/shared/types/README.md)
- [USAGE_EXAMPLES.md](/Users/sandyhsueh/pearl33atelier/packages/shared/USAGE_EXAMPLES.md)
