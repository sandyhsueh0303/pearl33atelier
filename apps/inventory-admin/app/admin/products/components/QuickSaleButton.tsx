'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickSaleButtonProps {
  productId: string;
}

export default function QuickSaleButton({ productId }: QuickSaleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleQuickSale = async () => {
    // Navigate to sales page with preselected product
    router.push(`/admin/sales?productId=${productId}`);
  };

  return (
    <button
      onClick={handleQuickSale}
      disabled={loading}
      className="admin-product-form-quick-sale-button"
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#2b8a3e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      title="Record a sale for this product"
    >
      <span className="admin-product-form-quick-sale-icon">💰</span>
      <span className="admin-product-form-quick-sale-label">Record Sale</span>
    </button>
  );
}
