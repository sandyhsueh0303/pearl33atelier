import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

type ParsedMarkdownFile = {
  content: string
  data: Record<string, unknown>
}

const blogContentDirectories = [
  path.join(process.cwd(), '..', 'public-web', 'content', 'blog'),
  path.join(process.cwd(), 'apps', 'public-web', 'content', 'blog'),
  path.join(process.cwd(), 'content', 'blog'),
]

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

function getBlogContentDirectory() {
  return blogContentDirectories.find((directory) => fsSync.existsSync(directory))
}

function coerceFrontmatterValue(rawValue: string): unknown {
  const trimmedValue = rawValue.trim()

  if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
    try {
      return JSON.parse(trimmedValue)
    } catch {
      return trimmedValue.slice(1, -1)
    }
  }

  if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
    return trimmedValue.slice(1, -1)
  }

  if (trimmedValue === 'true') {
    return true
  }

  if (trimmedValue === 'false') {
    return false
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return Number(trimmedValue)
  }

  if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
    return trimmedValue
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (item.startsWith('"') && item.endsWith('"')) {
          try {
            return JSON.parse(item)
          } catch {
            return item.slice(1, -1)
          }
        }

        if (item.startsWith("'") && item.endsWith("'")) {
          return item.slice(1, -1)
        }

        return item
      })
  }

  return trimmedValue
}

function parseFrontmatter(fileContents: string): ParsedMarkdownFile {
  if (!fileContents.startsWith('---\n')) {
    return { data: {}, content: fileContents }
  }

  const endMarkerIndex = fileContents.indexOf('\n---\n', 4)

  if (endMarkerIndex === -1) {
    return { data: {}, content: fileContents }
  }

  const frontmatterBlock = fileContents.slice(4, endMarkerIndex)
  const content = fileContents.slice(endMarkerIndex + 5)
  const data: Record<string, unknown> = {}
  let currentArrayKey: string | null = null

  for (const line of frontmatterBlock.split('\n')) {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      continue
    }

    if (trimmedLine.startsWith('- ') && currentArrayKey) {
      const currentValue = data[currentArrayKey]
      const nextValue = trimmedLine.slice(2).trim()

      if (Array.isArray(currentValue)) {
        currentValue.push(String(coerceFrontmatterValue(nextValue)))
      } else {
        data[currentArrayKey] = [String(coerceFrontmatterValue(nextValue))]
      }

      continue
    }

    currentArrayKey = null

    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()

    if (!key) {
      continue
    }

    if (!rawValue) {
      currentArrayKey = key
      data[key] = []
      continue
    }

    data[key] = coerceFrontmatterValue(rawValue)
  }

  return { data, content }
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
  const blogContentDirectory = getBlogContentDirectory()

  if (!blogContentDirectory) {
    return []
  }

  const fileNames = await fs.readdir(blogContentDirectory)

  const posts: Array<AdminBlogPostSummary | null> = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const fullPath = path.join(blogContentDirectory, fileName)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        const { data } = parseFrontmatter(fileContents)

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
