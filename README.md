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
  - ✏️ 產品 CRUD（新增、編輯、刪除）
  - 🖼️ 多圖片上傳和管理
  - ⭐ 設定主圖和圖片排序
  - 📊 產品發布/草稿狀態管理
  - � 庫存管理（追蹤珍珠和材料）
  - 💰 成本分析（材料、人工、其他成本）
  - �🔄 即時數據刷新
  - 📝 自動生成 slug

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
開啟兩個終端視窗，分別執行：
- 終端 1: `npm run dev:public-web`
- 終端 2: `npm run dev:inventory-admin`

### 生產環境建置

#### 建置 Public Web
```bash
npm run build:public-web
```

#### 建置 Inventory Admin
```bash
npm run build:inventory-admin
```

#### 啟動生產環境
```bash
npm run start:public-web      # Port 3000
npm run start:inventory-admin # Port 3001
```

### 生成 TypeScript 類型

當 Supabase 數據庫 schema 更新後，重新生成類型定義：
```bash
npm run gen:types
```

## 🗄️ 數據庫設定

### Supabase 表結構

1. **catalog_products** - 產品目錄
   - 產品資訊、價格、庫存狀態
   - `published` 欄位控制是否顯示在公開網站
   - 關聯到 `inventory_items`（庫存項目）

2. **product_images** - 產品圖片
   - 關聯到 `catalog_products`
   - `is_primary` 標記主圖
   - `sort_order` 控制顯示順序
   - 圖片存儲在 Supabase Storage

3. **inventory_items** - 庫存管理
   - 追蹤珍珠和材料的庫存
   - `on_hand` - 庫存數量
   - `reserved` - 已用於產品的數量
   - `cost` - 單位成本
   - `vendor` - 供應商
   - `purchase_date` - 採購日期

4. **product_costs** - 產品成本明細
   - 關聯到 `catalog_products` 和 `inventory_items`
   - `pearl_quantity` - 珍珠數量
   - `pearl_unit_cost` - 珍珠單價
   - `material_cost` - 材料成本
   - `labor_cost` - 人工成本
   - `misc_cost` - 其他成本
   - 用於計算產品的總成本和利潤

5. **admin_users** - 管理員帳號
   - 關聯到 `auth.users`
   - 控制後台存取權限

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
**更新日期**: 2026-02-04