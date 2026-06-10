import styles from './loading.module.css'

export default function ProductsLoading() {
  return (
    <main className={styles.loadingPage}>
      <div className={styles.loadingShell}>
        <div className={styles.headingSkeleton} />
        <div className={styles.subheadingSkeleton} />

        <div className={styles.productGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.productCard}>
              <div className={styles.imageSkeleton} />
              <div className={styles.cardBody}>
                <div className={styles.titleSkeleton} />
                <div className={styles.metaSkeleton} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
