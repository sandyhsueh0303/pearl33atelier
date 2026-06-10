import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        33 Pearl Atelier — Inventory Admin
      </h1>
      <p className={styles.description}>
        Internal management system for pearl jewelry inventory
      </p>
      <a
        href="/admin/login"
        className={styles.loginLink}
      >
        Go to Admin Login
      </a>
    </div>
  )
}
