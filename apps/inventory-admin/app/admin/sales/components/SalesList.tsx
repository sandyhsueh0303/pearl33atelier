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
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sale_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        order,
        ...(search && { search }),
      });

      const response = await fetch(`/api/sales?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Failed to load sales records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [sortBy, order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale record?')) return;

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sale');
      
      alert('Sale record deleted successfully');
      fetchSales();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete sale record');
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1976d2'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>{summary.totalOrders}</div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1976d2'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Units</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>{summary.totalUnits}</div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1976d2'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #d32f2f'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Cost</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f' }}>
            {formatCurrency(summary.totalCost)}
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #4caf50'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Profit</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
            {formatCurrency(summary.totalProfit)}
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
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
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
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
                    setTimeout(fetchSales, 0);
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
              onClick={fetchSales}
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
          Showing <strong>{sales.length}</strong> sales records
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          Loading...
        </div>
      ) : sales.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>No sales records yet</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Order Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Product</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Quantity</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Cost</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Profit</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Channel</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(sale.sale_date)}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {sale.order_number ? (
                        <span style={{ fontFamily: 'monospace', color: '#666' }}>{sale.order_number}</span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {sale.catalog_products ? (
                        <Link
                          href={`/admin/products/${sale.product_id}`}
                          style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '500' }}
                        >
                          {sale.catalog_products.title}
                        </Link>
                      ) : (
                        'Unknown product'
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{sale.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>{formatCurrency(sale.total_price)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#d32f2f' }}>{formatCurrency(sale.total_cost)}</td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      color: sale.profit >= 0 ? '#4caf50' : '#d32f2f',
                      fontWeight: 'bold',
                    }}>
                      {formatCurrency(sale.profit)}
                      {sale.profit_margin !== null && (
                        <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', fontWeight: 'normal' }}>
                          ({sale.profit_margin.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{sale.customer_name || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {sale.platform ? (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}>
                          {sale.platform}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => onEdit?.(sale)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
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
    </div>
  );
}
