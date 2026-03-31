/**
 * Convert text to URL-friendly slug
 * 
 * Rules:
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters (keep only a-z, 0-9, -)
 * - Merge multiple hyphens
 * - Trim hyphens from start/end
 * 
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('Product  123') // 'product-123'
 * slugify('Test---Case')  // 'test-case'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()                    // 全小寫
    .replace(/\s+/g, '-')             // 空格 → -
    .replace(/[^a-z0-9-]/g, '')       // 只保留 a-z 0-9 -
    .replace(/-+/g, '-')              // 多個 - 合併
    .replace(/^-+|-+$/g, '')          // 去頭尾 -
}

function compactMaterialSlugPart(material: string): string {
  const normalized = material.trim().toLowerCase()

  if (
    normalized === '925 sterling silver with 18k gold plating' ||
    normalized === '925 sterling silver with white gold plating'
  ) {
    return '925'
  }

  if (normalized === '18k gold') return '18k'
  if (normalized === '18k white gold') return '18kwg'
  if (normalized === 'natural diamond') return 'diamond'
  if (normalized === 'lab-grown diamond') return 'lab-diamond'
  if (normalized === 'cubic zirconia') return 'cz'

  return material.trim()
}

export function materialValueToSlugPart(value: string): string {
  return Array.from(
    new Set(
      value
        .split(/[,;/\n]+/)
        .map((part) => compactMaterialSlugPart(part))
        .filter(Boolean)
    )
  ).join(' ')
}

function compactPearlTypeSlugPart(pearlType: string): string {
  const normalized = pearlType.trim().toLowerCase()

  if (normalized === 'whiteakoya') return 'white-akoya'
  if (normalized === 'greyakoya') return 'grey-akoya'
  if (normalized === 'whitesouthsea') return 'white-south-sea'
  if (normalized === 'goldensouthsea') return 'golden-south-sea'

  return pearlType.trim()
}

export function pearlTypeValueToSlugPart(value: string): string {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((part) => compactPearlTypeSlugPart(part))
        .filter(Boolean)
    )
  ).join(' ')
}
