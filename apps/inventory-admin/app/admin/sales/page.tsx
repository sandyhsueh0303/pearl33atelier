'use client';

import { Suspense, useState } from 'react';
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
  order_number: number | null;
  platform: string | null;
  notes: string | null;
}

function SalesPageContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 300);
  };

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title-row">
          <h1 className="admin-page-title">Sales</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="admin-btn admin-btn-secondary"
            style={{ backgroundColor: refreshing ? '#e0e0e0' : '#f5f5f5', cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.6 : 1 }}
            title="Reload sales list"
          >
            {refreshing ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        <button
          onClick={() => {
            if (showForm && !editingSale) {
              setShowForm(false);
            } else {
              handleNewSale();
            }
          }}
          className={(showForm && !editingSale) ? 'admin-btn admin-btn-secondary' : 'admin-btn admin-btn-primary'}
        >
          {(showForm && !editingSale) ? 'Hide Form' : '+ Record New Sale'}
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

export default function SalesPage() {
  return (
    <Suspense fallback={<main className="admin-page">Loading...</main>}>
      <SalesPageContent />
    </Suspense>
  )
}
