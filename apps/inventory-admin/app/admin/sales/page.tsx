'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SalesForm from './components/SalesForm';
import SalesList from './components/SalesList';
import AdminPageHeader from '../components/AdminPageHeader';

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

  const refreshSalesList = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateSaleSuccess = () => {
    refreshSalesList();
    setEditingSale(null);
    setShowForm(false);
  };

  const handleUpdateSaleSuccess = () => {
    // Hide edit form and keep list state (page/scroll/filters) unchanged.
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
      <AdminPageHeader
        title="Sales"
        onRefresh={handleRefresh}
        refreshLabel="Reload sales list"
        refreshing={refreshing}
        actions={
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
        }
      />

      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <SalesForm 
            onSuccess={editingSale ? handleUpdateSaleSuccess : handleCreateSaleSuccess}
            preselectedProductId={editingSale ? undefined : (preselectedProductId || undefined)}
            editSale={editingSale || undefined}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      )}

      <div>
        <SalesList 
          key={refreshKey} 
          onRefresh={handleCreateSaleSuccess}
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
