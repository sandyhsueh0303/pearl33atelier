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
