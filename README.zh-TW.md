# 33 Pearl Atelier

[English Version](./README.md)

33 Pearl Atelier 的 monorepo，包含：

- 公開網站 `apps/public-web`
- 後台管理 `apps/inventory-admin`
- 共享型別與工具 `packages/shared`
- Supabase schema / migration 相關檔案 `supabase`

目前專案重點功能包含：

- ready-to-wear 商品展示與購物車
- Stripe Checkout 付款
- Stripe webhook 訂單同步
- Resend 訂單確認信
- inventory / BOM / sales / orders 後台管理
- blog / journal 內容系統

## 專案結構

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

公開網站，預設開發埠為 `3000`。

主要功能：

- 首頁、品牌頁、FAQ、聯絡頁
- 商品列表與商品詳情
- cart / Stripe Checkout / success flow
- custom services 與 custom inquiry
- blog / journal
- Stripe webhook 接單
- Resend 訂單確認信

### `apps/inventory-admin`

後台管理系統，預設開發埠為 `3001`。

主要功能：

- admin auth
- catalog products 管理
- product images 管理
- inventory items 管理
- product materials / BOM
- sales records
- orders 管理
- tracking / shipped status 更新

### `packages/shared`

共享程式碼，包含：

- Supabase / storage 相關工具
- shared types
- `database.types.ts`

## 開發需求

- Node.js 20+
- npm 9+
- Supabase 專案
- Stripe 帳號
- Resend 帳號

## 安裝

```bash
npm install
```

## 本機開發

### 啟動公開網站

```bash
npm run dev:public-web
```

開啟：`http://localhost:3000`

### 啟動後台

```bash
npm run dev:inventory-admin
```

開啟：`http://localhost:3001`

### 同時啟動兩個 app

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

## 常用 scripts

```bash
npm run dev:public-web
npm run dev:inventory-admin
npm run build:public-web
npm run build:inventory-admin
npm run start:public-web
npm run start:inventory-admin
npm run gen:types
```

## 環境變數

### `apps/public-web/.env.local`

至少需要：

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

可選：

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

### `apps/inventory-admin/.env.local`

至少需要：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

如果後台要寄 shipping email，還需要：

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
```

## Stripe flow

目前付款流程大致如下：

1. 使用者在 `public-web` 加入 cart
2. `/api/checkout/session` 建立 Stripe Checkout Session
3. 同時建立 `orders` / `order_items`
4. Stripe webhook 收到 `checkout.session.completed`
5. 更新 `orders.status = paid`
6. 同步 shipping / tax 到資料庫
7. 同步 paid order 到 sales records
8. 透過 Resend 寄出訂單確認信

## Resend

專案目前有兩種 email：

- `public-web`
  - 訂單確認信
- `inventory-admin`
  - shipping email

如果 Resend 還在 testing mode，寄送對象會受限制。正式上線前請先完成 domain verification，並使用已驗證網域下的寄件地址。

## Supabase

### 型別更新

當 public schema 變更後，重新生成 shared database types：

```bash
npm run gen:types
```

輸出檔案：

- [packages/shared/types/database.types.ts](./packages/shared/types/database.types.ts)

### 重要提醒

- schema 變更請盡量同步補上 migration
- 不要只手動改 production / remote DB 而不更新 repo

## 目前資料模型重點

常用資料表包含：

- `catalog_products`
- `product_images`
- `inventory_items`
- `product_materials`
- `sales_records`
- `orders`
- `order_items`
- `admin_users`

`orders` 目前已支援的欄位包含：

- `order_number`
- `status`
- `shipping_fee_cents`
- `tax_amount_cents`
- `tracking_number`
- `shipping_carrier`
- `shipped_at`
- `confirmation_email_sent_at`
- `shipping_email_sent_at`

## 注意事項

- `apps/*/tsconfig.tsbuildinfo` 是暫存檔，不要 commit
- 如果 webhook 成功但信沒寄出，先檢查：
  - Resend env
  - Resend testing mode 限制
  - verified domain
- `public-web` 和 `inventory-admin` 是兩個獨立 app，各自需要自己的 env

## 測試建議

### public-web

- cart flow
- Stripe checkout
- success page
- webhook
- order confirmation email
- blog / product linking

### inventory-admin

- login
- product CRUD
- sales record flow
- orders list
- shipped status update

## Deploy 前 checklist

- Supabase schema 已同步
- 必要 env 都已設好
- Stripe webhook endpoint 指到正確環境
- Resend domain 已驗證
- `NEXT_PUBLIC_SITE_URL` 使用正確正式網域

## Repository notes

- root README 只寫整體開發與部署資訊
- app-specific 細節盡量放在對應 app 目錄內處理
- 長篇測試與路由記錄可參考：
  - [TESTING_ROUTES.md](./TESTING_ROUTES.md)
