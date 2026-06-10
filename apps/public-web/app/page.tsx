import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'

const serviceCards = [
  {
    title: 'Complimentary Lifetime Care',
    desc:
      'Pearl necklaces include lifetime restringing and cleaning. Earrings and other pearl pieces receive complimentary cleaning and maintenance.',
  },
  {
    title: 'Pearl Redesign Service',
    desc: 'Transform treasured pearls into new pieces',
  },
]

const orderFlows = [
  {
    title: 'Ready-to-Wear',
    subtitle: 'For pieces available to purchase now',
    steps: ['Browse the collection', 'Add to cart', 'Secure checkout'],
    timeline: 'Ships in 3 days',
  },
  {
    title: 'Custom Design',
    subtitle: 'Accepted on a limited basis for more personal, considered projects',
    steps: ['Request access', 'Private consultation', 'Design development'],
    timeline: 'Limited availability',
  },
]

const journalCards = [
  {
    href: '/blog/pearl-types-guide',
    title: 'Pearl Types Guide',
    description:
      'Understand the subtle differences between Akoya, South Sea, Tahitian, and Freshwater pearls.',
    cta: 'Read Guide ->',
  },
  {
    href: '/blog/how-to-care-for-pearl-jewelry-daily',
    title: 'Daily Pearl Care',
    description: 'Simple habits to keep your pearl jewelry luminous and beautifully maintained.',
    cta: 'Read Journal ->',
  },
  {
    href: '/blog/pearl-quality-factors-shape-luster-surface-color-overtone',
    title: 'Pearl Quality Factors',
    description:
      "Learn how luster, shape, surface, and overtone influence a pearl's beauty and character.",
    cta: 'Read Guide ->',
  },
]

export const metadata: Metadata = {
  title: '33 Pearl Atelier | Fine Pearl Jewelry | GIA Certified Pearls',
  description:
    'Discover exquisite handcrafted pearl jewelry at 33 Pearl Atelier. Shop GIA certified White South Sea, Akoya, and Tahitian pearls. Free shipping on orders over $200. Custom design services available.',
  keywords: [
    'pearl jewelry',
    'fine jewelry',
    'GIA certified pearls',
    'white south sea pearls',
    'akoya pearls',
    'tahitian pearls',
    'freshwater pearls',
    'pearl necklace',
    'pearl earrings',
    'pearl bracelet',
    'pearl rings',
    'custom pearl jewelry',
    'handcrafted jewelry',
    'pearl atelier',
    '33 Pearl Atelier',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: '33 Pearl Atelier - Finest Pearl Jewelry',
    description:
      'Discover exquisite handcrafted pearl jewelry. GIA certified pearls with free shipping over $200.',
    type: 'website',
    url: SITE_URL,
    siteName: '33 Pearl Atelier',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/images/og-home.png`,
        width: 1200,
        height: 630,
        alt: '33 Pearl Atelier - Fine Pearl Jewelry Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '33 Pearl Atelier - Finest Pearl Jewelry',
    description: 'Discover exquisite handcrafted pearl jewelry. GIA certified pearls.',
    images: [`${SITE_URL}/images/og-home.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { 'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
  },
}

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: '33 Pearl Atelier',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Fine pearl jewelry boutique specializing in GIA certified pearls and custom designs.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Jose',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@33pearlatelier.com',
      availableLanguage: ['en', 'zh'],
    },
    sameAs: [
      'https://www.instagram.com/33pearlatelier',
      'https://www.facebook.com/33pearlatelier',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: '33 Pearl Atelier',
    description: 'Fine pearl jewelry boutique',
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.homeBlobOne} />
          <div className={styles.homeBlobTwo} />
          <div className={styles.homeBlobCenter} />

          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>Fine Pearl Jewelry</div>
            <h1 className={styles.heroTitle}>33 Pearl Atelier</h1>
            <p className={styles.heroDescription}>
              Pearls chosen with intention, designed to stay with you.
              <br />
              <span className={styles.heroDescriptionNote}>
                From hand-selected ready-to-wear pieces to custom design and lifetime care, each
                piece is shaped with balance, wearability, and lasting beauty in mind.
              </span>
            </p>

            <div className={styles.heroActions}>
              <Link href="/products" prefetch className={styles.heroCta}>
                Explore the Collection
              </Link>
            </div>
          </div>

          <div className={styles.homeScrollIndicator}>
            <div className={styles.scrollLabel}>Scroll to Discover</div>
            <div className={styles.homeScrollArrow}>↓</div>
          </div>
        </section>

        <section className={styles.whySection}>
          <div className={styles.whyInner}>
            <p className={styles.sectionEyebrow}>Why 33 Pearl Atelier</p>
            <div className={styles.whyList}>
              <span>GIA-certified gemologist selection</span>
              <span className={styles.goldDot}>•</span>
              <span>Individually matched pearls</span>
              <span className={styles.goldDot}>•</span>
              <span>Small-batch, intentional production</span>
              <span className={styles.goldDot}>•</span>
              <span>Lifetime care included</span>
              <span className={styles.goldDot}>•</span>
              <span>100+ satisfied customers</span>
              <span className={styles.goldDot}>•</span>
              <span>4.9/5 rating</span>
            </div>
            <p className={styles.whyTagline}>Each piece is chosen, not produced.</p>
          </div>
        </section>

        <section className={styles.serviceSection}>
          <div className={styles.servicePanel}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceBadge}>Pearl Care</div>
              <h2 className={styles.serviceTitle}>Lifetime Service</h2>
              <p className={styles.serviceIntro}>Lifetime Care Included</p>
              <p className={styles.serviceIntro}>
                Professional restringing, cleaning, and maintenance — always free.
              </p>
            </div>
            <div className={styles.serviceGrid}>
              {serviceCards.map((item) => (
                <div key={item.title} className={styles.serviceCard}>
                  <div className={styles.serviceCardTitle}>{item.title}</div>
                  <div className={styles.serviceDivider} />
                  <div className={styles.serviceCardText}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.orderSection}>
          <div className={styles.orderInner}>
            <h2 className={styles.sectionTitle}>Before You Order</h2>
            <p className={styles.sectionLead}>Choose the path that best fits your piece and timeline.</p>

            <div className={styles.orderPanel}>
              <div className={styles.orderPanelBody}>
                <div className={styles.orderGrid}>
                  {orderFlows.map((flow) => (
                    <div key={flow.title} className={styles.orderCard}>
                      <h4 className={styles.orderCardTitle}>{flow.title}</h4>
                      <p className={styles.orderCardSubtitle}>{flow.subtitle}</p>
                      <div className={styles.orderSteps}>
                        {flow.steps.map((step, index) => (
                          <div key={step} className={styles.orderStep}>
                            <span className={styles.stepNumber}>{index + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.timelineBadge}>{flow.timeline}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.orderHelp}>
                <p className={styles.orderHelpText}>
                  Need help choosing between ready-to-wear and custom? We’re happy to guide you on
                  timing, pearl care, and the best next step for your order.
                </p>
                <div className={styles.orderHelpActions}>
                  <Link href="/custom-services" className={styles.secondaryLink}>
                    Custom Services
                  </Link>
                  <Link href="/contact" className={styles.outlineLink}>
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.journalSection}>
          <h2 className={styles.sectionTitle}>From the Journal</h2>
          <p className={styles.journalLead}>
            Discover pearl stories, care tips, and thoughtful buying guides - a space to explore and
            understand pearls beyond the surface.
          </p>

          <div className={styles.journalGrid}>
            {journalCards.map((card) => (
              <Link key={card.href} href={card.href} className={styles.journalCardLink}>
                <article className={styles.journalCard}>
                  <h3 className={styles.journalCardTitle}>{card.title}</h3>
                  <p className={styles.journalCardText}>{card.description}</p>
                  <span className={styles.journalCardCta}>{card.cta}</span>
                </article>
              </Link>
            ))}
          </div>

          <div className={styles.centerActions}>
            <Link href="/blog" className={styles.primaryLink}>
              View All Journal Posts
            </Link>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.faqInner}>
            <h2 className={styles.faqTitle}>Customer Care & FAQ</h2>
            <p className={styles.faqLead}>
              Find quick answers about ordering, availability, shipping, pearl care, and redesign
              services.
            </p>
            <div className={styles.centerActions}>
              <Link href="/faq" className={styles.outlineLink}>
                View FAQ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
