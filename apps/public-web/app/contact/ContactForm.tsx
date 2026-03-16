'use client'

import { useState } from 'react'
import { colors, typography, spacing, transitions } from '../constants/design'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ready' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const inquiryTypeLabel =
    {
      general: 'General Inquiry',
      custom_design: 'Custom Design',
      pearl_care: 'Pearl Care',
      redesign_service: 'Redesign Service',
    }[formData.inquiryType] || 'Not selected'

  const buildMessage = () => `Hi 33 Pearl Atelier,

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Inquiry Type: ${inquiryTypeLabel}
Subject: ${formData.subject || 'Not provided'}

Message:
${formData.message}
`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setCopied(false)

    try {
      await navigator.clipboard.writeText(buildMessage())
      setCopied(true)
      setStatus('ready')
    } catch {
      // Clipboard can fail on some browsers; still let user continue via email.
      setCopied(false)
      setStatus('ready')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent(formData.subject || inquiryTypeLabel || 'Contact Inquiry')
    const body = encodeURIComponent(buildMessage())
    window.location.href = `mailto:33pearlatelier@gmail.com?subject=${subject}&body=${body}`
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
      await navigator.clipboard.writeText(buildMessage())
      setCopied(true)
      window.alert('Message copied.')
    } catch {
      setStatus('error')
    }
  }

  const labelStyle = {
    display: 'block',
    fontSize: typography.fontSize.xs,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: typography.fontWeight.medium,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  }

  return (
    <div>
      <h2
        style={{
          fontSize: 'clamp(2rem, 3.4vw, 2.3rem)',
          fontWeight: typography.fontWeight.medium,
          color: colors.darkGray,
          marginBottom: spacing.sm,
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}
      >
        Quick Inquiry
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
          textAlign: 'center',
          lineHeight: typography.lineHeight.relaxed,
        }}
      >
        Use this form for ready-to-wear inquiries, custom design requests, pearl care questions, or redesign service.
        <br />
        We&apos;ll get back to you within 24 hours. Prefer direct contact? Use Instagram, WeChat, or email links above.
      </p>

      {status === 'ready' ? (
        <div style={{ marginTop: spacing.lg }}>
          <h3 style={{ marginBottom: spacing.sm, fontSize: typography.fontSize.xl }}>
            Your message is ready ✨
          </h3>
          <p style={{ color: copied ? '#2e7d32' : colors.textSecondary, marginBottom: spacing.lg }}>
            {copied
              ? 'Your message has been copied to clipboard.'
              : 'Clipboard permission denied. You can still send by email.'}
          </p>

          <div
            style={{
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '8px',
              padding: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <p style={{ marginBottom: spacing.sm, fontWeight: typography.fontWeight.medium }}>
              A. Send via Email
            </p>
            <button
              type="button"
              onClick={handleSendEmail}
              style={{
                width: '100%',
                padding: spacing.sm,
                backgroundColor: colors.darkGray,
                color: colors.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Send via Email
            </button>
          </div>

          <div
            style={{
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '8px',
              padding: spacing.md,
            }}
          >
            <p style={{ marginBottom: spacing.sm, fontWeight: typography.fontWeight.medium }}>
              B. Message Us Directly
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: spacing.sm }}>
              <button
                type="button"
                onClick={handleOpenInstagram}
                style={{
                  padding: spacing.sm,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '6px',
                  backgroundColor: colors.white,
                  cursor: 'pointer',
                }}
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={handleOpenWeChat}
                style={{
                  padding: spacing.sm,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '6px',
                  backgroundColor: colors.white,
                  cursor: 'pointer',
                }}
              >
                WeChat
              </button>
              <button
                type="button"
                onClick={handleOpenLine}
                style={{
                  padding: spacing.sm,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '6px',
                  backgroundColor: colors.white,
                  cursor: 'pointer',
                }}
              >
                LINE
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyAgain}
              style={{
                marginTop: spacing.sm,
                width: '100%',
                padding: spacing.sm,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '6px',
                backgroundColor: colors.white,
                cursor: 'pointer',
              }}
            >
              Copy Message Again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: spacing.lg }}>
            <label htmlFor="name" style={labelStyle}>
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '8px',
                backgroundColor: '#FFFEFC',
                fontSize: typography.fontSize.sm,
                color: colors.darkGray,
                transition: transitions.normal,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.gold
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.lightGray
              }}
            />
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label htmlFor="email" style={labelStyle}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '8px',
                backgroundColor: '#FFFEFC',
                fontSize: typography.fontSize.sm,
                color: colors.darkGray,
                transition: transitions.normal,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.gold
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.lightGray
              }}
            />
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label htmlFor="phone" style={labelStyle}>
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '8px',
                backgroundColor: '#FFFEFC',
                fontSize: typography.fontSize.sm,
                color: colors.darkGray,
                transition: transitions.normal,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.gold
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.lightGray
              }}
            />
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label htmlFor="inquiryType" style={labelStyle}>
              Inquiry Type
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  paddingRight: '2.4rem',
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  fontSize: typography.fontSize.sm,
                  color: colors.darkGray,
                  transition: transitions.normal,
                  outline: 'none',
                  backgroundColor: '#FFFEFC',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.gold
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.lightGray
                }}
              >
                <option value="">Select an inquiry type</option>
                <option value="general">General Inquiry</option>
                <option value="custom_design">Custom Design</option>
                <option value="pearl_care">Pearl Care</option>
                <option value="redesign_service">Redesign Service</option>
              </select>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '0.95rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.xs,
                  pointerEvents: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                ▼
              </span>
            </div>
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label htmlFor="subject" style={labelStyle}>
              Subject / Topic
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  backgroundColor: '#FFFEFC',
                  fontSize: typography.fontSize.sm,
                  color: colors.darkGray,
                  transition: transitions.normal,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.gold
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.lightGray
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: spacing.xl }}>
            <label htmlFor="message" style={labelStyle}>
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: spacing.md,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '8px',
                backgroundColor: '#FFFEFC',
                fontSize: typography.fontSize.sm,
                color: colors.darkGray,
                transition: transitions.normal,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.gold
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.lightGray
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.xl}`,
              backgroundColor: colors.darkGray,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
              transition: transitions.normal,
              opacity: status === 'submitting' ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (status !== 'submitting') {
                e.currentTarget.style.backgroundColor = colors.gold
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.darkGray
            }}
          >
            {status === 'submitting' ? 'Preparing...' : 'Send Message'}
          </button>

          {status === 'error' && (
            <div
              style={{
                marginTop: spacing.lg,
                padding: spacing.md,
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid #dc3545',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#dc3545', fontSize: typography.fontSize.base, margin: 0 }}>
                Failed to copy message. Please try again.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
