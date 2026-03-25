# Shared Database Types

這個資料夾放的是專案使用的 shared database types。

## 這個資料夾的角色

這裡放的是 Supabase schema 對應出來的 TypeScript 型別，以及少量人工整理過的 aliases，讓前後台都能用一致的資料結構寫程式。

## 主要檔案

- [database.types.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/database.types.ts)
  - 由 Supabase schema 自動產生
  - 不要手動編輯
- [index.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/index.ts)
  - 對 generated types 做 re-export
  - 補上常用 row aliases 與 enum aliases

## 為什麼這層重要

這個專案同時有前台、後台、webhook、admin workflow。若沒有穩定的型別層，schema 一改就會出現多個 app 各自錯一點點的狀況。

型別層的目的就是：

- 把 schema 變更的影響提早暴露在開發期
- 讓 table / column 名稱錯誤盡量變成 TypeScript error
- 讓 shared logic、public-web、inventory-admin 依賴同一套資料定義

## 重新生成方式

從 repo root：

```bash
npm run gen:types
```

輸出位置：

- [database.types.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/database.types.ts)

## 常用型別

`index.ts` 目前整理出這些常用 helper：

- `AdminUserRow`
- `InventoryItemRow`
- `CatalogProductRow`
- `ProductImageRow`
- `PearlType`
- `AvailabilityKind`
- `ProductCategory`

## Example

```ts
import type { Database, CatalogProductRow } from '@pearl33atelier/shared/types'

type ProductInsert = Database['public']['Tables']['catalog_products']['Insert']

const product: ProductInsert = {
  title: 'Akoya Pearl Necklace',
  slug: 'akoya-pearl-necklace',
  pearl_type: 'WhiteAkoya',
  availability: 'IN_STOCK',
}

function renderProductCard(item: CatalogProductRow) {
  return item.title
}
```

## 維護原則

- 不要手動改 `database.types.ts`
- schema 變更後先重新生成型別，再修正程式
- 若某個 alias 同時被前後台頻繁使用，再考慮把它放進 `index.ts`
