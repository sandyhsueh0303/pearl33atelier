# Admin 登入系統設定指南

## 📋 設定步驟

### 1️⃣ 在 Supabase 創建 admin_users 表

前往 Supabase Dashboard → SQL Editor，執行以下 SQL：

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record"
ON admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2️⃣ 創建第一個 Admin 用戶

#### 方法 A：使用 Supabase Dashboard（推薦）

1. **創建 Auth 用戶**：
   - 前往 Authentication → Users
   - 點擊 "Add user" → "Create new user"
   - Email: `admin@33pearlatelier.com`
   - Password: `設定你的密碼`
   - Auto Confirm User: ✅（勾選）
   - 點擊 "Create user"
   - **複製顯示的 User ID（UUID）**

2. **添加到 admin_users 表**：
   - 前往 SQL Editor
   - 執行以下 SQL（替換 UUID 和 email）：

```sql
INSERT INTO admin_users (user_id, email, name, role)
VALUES (
  '你的-user-id-uuid-在這裡',
  'admin@33pearlatelier.com',
  'Admin User',
  'super_admin'
);
```

#### 方法 B：使用 Supabase CLI（進階）

```bash
# 創建用戶並添加到 admin_users
supabase sql <<EOF
-- 首先創建 auth user（需要通過 Supabase Dashboard 或 API）
-- 然後添加到 admin_users
INSERT INTO admin_users (user_id, email, name, role)
SELECT id, email, 'Admin User', 'super_admin'
FROM auth.users
WHERE email = 'admin@33pearlatelier.com';
EOF
```

---

### 3️⃣ 設定 RLS Policies（重要！）

為了讓 admin 可以看到所有產品（包括草稿），執行以下 SQL：

```sql
-- 允許 admin_users 讀取所有產品
CREATE POLICY "Admin users can read all products"
ON catalog_products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 允許 admin_users 管理所有產品
CREATE POLICY "Admin users can manage all products"
ON catalog_products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 允許 admin_users 管理圖片
CREATE POLICY "Admin users can manage product images"
ON product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 允許匿名用戶（public-web）只讀取已發布的產品
CREATE POLICY "Public can read published products"
ON catalog_products
FOR SELECT
TO anon
USING (published = true);

-- 允許匿名用戶讀取已發布的圖片
CREATE POLICY "Public can read published images"
ON product_images
FOR SELECT
TO anon
USING (published = true);
```

---

### 4️⃣ 重啟開發伺服器

```bash
# 停止目前的 dev server（Ctrl+C）
# 然後重新啟動
npm run dev --workspace=apps/inventory-admin
```

---

## 🔐 登入測試

1. 前往 `http://localhost:3001/admin/login`
2. 輸入：
   - Email: `admin@33pearlatelier.com`
   - Password: `你設定的密碼`
3. 點擊 "Login"
4. 成功後會自動導向 `/admin/products`
5. 現在應該可以看到所有產品（包括草稿）了！

---

## 📁 新增的檔案

```
apps/inventory-admin/
├── app/
│   ├── admin/
│   │   └── login/
│   │       └── page.tsx                    # 登入頁面
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts             # 登入 API
│       ├── logout/route.ts            # 登出 API
│       └── session/route.ts           # Session 檢查
│   ├── components/
│   │   ├── AuthProvider.tsx               # Auth Context
│   │   └── Navbar.tsx                     # 導航欄（含登出按鈕）
│   └── layout.tsx                         # 更新：加入 AuthProvider
├── middleware.ts                          # Protected Routes
└── ADMIN_SETUP.md                         # 本文件
```

---

## ✅ 功能檢查清單

- [x] Admin 登入頁面
- [x] 登入 API（驗證 Supabase Auth + admin_users）
- [x] 登出功能
- [x] Session 管理（Cookie-based）
- [x] Protected Routes（Middleware）
- [x] 導航欄（顯示用戶資訊和登出按鈕）
- [ ] RLS Policies（待設定）
- [ ] 第一個 Admin 用戶（待創建）

---

## 🚀 下一步

完成以上設定後：

1. 所有 `/admin/*` 路由都需要登入
2. Admin 可以看到所有產品（包括草稿）
3. Public Web 只能看到已發布的產品
4. Session 自動管理，7 天內免登入

---

## 🔧 故障排除

### 問題：登入後還是只看到已發布的產品

**原因**：RLS Policies 未正確設定

**解決**：
1. 確認已執行步驟 3️⃣ 的所有 SQL
2. 檢查 Supabase Dashboard → Authentication → Policies
3. 確認 `catalog_products` 表有 "Admin users can read all products" policy

### 問題：登入失敗 "Access denied"

**原因**：用戶不在 admin_users 表中

**解決**：
1. 檢查 admin_users 表是否有該用戶記錄
2. 確認 `is_active = true`
3. 確認 `user_id` 與 auth.users 中的 id 匹配

### 問題：無法創建產品

**原因**：RLS Policies 沒有 INSERT/UPDATE 權限

**解決**：
確認已執行 "Admin users can manage all products" policy（FOR ALL）

---

## 📝 新增更多 Admin 用戶

```sql
-- 1. 先在 Dashboard 創建 Auth 用戶
-- 2. 然後執行：
INSERT INTO admin_users (user_id, email, name, role)
VALUES (
  '新用戶的-user-id',
  'newadmin@33pearlatelier.com',
  'New Admin Name',
  'admin'  -- 或 'super_admin'
);
```

---

## 🔒 安全建議

1. ✅ **使用強密碼**：至少 12 字元，包含大小寫、數字、符號
2. ✅ **定期更換密碼**：建議每 90 天
3. ✅ **限制 Admin 數量**：只給需要的人權限
4. ✅ **監控登入記錄**：定期檢查 `admin_users.last_login_at`
5. ✅ **生產環境使用 HTTPS**：確保 Cookie 安全傳輸

---

完成！🎉 現在你有一個完整、安全的 Admin 登入系統了。
