import type { Metadata } from 'next'
import PageHero from '../components/PageHero'
import ContactMethods from './ContactMethods'
import ContactForm from './ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact Us | 33 Pearl Atelier',
  description:
    'Get in touch with 33 Pearl Atelier. Questions about our collection, shipping, pearl care, lifetime service, or redesign requests?',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Reach out for ready-to-wear inquiries, custom design requests, pearl care questions, or pearl redesign service."
      />

      <div className={styles.methodsWrap}>
        <ContactMethods />
      </div>

      {/* Contact Form Section */}
      <section className={styles.formSection}>
        <div className={styles.formPanel}>
          <ContactForm />
          <p className={styles.responseNote}>
            ✓ We typically respond within 24 hours
          </p>
        </div>
      </section>
    </main>
  )
}
