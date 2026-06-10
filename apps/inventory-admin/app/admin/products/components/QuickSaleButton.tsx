'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './QuickSaleButton.module.css';

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
      className={`admin-product-form-quick-sale-button ${styles.button}`}
      title="Record a sale for this product"
    >
      <span className="admin-product-form-quick-sale-icon">💰</span>
      <span className="admin-product-form-quick-sale-label">Record Sale</span>
    </button>
  );
}
