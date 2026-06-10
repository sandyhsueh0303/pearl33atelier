'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './SalesList.module.css';

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
  order_number: number | null;
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

interface SalesSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalUnits: number;
}

export default function SalesList({ onRefresh, onEdit }: SalesListProps) {
  const ITEMS_PER_PAGE = 30;
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [summary, setSummary] = useState<SalesSummary>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalOrders: 0,
    totalUnits: 0,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('order_number');
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
    void fetchSummary();
  }, [appliedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, order, appliedSearch]);

  useEffect(() => {
    if (loading) return;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, loading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };

  const fetchSummary = async () => {
    try {
      const pageSize = 100;
      let page = 1;
      let totalPagesForSummary = 1;
      const allSales: SalesRecord[] = [];

      while (page <= totalPagesForSummary) {
        const params = new URLSearchParams({
          sortBy: 'order_number',
          order: 'desc',
          page: String(page),
          pageSize: String(pageSize),
          ...(appliedSearch && { search: appliedSearch }),
        });

        const response = await fetch(`/api/sales?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch sales summary');

        const data = await response.json();
        allSales.push(...(data.sales || []));
        totalPagesForSummary = data.pagination?.totalPages || 1;
        page += 1;
      }

      const nextSummary = allSales.reduce(
        (acc, sale) => ({
          totalRevenue: acc.totalRevenue + sale.total_price,
          totalCost: acc.totalCost + sale.total_cost,
          totalProfit: acc.totalProfit + sale.profit,
          totalOrders: acc.totalOrders + 1,
          totalUnits: acc.totalUnits + sale.quantity,
        }),
        { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalOrders: 0, totalUnits: 0 }
      );

      setSummary(nextSummary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
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

  const totalProfitMargin = summary.totalRevenue > 0
    ? (summary.totalProfit / summary.totalRevenue) * 100
    : 0;
  return (
    <div>
      {error && (
        <div className={`admin-error-banner ${styles.banner}`}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div className={styles.notice}>
          {notice}
        </div>
      )}

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Orders</div>
          <div className={`${styles.summaryValue} ${styles.goldText}`}>{summary.totalOrders}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Units</div>
          <div className={`${styles.summaryValue} ${styles.positiveText}`}>{summary.totalUnits}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Revenue</div>
          <div className={`${styles.summaryValue} ${styles.goldText}`}>
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Cost</div>
          <div className={`${styles.summaryValue} ${styles.negativeText}`}>
            {formatCurrency(summary.totalCost)}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Profit</div>
          <div className={`${styles.summaryValue} ${styles.positiveText}`}>
            {formatCurrency(summary.totalProfit)}
          </div>
          <div className={styles.marginText}>
            {totalProfitMargin.toFixed(1)}% Profit Margin
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className={`admin-card ${styles.filterCard}`}>
        <div className={styles.filterRow}>
          <div className={styles.searchFilter}>
            <label className={styles.filterLabel} htmlFor="sales-list-search">
              🔍 Search
            </label>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                id="sales-list-search"
                type="text"
                placeholder="Search customer, order number, or channel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button
                type="submit"
                className={`admin-btn admin-btn-secondary ${styles.filterButton}`}
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
                  className={styles.clearButton}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div className={styles.sortByFilter}>
            <label className={styles.filterLabel} htmlFor="sales-sort-by">
              Sort Field
            </label>
            <select
              id="sales-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.selectControl}
            >
              <option value="order_number">Order Number</option>
              <option value="total_price">Revenue</option>
              <option value="profit">Profit</option>
              <option value="customer_name">Customer</option>
            </select>
          </div>

          <div className={styles.orderFilter}>
            <label className={styles.filterLabel} htmlFor="sales-sort-order">
              Order
            </label>
            <select
              id="sales-sort-order"
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              className={styles.selectControl}
            >
              <option value="desc">Descending ↓</option>
              <option value="asc">Ascending ↑</option>
            </select>
          </div>

          <div className={styles.refreshFilter}>
            <button
              onClick={() => {
                void fetchSales(currentPage);
              }}
              className={styles.clearButton}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className={styles.resultText}>
          Showing <strong>{sales.length}</strong> / {totalItems} sales records
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className={`admin-card ${styles.emptyCard}`}>
          Loading...
        </div>
      ) : sales.length === 0 ? (
        <div className={`admin-card ${styles.emptyCard}`}>
          <p className={styles.emptyText}>No sales records yet</p>
        </div>
      ) : (
        <div className={`admin-card ${styles.tableCard}`}>
          <div className={styles.tableScroll}>
            <table className={`admin-table ${styles.table}`}>
              <thead>
                <tr className="admin-table-head-row">
                  <th>Order Number</th>
                  <th>Product</th>
                  <th className="admin-th-center">Quantity</th>
                  <th className="admin-th-right">Price</th>
                  <th className="admin-th-right">Cost</th>
                  <th className="admin-th-right">Profit</th>
                  <th>Customer</th>
                  <th className="admin-th-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="admin-row-divider">
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
                    <td className={`admin-cell-right admin-money admin-cell-sm ${sale.profit >= 0 ? styles.positiveText : styles.negativeText}`}>
                      {formatCurrency(sale.profit)}
                      {sale.profit_margin !== null && (
                        <span className={styles.profitMarginInline}>
                          ({sale.profit_margin.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="admin-cell-sm">{sale.customer_name || '-'}</td>
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
        <div className={styles.pagination}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles.paginationLabel}>
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
