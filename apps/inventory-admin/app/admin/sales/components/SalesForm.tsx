'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  slug: string;
  sell_price: number;
}

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

interface SalesFormProps {
  onSuccess?: () => void;
  preselectedProductId?: string;
  editSale?: SaleRecord;
  onCancelEdit?: () => void;
}

export default function SalesForm({ onSuccess, preselectedProductId, editSale, onCancelEdit }: SalesFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products || []);

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
      setOrderNumber(editSale.order_number || '');
      setPlatform(editSale.platform || '');
      setNotes(editSale.notes || '');
    }
  }, [editSale]);

  // Fetch product cost when product is selected
  const fetchProductCost = async (prodId: string) => {
    if (!prodId) return;

    setLoadingCost(true);
    try {
      const response = await fetch(`/api/sales/product-cost/${prodId}`);
      if (!response.ok) throw new Error('Failed to fetch product cost');
      
      const data = await response.json();
      setUnitPrice(data.sell_price.toString());
      setUnitCost(data.unit_cost.toString());
    } catch (error) {
      console.error('Error fetching product cost:', error);
      alert('Failed to load product cost. Please enter manually.');
    } finally {
      setLoadingCost(false);
    }
  };

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
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
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
          order_number: orderNumber || null,
          platform: platform || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editSale ? 'update' : 'create'} sale`);
      }

      alert(editSale ? 'Sales record updated! ✅' : 'Sales record created! ✅');
      
      // Reset form or call cancel if editing
      if (editSale && onCancelEdit) {
        onCancelEdit();
      } else if (!editSale) {
        // Reset form only for new records
        if (!preselectedProductId) {
          setProductId('');
        }
        setQuantity('1');
        setUnitPrice('');
        setUnitCost('');
        setSaleDate(new Date().toISOString().split('T')[0]);
        setCustomerName('');
        setOrderNumber('');
        setPlatform('');
        setNotes('');
      }

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating sale:', error);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{editSale ? 'Edit Sales Record' : 'Record New Sale'}</h2>
        {editSale && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Product Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
            Product <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <select
            value={productId}
            onChange={handleProductChange}
            required
            disabled={!!preselectedProductId || loadingCost}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} (${product.sell_price})
              </option>
            ))}
          </select>
          {loadingCost && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              Loading product cost...
            </div>
          )}
        </div>

        {/* Quantity, Price, Cost */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
              Quantity <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
              Unit Price <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              min="0"
              step="0.01"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
              Unit Cost <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              min="0"
              step="0.01"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Calculated Values Display */}
        {(totalPrice > 0 || totalCost > 0) && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Total Price</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9A961' }}>
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Total Cost</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EF4444' }}>
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Profit</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: profit >= 0 ? '#10B981' : '#EF4444'
                }}>
                  ${profit.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Profit Margin</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: profitMargin >= 0 ? '#10B981' : '#EF4444'
                }}>
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sale Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
            Sale Date
          </label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Optional Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
              Order Number
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Optional"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Platform */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
            Sales Channel
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
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

        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem', color: '#666' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="OptionalNotes..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading || loadingCost}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: loading ? '#e0e0e0' : '#C9A961',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (editSale ? 'Updating...' : 'Saving...') : (editSale ? '💾 Update Sale' : '💰 Record Sale')}
          </button>
          {editSale && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
