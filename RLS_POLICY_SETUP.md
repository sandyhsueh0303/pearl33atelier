# Admin Panel RLS 政策設定

## 問題
Admin panel 使用 `SUPABASE_ANON_KEY`，受到 RLS 限制，只能看到 `published = true` 的產品。

## 解決方案

### 方案 1：添加 RLS 政策（簡單，推薦）

在 Supabase SQL Editor 執行：

```sql
-- 允許已認證的用戶查看所有產品（包括草稿）
CREATE POLICY "Authenticated users can view all products"
ON catalog_products
FOR SELECT
TO authenticated
USING (true);

-- 允許已認證的用戶修改所有產品
CREATE POLICY "Authenticated users can update all products"
ON catalog_products
FOR UPDATE
TO authenticated
USING (true);

-- 允許已認證的用戶刪除所有產品
CREATE POLICY "Authenticated users can delete all products"
ON catalog_products
FOR DELETE
TO authenticated
USING (true);

-- 允許已認證的用戶創建產品
CREATE POLICY "Authenticated users can insert products"
ON catalog_products
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 方案 2：使用 Service Role Key（更安全）

1. 到 Supabase Dashboard → Settings → API
2. 複製 `service_role` key
3. 在 `apps/inventory-admin/.env.local` 添加：
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...你的key
   ```
4. 修改 admin 頁面使用 service role key

## 產品圖片的 RLS 政策

同樣需要為 `product_images` 表添加政策：

```sql
-- 允許已認證的用戶查看所有圖片
CREATE POLICY "Authenticated users can view all images"
ON product_images
FOR SELECT
TO authenticated
USING (true);

-- 允許已認證的用戶修改所有圖片
CREATE POLICY "Authenticated users can update all images"
ON product_images
FOR UPDATE
TO authenticated
USING (true);

-- 允許已認證的用戶刪除所有圖片
CREATE POLICY "Authenticated users can delete all images"
ON product_images
FOR DELETE
TO authenticated
USING (true);

-- 允許已認證的用戶創建圖片
CREATE POLICY "Authenticated users can insert images"
ON product_images
FOR INSERT
TO authenticated
WITH CHECK (true);
```

## 注意事項

- 這些政策只允許**已認證**的用戶（authenticated）操作
- 匿名用戶（anon）仍然只能看到 published = true 的產品
- 確保你的 admin_users 表也有適當的 RLS 政策
