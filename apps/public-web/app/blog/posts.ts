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
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'pearl-types-akoya-south-sea-tahitian-freshwater',
    title: 'Pearl Types Guide: Akoya, South Sea, Tahitian, and Freshwater',
    excerpt:
      'A practical guide to the main pearl varieties and how to choose the right one for your style and budget.',
    seoDescription:
      'Learn the differences between Akoya, South Sea, Tahitian, and Freshwater pearls, including luster, color, size, and ideal jewelry styles.',
    publishedAt: '2026-02-14',
    author: '33 Pearl Atelier',
    tags: ['Pearl Guide', 'Akoya', 'South Sea', 'Tahitian', 'Freshwater'],
    readingMinutes: 6,
    sections: [
      {
        heading: 'Why Pearl Type Matters',
        paragraphs: [
          'Different pearl types vary in luster, overtone, size range, and overall mood. Choosing the right type helps your final jewelry piece feel balanced and intentional.',
          'When selecting pearls, focus on how they look in natural light, how they pair with your preferred metal tone, and how often you plan to wear the piece.',
        ],
      },
      {
        heading: 'Quick Overview of the Four Main Types',
        paragraphs: [
          'Akoya pearls are known for sharp luster and classic elegance. South Sea pearls are larger and often have a soft satin glow. Tahitian pearls offer darker tones and unique overtones, while Freshwater pearls provide flexible shapes and excellent value.',
          'No type is universally better. The right choice depends on style goals, budget, and design context.',
        ],
      },
      {
        heading: 'How We Recommend Choosing',
        paragraphs: [
          'Start with your use case: daily wear, gifting, bridal, or statement occasions. Then compare size comfort, color tone, and overall silhouette.',
          'For custom projects, we usually prepare options across quality levels so you can compare side by side before finalizing.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-care-for-pearl-jewelry-daily',
    title: 'How to Care for Pearl Jewelry in Daily Life',
    excerpt:
      'Simple care habits that keep pearls luminous and protected for years.',
    seoDescription:
      'Discover easy daily pearl care tips: wear pearls last, avoid chemicals, proper storage, and cleaning methods that protect luster.',
    publishedAt: '2026-02-14',
    author: '33 Pearl Atelier',
    tags: ['Pearl Care', 'Jewelry Maintenance'],
    readingMinutes: 5,
    sections: [
      {
        heading: 'The Last-On, First-Off Rule',
        paragraphs: [
          'Apply skincare, perfume, and hairspray first. Put on pearls last to reduce chemical contact.',
          'At the end of the day, remove pearls before makeup removal and cleansing products.',
        ],
      },
      {
        heading: 'Cleaning and Storage Basics',
        paragraphs: [
          'After wearing, wipe pearls with a soft cloth to remove oils and moisture.',
          'Store pearls separately from harder gems and metals to avoid scratches.',
        ],
      },
      {
        heading: 'When to Schedule Professional Care',
        paragraphs: [
          'If a pearl strand feels loose or spacing between knots increases, consider restringing.',
          'For frequently worn strands, periodic inspection helps prevent breakage and loss.',
        ],
      },
    ],
  },
]

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

