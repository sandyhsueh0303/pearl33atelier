import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const rootContentDirectory = path.join(process.cwd(), 'apps/public-web/content/blog')
const appContentDirectory = path.join(process.cwd(), 'content/blog')
const postsDirectory = fs.existsSync(rootContentDirectory) ? rootContentDirectory : appContentDirectory

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  seoDescription: string
  publishedAt: string
  updatedAt?: string
  author: string
  tags: string[]
  readingMinutes: number
  content: string
}

/**
 * 取得所有文章
 */
export function getAllPosts(): BlogPost[] {
  // 確保目錄存在
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // 移除 .md 副檔名當作 slug
      const slug = fileName.replace(/\.md$/, '')

      // 讀取 markdown 檔案
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // 使用 gray-matter 解析 metadata 和 content
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        seoDescription: data.seoDescription,
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt,
        author: data.author,
        tags: data.tags || [],
        readingMinutes: data.readingMinutes || 5,
        content,
      } as BlogPost
    })

  // 按日期排序（最新的在前）
  return allPostsData.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1
    } else {
      return -1
    }
  })
}

/**
 * 根據 slug 取得單篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const { data, content } = matter(fileContents)

    // 將 Markdown 轉成 HTML
    const processedContent = await remark()
      .use(html)
      .process(content)
    
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      seoDescription: data.seoDescription,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      author: data.author,
      tags: data.tags || [],
      readingMinutes: data.readingMinutes || 5,
      content: contentHtml,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * 取得所有 slugs（用於 generateStaticParams）
 */
export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => ({
      slug: fileName.replace(/\.md$/, ''),
    }))
}
