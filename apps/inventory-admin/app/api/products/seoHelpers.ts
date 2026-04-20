export const SEO_TITLE_MAX_LENGTH = 65
export const SEO_BRAND_SUFFIX = '33 Pearl Atelier'

export function normalizeKeywords(keywords: unknown): string[] {
  const values = Array.isArray(keywords)
    ? keywords
    : String(keywords || '')
        .split(/[,;\n]+/)
        .map((value) => value.trim())
        .filter(Boolean)

  return Array.from(
    new Set(values.map((value) => String(value || '').trim()).filter(Boolean))
  )
}

export function buildSeoTitle(
  title: string,
  category: string,
  pearlType: string,
  sizeHint?: string | null
) {
  const baseParts = [
    title,
    sizeHint ? `${sizeHint}mm` : null,
    pearlType,
    category ? String(category).replace(/s$/i, '') : null,
  ].filter(Boolean)
  const baseTitle = baseParts.join(' | ')
  const brandedTitle = `${baseTitle} | ${SEO_BRAND_SUFFIX}`
  return brandedTitle.length <= SEO_TITLE_MAX_LENGTH ? brandedTitle : baseTitle
}

export function normalizeSeoTitle(value: unknown, fallbackTitle: string) {
  const title = String(value || '').trim() || fallbackTitle
  if (title.length <= SEO_TITLE_MAX_LENGTH) return title

  const brandSuffixPattern = new RegExp(`\\s*[|\\-]\\s*${SEO_BRAND_SUFFIX}$`, 'i')
  const withoutBrand = title.replace(brandSuffixPattern, '').trim()
  return withoutBrand || title
}

export function buildSeoDescription(
  title: string,
  pearlType: string,
  category: string,
  overtone: string,
  luster: string
) {
  return [
    `${title} by 33 Pearl Atelier.`,
    `${pearlType} ${String(category || '').toLowerCase()}`.trim(),
    `with ${luster} luster${overtone ? ` and ${overtone} overtone` : ''}.`,
    'Explore refined pearl jewelry designed for modern, everyday elegance.',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export function buildSeoKeywords(
  title: string,
  pearlType: string,
  category: string,
  overtone: string
) {
  return Array.from(
    new Set(
      [
        title,
        pearlType,
        `${pearlType} pearl jewelry`,
        `${pearlType} ${String(category || '').replace(/s$/i, '')}`.trim(),
        overtone ? `${overtone} pearls` : null,
        SEO_BRAND_SUFFIX,
      ].filter((value): value is string => Boolean(value))
    )
  )
}

export function buildOgImageAlt(title: string, pearlType: string, shape: string) {
  return [title, pearlType ? `${pearlType} pearl jewelry` : null, shape ? `${shape} shape` : null]
    .filter(Boolean)
    .join(', ')
}
