# 33 Pearl Atelier

[English Version](/Users/sandyhsueh/pearl33atelier/README.md)

這個 monorepo 是 33 Pearl Atelier 的數位系統本體，不只是官網加後台，而是一套把品牌展示、商品管理、訂單流、庫存邏輯與自動化流程串在一起的營運系統。

## 這個 Repo 的定位

這個專案的核心不是「做兩個 app」，而是讓品牌前台與內部營運使用同一套資料與規則：

- `public-web` 負責品牌呈現、商品瀏覽、購物車與結帳
- `inventory-admin` 負責商品上架、庫存、銷售、訂單與出貨管理
- `packages/shared` 負責把兩邊共用的 domain logic 收斂在同一層
- `supabase` 是資料與持久層

整體設計思路是：前台要精緻、安靜、可信；後台要務實、可操作、減少人工重工。

## 系統設計構思

這個系統有幾個很明確的設計原則：

- 品牌優先，不走 marketplace 風格：前台不是大量 SKU 堆疊，而是讓商品、材質、工藝與品牌感受被看見。
- 營運優先，不把後台做成展示型 CMS：後台要支撐日常工作，包括上架、庫存、銷售、訂單與出貨。
- 單一資料真相來源：商品、訂單、庫存等核心資料都回到 Supabase。
- 可自動化的地方就自動化：付款狀態更新、訂單建立、信件寄送、可售數量判斷，不希望靠人工維持一致性。
- 共用規則集中管理：像 `slug`、圖片 URL、型別、availability 計算，都放在 shared layer，避免前後台各寫一套。

## 高階架構

```text
顧客
  -> public-web
  -> Stripe Checkout
  -> Stripe webhook
  -> Supabase 的 orders / order_items / sales
  -> 訂單確認信

內部管理者
  -> inventory-admin
  -> Supabase 的 catalog / inventory / sales / orders

兩個 app 共同依賴
  -> packages/shared
  -> 共用型別、工具、庫存可售邏輯、storage helpers
```

## 專案結構

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

## 各 README 的分工

- [apps/public-web/README.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/README.md)：前台定位、使用者流程、路由、env、外部整合
- [apps/inventory-admin/README.md](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/README.md)：後台工作流、auth 模型、主要 API
- [packages/shared/README.md](/Users/sandyhsueh/pearl33atelier/packages/shared/README.md)：shared domain layer 的責任與邏輯
- [packages/shared/types/README.md](/Users/sandyhsueh/pearl33atelier/packages/shared/types/README.md)：型別生成與維護方式
- [33pearlatelier/README.md](/Users/sandyhsueh/pearl33atelier/33pearlatelier/README.md)：巢狀 workspace 與 Notion 匯入腳本說明

## 系統主要組成

### `apps/public-web`

前台網站，開發時執行於 `http://localhost:3000`。

主要責任：

- 呈現品牌與商品
- 只顯示已發布商品
- 支援購物車與結帳
- 透過 Stripe 啟動付款流程
- 處理顧客端訂單確認信

### `apps/inventory-admin`

內部後台，開發時執行於 `http://localhost:3001`。

主要責任：

- 商品建立、編輯與發布
- 原料 / 庫存管理
- 材料配置與可售數量判斷
- 銷售與訂單管理
- 出貨與追蹤資訊更新

### `packages/shared`

前後台共用的 domain layer。

主要責任：

- typed Supabase access
- 共用 storage / slug helpers
- 依材料配置計算商品可售狀態
- 讓前後台依賴同一份 schema 與規則

## 系統自動化行為

這個系統刻意把高頻、重複、容易出錯的流程自動化：

- 使用者送出 checkout 前，系統先建立 `orders` 與 `order_items`
- Stripe webhook 會在付款完成後自動把訂單標記為 paid，並回填金額資訊
- 已付款訂單會同步到後續 sales 流程
- 如果 email 設定完整，系統會自動寄出訂單確認信
- 後台可觸發 shipping email
- 商品 availability 可以由材料庫存與配置關係推導，而不是只靠人工切狀態

## 本機開發

安裝：

```bash
npm install
```

分別在不同 terminal 啟動兩個 app：

```bash
npm run dev:public-web
npm run dev:inventory-admin
```

## Build 與 Start

```bash
npm run build:public-web
npm run build:inventory-admin
npm run start:public-web
npm run start:inventory-admin
```

## 環境變數概覽

兩個 app 各自使用自己的 `.env.local`。

共同基礎：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

前台額外需要：

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`

兩個 app 都會用到：

- `NEXT_PUBLIC_SITE_URL`

實際完整清單請看各 app 自己的 README。

## Schema 與型別流程

當 public schema 變更時：

```bash
npm run gen:types
```

輸出檔案：

- [packages/shared/types/database.types.ts](/Users/sandyhsueh/pearl33atelier/packages/shared/types/database.types.ts)

## 備註

- `public-web` 和 `inventory-admin` 雖然是兩個 app，但設計上是同一個系統的兩個表面。
- 資料庫 schema 變更後，請同步維護 generated types。
- 只要是前後台共用的規則，優先收斂到 shared helpers。
