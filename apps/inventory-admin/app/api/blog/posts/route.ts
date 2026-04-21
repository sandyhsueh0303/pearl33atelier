import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { listAdminBlogPosts } from '@/app/lib/blogAdmin'

export async function GET() {
  const { errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  try {
    const posts = await listAdminBlogPosts()
    return NextResponse.json({
      posts,
      total: posts.length,
    })
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    return NextResponse.json({ error: 'Failed to load blog posts' }, { status: 500 })
  }
}

