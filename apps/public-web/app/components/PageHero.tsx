import styles from './PageHero.module.css'

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
}

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  const descriptionLines = description.split('\n').filter(Boolean)

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>
          {descriptionLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={index === 0 ? styles.descriptionLineFirst : styles.descriptionLine}
            >
              {line}
            </p>
          ))}
        </div>
        <div className={styles.divider} />
      </div>
    </section>
  )
}
