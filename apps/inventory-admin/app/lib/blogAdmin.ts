import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const blogContentDirectory = path.join(process.cwd(), '..', 'public-web', 'content', 'blog')

export type AdminBlogPostSummary = {
  slug: string
  fileName: string
  title: string
  excerpt: string
  publishedAt: string
  updatedAt?: string
  author: string
  tags: string[]
  readingMinutes: number
  ogImage?: string
}

function isPublishableBlogFrontmatter(data: Record<string, unknown>): data is {
  title: string
  excerpt: string
  publishedAt: string
  author: string
  tags?: string[]
  readingMinutes?: number
  updatedAt?: string
  ogImage?: string
} {
  return (
    typeof data.title === 'string' &&
    data.title.trim().length > 0 &&
    typeof data.excerpt === 'string' &&
    data.excerpt.trim().length > 0 &&
    typeof data.publishedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.publishedAt) &&
    typeof data.author === 'string' &&
    data.author.trim().length > 0
  )
}

export async function listAdminBlogPosts(): Promise<AdminBlogPostSummary[]> {
  const fileNames = await fs.readdir(blogContentDirectory)

  const posts: Array<AdminBlogPostSummary | null> = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const fullPath = path.join(blogContentDirectory, fileName)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        const { data } = matter(fileContents)

        if (!isPublishableBlogFrontmatter(data)) {
          return null
        }

        return {
          slug: fileName.replace(/\.md$/, ''),
          fileName,
          title: data.title.trim(),
          excerpt: data.excerpt.trim(),
          publishedAt: data.publishedAt,
          updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
          author: data.author.trim(),
          tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
          readingMinutes: typeof data.readingMinutes === 'number' ? data.readingMinutes : 5,
          ogImage: typeof data.ogImage === 'string' ? data.ogImage : undefined,
        } satisfies AdminBlogPostSummary
      })
  )

  const publishablePosts = posts.filter((post): post is AdminBlogPostSummary => post !== null)

  return publishablePosts.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
}
