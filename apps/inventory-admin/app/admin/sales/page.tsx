'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SalesForm from './components/SalesForm';
import SalesList from './components/SalesList';

interface SaleRecord {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  sale_date: string;
  customer_name: string | null;
  order_number: string | null;
  platform: string | null;
  notes: string | null;
}

export default function SalesPage() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);

  // Auto-show form if a product is preselected
  useEffect(() => {
    if (preselectedProductId) {
      setShowForm(true);
      setEditingSale(null);
    }
  }, [preselectedProductId]);

  const handleSaleSuccess = () => {
    // Trigger refresh of the sales list
    setRefreshKey(prev => prev + 1);
    setEditingSale(null);
    setShowForm(false);
  };

  const handleEdit = (sale: SaleRecord) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
    setShowForm(false);
  };

  const handleNewSale = () => {
    setEditingSale(null);
    setShowForm(true);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>銷售管理</h1>
        <button
          onClick={() => {
            if (showForm && !editingSale) {
              setShowForm(false);
            } else {
              handleNewSale();
            }
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: (showForm && !editingSale) ? '#f5f5f5' : '#1976d2',
            color: (showForm && !editingSale) ? '#333' : 'white',
            border: (showForm && !editingSale) ? '1px solid #ddd' : 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {(showForm && !editingSale) ? '隱藏表單' : '+ 記錄新銷售'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <SalesForm 
            onSuccess={handleSaleSuccess}
            preselectedProductId={editingSale ? undefined : (preselectedProductId || undefined)}
            editSale={editingSale || undefined}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      )}

      <div>
        <SalesList 
          key={refreshKey} 
          onRefresh={handleSaleSuccess}
          onEdit={handleEdit}
        />
      </div>
    </main>
  );
}
