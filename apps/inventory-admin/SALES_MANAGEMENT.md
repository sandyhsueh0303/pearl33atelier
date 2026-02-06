# Sales Management System

## 📊 Overview

The sales management system allows you to track product sales, record revenue, costs, and automatically calculate profits. Sales records do NOT affect product availability or publishing status.

## 🎯 Features

### Sales Management Page (`/admin/sales`)

1. **Record New Sales**
   - Select product from dropdown
   - Automatically loads current product price and cost
   - Enter quantity, adjust price/cost if needed
   - Auto-calculates total price, total cost, profit, and profit margin
   - Optional: customer name, order number, platform, notes

2. **Sales List & Statistics**
   - Real-time summary cards (Total Orders, Units, Revenue, Cost, Profit)
   - Sortable table by date, revenue, profit, or customer
   - Search by customer name, order number, or platform
   - Delete sales records

3. **Quick Sale from Product Page**
   - Click "Record Sale" button on any product edit page
   - Automatically navigates to sales page with product pre-selected

## 🔐 Security

- All sales data is protected by RLS (Row Level Security)
- Only admin users in `admin_users` table can view and manage sales
- API endpoints verify admin status before allowing access

## 📁 File Structure

```
apps/inventory-admin/
├── app/
│   ├── api/
│   │   └── sales/
│   │       ├── route.ts                          # GET, POST sales records
│   │       ├── [id]/route.ts                     # GET, PUT, DELETE by ID
│   │       └── product-cost/[productId]/route.ts # Get product cost
│   └── admin/
│       ├── sales/
│       │   ├── page.tsx                          # Main sales page
│       │   └── components/
│       │       ├── SalesForm.tsx                 # Form to record sales
│       │       └── SalesList.tsx                 # Sales table & stats
│       └── products/
│           ├── [id]/page.tsx                     # Updated with quick sale button
│           └── components/
│               └── QuickSaleButton.tsx           # Quick sale button
```

## 🚀 Usage

### Method 1: Record Sale from Sales Page

1. Go to **Sales Management** (銷售管理) from navigation
2. Click **New Sale** if form is hidden
3. Select product
4. Adjust quantity/price if needed
5. Add optional customer info
6. Click **Record Sale**

### Method 2: Quick Sale from Product Page

1. Go to **Products** (產品管理)
2. Click on any product to edit
3. Click **Record Sale** button at top right
4. Complete the form with pre-selected product
5. Click **Record Sale**

## 💡 Cost Snapshots

When you record a sale, the system:
- Calculates current cost from `product_materials` (BOM)
- Saves it as `unit_cost` snapshot
- This preserves historical cost even if material costs change later
- Ensures accurate profit tracking over time

## 📊 Data Model

### `sales_records` Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sale_date | DATE | Sale date (defaults to today) |
| product_id | UUID | Reference to catalog_products |
| quantity | INTEGER | Number of units sold |
| unit_price | DECIMAL | Selling price per unit |
| total_price | DECIMAL | quantity × unit_price |
| unit_cost | DECIMAL | Cost per unit (snapshot) |
| total_cost | DECIMAL | quantity × unit_cost |
| profit | DECIMAL | total_price - total_cost |
| profit_margin | DECIMAL | (profit / total_price) × 100 |
| customer_name | VARCHAR | Optional customer name |
| order_number | VARCHAR | Optional order reference |
| platform | VARCHAR | Sales channel (website/instagram/line/etc) |
| notes | TEXT | Optional notes |

### Views

- **`product_sales_summary`**: Aggregated sales stats per product
- **`sales_overview`**: Sales statistics by day/week/month

## 🎨 UI Components

### SalesForm
- Product selector with auto-price/cost loading
- Real-time calculation display
- Optional fields for customer details
- Validation and error handling

### SalesList
- Summary statistics cards
- Search and sort functionality
- Product links to edit page
- Delete with confirmation

### QuickSaleButton
- Appears on product edit page
- One-click navigation to sales form
- Product pre-populated

## ⚡ API Endpoints

```
GET    /api/sales                    # List all sales (with search, sort)
POST   /api/sales                    # Create new sale
GET    /api/sales/[id]               # Get single sale
PUT    /api/sales/[id]               # Update sale
DELETE /api/sales/[id]               # Delete sale
GET    /api/sales/product-cost/[id]  # Get current product cost
```

All endpoints require admin authentication.

## 🔄 Future Enhancements

Future ideas for expansion:
- Sales analytics dashboard with charts
- Export to CSV/Excel
- Bulk import sales
- Customer management
- Invoice generation
- Inventory auto-adjustment on sale
- Email notifications
- Sales goals and tracking

## 📝 Notes

- Sales do NOT affect product `published` status
- Sales do NOT reduce inventory automatically (manual process)
- Cost snapshot ensures historical accuracy
- All monetary values use DECIMAL(10,2) for precision
- Dates use DATE type (no time component)

---

**Created**: 2026-02-06  
**Developer**: Sandy Hsueh  
**Status**: ✅ Production Ready
