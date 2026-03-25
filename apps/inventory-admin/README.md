# inventory-admin

33 Pearl Atelier 的內部營運後台。

## 這個 App 的角色

`inventory-admin` 不是單純資料編輯頁，而是店務營運工具。它要承接前台之外的大部分內部操作。

它負責：

- 管理員登入與 session
- 商品建立、編輯、發布
- inventory item 管理
- product material 配置與成本 / 可售邏輯支撐
- sales records 管理
- orders 檢視與出貨資訊更新

## 設計思路

這個 app 的重點是讓資料可以被營運，而不是只被儲存：

- 商品資料要能連回成本與材料，而不是孤立存在
- 庫存不是只有數量，還要能推導 available quantity
- 已付款訂單要能順利進入後台處理與出貨流程
- 權限邏輯要簡單清楚，避免模糊權限

## 後台系統責任

### 1. Admin 權限模型

- 使用 Supabase auth 處理登入身份
- 再用 `admin_users` 表確認是否具有後台權限
- 未登入回 `401`
- 已登入但非 admin 回 `403`

### 2. 商品營運模型

- 建立與編輯 `catalog_products`
- 管理 `slug`、`sku`、價格、分類、發布狀態
- 支援 product image 與 material 關聯
- 在列表上計算成本、毛利與實際 availability

### 3. 庫存營運模型

- 管理 `inventory_items`
- 使用 `total_quantity` 與 `allocated_quantity`
- 將 quantity 與 value summary 一起返回給 UI
- 支援 category / status / search / pagination / summary

### 4. 訂單與出貨模型

- 顯示 order 狀態、聯絡資料、總額、追蹤碼與寄信狀態
- 支援後續 shipping workflow
- 與 public-web 的付款結果保持一致

## 主要頁面

- `/`
- `/admin/login`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/inventory`
- `/admin/inventory/new`
- `/admin/inventory/[id]`
- `/admin/sales`
- `/admin/orders`

## 主要 API

Auth：

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Products：

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/[id]`
- `PATCH /api/products/[id]`
- `DELETE /api/products/[id]`
- `GET /api/products/next-sku`

Inventory：

- `GET /api/inventory`
- `POST /api/inventory`
- `GET /api/inventory/[id]`
- `PATCH /api/inventory/[id]`
- `DELETE /api/inventory/[id]`

Sales and orders：

- `GET /api/sales`
- `POST /api/sales`
- `PATCH /api/sales/[id]`
- `DELETE /api/sales/[id]`
- `GET /api/orders`

## 與其他系統的關係

- 對 Supabase：作為主要資料存取層
- 對 `public-web`：承接前台產生的商品、訂單與付款結果
- 對 `packages/shared`：依賴 shared types、slug helpers、availability logic
- 對 Resend：在設定完整時支援 shipping email

## Environment Variables

`apps/inventory-admin/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

若需要寄送 shipping email：

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
```

## 本機開發

從 repo root：

```bash
npm run dev:inventory-admin
```

從 app 目錄：

```bash
npm run dev
```

預設埠號：`3001`

## Build

從 repo root：

```bash
npm run build:inventory-admin
npm run start:inventory-admin
```

從 app 目錄：

```bash
npm run build
PORT=3001 npm run start
```

## 實作上值得記住的事

- 這個後台不是單一 CRUD app，它同時承載 catalog、inventory、sales、orders 四種營運面
- `sku` 有自己的自動編號規則
- 列表上的 availability 可以是「計算結果」，不是單純資料庫原始欄位
- 權限邏輯集中在 `requireAdmin()`，避免每條 API 各寫一套

## 相關檔案

- [package.json](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/package.json)
- [API_DOCUMENTATION.md](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/API_DOCUMENTATION.md)
- [app/utils/adminAuth.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/utils/adminAuth.ts)
- [app/api/products/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/products/route.ts)
- [app/api/inventory/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/inventory/route.ts)
- [app/api/orders/route.ts](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/orders/route.ts)
