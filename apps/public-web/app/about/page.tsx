import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../components/PageHero'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about 33 Pearl Atelier, our pearl sourcing standards, craftsmanship approach, and custom pearl jewelry philosophy.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  const values = [
    {
      title: 'Pearl Selection',
      description: 'We select pearls not just for quality, but for how they feel when worn.',
    },
    {
      title: 'Craftsmanship',
      description: 'Every piece is finished with careful handwork to balance elegance, comfort, and long-term wear.',
    },
    {
      title: 'Timeless Design',
      description: 'We create refined silhouettes that feel contemporary today and remain beautiful for years.',
    },
  ]

  return (
    <main className={styles.main}>
      <PageHero
        eyebrow="About Us"
        title="33 Pearl Atelier"
        description="33 Pearl Atelier was created from a simple belief — that pearl jewelry should feel natural to wear, not reserved for special occasions."
      />

      <section className={styles.founderSection}>
        <div className={styles.founderGrid}>
          <div className={styles.founderImageFrame}>
            <img
              src="/images/sandy.png"
              alt="Sandy, Founder"
              className={styles.founderImage}
            />
          </div>

          <article className={styles.founderCopy}>
            <p className={styles.eyebrow}>
              FOUNDER
            </p>
            <h2 className={styles.founderTitle}>
              From the Founder
            </h2>
            <p className={styles.founderCredential}>
              GIA Certified Gemologist
            </p>
            <div className={styles.goldDivider} />
            <p className={styles.founderLead}>
              I&apos;m Sandy, founder of 33 Pearl Atelier and a GIA Certified Gemologist.
            </p>
            <p className={styles.founderParagraph}>
              33 Pearl Atelier began with a simple idea — that pearls should feel personal, not traditional.
            </p>
            <p className={styles.founderParagraph}>
              I created the brand to offer pearl jewelry that feels effortless to wear and quietly refined. Each pearl is selected with attention to luster, proportion, and how it will live with the wearer over time.
            </p>
            <p className={styles.founderParagraph}>
              Beyond technical grading, I focus on character, balance, and everyday elegance — creating pieces that feel timeless, modern, and easy to wear with confidence.
            </p>
            <p className={styles.founderParagraph}>
              I&apos;m less interested in perfect pearls, and more in pieces that feel right when worn.
            </p>
            <p className={styles.founderParagraphLast}>
              Something you reach for without thinking — and continue to wear over time.
            </p>
          </article>
        </div>
      </section>
      <section
        className={styles.credentialsBar}
      >
        <div className={styles.credentialsInner}>
          <span>✓ GIA Certified Gemologist</span>
          <span className={styles.goldDot}>•</span>
          <span>✓ Pearl Grading Specialist</span>
          <span className={styles.goldDot}>•</span>
          <span>✓ Curated Pearl Styling &amp; Design</span>
        </div>
      </section>

      <section
        className={styles.valuesSection}
      >
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>
              Our Values
            </p>
            <h2 className={styles.sectionTitle}>
              What We Value
            </h2>
            <p className={styles.sectionIntro}>
              The standards behind every piece we curate and create.
            </p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value) => (
              <article
                key={value.title}
                className={`${styles.card} ${styles.valueCard}`}
              >
                <div className={styles.valueIcon}>
                  ✦
                </div>
                <h3 className={styles.cardTitle}>
                  {value.title}
                </h3>
                <p className={styles.cardText}>
                  {value.description}
                </p>
              </article>
            ))}
          </div>
          <p className={styles.valuesSummary}>
            33 Pearl Atelier specializes in handcrafted pearl jewelry, offers one-on-one custom pearl design,
            and is led by a GIA certified gemologist to ensure trusted quality and refined craftsmanship.
          </p>
        </div>
      </section>

      <section
        className={styles.storySection}
      >
        <div className={styles.storyGrid}>
          <div>
            <h2 className={styles.storyTitle}>
              Our Story
            </h2>
            <p className={styles.bodyText}>
              33 Pearl Atelier began with a simple idea — that pearl jewelry should feel personal, effortless, and part of everyday life.
            </p>
            <ul className={styles.bodyList}>
              <li>Pearls are selected from trusted sources for luster, harmony, and character.</li>
              <li>Each design is refined by hand from sourcing to final finish.</li>
              <li>We focus on pieces that move easily from special moments to everyday life.</li>
            </ul>
          </div>

          <div
            className={`${styles.card} ${styles.studioCard}`}
          >
            <h3 className={styles.cardTitle}>
              Studio Focus
            </h3>
            <p className={styles.bodyText}>
              We specialize in:
            </p>
            <ul className={styles.bodyList}>
              <li>Custom pearl jewelry and one-on-one design guidance.</li>
              <li>Curated ready-to-wear pieces with balanced proportions.</li>
              <li>Material and finishing choices tailored to your personal style.</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        className={styles.testimonialsSection}
      >
        <h2 className={styles.testimonialsTitle}>
          What Clients Say
        </h2>

        <div className={styles.testimonialsGrid}>
          <div
            className={`${styles.card} ${styles.testimonialCard}`}
          >
            <p className={styles.testimonialQuote}>
              &quot;The attention to detail and quality is exceptional. My pearl necklace has become my everyday piece.&quot;
            </p>
            <p className={styles.testimonialName}>
              — Emma L.
            </p>
          </div>

          <div
            className={`${styles.card} ${styles.testimonialCard}`}
          >
            <p className={styles.testimonialQuote}>
              &quot;Sandy guided me through every step of the custom process. The final earrings are elegant and timeless.&quot;
            </p>
            <p className={styles.testimonialName}>
              — Grace W.
            </p>
          </div>

          <div
            className={`${styles.card} ${styles.testimonialCard}`}
          >
            <p className={styles.testimonialQuote}>
              &quot;I love that each pearl is personally selected. You can really see the difference in luster and harmony.&quot;
            </p>
            <p className={styles.testimonialName}>
              — Chloe T.
            </p>
          </div>
        </div>
      </section>

      <section
        className={styles.ctaSection}
      >
        <h2 className={styles.ctaTitle}>
          Discover The Collection
        </h2>
        <p className={styles.ctaCopy}>
          Explore handcrafted pieces or start a custom design journey with us.
        </p>
        <div className={styles.ctaActions}>
          <Link
            href="/products"
            className={styles.primaryCta}
          >
            Shop Ready-to-Wear Collection
          </Link>
        </div>
        <p className={styles.secondaryCtaWrap}>
          <Link href="/custom-services" className={styles.secondaryCta}>
            Curated customization (limited availability)
          </Link>
        </p>
      </section>
    </main>
  )
}
