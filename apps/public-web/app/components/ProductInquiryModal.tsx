import React, { useState } from 'react';

interface ProductInquiryModalProps {
  open: boolean;
  onClose: () => void;
  productTitle: string;
  productSlug: string;
}

const ProductInquiryModal: React.FC<ProductInquiryModalProps> = ({ open, onClose, productTitle, productSlug }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Replace with actual API endpoint
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        maxWidth: 400,
        width: '100%',
        padding: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
        <h2 style={{ marginBottom: 16, fontSize: 22 }}>Product Inquiry</h2>
        <div style={{ marginBottom: 8, color: '#888', fontSize: 14 }}>For: <b>{productTitle}</b> (Code: {productSlug})</div>
        {submitted ? (
          <div style={{ color: '#2e7d32', fontWeight: 500, fontSize: 16, textAlign: 'center', margin: '32px 0' }}>
            Thank you! We have received your inquiry.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea
                placeholder="Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#bfa46b', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              {loading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductInquiryModal;
