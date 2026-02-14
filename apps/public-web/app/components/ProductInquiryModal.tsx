import React, { useEffect, useMemo, useState } from 'react';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setError('');
      setLoading(false);
      setCopied(false);
    }
  }, [open]);

  const inquiryContent = useMemo(
    () => `Hi 33 Pearl Atelier,

I am interested in this item:
- Product: ${productTitle}
- Code: ${productSlug}

Name: ${name}
Email: ${email}

Message:
${message}
`,
    [productTitle, productSlug, name, email, message]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await navigator.clipboard.writeText(inquiryContent);
      setCopied(true);
      setSubmitted(true);
    } catch {
      setCopied(false);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Inquiry: ${productTitle} (${productSlug})`);
    const body = encodeURIComponent(inquiryContent);
    window.location.href = `mailto:33pearlatelier@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleOpenInstagram = () => {
    window.open('https://www.instagram.com/33_pearl_atelier/', '_blank');
  };

  const handleOpenWeChat = async () => {
    try {
      await navigator.clipboard.writeText('_33pearlatelier');
    } catch {
      // ignore
    }
    window.location.href = 'weixin://';
    window.setTimeout(() => {
      window.alert('Open WeChat and search "_33pearlatelier" to start chatting.');
    }, 250);
  };

  const handleCopyAgain = async () => {
    try {
      await navigator.clipboard.writeText(inquiryContent);
      setCopied(true);
      window.alert('Inquiry message copied.');
    } catch {
      window.alert('Failed to copy inquiry message. Please try again.');
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
          <div style={{ marginTop: 18 }}>
            <h3 style={{ marginBottom: 8, fontSize: 20 }}>Your inquiry is ready ✨</h3>
            <p style={{ color: copied ? '#2e7d32' : '#888', fontSize: 14, marginBottom: 16 }}>
              {copied ? 'Your inquiry details were copied to clipboard.' : 'Clipboard permission denied. You can still send by email.'}
            </p>

            <div style={{ border: '1px solid #e9e1cf', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>A. Send via Email</div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 10 }}>We&apos;ll reply within 24-48 hours.</div>
              <button
                type="button"
                onClick={handleSendEmail}
                style={{ width: '100%', padding: 10, background: '#2d2d2d', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Send via Email
              </button>
            </div>

            <div style={{ border: '1px solid #e9e1cf', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>B. Copy &amp; Message Us Directly</div>
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
                <button type="button" onClick={handleOpenInstagram} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                  Instagram
                </button>
                <button type="button" onClick={handleOpenWeChat} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                  WeChat
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyAgain}
                style={{ marginTop: 10, width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
              >
                Copy Inquiry Again
              </button>
            </div>
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
