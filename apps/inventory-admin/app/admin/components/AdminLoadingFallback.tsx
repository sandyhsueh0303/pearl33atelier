import styles from './AdminLoadingFallback.module.css'

interface AdminLoadingFallbackProps {
  page?: boolean
}

export default function AdminLoadingFallback({ page = false }: AdminLoadingFallbackProps) {
  const content = <div className={styles.loading}>Loading...</div>

  if (page) {
    return <main className="admin-page">{content}</main>
  }

  return content
}
