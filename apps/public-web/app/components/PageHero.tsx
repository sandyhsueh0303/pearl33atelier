import type { CSSProperties } from 'react'
import { pageHeroStyles } from '../constants/pageHero'

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
  sectionStyle?: CSSProperties
}

export default function PageHero({ eyebrow, title, description, sectionStyle }: PageHeroProps) {
  return (
    <section style={{ ...pageHeroStyles.section, ...sectionStyle }}>
      <div style={pageHeroStyles.inner}>
        <p style={pageHeroStyles.eyebrow}>{eyebrow}</p>
        <h1 style={pageHeroStyles.title}>{title}</h1>
        <p style={pageHeroStyles.description}>{description}</p>
        <div style={pageHeroStyles.divider} />
      </div>
    </section>
  )
}
