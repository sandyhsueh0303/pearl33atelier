# 33 Pearl Atelier

My jewelry shop monorepo, includes public web and inventory management systems.

## Project Structure

This is a monorepo containing two Next.js applications:

```
33pearlatelier/
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

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sandyhsueh0303/33pearlatelier.git
cd 33pearlatelier
```

2. Install dependencies:
```bash
npm install
```

### Running the Applications

#### Start Public Web (localhost:3000)
```bash
npm run dev:public-web
```

#### Start Inventory Admin (localhost:3001)
```bash
npm run dev:inventory-admin
```

#### Run Both Applications Simultaneously
Open two terminal windows and run each command in a separate terminal.

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

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Package Manager**: npm workspaces
- **Styling**: CSS

## Screenshots

### Public Web
![Public Web](https://github.com/user-attachments/assets/9b60fdc0-87e2-4a2a-8d0a-93d4199466fb)

### Inventory Admin
![Inventory Admin](https://github.com/user-attachments/assets/e7a469fe-f472-4706-babf-1599b1684618)
