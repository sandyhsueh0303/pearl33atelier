'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './SalesForm.module.css';

interface Product {
  id: string;
  title: string;
  slug: string;
  pearl_type: string;
  sell_price: number | null;
}

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

interface SalesFormProps {
  onSuccess?: () => void;
  preselectedProductId?: string;
  editSale?: SaleRecord;
  onCancelEdit?: () => void;
}

export default function SalesForm({ onSuccess, preselectedProductId, editSale, onCancelEdit }: SalesFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pearlTypeFilter, setPearlTypeFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  // Form data
  const [productId, setProductId] = useState(preselectedProductId || '');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated values
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [profit, setProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  const fetchNextOrderNumber = async () => {
    try {
      const response = await fetch('/api/sales?page=1&pageSize=1');
      if (!response.ok) return;
      const data = await response.json();
      const totalItems = Number(data?.pagination?.totalItems || 0);
      setOrderNumber(String(totalItems + 1));
    } catch (error) {
      console.error('Failed to fetch next order number:', error);
    }
  };

  const pearlTypeOptions = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        products
          .flatMap((p) => p.pearl_type.split(',').map((item) => item.trim()))
          .filter(Boolean)
      )
    );
    return uniqueTypes.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const pearlTypeMatched =
        pearlTypeFilter === 'all' || product.pearl_type.includes(pearlTypeFilter);
      const searchMatched =
        q.length === 0 ||
        product.title.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q);
      return pearlTypeMatched && searchMatched;
    });
  }, [products, pearlTypeFilter, productSearch]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const pageSize = 100;
        let page = 1;
        let totalPages = 1;
        const allProducts: Product[] = [];

        while (page <= totalPages) {
          const response = await fetch(
            `/api/products?page=${page}&pageSize=${pageSize}&status=all&sortBy=title&sortOrder=asc`,
            { cache: 'no-store' }
          );
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          allProducts.push(...(data.products || []));
          totalPages = data.pagination?.totalPages || 1;
          page += 1;
        }

        const dedupedProducts = Array.from(
          new Map(allProducts.map((product) => [product.id, product])).values()
        );
        setProducts(dedupedProducts);

        // If preselected, fetch its cost automatically
        if (preselectedProductId && !editSale) {
          fetchProductCost(preselectedProductId);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [preselectedProductId, editSale]);

  // Update form when editSale changes
  useEffect(() => {
    if (editSale) {
      setProductId(editSale.product_id);
      setQuantity(editSale.quantity.toString());
      setUnitPrice(editSale.unit_price.toString());
      setUnitCost(editSale.unit_cost.toString());
      setSaleDate(editSale.sale_date);
      setCustomerName(editSale.customer_name || '');
      setOrderNumber(editSale.order_number?.toString() || '');
      setPlatform(editSale.platform || '');
      setNotes(editSale.notes || '');
    }
  }, [editSale]);

  // Prefill next order number for new sale
  useEffect(() => {
    if (!editSale) {
      void fetchNextOrderNumber();
    }
  }, [editSale]);

  // Fetch product cost when product is selected
  const fetchProductCost = async (prodId: string) => {
    if (!prodId) return;

    setLoadingCost(true);
    try {
      setFormError(null);
      const response = await fetch(`/api/sales/product-cost/${prodId}`);
      if (!response.ok) throw new Error('Failed to fetch product cost');
      
      const data = await response.json();
      setUnitPrice(data.sell_price.toString());
      setUnitCost(data.unit_cost.toString());
    } catch (error) {
      console.error('Error fetching product cost:', error);
      setFormError('Failed to load product cost. Please enter manually.');
    } finally {
      setLoadingCost(false);
    }
  };

  useEffect(() => {
    if (!formNotice) return;
    const timer = window.setTimeout(() => setFormNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [formNotice]);

  // Auto-calculate when quantity, price, or cost changes
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const cost = parseFloat(unitCost) || 0;

    const total_price = qty * price;
    const total_cost = qty * cost;
    const profit_amt = total_price - total_cost;
    const profit_pct = total_price > 0 ? (profit_amt / total_price) * 100 : 0;

    setTotalPrice(total_price);
    setTotalCost(total_cost);
    setProfit(profit_amt);
    setProfitMargin(profit_pct);
  }, [quantity, unitPrice, unitCost]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    setProductId(prodId);
    if (prodId) {
      fetchProductCost(prodId);
    } else {
      setUnitPrice('');
      setUnitCost('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !quantity || !unitPrice || unitCost === '') {
      setFormError('Please fill in all required fields');
      return;
    }

    const parsedOrderNumber =
      orderNumber.trim() === '' ? null : Number.parseInt(orderNumber.trim(), 10);
    if (parsedOrderNumber !== null && Number.isNaN(parsedOrderNumber)) {
      setFormError('Order number must be a valid number');
      return;
    }

    setLoading(true);
    try {
      setFormError(null);
      const url = editSale ? `/api/sales/${editSale.id}` : '/api/sales';
      const method = editSale ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity: parseInt(quantity),
          unit_price: parseFloat(unitPrice),
          unit_cost: parseFloat(unitCost),
          sale_date: saleDate,
          customer_name: customerName || null,
          order_number: parsedOrderNumber,
          platform: platform || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editSale ? 'update' : 'create'} sale`);
      }

      setFormNotice(editSale ? 'Sales record updated! ✅' : 'Sales record created! ✅');
      
      // Reset form only for new records
      if (!editSale) {
        // Reset form only for new records
        if (!preselectedProductId) {
          setProductId('');
        }
        setQuantity('1');
        setUnitPrice('');
        setUnitCost('');
        setSaleDate(new Date().toISOString().split('T')[0]);
        setCustomerName('');
        await fetchNextOrderNumber();
        setPlatform('');
        setNotes('');
      }

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating sale:', error);
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card admin-form-card">
      {formError && (
        <div className="admin-error-banner">
          <strong>Error:</strong> {formError}
        </div>
      )}
      {formNotice && (
        <div className="admin-banner admin-banner-success">
          {formNotice}
        </div>
      )}
      <div className="admin-section-header">
        <h2 className="admin-section-title">{editSale ? 'Edit Sales Record' : 'Record New Sale'}</h2>
        {editSale && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>

      <div>
        <div className="admin-form-section">
          <div className={`admin-form-grid-2 ${styles.filterGrid}`}>
            <div>
              <label className={`admin-form-label ${styles.compactLabel}`} htmlFor="sales-pearl-type-filter">
                Pearl Type Filter
              </label>
              <select
                id="sales-pearl-type-filter"
                value={pearlTypeFilter}
                onChange={(e) => setPearlTypeFilter(e.target.value)}
                disabled={!!preselectedProductId}
                className="admin-control"
              >
                <option value="all">All Pearl Types</option>
                {pearlTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`admin-form-label ${styles.compactLabel}`} htmlFor="sales-product-search">
                Search Product
              </label>
              <input
                id="sales-product-search"
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                disabled={!!preselectedProductId}
                placeholder="Search by title or slug..."
                className="admin-control"
              />
            </div>
          </div>

          <label className="admin-form-label" htmlFor="sales-product">
            Product <span className="admin-form-required">*</span>
          </label>
          <select
            id="sales-product"
            value={productId}
            onChange={handleProductChange}
            required
            disabled={!!preselectedProductId || loadingCost}
            className="admin-control"
          >
            <option value="">Select product...</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} ({product.pearl_type}) (${product.sell_price ?? 0})
              </option>
            ))}
          </select>
          <div className="admin-form-help admin-form-help-inline">
            Showing {filteredProducts.length} / {products.length} products
          </div>
          {loadingCost && (
            <div className={`admin-section-meta ${styles.costLoading}`}>
              Loading product cost...
            </div>
          )}
        </div>

        <div className="admin-form-grid-auto">
          <div>
            <label className="admin-form-label" htmlFor="sales-quantity">
              Quantity <span className="admin-form-required">*</span>
            </label>
            <input
              id="sales-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              required
              className="admin-control"
            />
          </div>

          <div>
            <label className="admin-form-label" htmlFor="sales-unit-price">
              Unit Price <span className="admin-form-required">*</span>
            </label>
            <input
              id="sales-unit-price"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              min="0"
              step="0.01"
              required
              className="admin-control"
            />
          </div>

          <div>
            <label className="admin-form-label" htmlFor="sales-unit-cost">
              Unit Cost <span className="admin-form-required">*</span>
            </label>
            <input
              id="sales-unit-cost"
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              min="0"
              step="0.01"
              required
              className="admin-control"
            />
          </div>
        </div>

        {(totalPrice > 0 || totalCost > 0) && (
          <div className="admin-value-panel admin-value-panel-neutral">
            <div className={`admin-form-grid-auto ${styles.valueGrid}`}>
              <div>
                <div className="admin-value-panel-label">Total Price</div>
                <div className={`admin-value-panel-amount ${styles.amount} ${styles.goldAmount}`}>
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="admin-value-panel-label">Total Cost</div>
                <div className={`admin-value-panel-amount ${styles.amount} ${styles.negativeAmount}`}>
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="admin-value-panel-label">Profit</div>
                <div className={`admin-value-panel-amount ${styles.amount} ${profit >= 0 ? styles.positiveAmount : styles.negativeAmount}`}>
                  ${profit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="admin-value-panel-label">Profit Margin</div>
                <div className={`admin-value-panel-amount ${styles.amount} ${profitMargin >= 0 ? styles.positiveAmount : styles.negativeAmount}`}>
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="admin-form-section">
          <label className="admin-form-label" htmlFor="sales-date">
            Sale Date
          </label>
          <input
            id="sales-date"
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="admin-control"
          />
        </div>

        <div className="admin-form-grid-2">
          <div>
            <label className="admin-form-label" htmlFor="sales-customer-name">
              Customer Name
            </label>
            <input
              id="sales-customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="admin-control"
            />
          </div>

          <div>
            <label className="admin-form-label" htmlFor="sales-order-number">
              Order Number
            </label>
            <input
              id="sales-order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Optional"
              className="admin-control"
            />
          </div>
        </div>

        <div className="admin-form-section">
          <label className="admin-form-label" htmlFor="sales-platform">
            Sales Channel
          </label>
          <select
            id="sales-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="admin-control"
          >
            <option value="">Select channel...</option>
            <option value="website">Website</option>
            <option value="instagram">Instagram</option>
            <option value="wechat">WeChat</option>
            <option value="line">LINE</option>
            <option value="facebook">Facebook</option>
            <option value="in-store">In-store</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="admin-form-section">
          <label className="admin-form-label" htmlFor="sales-notes">
            Notes
          </label>
          <textarea
            id="sales-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="OptionalNotes..."
            rows={3}
            className={`admin-control ${styles.notesTextarea}`}
          />
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            disabled={loading || loadingCost}
            className={`admin-btn admin-btn-primary ${styles.submitButton}`}
          >
            {loading ? (editSale ? 'Updating...' : 'Saving...') : (editSale ? '💾 Update Sale' : '💰 Record Sale')}
          </button>
          {editSale && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="admin-btn admin-btn-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
