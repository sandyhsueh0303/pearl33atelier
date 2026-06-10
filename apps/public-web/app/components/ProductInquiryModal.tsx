import { type FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './ProductInquiryModal.module.css'

interface ProductInquiryModalProps {
  open: boolean
  onClose: () => void
  productTitle: string
  productSlug: string
}

export default function ProductInquiryModal({
  open,
  onClose,
  productTitle,
  productSlug,
}: ProductInquiryModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      setSubmitted(false)
      setError('')
      setLoading(false)
      setCopied(false)
    }
  }, [open])

  const inquiryContent = useMemo(
    () => `Hi 33 Pearl Atelier,

I am interested in this item:
- Product: ${productTitle}
- Code: ${productSlug}

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
`,
    [productTitle, productSlug, name, email, phone, message]
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await navigator.clipboard.writeText(inquiryContent)
      setCopied(true)
      setSubmitted(true)
    } catch {
      setCopied(false)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Inquiry: ${productTitle} (${productSlug})`)
    const body = encodeURIComponent(inquiryContent)
    window.location.href = `mailto:hello@33pearlatelier.com?subject=${subject}&body=${body}`
  }

  const handleOpenInstagram = () => {
    window.open('https://www.instagram.com/33_pearl_atelier/', '_blank')
  }

  const handleOpenWeChat = async () => {
    const wechatId = '_33pearlatelier'

    try {
      await navigator.clipboard.writeText(wechatId)
      window.alert(`WeChat ID copied: ${wechatId}`)
    } catch {
      window.alert(`Unable to copy automatically. Please search WeChat ID: ${wechatId}`)
    }

    window.location.href = 'weixin://'
  }

  const handleOpenLine = () => {
    window.open('https://line.me/R/ti/p/~sandyhsiue0303', '_blank')
  }

  const handleCopyAgain = async () => {
    try {
      await navigator.clipboard.writeText(inquiryContent)
      setCopied(true)
      window.alert('Inquiry message copied.')
    } catch {
      window.alert('Failed to copy inquiry message. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close inquiry modal">
          ×
        </button>
        <h2 className={styles.title}>Product Inquiry</h2>
        <div className={styles.productMeta}>
          For: <b>{productTitle}</b> (Code: {productSlug})
        </div>

        {submitted ? (
          <div className={styles.result}>
            <h3 className={styles.resultTitle}>Your inquiry is ready</h3>
            <p className={copied ? styles.successMessage : styles.mutedMessage}>
              {copied
                ? 'Your inquiry details were copied to clipboard.'
                : 'Clipboard permission denied. You can still send by email.'}
            </p>

            <div className={styles.channelCard}>
              <div className={styles.channelTitle}>A. Send via Email</div>
              <div className={styles.channelHelper}>We&apos;ll reply within 24-48 hours.</div>
              <button type="button" onClick={handleSendEmail} className={styles.primaryButton}>
                Send via Email
              </button>
            </div>

            <div className={styles.channelCard}>
              <div className={styles.channelTitle}>B. Copy &amp; Message Us Directly</div>
              <div className={styles.socialGrid}>
                <button type="button" onClick={handleOpenInstagram} className={styles.secondaryButton}>
                  Instagram
                </button>
                <button type="button" onClick={handleOpenWeChat} className={styles.secondaryButton}>
                  WeChat
                </button>
                <button type="button" onClick={handleOpenLine} className={styles.secondaryButton}>
                  LINE
                </button>
              </div>
              <button type="button" onClick={handleCopyAgain} className={styles.copyButton}>
                Copy Inquiry Again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <textarea
                placeholder="Message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
