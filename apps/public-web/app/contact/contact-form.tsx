'use client'

import { useState } from 'react'
import { colors, typography, spacing, transitions } from '../constants/design'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div>
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.medium,
          color: colors.darkGray,
          marginBottom: spacing.xs,
          textAlign: 'center',
        }}
      >
        Quick Inquiry
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing['2xl'],
          textAlign: 'center',
        }}
      >
        Fill out the form below and we&apos;ll get back to you shortly, or for a faster reply, scroll to the footer and contact us via Instagram, WeChat, WhatsApp, or Email.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: spacing.lg }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.xs,
            }}
          >
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
              padding: spacing.md,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              backgroundColor: '#FFFEFC',
              fontSize: typography.fontSize.base,
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

        {/* Email */}
        <div style={{ marginBottom: spacing.lg }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.xs,
            }}
          >
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
              padding: spacing.md,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              backgroundColor: '#FFFEFC',
              fontSize: typography.fontSize.base,
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

        {/* Subject */}
        <div style={{ marginBottom: spacing.lg }}>
          <label
            htmlFor="subject"
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.xs,
            }}
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: spacing.md,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: '10px',
              fontSize: typography.fontSize.base,
              color: colors.darkGray,
              transition: transitions.normal,
              outline: 'none',
              backgroundColor: '#FFFEFC',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.gold
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.lightGray
            }}
          >
            <option value="">Select a subject</option>
            <option value="general">General Question</option>
            <option value="product">Product Inquiry</option>
            <option value="shipping">Shipping & Delivery</option>
            <option value="care">Care & Maintenance</option>
            <option value="order">Order Status</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div style={{ marginBottom: spacing.xl }}>
          <label
            htmlFor="message"
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.darkGray,
              marginBottom: spacing.xs,
            }}
          >
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
              borderRadius: '10px',
              backgroundColor: '#FFFEFC',
              fontSize: typography.fontSize.base,
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            width: '100%',
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: colors.darkGray,
            color: colors.white,
            border: 'none',
            borderRadius: '4px',
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            letterSpacing: '0.05em',
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
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {/* Status Messages */}
        {status === 'success' && (
          <div
            style={{
              marginTop: spacing.lg,
              padding: spacing.md,
              backgroundColor: 'rgba(201, 169, 97, 0.1)',
              border: `1px solid ${colors.gold}`,
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: colors.gold, fontSize: typography.fontSize.base, margin: 0 }}>
              ✓ Thank you! We'll respond within 24 hours.
            </p>
          </div>
        )}

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
              Something went wrong. Please try again or email us directly.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
