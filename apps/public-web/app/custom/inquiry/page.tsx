'use client'

import { useState } from 'react'
import { colors, typography, spacing } from '../../constants/design'
import { pageHeroStyles } from '../../constants/pageHero'
import PageHero from '../../components/PageHero'

export default function CustomInquiryPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [] as string[],
    pearlTypes: [] as string[],
    metalPreference: '',
    timeline: '',
    timelineDate: '',
    budgetConsideration: '',
    message: '',
  })
  
  const [copied, setCopied] = useState(false)

  const handleInterestChange = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest),
      })
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      })
    }
  }

  const handlePearlTypeChange = (pearlType: string) => {
    if (formData.pearlTypes.includes(pearlType)) {
      setFormData({
        ...formData,
        pearlTypes: formData.pearlTypes.filter((p) => p !== pearlType),
      })
    } else {
      setFormData({
        ...formData,
        pearlTypes: [...formData.pearlTypes, pearlType],
      })
    }
  }

  const generateMessage = () => {
    const metalPreferenceText = formData.metalPreference || 'Not specified'
    const timelineText =
      formData.timeline === 'For a specific date'
        ? `For a specific date: ${formData.timelineDate || 'Not specified'}`
        : formData.timeline || 'Not specified'
    const budgetConsiderationText = formData.budgetConsideration || 'Not specified'
    const phoneText = formData.phone || 'Not provided'

    return `Hi! I'm interested in your pearl jewelry.

Name: ${formData.name}
Email: ${formData.email}
Phone: ${phoneText}

I'm interested in:
${formData.interests.map(i => `• ${i}`).join('\n') || '• To be discussed'}

Preferred pearl types:
${formData.pearlTypes.map(p => `• ${p}`).join('\n') || '• To be discussed'}

Metal Preference: ${metalPreferenceText}
Timeline: ${timelineText}
Budget Consideration: ${budgetConsiderationText}

Message:
${formData.message}

---
I have reference photos to share!`
  }

  const handleCopy = async () => {
    const message = generateMessage()
    
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      
      // 3秒後自動隱藏成功訊息
      setTimeout(() => {
        // 不要完全隱藏，保持顯示聯絡方式按鈕
      }, 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy message. Please try again.')
    }
  }

  const openInstagram = () => {
    window.open('https://www.instagram.com/33_pearl_atelier/', '_blank')
  }

  const openWeChat = () => {
    // WeChat 網頁版或顯示 QR code
    alert('Open WeChat and search "_33pearlatelier" to start chatting.')
  }

  const openEmail = () => {
    const subject = encodeURIComponent('Pearl Jewelry Inquiry')
    const body = encodeURIComponent(generateMessage())
    window.open(`mailto:33pearlatelier@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  const openLine = () => {
    window.open('https://line.me/R/ti/p/~sandyhsiue0303', '_blank')
  }

  const isFormValid = formData.name && formData.email && formData.interests.length > 0 && formData.message

  return (
    <main style={pageHeroStyles.main}>
      
      {/* Hero Section */}
      <PageHero
        eyebrow="INQUIRY"
        title="Request Custom Access"
        description="Custom work is accepted on a limited basis. Each project is considered individually, with a focus on balance, proportion, and how the piece will be worn over time."
      />

      {/* Form Section */}
      <section style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: `${spacing['2xl']} ${spacing.xl}`,
      }}>

        <p style={{
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          textAlign: 'center',
          margin: `0 0 ${spacing.xl}`,
        }}>
          For ready-to-wear inquiries, pearl care questions, or redesign service, please use the general contact form.
        </p>
        
        {/* What We Look For */}
        <div style={{
          background: '#fffdfa',
          padding: spacing.lg,
          borderRadius: '14px',
          border: '1px solid #E6DDCF',
          borderTop: '2px solid rgba(212, 175, 55, 0.45)',
          marginBottom: spacing['2xl'],
          boxShadow: '0 6px 14px rgba(24, 24, 24, 0.04)',
        }}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.md,
            color: colors.darkGray,
            letterSpacing: '0.01em',
          }}>
            What We Look For in a Custom Request
          </h2>
          <ul style={{
            fontSize: typography.fontSize.base,
            lineHeight: '1.75',
            color: colors.textPrimary,
            paddingLeft: '1.05rem',
            margin: 0,
          }}>
            <li>Your general idea or inspiration</li>
            <li>Preferred pearl type or tone</li>
            <li>Occasion or intended use</li>
            <li>Budget range and priorities</li>
          </ul>
        </div>

        {/* Form */}
        <div style={{
          background: '#fff',
          padding: spacing['2xl'],
          borderRadius: '16px',
          border: '1px solid #E7E0D3',
          boxShadow: '0 8px 18px rgba(36, 28, 16, 0.05)',
        }}>
          {/* Name */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
              color: colors.textPrimary,
            }}>
              Name *
            </label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          {/* Email */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
              color: colors.textPrimary,
            }}>
              Email *
            </label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          {/* Phone */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
              color: colors.textPrimary,
            }}>
              Phone
            </label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          {/* Interests - Checkboxes */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              I'm interested in... * (select all that apply)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: spacing.sm,
            }}>
              {['Necklace', 'Earrings', 'Bracelet', 'Ring', 'Need guidance'].map((interest) => (
                <label 
                  key={interest}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.base,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    border: '1px solid #E6DDCF',
                    borderRadius: '10px',
                    background: '#FFFEFC',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          {/* Pearl Type - Checkboxes */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              Pearl type (select all that apply)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: spacing.sm,
            }}>
              {['White Akoya', 'Grey Akoya', 'White South Sea', 'Golden South Sea', 'Tahitian', 'Not sure - need guidance'].map((pearlType) => (
                <label
                  key={pearlType}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.base,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    border: '1px solid #E6DDCF',
                    borderRadius: '10px',
                    background: '#FFFEFC',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.pearlTypes.includes(pearlType)}
                    onChange={() => handlePearlTypeChange(pearlType)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  {pearlType}
                </label>
              ))}
            </div>
          </div>
          
          {/* Metal Preference */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              Metal preference
            </label>
            <select
              value={formData.metalPreference}
              onChange={(e) => setFormData({ ...formData, metalPreference: e.target.value })}
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
              }}
            >
              <option value="">Select a preference</option>
              <option value="925 Silver with 18K Gold Vermeil">925 Silver with 18K Gold Vermeil</option>
              <option value="925 Silver with White Gold Vermeil">925 Silver with White Gold Vermeil</option>
              <option value="18K Yellow Gold">18K Yellow Gold</option>
              <option value="18K White Gold">18K White Gold</option>
              <option value="PT900 Platinum">PT900 Platinum</option>
              <option value="Not Sure / Open to Suggestions">Not Sure / Open to Suggestions</option>
            </select>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              Timeline
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
              }}
            >
              <option value="">Select a timeline</option>
              <option value="No rush - just browsing">No rush - just browsing</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="1-3 months">1-3 months</option>
              <option value="For a specific date">For a specific date</option>
            </select>
            {formData.timeline === 'For a specific date' && (
              <>
                <input
                  type="text"
                  placeholder="For a specific date: [_______]"
                  value={formData.timelineDate}
                  onChange={(e) => setFormData({ ...formData, timelineDate: e.target.value })}
                  style={{
                    width: '100%',
                    marginTop: spacing.sm,
                    padding: spacing.sm,
                    border: '1px solid #DDD4C5',
                    borderRadius: '10px',
                    background: '#FFFEFC',
                    fontSize: typography.fontSize.base,
                    fontFamily: 'inherit',
                  }}
                />
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  e.g., &quot;March 15&quot; or &quot;Wedding on April 20 2026&quot;
                </p>
              </>
            )}
          </div>
          
          {/* Price Guide */}
          <div style={{
            background: '#F8F6F0',
            padding: spacing.lg,
            borderRadius: '10px',
            marginBottom: spacing.lg,
            border: '1px solid #E8DCC8',
          }}>
            <p style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.darkGray,
              marginBottom: spacing.sm,
            }}>
              💡 Custom Pricing
            </p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: '1.6' }}>
              Most custom projects begin around $800–$1000, depending on pearl selection and design.
            </p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: '1.6', marginTop: spacing.sm }}>
              We focus on pieces that balance quality, proportion, and long-term wear.
            </p>
          </div>

          {/* Budget Range */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              Budget Range
            </label>
            <select
              value={formData.budgetConsideration}
              onChange={(e) => setFormData({ ...formData, budgetConsideration: e.target.value })}
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
                color: colors.textPrimary,
              }}
            >
              <option value="">Select a range</option>
              <option value="Under $500">Under $500</option>
              <option value="$500–$1000">$500–$1000</option>
              <option value="$1000–$3000">$1000–$3000</option>
              <option value="$3000+">$3000+</option>
            </select>
          </div>

          {/* Message */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              color: colors.textPrimary,
            }}>
              Tell us about your idea, preferred pearl type, or any references you have. *
            </label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              placeholder={"If you’re unsure, feel free to share the occasion or general direction — we’ll guide you."}
              style={{
                width: '100%',
                padding: spacing.sm,
                border: '1px solid #DDD4C5',
                borderRadius: '10px',
                background: '#FFFEFC',
                fontSize: typography.fontSize.base,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <p style={{
              marginTop: spacing.sm,
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              lineHeight: '1.6',
            }}>
              If you&apos;re unsure, feel free to share the occasion or general direction — we&apos;ll guide you.
            </p>
          </div>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!isFormValid}
            style={{
              width: '100%',
              padding: `${spacing.md} ${spacing.xl}`,
              background: isFormValid ? colors.darkGray : '#CCCCCC',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
            }}
          >
            Copy & Send Your Inquiry
          </button>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing.md,
            textAlign: 'center',
            lineHeight: '1.6',
          }}>
            Send via Instagram, Email, or WeChat — whichever feels easiest.
          </p>
          
          {/* Reminder before copying */}
          {!copied && (
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              marginTop: spacing.sm,
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              Have reference photos? Attach them when sending your message.
            </p>
          )}
        </div>

        {/* Success Message & Channels - Show after copy */}
        {copied && (
          <div style={{
            background: '#fffdfa',
            padding: spacing['2xl'],
            borderRadius: '12px',
            border: `1px solid ${colors.lightGray}`,
            borderTop: '2px solid rgba(212, 175, 55, 0.45)',
            marginTop: spacing.xl,
            animation: 'fadeIn 0.3s ease-in',
          }}>
            
            {/* Success Message */}
            <div style={{
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}>
              <h3 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.semibold,
                color: colors.darkGray,
                marginBottom: spacing.xs,
              }}>
                Copied ✓
              </h3>
              <p style={{ color: colors.textSecondary, margin: 0 }}>
                Copy and send this message via Instagram, Email, or WeChat — whichever feels easiest.
              </p>
            </div>

            {/* Photo Reminder - Highlighted */}
            <div style={{
              background: '#fff',
              padding: spacing.md,
              borderRadius: '8px',
              border: '1px solid #E8DCC8',
              marginBottom: spacing.xl,
              textAlign: 'center',
            }}>
              <h4 style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.darkGray,
                marginBottom: spacing.xs,
              }}>
                Attach reference photos if available
              </h4>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
                lineHeight: '1.6',
                margin: 0,
              }}>
                They help us understand your style and recommend better options.
              </p>
            </div>

            {/* Channel Selection */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.textPrimary,
                marginBottom: spacing.lg,
                fontWeight: typography.fontWeight.medium,
              }}>
                Continue via
              </p>

              <button
                onClick={handleCopy}
                style={{
                  marginBottom: spacing.lg,
                  padding: `${spacing.xs} ${spacing.lg}`,
                  border: '1px solid #E0E0E0',
                  borderRadius: '999px',
                  background: '#fff',
                  color: colors.darkGray,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}
              >
                Copy Again
              </button>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
              }}>
                
                {/* Instagram */}
                <button
                  onClick={openInstagram}
                  style={{
                    background: 'white',
                    padding: spacing.lg,
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    Instagram
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                  }}>
                    @33_pearl_atelier
                  </div>
                </button>

                {/* WeChat */}
                <button
                  onClick={openWeChat}
                  style={{
                    background: 'white',
                    padding: spacing.lg,
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    WeChat
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                  }}>
                    _33pearlatelier
                  </div>
                </button>

                {/* LINE */}
                <button
                  onClick={openLine}
                  style={{
                    background: 'white',
                    padding: spacing.lg,
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    LINE
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                  }}>
                    sandyhsiue0303
                  </div>
                </button>

                {/* Email */}
                <button
                  onClick={openEmail}
                  style={{
                    background: 'white',
                    padding: spacing.lg,
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    Email
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                  }}>
                    33pearlatelier@gmail.com
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          padding: `${spacing.xl} ${spacing.xl} ${spacing['2xl']}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            margin: 0,
          }}
        >
          We review each inquiry carefully and will respond within 1–2 business days.
        </p>
      </section>

      {/* Inline CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}
