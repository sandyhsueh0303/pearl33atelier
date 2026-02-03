# 33 Pearl Atelier

My jewelry shop monorepo, includes public web and inventory management systems.

## Project Structure

This is a monorepo containing two Next.js applications:

```
pearl33atelier/
├── apps/
│   ├── public-web/          # Public-facing jewelry shop website
│   └── inventory-admin/     # Inventory management admin system
├── package.json             # Root workspace configuration
└── README.md
```

## Applications

### 1. Public Web (`apps/public-web`)
- **URL**: http://localhost:3000
- **Description**: Public-facing website for 33 Pearl Atelier jewelry shop
- **Features**: Browse jewelry collection, product details, shopping cart, customer accounts

### 2. Inventory Admin (`apps/inventory-admin`)
- **URL**: http://localhost:3001
- **Description**: Inventory management system for shop administrators
- **Features**: Product management, stock tracking, order management, sales analytics
- **Note**: Authentication and authorization will be implemented before production deployment

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm (v9 or higher)
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sandyhsueh0303/pearl33atelier.git
cd pearl33atelier
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `.env.local` files in both apps with your Supabase credentials:

**For Public Web** (`apps/public-web/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Inventory Admin** (`apps/inventory-admin/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Get these values from your Supabase Dashboard → Settings → API

### Running the Applications

#### Start Public Web (localhost:3000)
```bash
npm run dev:public-web
```

Then open http://localhost:3000 in your browser.

#### Start Inventory Admin (localhost:3001)
```bash
npm run dev:inventory-admin
```

Then open http://localhost:3001 in your browser.

#### Run Both Applications Simultaneously
Open two terminal windows and run each command in a separate terminal:
- Terminal 1: `npm run dev:public-web`
- Terminal 2: `npm run dev:inventory-admin`

### Building for Production

#### Build Public Web
```bash
npm run build:public-web
```

#### Build Inventory Admin
```bash
npm run build:inventory-admin
```

## Technology Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: npm workspaces (monorepo)
- **Shared Package**: `@pearl33atelier/shared` (types + Supabase client)
- **Styling**: CSS
- **Node.js**: v20.19.6
- **Security**: All dependencies patched and up-to-date

## Testing Routes

Test routes are available to verify Supabase connection, RLS policies, and product publishing functionality.

### Public Web Testing Routes

- **`/health`** - Health check endpoint
  - Returns: "OK" status
  - URL: http://localhost:3000/health

- **`/products-test`** - List published products (RLS filtered)
  - Shows: quality, title, pearl_type, price
  - Only displays products with `published=true`
  - URL: http://localhost:3000/products-test

### Inventory Admin Testing Routes

- **`/admin/health`** - Admin health check endpoint
  - Returns: "OK" status
  - URL: http://localhost:3001/admin/health

- **`/admin/products-test`** - List all products (including drafts)
  - Shows: All products with published/draft status
  - Statistics: Published count, Draft count, Total
  - URL: http://localhost:3001/admin/products-test

- **`/admin/publish-test`** - Publish/Unpublish products
  - Quick toggle product publish status by quality ID
  - Actions: Publish (set published=true) or Unpublish (set published=false)
  - URL: http://localhost:3001/admin/publish-test

### Regression Testing

After modifying database schema or RLS policies, test in this order:

1. **Health Checks**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001/admin/health
   ```

2. **Verify RLS Policies**
   - Public should only see published products
   - Admin should see all products (published + draft)

3. **Test Publish/Unpublish**
   - Use `/admin/publish-test` to toggle product status
   - Verify changes appear correctly in both public and admin views

For detailed testing documentation, see [TESTING_ROUTES.md](./TESTING_ROUTES.md).

## Screenshots

### Public Web
![Public Web](https://github.com/user-attachments/assets/b3099018-7cba-49c1-b375-e23307f2356c)

### Inventory Admin
![Inventory Admin](https://github.com/user-attachments/assets/899393b6-6e1a-4155-abd2-74ece73bb8e6)
