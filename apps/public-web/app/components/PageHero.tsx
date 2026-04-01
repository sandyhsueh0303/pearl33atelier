import type { CSSProperties } from 'react'
import { pageHeroStyles } from '../constants/pageHero'

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
  sectionStyle?: CSSProperties
}

export default function PageHero({ eyebrow, title, description, sectionStyle }: PageHeroProps) {
  const descriptionLines = description.split('\n').filter(Boolean)

  return (
    <section style={{ ...pageHeroStyles.section, ...sectionStyle }}>
      <div style={pageHeroStyles.inner}>
        <p style={pageHeroStyles.eyebrow}>{eyebrow}</p>
        <h1 style={pageHeroStyles.title}>{title}</h1>
        <div style={pageHeroStyles.description}>
          {descriptionLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              style={{
                margin: index === 0 ? 0 : '0.6rem 0 0',
              }}
            >
              {line}
            </p>
          ))}
        </div>
        <div style={pageHeroStyles.divider} />
      </div>
    </section>
  )
}
