# Inventory Admin API Documentation

## 📁 API 結構概覽

```
/api/products/
├── GET     /api/products                                    # 取得所有產品列表
├── POST    /api/products                                    # 新增產品（草稿）
│
├── GET     /api/products/[id]                              # 取得單一產品（含圖片）
├── PATCH   /api/products/[id]                              # 更新產品資料
├── DELETE  /api/products/[id]                              # 刪除產品
│
├── POST    /api/products/[id]/publish                      # 發布產品
├── DELETE  /api/products/[id]/publish                      # 取消發布
│
├── POST    /api/products/[id]/images                       # 上傳圖片（多檔案）
│
├── PATCH   /api/products/[id]/images/[imageId]            # 更新圖片（published, is_primary, sort_order）
└── DELETE  /api/products/[id]/images/[imageId]            # 刪除圖片
```

---

## 📝 詳細 API 說明

### 1. 產品管理 (Products)

#### GET `/api/products`
**功能**: 取得所有產品列表

**回應**:
```json
{
  "products": [
    {
      "id": "uuid",
      "title": "產品名稱",
      "quality": "unique-id",
      "published": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/api/products`
**功能**: 新增產品（預設草稿狀態）

**請求 Body**:
```json
{
  "title": "白色 Akoya 珍珠項鍊",
  "quality": "wa-001",
  "pearl_type": "WhiteAkoya",
  "size_mm": "7-7.5",
  "shape": "圓形",
  "material": "18K 金",
  "sell_price": 25000,
  "original_price": 30000,
  "availability": "IN_STOCK",
  "description": "高品質白色 Akoya 珍珠"
}
```

**回應**:
```json
{
  "product": { ... },
  "message": "Product created successfully"
}
```

---

#### GET `/api/products/[id]`
**功能**: 取得單一產品詳情（包含圖片）

**回應**:
```json
{
  "product": {
    "id": "uuid",
    "title": "產品名稱",
    ...
  },
  "images": [
    {
      "id": "uuid",
      "storage_path": "product-images/...",
      "published": false,
      "is_primary": true,
      "sort_order": 1
    }
  ]
}
```

---

#### PATCH `/api/products/[id]`
**功能**: 更新產品資料

**請求 Body**: （只需包含要更新的欄位）
```json
{
  "title": "新的產品名稱",
  "sell_price": 28000
}
```

---

#### DELETE `/api/products/[id]`
**功能**: 刪除產品（同時刪除所有圖片）

---

### 2. 發布管理 (Publish)

#### POST `/api/products/[id]/publish`
**功能**: 發布產品

**效果**:
- 設定 `published = true`
- 設定 `published_at = now()`
- 產品會出現在 public-web

**回應**:
```json
{
  "success": true,
  "product": { ... },
  "message": "Product published successfully"
}
```

---

#### DELETE `/api/products/[id]/publish`
**功能**: 取消發布產品

**效果**:
- 設定 `published = false`
- 設定 `published_at = null`
- 產品不會在 public-web 顯示

**回應**:
```json
{
  "success": true,
  "product": { ... },
  "message": "Product unpublished successfully"
}
```

---

### 3. 圖片管理 (Images)

#### POST `/api/products/[id]/images`
**功能**: 上傳產品圖片（支援多檔案）

**請求**: `multipart/form-data`
```
images: File[]
```

**效果**:
- 上傳到 Supabase Storage (`product_image` bucket)
- 自動產生 `storage_path`
- 預設 `published = false`（草稿）
- 自動設定 `sort_order`

**回應**:
```json
{
  "images": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "storage_path": "product-images/...",
      "published": false,
      "is_primary": false,
      "sort_order": 1
    }
  ]
}
```

---

#### PATCH `/api/products/[id]/images/[imageId]`
**功能**: 更新圖片屬性

**請求 Body**:
```json
{
  "published": true,        // 可選：切換發布狀態
  "is_primary": true,       // 可選：設為主圖（自動取消其他圖片）
  "sort_order": 2           // 可選：更新排序
}
```

**效果**:
- 當設定 `is_primary = true` 時，會自動將該產品的其他圖片設為 `is_primary = false`
- 每個產品只能有一張主圖

**回應**:
```json
{
  "image": { ... },
  "message": "Set as primary image successfully"
}
```

---

#### DELETE `/api/products/[id]/images/[imageId]`
**功能**: 刪除圖片

**效果**:
- 從資料庫刪除記錄
- 從 Supabase Storage 刪除檔案

---

## 🔄 典型工作流程

### 新增產品完整流程

```
1. POST /api/products
   → 建立產品（draft, published=false）

2. POST /api/products/[id]/images
   → 上傳多張圖片（published=false）

3. PATCH /api/products/[id]/images/[imageId]
   → 選擇要公開的圖片（published=true）

4. PATCH /api/products/[id]/images/[imageId]
   → 設定主圖（is_primary=true）

5. POST /api/products/[id]/publish
   → 發布產品（published=true, published_at=now()）

6. ✅ Public Web 立即顯示產品和已發布的圖片
```

### 取消發布流程

```
1. DELETE /api/products/[id]/publish
   → 取消發布（published=false, published_at=null）

2. ✅ Public Web 立即隱藏產品
```

---

## 🔐 待實作：身份驗證

目前所有 API 使用 `ANON_KEY`，**無權限控制**。

### 計畫實作：
- [ ] Admin 登入系統 (Supabase Auth)
- [ ] `admin_users` 表
- [ ] Protected API routes（需驗證）
- [ ] RLS Policies（只允許 admin）
- [ ] Session 管理

---

## 📦 相關檔案位置

```
apps/inventory-admin/app/api/products/
├── route.ts                                      # 產品列表 & 新增
├── [id]/
│   ├── route.ts                                  # 單一產品 CRUD
│   ├── publish/route.ts                          # 發布 & 取消發布
│   └── images/
│       ├── route.ts                              # 圖片上傳
│       └── [imageId]/
│           └── route.ts                          # 圖片更新 & 刪除（含設主圖）
```

---

## 🚀 測試建議

使用 `curl` 或 Postman 測試：

```bash
# 取得所有產品
curl http://localhost:3001/api/products

# 新增產品
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"測試產品","quality":"test-001"}'

# 上傳圖片
curl -X POST http://localhost:3001/api/products/[id]/images \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"

# 設定主圖
curl -X PATCH http://localhost:3001/api/products/[id]/images/[imageId] \
  -H "Content-Type: application/json" \
  -d '{"is_primary": true}'

# 發布產品
curl -X POST http://localhost:3001/api/products/[id]/publish

# 取消發布
curl -X DELETE http://localhost:3001/api/products/[id]/publish
```
