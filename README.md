# 33 Pearl Atelier

珠寶店完整系統，包含公開網站和後台庫存管理系統的 monorepo 專案。

## 📁 專案結構

這是一個 monorepo，包含兩個 Next.js 應用程式和共享套件：

```
pearl33atelier/
├── apps/
│   ├── public-web/          # 公開的珠寶商店網站
│   └── inventory-admin/     # 後台庫存管理系統
├── packages/
│   └── shared/              # 共享的類型定義、工具函數和 Supabase 客戶端
├── docs/                    # 文檔和 SQL 腳本
├── supabase/                # Supabase 配置和遷移
├── package.json             # Root workspace 配置
└── README.md
```

## 🌐 應用程式

### 1. Public Web (`apps/public-web`)
- **開發 URL**: http://localhost:3000
- **生產 URL**: https://pearl33admin.zeabur.app (部署在 Zeabur)
- **描述**: 33 Pearl Atelier 珠寶店的公開網站
- **功能**:
  - 📱 響應式設計
  - 🔍 瀏覽珠寶產品目錄
  - 📦 產品詳情頁（含圖片輪播）
  - 🏷️ 產品分類（珍珠類型、形狀、材質）
  - 💰 價格顯示和優惠標示

### 2. Inventory Admin (`apps/inventory-admin`)
- **開發 URL**: http://localhost:3001
- **生產 URL**: https://pearl33admin.zeabur.app (部署在 Zeabur)
- **描述**: 管理員專用的庫存管理系統
- **功能**:
  - 🔐 管理員登入認證
  
  **產品管理**:
  - ✏️ 產品 CRUD（新增、編輯、刪除）
  - 🖼️ 多圖片上傳和管理
  - ⭐ 設定主圖和圖片排序
  - 📊 產品發布/草稿狀態管理
  - 🔍 搜尋、篩選、排序功能
  - 📝 自動生成 slug
  
  **庫存管理**:
  - 📦 庫存項目管理（珍珠、材料）
  - 💰 成本追蹤（單位成本、供應商、採購日期）
  - 📊 庫存統計（總項目、總數量、可用數量、總價值）
  - 🔍 按供應商或備註搜尋
  - 📈 按日期、價值、數量排序
  
  **進階功能**:
  - 🧾 產品材料清單（BOM）管理
  - 💵 產品成本分析（材料、人工、其他成本）
  - 📊 利潤計算和分析
  - � 產品庫存追蹤（生產、銷售數量）
  - �🔄 即時數據刷新
  - � 響應式設計

## 🚀 開始使用

### 環境需求
- Node.js v20 或更高版本
- npm v9 或更高版本
- Supabase 帳號（用於數據庫和儲存）

### 安裝步驟

1. **克隆專案**:
```bash
git clone https://github.com/sandyhsueh0303/pearl33atelier.git
cd pearl33atelier
```

2. **安裝依賴**:
```bash
npm install
```

3. **設定環境變數**:

在兩個應用程式中創建 `.env.local` 檔案：

**Public Web** (`apps/public-web/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xjrnyynfzbrhmotepzyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Inventory Admin** (`apps/inventory-admin/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xjrnyynfzbrhmotepzyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 從 Supabase Dashboard → Settings → API 獲取這些值

### 運行應用程式

#### 🌐 啟動 Public Web (port 3000)
```bash
npm run dev:public-web
```
然後在瀏覽器開啟 http://localhost:3000

#### 🔧 啟動 Inventory Admin (port 3001)
```bash
npm run dev:inventory-admin
```
然後在瀏覽器開啟 http://localhost:3001

#### 📦 同時運行兩個應用程式

**方法 1: 使用兩個終端視窗**
```bash
# 終端 1
npm run dev:public-web

# 終端 2
npm run dev:inventory-admin
```

**方法 2: 使用後台運行（推薦用於開發）**
```bash
# 同時啟動兩個服務
npm run dev:public-web & npm run dev:inventory-admin &

# 查看運行狀態
jobs

# 停止所有後台服務
killall node
```

### 生產環境建置

#### 建置單個服務
```bash
# 建置 Public Web
npm run build:public-web

# 建置 Inventory Admin
npm run build:inventory-admin
```

#### 同時建置兩個服務
```bash
# 方法 1: 依序建置
npm run build:public-web && npm run build:inventory-admin

# 方法 2: 使用 npm workspaces（並行建置，更快）
npm run build --workspaces
```

#### 啟動生產環境
```bash
npm run start:public-web      # Port 3000
npm run start:inventory-admin # Port 3001
```

#### 同時啟動生產環境
```bash
# 使用後台運行
npm run start:public-web & npm run start:inventory-admin &
```

### 生成 TypeScript 類型

當 Supabase 數據庫 schema 更新後，重新生成類型定義：
```bash
npm run gen:types
```

## 🗄️ 數據庫設定

### Supabase 表結構

#### 核心表 (Core Tables)

1. **catalog_products** - 產品目錄
   - 產品基本資訊（標題、描述、價格）
   - `published` - 是否發布到公開網站
   - `slug` - URL 友好的唯一識別碼
   - `pearl_type` - 珍珠類型（淡水珍珠、南洋珍珠等）
   - `shape` - 形狀、`size_mm` - 尺寸、`material` - 材質
   - `availability` - 可用性狀態（in_stock/made_to_order/preorder）
   - `sell_price` / `original_price` - 售價和原價
   - 關聯到 `inventory_items`（主要珍珠庫存）

2. **product_images** - 產品圖片
   - 關聯到 `catalog_products`（一對多）
   - `is_primary` - 標記主圖
   - `sort_order` - 控制圖片顯示順序
   - `published` - 是否發布該圖片
   - `storage_path` - Supabase Storage 路徑

3. **inventory_items** - 庫存管理
   - 追蹤所有珍珠和材料的庫存
   - `vendor` - 供應商名稱
   - `purchase_date` - 採購日期
   - `cost` - 單位成本
   - `on_hand` - 現有庫存數量
   - `reserved` - 已保留/已用於產品的數量
   - `internal_note` - 內部備註

#### 進階表 (Advanced Tables)

4. **product_materials** - 產品材料清單（BOM - Bill of Materials）
   - 關聯 `catalog_products` 和 `inventory_items`（多對多）
   - `quantity_per_unit` - 每個產品需要的材料數量
   - `unit_cost_snapshot` - 建立時的成本快照
   - `sort_order` - 材料顯示順序
   - `notes` - 材料使用備註
   - 📌 **用途**: 精確追蹤每個產品使用了哪些庫存材料

5. **product_costs** - 產品成本明細
   - 關聯到 `catalog_products`（一對一）
   - `material_cost` - 材料總成本（從 product_materials 計算）
   - `labor_cost` - 人工成本
   - `misc_cost` - 其他雜項成本
   - `cost_notes` - 成本備註
   - 📊 **自動計算**: 總成本、利潤、利潤率

6. **product_stock** - 產品庫存追蹤
   - 關聯到 `catalog_products`（一對一）
   - `quantity_produced` - 已生產數量
   - `quantity_available` - 可販售數量
   - `quantity_reserved` - 已預訂數量
   - `quantity_sold` - 已售出數量
   - `last_production_date` - 最後生產日期
   - `last_production_quantity` - 最後生產數量
   - 📦 **用途**: 追蹤成品庫存狀態

7. **admin_users** - 管理員帳號
   - 關聯到 `auth.users`
   - 控制後台系統存取權限

#### 視圖 (Views)

8. **products_full_info** - 產品完整資訊視圖
   - 整合所有產品相關資料
   - 包含成本、利潤、庫存、材料清單等
   - 📈 **自動計算欄位**:
     - `total_cost` - 總成本
     - `profit` - 利潤
     - `profit_margin` - 利潤率
     - `pearl_cost` - 珍珠成本
     - `materials` - 材料清單 JSON

### 資料庫關係架構

```
catalog_products (產品)
    ├── product_images (多張圖片)
    ├── product_materials (使用多種材料) → inventory_items
    ├── product_costs (成本明細)
    ├── product_stock (庫存追蹤)
    └── inventory_item_id (主要珍珠) → inventory_items

inventory_items (庫存)
    ├── 被 product_materials 引用（多個產品可使用同一材料）
    └── 被 catalog_products 引用（作為主要珍珠）

products_full_info (視圖)
    └── 整合所有產品相關資料，自動計算成本和利潤
```

### 使用場景範例

#### 場景 1: 建立新產品
1. 在 `catalog_products` 建立產品基本資訊
2. 在 `product_images` 上傳產品圖片
3. 在 `product_materials` 關聯需要的庫存材料
4. 系統自動在 `product_costs` 計算總成本
5. 在 `product_stock` 記錄生產和庫存資訊

#### 場景 2: 庫存管理
1. 在 `inventory_items` 新增原材料採購記錄
2. 使用材料製作產品時，透過 `product_materials` 關聯
3. 系統自動更新 `inventory_items` 的 `reserved` 數量
4. 可追蹤每種材料的使用情況和剩餘數量

#### 場景 3: 成本分析
1. `products_full_info` 視圖自動計算每個產品的:
   - 材料總成本（從 product_materials 累加）
   - 人工和其他成本（從 product_costs）
   - 總成本、利潤、利潤率
2. 管理員可快速查看產品獲利能力

### Storage 設定

產品圖片存儲在 Supabase Storage：
- **Bucket**: `product-images` (必須設為 public)
- **Folder**: `uploads/`
- **路徑格式**: `uploads/{product_id}/{timestamp}-{random}.{ext}`

**重要**: 請確保 `product-images` bucket 設為公開：
```sql
UPDATE storage.buckets 
SET public = true 
WHERE name = 'product-images';
```

## 🔐 管理員設定

請參閱 [`apps/inventory-admin/ADMIN_SETUP.md`](./apps/inventory-admin/ADMIN_SETUP.md) 了解如何：
1. 創建 `admin_users` 表
2. 設定第一個管理員帳號
3. 配置 RLS 政策
4. 設定登入系統

## 📦 共享套件

`packages/shared/` 包含：

### Types (`@pearl33atelier/shared/types`)
- `CatalogProduct` - 產品類型定義
- `ProductImage` - 圖片類型定義
- `Database` - Supabase 自動生成的類型

### Utils
- `slugify()` - URL 友好的 slug 生成
- `getProductImageUrl()` - 圖片 URL 生成
- `createSupabaseClient()` - Supabase 客戶端工廠

### Supabase
- 統一的 Supabase 客戶端配置
- 支援 SSR 的 cookie 處理

## 🛠️ 技術棧

- **框架**: Next.js 16 (App Router)
- **React**: v19
- **語言**: TypeScript 5
- **數據庫**: Supabase (PostgreSQL)
- **儲存**: Supabase Storage
- **認證**: Supabase Auth
- **部署**: Zeabur
- **包管理**: npm workspaces (monorepo)
- **樣式**: Inline CSS (計劃遷移到 Tailwind CSS)

## 🚢 部署到 Zeabur

### 環境變數設定

為每個服務設定：

**Public Web 服務**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xjrnyynfzbrhmotepzyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

**Inventory Admin 服務**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xjrnyynfzbrhmotepzyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### Zeabur 配置

每個服務的設定：

**Build Command**:
- Public Web: `npm install && npm run build:public-web`
- Inventory Admin: `npm install && npm run build:inventory-admin`

**Start Command**:
- Public Web: `npm run start:public-web`
- Inventory Admin: `npm run start:inventory-admin`

**Root Directory**: 留空（使用 monorepo root）

### 注意事項

1. ⚠️ 環境變數必須在**建置前**設定
2. ⚠️ 設定後需要**重新部署**才會生效
3. ⚠️ `NEXT_PUBLIC_` 變數在建置時被內嵌，無法在運行時更改

## 🧪 測試

## 🧪 測試

詳細的測試路由文檔請參閱 [TESTING_ROUTES.md](./TESTING_ROUTES.md)

## 📚 文檔

- [`ADMIN_SETUP.md`](./apps/inventory-admin/ADMIN_SETUP.md) - 管理員系統設定指南
- [`API_DOCUMENTATION.md`](./apps/inventory-admin/API_DOCUMENTATION.md) - API 端點文檔
- [`TESTING_ROUTES.md`](./TESTING_ROUTES.md) - 測試路由說明
- [`USAGE_EXAMPLES.md`](./packages/shared/USAGE_EXAMPLES.md) - 共享套件使用範例
- [`database.types.ts`](./packages/shared/types/database.types.ts) - 完整資料庫類型定義

### 資料庫相關 SQL
- [`slug_constraints.sql`](./docs/sql/slug_constraints.sql) - Slug 唯一性約束

## 🐛 已知問題和解決方案

### 圖片無法顯示
- ✅ 確認 `product-images` bucket 已設為 public
- ✅ 檢查 storage_path 格式正確（`uploads/...`）
- ✅ 驗證環境變數已正確設定

### 登入失敗 (500 錯誤)
- ✅ 確認環境變數在建置前已設定
- ✅ 檢查 `admin_users` 表已創建
- ✅ 驗證管理員帳號已正確添加

### 產品列表不刷新
- ✅ 使用頁面上的 🔄 刷新按鈕
- ✅ 返回列表頁時會自動重新載入

## 🤝 貢獻

歡迎提交 issues 和 pull requests！

## 📝 授權

Private - All rights reserved

---

**開發者**: Sandy Hsueh  
**專案**: 33 Pearl Atelier  
**更新日期**: 2026-02-05