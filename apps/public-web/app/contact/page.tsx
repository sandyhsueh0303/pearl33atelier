'use client'

import { useState } from 'react'
import { colors, typography, spacing } from '../constants/design'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState('')
  const [message, setMessage] = useState('')
  const [copyNotice, setCopyNotice] = useState('')

  const handleCopyInquiry = async () => {
    const inquiryText = [
      'Inquiry Information',
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Phone: ${phone || '-'}`,
      `Interested In: ${interest || '-'}`,
      `Message: ${message || '-'}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(inquiryText)
      setCopyNotice('Inquiry content copied. Please use Ways to Connect to send it, and also send reference pictures.')
    } catch {
      setCopyNotice('Copy failed. Please copy the content manually and send it via Ways to Connect with reference pictures.')
    }
  }

  return (
    <main style={{ backgroundColor: colors.white }}>
      
      {/* Hero Section */}
      <section style={{
        padding: `${spacing['4xl']} ${spacing.xl} ${spacing['3xl']}`,
        background: 'linear-gradient(180deg, #F7F4EE 0%, #FFFFFF 100%)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: typography.fontSize.sm,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: colors.gold,
          marginBottom: spacing.md,
        }}>
          CONTACT
        </p>
        
        <h1 style={{
          fontSize: 'clamp(2.2rem, 6.5vw, 4rem)',
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.lineHeight.tight,
          color: colors.darkGray,
          marginBottom: spacing.lg,
        }}>
          Start Your Inquiry
        </h1>
        
        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
          maxWidth: '760px',
          margin: '0 auto',
        }}>
          Share your pearl type preference, budget range, occasion, and preferred timeline. 
          We will reply with clear next steps for collection purchase or custom design.
        </p>
      </section>

      {/* Main Content - Two Column */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${spacing['3xl']} ${spacing.xl}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing['4xl'],
      }}>
        
        {/* Left Column - Contact Methods */}
        <div>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing['2xl'],
            color: colors.darkGray,
          }}>
            Ways to Connect
          </h2>
          
          {/* Contact Cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
          }}>
            
            {/* Instagram */}
            <div style={{
              background: 'white',
              padding: spacing.xl,
              borderRadius: '12px',
              border: '2px solid #F0F0F0',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.lg,
              }}>
                <div style={{ fontSize: '2.5rem' }}>📱</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    Instagram
                  </h3>
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textSecondary,
                  }}>
                    @33_pearl_atelier
                  </p>
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#F5F5F5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: typography.fontSize.xs,
                  color: colors.textLight,
                }}>
                  QR Code
                </div>
              </div>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.textLight,
                marginTop: spacing.sm,
              }}>
                DM us for quick questions or browse our latest pieces
              </p>
            </div>
            
            {/* WeChat */}
            <div style={{
              background: 'white',
              padding: spacing.xl,
              borderRadius: '12px',
              border: '2px solid #F0F0F0',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.lg,
              }}>
                <div style={{ fontSize: '2.5rem' }}>💬</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    WeChat
                  </h3>
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textSecondary,
                  }}>
                    _33pearlatelier
                  </p>
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#F5F5F5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: typography.fontSize.xs,
                  color: colors.textLight,
                }}>
                  QR Code
                </div>
              </div>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.textLight,
                marginTop: spacing.sm,
              }}>
                Preferred for detailed discussions and consultations
              </p>
            </div>
            
            {/* Email */}
            <div style={{
              background: 'white',
              padding: spacing.xl,
              borderRadius: '12px',
              border: '2px solid #F0F0F0',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.lg,
              }}>
                <div style={{ fontSize: '2.5rem' }}>✉️</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.xs,
                  }}>
                    Email
                  </h3>
                  <a
                    href="mailto:33pearlatelier@gmail.com"
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.textSecondary,
                      textDecoration: 'underline',
                    }}
                  >
                    33pearlatelier@gmail.com
                  </a>
                </div>
              </div>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.textLight,
                marginTop: spacing.sm,
              }}>
                Best for formal inquiries and custom project details
              </p>
            </div>
          </div>
          
          {/* Business Hours */}
          <div style={{
            background: '#F8F6F0',
            padding: spacing.xl,
            borderRadius: '12px',
            marginTop: spacing['2xl'],
          }}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}>
              🕐 Business Hours
            </h3>
            <div style={{
              fontSize: typography.fontSize.base,
              lineHeight: '1.8',
              color: colors.textPrimary,
            }}>
              <div>Monday - Friday: 10:00 AM - 6:00 PM</div>
              <div>Saturday: 11:00 AM - 4:00 PM</div>
              <div>Sunday: Closed</div>
            </div>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              marginTop: spacing.md,
              paddingTop: spacing.md,
              borderTop: '1px solid #E8DCC8',
            }}>
              ✓ We typically respond within 24 hours
            </p>
          </div>
        </div>
        
        {/* Right Column - Inquiry Guide & Form */}
        <div>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing['2xl'],
            color: colors.darkGray,
          }}>
            Quick Inquiry Form
          </h2>
          
          {/* What to Include Guide */}
          <div style={{
            background: '#F8F6F0',
            padding: spacing.xl,
            borderRadius: '12px',
            marginBottom: spacing['2xl'],
          }}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
            }}>
              What to Include in Your Inquiry
            </h3>
            <ul style={{
              fontSize: typography.fontSize.base,
              lineHeight: '1.8',
              color: colors.textPrimary,
              paddingLeft: spacing.lg,
            }}>
              <li>Jewelry style (necklace, earrings, bracelet, or ring)</li>
              <li>Pearl preference (type, size range, color tone, or any specific details you have in mind)</li>
              <li>Budget range and timeline</li>
              <li>Reference photos or inspiration</li>
            </ul>
          </div>
          
          {/* Simple Form */}
          <form style={{
            background: 'white',
            padding: spacing.xl,
            borderRadius: '12px',
            border: '2px solid #F0F0F0',
          }}>
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
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: typography.fontSize.base,
                }}
              />
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs,
              }}>
                Email *
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: typography.fontSize.base,
                }}
              />
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs,
              }}>
                Phone (Optional)
              </label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: typography.fontSize.base,
                }}
              />
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs,
              }}>
                What are you interested in? *
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: typography.fontSize.base,
                }}
              >
                <option>Select...</option>
                <option>Necklace</option>
                <option>Earrings</option>
                <option>Bracelet</option>
                <option>Ring</option>
                <option>Custom Design</option>
              </select>
            </div>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs,
              }}>
                Message *
              </label>
              <textarea 
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: typography.fontSize.base,
                  fontFamily: 'inherit',
                }}
                placeholder="Tell us about your preferences, budget range, and timeline..."
              />
            </div>
            
            <button
              type="button"
              onClick={handleCopyInquiry}
              style={{
                width: '100%',
                padding: `${spacing.md} ${spacing.xl}`,
                background: colors.darkGray,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Copy Inquiry
            </button>
            
            <p style={{
              fontSize: typography.fontSize.xs,
              color: colors.textLight,
              marginTop: spacing.md,
              textAlign: 'center',
            }}>
              {copyNotice || 'Copy your inquiry, then send it via Ways to Connect with reference pictures.'}
            </p>
          </form>
        </div>
      </section>
      
      {/* Trust Indicators */}
      <section style={{
        background: '#F8F6F0',
        padding: `${spacing['3xl']} ${spacing.xl}`,
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: spacing['2xl'],
          textAlign: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: spacing.md,
            }}>✓</div>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
            }}>
              24-Hour Response
            </h3>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
            }}>
              We reply to all inquiries within one business day
            </p>
          </div>
          
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: spacing.md,
            }}>✓</div>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
            }}>
              Free Consultation
            </h3>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
            }}>
              No obligation to discuss your custom design ideas
            </p>
          </div>
          
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: spacing.md,
            }}>✓</div>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
            }}>
              Personalized Service
            </h3>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
            }}>
              Each piece crafted specifically for you
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQ Quick Link */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: `${spacing['3xl']} ${spacing.xl}`,
      }}>
        <div style={{
          background: 'white',
          padding: spacing['2xl'],
          borderRadius: '12px',
          border: '2px solid #F0F0F0',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.normal,
            marginBottom: spacing.md,
          }}>
            Have Questions?
          </h3>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
          }}>
            Visit our FAQ for quick answers about pearl types, custom design process, 
            pricing, and shipping.
          </p>
          <a 
            href="/faq"
            style={{
              display: 'inline-block',
              padding: `${spacing.sm} ${spacing.xl}`,
              background: 'transparent',
              color: colors.gold,
              border: `2px solid ${colors.gold}`,
              borderRadius: '6px',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            View All FAQs →
          </a>
        </div>
      </section>
      
    </main>
  )
}
