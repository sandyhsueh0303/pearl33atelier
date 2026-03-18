import { MetadataRoute } from 'next'
import { createSupabaseClient } from '@pearl33atelier/shared/supabase'
import { getAllPosts } from './lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.33pearlatelier.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/care-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/custom-services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/custom/inquiry`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ]

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let productPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('catalog_products')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .not('slug', 'is', null)
      .order('published_at', { ascending: false })

    productPages = (data || [])
      .filter((item) => typeof item.slug === 'string' && item.slug.length > 0)
      .map((item) => ({
        url: `${baseUrl}/products/${item.slug}`,
        lastModified: item.updated_at || item.published_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
  } catch {
    productPages = []
  }

  return [...staticPages, ...productPages, ...blogPages]
}
