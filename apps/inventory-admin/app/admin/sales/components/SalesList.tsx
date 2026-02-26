'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SalesRecord {
  id: string;
  sale_date: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  profit: number;
  profit_margin: number | null;
  customer_name: string | null;
  order_number: string | null;
  platform: string | null;
  notes: string | null;
  catalog_products?: {
    id: string;
    title: string;
    slug: string;
  };
}

interface SalesListProps {
  onRefresh?: () => void;
  onEdit?: (sale: SalesRecord) => void;
}

export default function SalesList({ onRefresh, onEdit }: SalesListProps) {
  const ITEMS_PER_PAGE = 30;
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('sale_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSales = async (targetPage = currentPage) => {
    setLoading(true);
    try {
      setError(null);
      const params = new URLSearchParams({
        sortBy,
        order,
        page: String(targetPage),
        pageSize: String(ITEMS_PER_PAGE),
        ...(appliedSearch && { search: appliedSearch }),
      });

      const response = await fetch(`/api/sales?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      
      const data = await response.json();
      setSales(data.sales || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    fetchSales(currentPage);
  }, [sortBy, order, currentPage, appliedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, order, appliedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale record?')) return;

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sale');
      
      setNotice('Sale record deleted successfully');
      fetchSales(currentPage);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting sale:', error);
      setError('Failed to delete sale record');
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate summary statistics
  const summary = sales.reduce(
    (acc, sale) => ({
      totalRevenue: acc.totalRevenue + sale.total_price,
      totalCost: acc.totalCost + sale.total_cost,
      totalProfit: acc.totalProfit + sale.profit,
      totalOrders: acc.totalOrders + 1,
      totalUnits: acc.totalUnits + sale.quantity,
    }),
    { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalOrders: 0, totalUnits: 0 }
  );
  return (
    <div>
      {error && (
        <div className="admin-error-banner" style={{ marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #A7F3D0',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A961' }}>{summary.totalOrders}</div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Units</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{summary.totalUnits}</div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9A961' }}>
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Cost</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444' }}>
            {formatCurrency(summary.totalCost)}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Profit</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
            {formatCurrency(summary.totalProfit)}
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              🔍 Search
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Search customer, order number, or channel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                className="admin-btn admin-btn-secondary"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setAppliedSearch('');
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div style={{ flex: '0 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              Sort Field
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="sale_date">Date</option>
              <option value="total_price">Revenue</option>
              <option value="profit">Profit</option>
              <option value="customer_name">Customer</option>
            </select>
          </div>

          <div style={{ flex: '0 1 100px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#666' }}>
              Order
            </label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="desc">Descending ↓</option>
              <option value="asc">Ascending ↑</option>
            </select>
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <button
              onClick={() => {
                void fetchSales(currentPage);
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Showing <strong>{sales.length}</strong> / {totalItems} sales records
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading...
        </div>
      ) : sales.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>No sales records yet</p>
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr className="admin-table-head-row">
                  <th>Date</th>
                  <th>Order Number</th>
                  <th>Product</th>
                  <th className="admin-th-center">Quantity</th>
                  <th className="admin-th-right">Price</th>
                  <th className="admin-th-right">Cost</th>
                  <th className="admin-th-right">Profit</th>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th className="admin-th-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="admin-row-divider">
                    <td className="admin-cell-sm">{formatDate(sale.sale_date)}</td>
                    <td className="admin-cell-sm">
                      {sale.order_number ? (
                        <span className="admin-cell-mono">{sale.order_number}</span>
                      ) : '-'}
                    </td>
                    <td className="admin-cell-sm">
                      {sale.catalog_products ? (
                        <Link
                          href={`/admin/products/${sale.product_id}`}
                          className="admin-link-accent"
                        >
                          {sale.catalog_products.title}
                        </Link>
                      ) : (
                        'Unknown product'
                      )}
                    </td>
                    <td className="admin-cell-center admin-cell-sm">{sale.quantity}</td>
                    <td className="admin-cell-right admin-money admin-cell-sm">{formatCurrency(sale.total_price)}</td>
                    <td className="admin-cell-right admin-money admin-money-danger admin-cell-sm">{formatCurrency(sale.total_cost)}</td>
                    <td style={{
                      color: sale.profit >= 0 ? '#10B981' : '#EF4444',
                    }} className="admin-cell-right admin-money admin-cell-sm">
                      {formatCurrency(sale.profit)}
                      {sale.profit_margin !== null && (
                        <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', fontWeight: 'normal' }}>
                          ({sale.profit_margin.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="admin-cell-sm">{sale.customer_name || '-'}</td>
                    <td className="admin-cell-sm">
                      {sale.platform ? (
                        <span className="admin-pill-soft admin-pill-gold">
                          {sale.platform}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="admin-cell-center">
                      <div className="admin-action-group">
                        <button
                          onClick={() => onEdit?.(sale)}
                          className="admin-btn admin-btn-edit admin-btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="admin-btn admin-btn-delete admin-btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sales.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
