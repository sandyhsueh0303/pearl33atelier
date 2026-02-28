'use client'

import { useState } from 'react'
import { colors, typography, spacing } from '../constants/design'
import { pageHeroStyles } from '../constants/pageHero'
import PageHero from '../components/PageHero'

export default function ContactPage() {
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

  const isFormValid = formData.name && formData.email && formData.interests.length > 0 && formData.message

  return (
    <main style={pageHeroStyles.main}>
      
      {/* Hero Section */}
      <PageHero
        eyebrow="CONTACT"
        title="Start Your Inquiry"
        description="Share your pearl type preference, budget range, occasion, and preferred timeline. We will reply with clear next steps for collection purchase or custom design."
      />

      {/* Form Section */}
      <section style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: `${spacing['3xl']} ${spacing.xl}`,
      }}>
        
        {/* What to Include */}
        <div style={{
          background: 'linear-gradient(180deg, #FCFAF6 0%, #F8F6F0 100%)',
          padding: spacing.xl,
          borderRadius: '14px',
          border: '1px solid #E7E0D3',
          marginBottom: spacing['2xl'],
        }}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.md,
            color: colors.darkGray,
          }}>
            What to Include in Your Inquiry
          </h2>
          <ul style={{
            fontSize: typography.fontSize.base,
            lineHeight: '1.8',
            color: colors.textPrimary,
            paddingLeft: spacing.lg,
          }}>
            <li>Jewelry style and pearl preference</li>
            <li>Metal type and timeline</li>
            <li>Budget consideration</li>
            <li>Reference photos (attach when sending)</li>
          </ul>
        </div>

        {/* Form */}
        <div style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFBF8 100%)',
          padding: spacing['2xl'],
          borderRadius: '16px',
          border: '1px solid #E7E0D3',
          boxShadow: '0 10px 24px rgba(36, 28, 16, 0.06)',
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
              Phone (Optional)
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs,
            }}>
              {[
                '925 Silver with 18K Gold Vermeil',
                '925 Silver with White Gold Vermeil',
                '18K Yellow Gold',
                '18K White Gold',
                'PT900 Platinum',
                'Not Sure / Open to Suggestions',
              ].map((metal) => (
                <label 
                  key={metal}
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
                    type="radio"
                    name="metalPreference"
                    value={metal}
                    checked={formData.metalPreference === metal}
                    onChange={(e) => setFormData({ ...formData, metalPreference: e.target.value })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  {metal}
                </label>
              ))}
            </div>
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
              Timeline (Optional)
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs,
            }}>
              {[
                'No rush - just browsing',
                'Within 1 month',
                '1-3 months',
                'For a specific date',
              ].map((timeline) => (
                <label
                  key={timeline}
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
                    type="radio"
                    name="timeline"
                    value={timeline}
                    checked={formData.timeline === timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  {timeline}
                </label>
              ))}
            </div>
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
              💡 Pearl & Jewelry Pricing
            </p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: '1.6' }}>
              Pearl and jewelry prices can vary significantly based on pearl quality, size, matching requirements, and metal selection.
              We&apos;re always happy to recommend options that fit your budget while maintaining quality.
            </p>
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
              Budget Consideration (Optional)
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs,
            }}>
              {[
                "I'm flexible - quality is my priority",
                'Balanced - good quality within budget',
                'Budget-conscious - best value important',
                "Let's discuss options together",
              ].map((option) => (
                <label
                  key={option}
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
                    type="radio"
                    name="budgetConsideration"
                    value={option}
                    checked={formData.budgetConsideration === option}
                    onChange={(e) => setFormData({ ...formData, budgetConsideration: e.target.value })}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
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
              Message *
            </label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              placeholder="Share your preferences, style inspirations, or any questions you have. We're here to help!"
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
              marginTop: spacing.xs,
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              lineHeight: '1.6',
            }}>
              Hint: Mention pearl quality details like luster, surface, or color if you have preferences.
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
            📋 Copy Inquiry Message
          </button>
          
          {/* Reminder before copying */}
          {!copied && (
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              marginTop: spacing.md,
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              💡 Have reference photos? Attach them when sending your message
            </p>
          )}
        </div>

        {/* Success Message & Channels - Show after copy */}
        {copied && (
          <div style={{
            background: 'white',
            padding: spacing['2xl'],
            borderRadius: '12px',
            border: `2px solid ${colors.gold}`,
            marginTop: spacing.xl,
            animation: 'fadeIn 0.3s ease-in',
          }}>
            
            {/* Success Message */}
            <div style={{
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: spacing.md,
              }}>
                ✓
              </div>
              <h3 style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.semibold,
                color: colors.gold,
                marginBottom: spacing.sm,
              }}>
                Message copied to clipboard!
              </h3>
            </div>

            {/* Photo Reminder - Highlighted */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3D6 100%)',
              padding: spacing.lg,
              borderRadius: '8px',
              border: '2px solid #FFD700',
              marginBottom: spacing.xl,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: spacing.sm,
              }}>
                📸
              </div>
              <h4 style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.darkGray,
                marginBottom: spacing.xs,
              }}>
                Remember to attach your reference photos!
              </h4>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
                lineHeight: '1.6',
              }}>
                Photos help us understand your style and provide better recommendations
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
                Choose your preferred channel:
              </p>
              
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
                  <div style={{ fontSize: '2.5rem', marginBottom: spacing.sm }}>📱</div>
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
                  <div style={{ fontSize: '2.5rem', marginBottom: spacing.sm }}>💬</div>
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
                  <div style={{ fontSize: '2.5rem', marginBottom: spacing.sm }}>✉️</div>
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

      {/* Business Hours */}
      <section style={{
        background: '#F8F6F0',
        padding: `${spacing['3xl']} ${spacing.xl}`,
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.lg,
            color: colors.darkGray,
          }}>
            🕐 Business Hours
          </h3>
          <div style={{
            fontSize: typography.fontSize.base,
            lineHeight: '1.8',
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}>
            <div>Monday - Friday: 10:00 AM - 6:00 PM</div>
            <div>Saturday: 11:00 AM - 4:00 PM</div>
            <div>Sunday: Closed</div>
          </div>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            ✓ We typically respond within 24 hours
          </p>
        </div>
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
