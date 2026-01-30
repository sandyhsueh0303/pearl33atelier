# Testing Routes

快速回歸測試路由，用於驗證 Supabase 連線、RLS 權限和資料操作。

## PUBLIC WEB (Port 3000)

### 🟢 GET `/health`
**用途**: 檢查 public-web 應用是否正常運行
- **返回**: "OK" 狀態
- **測試**: 應用基本健康檢查

**測試方式**:
```bash
curl http://localhost:3000/health
# 或在瀏覽器打開: http://localhost:3000/health
```

---

### 📦 GET `/products-test`
**用途**: 測試 Supabase 公開查詢（僅顯示已發布產品）
- **顯示欄位**: quality, title, pearl_type, sell_price, published
- **RLS 行為**: 自動過濾只顯示 `published=true` 的產品
- **使用金鑰**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`（匿名/公開存取）

**預期結果**:
- ✅ 只顯示已發布（published=true）的產品
- ❌ 不會顯示草稿（draft）產品
- 📊 顯示總數統計

**測試方式**:
```bash
# 在瀏覽器打開
open http://localhost:3000/products-test
```

---

## INVENTORY ADMIN (Port 3001)

### 🟢 GET `/admin/health`
**用途**: 檢查 inventory-admin 應用是否正常運行
- **返回**: "OK" 狀態
- **測試**: 應用基本健康檢查

**測試方式**:
```bash
curl http://localhost:3001/admin/health
# 或在瀏覽器打開: http://localhost:3001/admin/health
```

---

### 📦 GET `/admin/products-test`
**用途**: 測試 Supabase 管理員查詢（顯示所有產品含草稿）
- **顯示欄位**: status, quality, title, pearl_type, sell_price, availability, published_at
- **RLS 行為**: 顯示所有產品（已發布 + 草稿）
- **使用金鑰**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`（需配置 RLS 管理員權限）

**預期結果**:
- ✅ 顯示所有產品（published + draft）
- 📊 分別統計已發布、草稿、總數
- 🎨 不同背景色區分狀態

**測試方式**:
```bash
# 在瀏覽器打開
open http://localhost:3001/admin/products-test
```

---

### ⚡ GET `/admin/publish-test`
**用途**: 一鍵發布/取消發布產品（by quality）
- **表單輸入**: 
  - `quality`: 產品的唯一識別碼（例如: `premium-white-akoya-8mm`）
  - `action`: `publish` 或 `unpublish`
- **API 端點**: `POST /api/publish`

**Publish 動作**:
- 設置 `published = true`
- 設置 `published_at = now()`

**Unpublish 動作**:
- 設置 `published = false`
- 設置 `published_at = null`

**測試方式**:
```bash
# 在瀏覽器打開表單
open http://localhost:3001/admin/publish-test

# 或使用 curl 直接測試 API
curl -X POST http://localhost:3001/api/publish \
  -H "Content-Type: application/json" \
  -d '{"quality":"premium-white-akoya-8mm","action":"publish"}'

curl -X POST http://localhost:3001/api/publish \
  -H "Content-Type: application/json" \
  -d '{"quality":"premium-white-akoya-8mm","action":"unpublish"}'
```

---

## 完整回歸測試流程

### 1️⃣ 健康檢查
```bash
# Public Web
curl http://localhost:3000/health

# Inventory Admin
curl http://localhost:3001/admin/health
```

### 2️⃣ 查看產品列表
```bash
# Public（只看已發布）
open http://localhost:3000/products-test

# Admin（看所有產品）
open http://localhost:3001/admin/products-test
```

### 3️⃣ 測試發布功能
```bash
# 打開發布測試頁面
open http://localhost:3001/admin/publish-test

# 1. 輸入 quality (例如: test-product-01)
# 2. 選擇 action (publish)
# 3. 點擊按鈕

# 驗證: 檢查 public-web 是否能看到該產品
open http://localhost:3000/products-test
```

### 4️⃣ 測試取消發布
```bash
# 同樣頁面，選擇 unpublish
# 驗證: public-web 應該看不到該產品
```

---

## RLS 測試場景

### ✅ 應該通過的操作

**Public Web (匿名金鑰)**:
- ✅ SELECT `catalog_products` WHERE `published=true`
- ✅ SELECT `product_images` WHERE `published=true`
- ❌ SELECT 草稿產品 (published=false)
- ❌ INSERT / UPDATE / DELETE 任何資料

**Inventory Admin (需配置管理員權限)**:
- ✅ SELECT 所有 `catalog_products`（含草稿）
- ✅ INSERT / UPDATE / DELETE `catalog_products`
- ✅ SELECT / INSERT / UPDATE / DELETE `inventory_items`
- ✅ SELECT / INSERT / UPDATE / DELETE `product_images`

### ❌ 應該被拒絕的操作

**Public Web 嘗試**:
```bash
# 這些應該失敗（403 或返回空）
- 查詢未發布產品
- 嘗試修改任何資料
- 存取 inventory_items 表
```

---

## 快速故障排除

### 問題: "Missing Supabase environment variables"
**原因**: `.env.local` 檔案未設置
**解決**:
```bash
# apps/public-web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# apps/inventory-admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 問題: "No products found"
**原因**: 資料庫中沒有產品
**解決**: 使用 Supabase Dashboard 或 SQL 創建測試資料

### 問題: Public Web 看不到已發布產品
**原因**: RLS 政策未正確配置
**解決**: 
```sql
-- 在 Supabase SQL Editor 執行
CREATE POLICY "Allow public read published products"
ON catalog_products FOR SELECT
TO anon
USING (published = true);
```

### 問題: Admin 也看不到所有產品
**原因**: Admin RLS 政策未配置
**解決**:
```sql
-- 在 Supabase SQL Editor 執行
CREATE POLICY "Allow admin full access"
ON catalog_products FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);
```

---

## 更新 Schema/RLS 後的回歸測試清單

每次修改資料庫 schema 或 RLS 政策後，按順序執行：

- [ ] 1. 健康檢查（確保應用能啟動）
  - [ ] `http://localhost:3000/health`
  - [ ] `http://localhost:3001/admin/health`

- [ ] 2. Public 查詢測試
  - [ ] `http://localhost:3000/products-test` 只顯示已發布產品

- [ ] 3. Admin 查詢測試
  - [ ] `http://localhost:3001/admin/products-test` 顯示所有產品

- [ ] 4. 發布功能測試
  - [ ] Publish 一個草稿產品
  - [ ] 驗證 public-web 能看到
  - [ ] Unpublish 該產品
  - [ ] 驗證 public-web 看不到

- [ ] 5. 權限測試
  - [ ] Public 無法看到草稿
  - [ ] Public 無法修改資料
  - [ ] Admin 能看到所有資料

✅ 全部通過 = Schema/RLS 配置正確！

---

## 建議的測試資料

建議在 Supabase 中創建以下測試資料：

```sql
-- 1. 創建測試庫存
INSERT INTO inventory_items (id, vendor, purchase_date, cost, on_hand, reserved)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Test Vendor', '2026-01-01', 1000, 10, 0);

-- 2. 創建已發布產品
INSERT INTO catalog_products (
  id, inventory_item_id, title, quality, pearl_type, 
  sell_price, availability, published, published_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Test Published Product',
  'test-published-01',
  'WhiteAkoya',
  2000,
  'IN_STOCK',
  true,
  now()
);

-- 3. 創建草稿產品
INSERT INTO catalog_products (
  id, inventory_item_id, title, quality, pearl_type, 
  sell_price, availability, published
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440001',
  'Test Draft Product',
  'test-draft-01',
  'Tahitian',
  3000,
  'PREORDER',
  false
);
```

現在你可以：
- ✅ Public Web 看到 `test-published-01`
- ❌ Public Web 看不到 `test-draft-01`
- ✅ Admin 看到兩個產品
- ⚡ 使用 publish-test 切換 `test-draft-01` 的發布狀態
