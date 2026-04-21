import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import {
  isArticlePackage,
  normalizeArticlePackage,
  renderMarkdownDocument,
  type ArticlePackage,
} from '@/app/lib/blogPipeline'

const blogContentDirectory = path.join(process.cwd(), '..', 'public-web', 'content', 'blog')

type BlogSaveRequest = {
  articlePackage?: unknown
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  try {
    const body = (await request.json()) as BlogSaveRequest
    if (!isArticlePackage(body.articlePackage)) {
      return NextResponse.json({ error: 'Invalid article package' }, { status: 400 })
    }

    const normalized = normalizeArticlePackage(body.articlePackage as ArticlePackage)
    const markdownDocument = normalized.markdownDocument || renderMarkdownDocument(normalized)
    const markdownPath = path.join(blogContentDirectory, `${normalized.slug}.md`)
    const schemaPath = path.join(blogContentDirectory, `${normalized.slug}.schema.json`)

    await fs.writeFile(markdownPath, markdownDocument, 'utf8')
    await fs.writeFile(schemaPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')

    return NextResponse.json({
      ok: true,
      slug: normalized.slug,
      files: {
        markdownPath,
        schemaPath,
      },
    })
  } catch (error) {
    console.error('Failed to save blog article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save blog article' },
      { status: 500 }
    )
  }
}
