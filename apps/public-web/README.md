# public-web

33 Pearl Atelier 的前台網站。

## 這個 App 的角色

`public-web` 的任務不是單純把商品列出來，而是把品牌感、商品資訊、結帳信任感與內容敘事放在同一個體驗裡。

它負責：

- 品牌首頁與敘事頁面
- 商品列表與商品詳情
- 購物車與 Stripe Checkout
- checkout success 流程
- blog / care guide / FAQ / contact / custom inquiry
- 顧客端訂單確認信相關流程
- 讀取由 `inventory-admin` AI blog workflow 產出的 Markdown 與 frontmatter 內容

## 設計思路

這個 app 的設計重點不是做成大型電商，而是做成品牌導向的選購體驗：

- 商品資料要乾淨，只曝光已發布內容
- 內容頁與商品頁要能一起支撐品牌信任感
- checkout 前要先做足資料與可售性確認，避免付款成功才發現不能出貨
- 對外路由與資料欄位要穩定，尤其是產品 `slug`

## 前台系統責任

### 1. 商品展示責任

- 從 Supabase 讀取已發布商品
- 顯示商品主圖、價格、availability 與內容資訊
- 使用 `slug` 作為產品 URL 識別

### 2. 結帳責任

- 接收 cart items
- 驗證商品存在、已發布、可售且價格有效
- 建立 `orders` 與 `order_items`
- 建立 Stripe Checkout Session 並導向付款

### 3. 付款後責任

- 由 Stripe webhook 接手付款完成事件
- 更新訂單狀態與金額欄位
- 觸發 downstream order sync
- 在設定完整時寄送訂單確認信

### 4. Content 與 Blog 責任

- 從 `content/blog` 載入站內 blog 文章
- 將 frontmatter 與 Markdown 內容轉成公開閱讀頁面
- 與 `inventory-admin` 的 AI blog save flow 保持內容格式相容

## 路由概覽

主要頁面：

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/checkout/success`
- `/about`
- `/faq`
- `/contact`
- `/custom-services`
- `/custom/inquiry`
- `/care-guide`
- `/blog`
- `/blog/[slug]`

補充內容來源：

- `apps/public-web/content/blog`
- `apps/public-web/content/blog-pipeline`

主要 API：

- `POST /api/checkout/session`
- `POST /api/stripe/webhook`
- `POST /api/contact`

## 與其他系統的關係

- 對 Supabase：讀取 catalog 與寫入 order data
- 對 Stripe：建立 checkout session 與接收 webhook
- 對 Resend：寄送訂單確認信
- 對 `packages/shared`：使用共用型別、Supabase client、圖片與 availability helpers

## Environment Variables

`apps/public-web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
COUPON_RESEND_FROM_EMAIL=
RESEND_REPLY_TO_EMAIL=
```

可選：

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

## 本機開發

從 repo root：

```bash
npm run dev:public-web
```

從 app 目錄：

```bash
npm run dev
```

預設埠號：`3000`

## Build

從 repo root：

```bash
npm run build:public-web
npm run start:public-web
```

從 app 目錄：

```bash
npm run build
PORT=3000 npm run start
```

## 實作上值得記住的事

- checkout 不是只連 Stripe，而是先在自己系統中建立 order record
- availability 不是只看手動欄位，也可能由材料配置推導
- contact API 目前保持 endpoint 穩定，但仍是暫時的 server-side logging 實作
- `SUPABASE_SERVICE_ROLE_KEY` 只應該出現在可信任的 server-side flow
- blog 文章的 publish artifact 目前是 `.md` 加 `.schema.json` 的雙檔案模式

## 相關檔案

- [package.json](/Users/sandyhsueh/pearl33atelier/apps/public-web/package.json)
- [app/api/checkout/session/route.ts](/Users/sandyhsueh/pearl33atelier/apps/public-web/app/api/checkout/session/route.ts)
- [app/api/stripe/webhook/route.ts](/Users/sandyhsueh/pearl33atelier/apps/public-web/app/api/stripe/webhook/route.ts)
- [app/api/contact/route.ts](/Users/sandyhsueh/pearl33atelier/apps/public-web/app/api/contact/route.ts)
