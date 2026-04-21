export const BLOG_PRIMARY_INTENTS = [
  'educational',
  'comparison',
  'buying-guide',
  'care-guide',
  'styling-guide',
  'process-explainer',
] as const

export const BLOG_ARTICLE_TYPES = [
  'evergreen-guide',
  'comparison-guide',
  'faq-style-guide',
  'brand-education',
  'editorial-story',
] as const

export const BLOG_CTA_TYPES = [
  'shop-collection',
  'browse-category',
  'custom-inquiry',
  'soft-none',
] as const

export const BLOG_PRODUCT_CATEGORIES = [
  'Bracelets',
  'Necklaces',
  'Earrings',
  'Studs',
  'Rings',
  'Pendants',
  'Loose Pearls',
  'Brooches',
] as const

export type BlogPrimaryIntent = (typeof BLOG_PRIMARY_INTENTS)[number]
export type BlogArticleType = (typeof BLOG_ARTICLE_TYPES)[number]
export type BlogCtaType = (typeof BLOG_CTA_TYPES)[number]
export type BlogProductCategory = (typeof BLOG_PRODUCT_CATEGORIES)[number]

export type ArticleBrief = {
  slug: string
  workingTitle: string
  primaryIntent: BlogPrimaryIntent
  primaryKeyword: string
  secondaryKeywords?: string[]
  audience: string
  articleType: BlogArticleType
  goal: string
  mustCover: string[]
  niceToCover?: string[]
  brandContext?: {
    relevantCollections?: string[]
    customServiceRelevant?: boolean
    productCategoriesRelevant?: BlogProductCategory[]
  }
  factsProvided?: string[]
  linksToMention?: string[]
  cta: {
    type: BlogCtaType
    path: string
    labelHint?: string
  }
  constraints?: {
    avoidClaims?: string[]
    mustNotMention?: string[]
    targetReadingMinutes?: number
  }
}

export type PlannerOutput = {
  slug: string
  searchIntent: string
  readerQuestion: string
  articleAngle: string
  readerPromise: string
  titleOptions: [string, string, string]
  recommendedTitle: string
  frontmatterDraft: {
    title: string
    excerpt: string
    seoDescription: string
    keywords: string[]
    ogImage: string
    ogImageAlt: string
    publishedAt: string
    updatedAt?: string
    author: string
    tags: string[]
    readingMinutes: number
  }
  outline: Array<{
    heading: string
    purpose: string
    mustCover: string[]
    notes: string[]
  }>
  internalLinkSuggestions: Array<{
    path: string
    reason: string
    anchorHint: string
  }>
  ctaRecommendation: {
    type: string
    path: string
    labelHint: string
    reason: string
  }
  riskNotes: string[]
  writerInstructions: string[]
}

export type ArticlePackage = {
  slug: string
  frontmatter: {
    title: string
    excerpt: string
    seoDescription: string
    keywords: string[]
    ogImage: string
    ogImageAlt: string
    publishedAt: string
    updatedAt?: string
    author: string
    tags: string[]
    readingMinutes: number
  }
  bodyMarkdown: string
  markdownDocument?: string
  internalLinks?: Array<{
    path: string
    anchorText: string
  }>
  qa?: {
    primaryKeywordUsed?: boolean
    relatedReadingSectionIncluded?: boolean
    notes?: string[]
  }
}

export type ReviewerOutput = {
  decision: 'approve' | 'revise'
  summary: string
  checks: {
    briefAligned: boolean
    plannerAligned: boolean
    brandToneAligned: boolean
    schemaValid: boolean
    searchIntentAligned: boolean
    unsupportedClaimsFound: boolean
    manualRelatedReadingFound: boolean
  }
  blockingIssues: Array<{
    field: string
    issue: string
    whyItMatters: string
    requiredAction: string
  }>
  nonBlockingSuggestions: string[]
  reviewedArticlePackage: ArticlePackage
}

export type RewriterOutput = {
  rewriteSummary: string
  addressedIssues: Array<{
    field: string
    issue: string
    resolution: string
  }>
  remainingConcerns: string[]
  rewrittenArticlePackage: ArticlePackage
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function inferArticleTypeFromIntent(intent: BlogPrimaryIntent): BlogArticleType {
  switch (intent) {
    case 'comparison':
      return 'comparison-guide'
    case 'care-guide':
      return 'faq-style-guide'
    case 'process-explainer':
      return 'brand-education'
    default:
      return 'evergreen-guide'
  }
}

export function inferAudienceFromIntent(intent: BlogPrimaryIntent): string {
  switch (intent) {
    case 'buying-guide':
      return 'Readers choosing their first or next pearl piece'
    case 'comparison':
      return 'Readers comparing pearl options before making a decision'
    case 'care-guide':
      return 'Pearl owners looking for practical daily care guidance'
    case 'styling-guide':
      return 'Readers looking for styling clarity around pearl jewelry'
    case 'process-explainer':
      return 'Readers curious about how custom pearl jewelry comes together'
    default:
      return 'Readers researching pearls before choosing, styling, or caring for them'
  }
}

export function inferGoal({
  workingTitle,
  primaryKeyword,
  primaryIntent,
}: {
  workingTitle: string
  primaryKeyword: string
  primaryIntent: BlogPrimaryIntent
}): string {
  const topic = primaryKeyword || workingTitle || 'the topic'
  switch (primaryIntent) {
    case 'comparison':
      return `Help the reader compare ${topic} clearly and decide which option fits best.`
    case 'buying-guide':
      return `Help the reader choose ${topic} with more confidence and less guesswork.`
    case 'care-guide':
      return `Help the reader understand how to care for ${topic} in a practical, realistic way.`
    case 'styling-guide':
      return `Help the reader style ${topic} with more clarity and confidence.`
    case 'process-explainer':
      return `Help the reader understand how ${topic} works from a design and decision-making perspective.`
    default:
      return `Help the reader understand ${topic} in a way that is practical, clear, and easy to use.`
  }
}

export function inferMustCover({
  workingTitle,
  primaryKeyword,
  primaryIntent,
}: {
  workingTitle: string
  primaryKeyword: string
  primaryIntent: BlogPrimaryIntent
}): string[] {
  const topic = primaryKeyword || workingTitle || 'the topic'
  switch (primaryIntent) {
    case 'comparison':
      return [
        `How the main options within ${topic} differ`,
        `What differences actually matter when deciding`,
        `How to choose the best fit with more confidence`,
      ]
    case 'buying-guide':
      return [
        `What to look for first when choosing ${topic}`,
        `How to avoid overcomplicating the decision`,
        `Which factors matter most for a first purchase`,
      ]
    case 'care-guide':
      return [
        `The daily habits that help protect ${topic}`,
        `What to avoid when wearing or storing ${topic}`,
        `How to keep care advice practical and realistic`,
      ]
    case 'styling-guide':
      return [
        `How ${topic} changes the mood of a look`,
        `What makes ${topic} easier or harder to style`,
        `How to choose a more wearable styling direction`,
      ]
    case 'process-explainer':
      return [
        `How the process around ${topic} typically starts`,
        `What decisions shape the final result`,
        `How to understand the process without overcomplicating it`,
      ]
    default:
      return [
        `Why ${topic} matters in practical terms`,
        `What the reader should understand first`,
        `How to use that understanding in a real decision`,
      ]
  }
}

export function validateArticleBrief(input: unknown): { brief?: ArticleBrief; errors: string[] } {
  const errors: string[] = []

  if (!input || typeof input !== 'object') {
    return { errors: ['Brief is required.'] }
  }

  const data = input as Record<string, unknown>
  const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
  const workingTitle = typeof data.workingTitle === 'string' ? data.workingTitle.trim() : ''
  const primaryIntent = data.primaryIntent
  const primaryKeyword = typeof data.primaryKeyword === 'string' ? data.primaryKeyword.trim() : ''
  const normalizedIntent = BLOG_PRIMARY_INTENTS.includes(primaryIntent as BlogPrimaryIntent)
    ? (primaryIntent as BlogPrimaryIntent)
    : null
  const audienceRaw = typeof data.audience === 'string' ? data.audience.trim() : ''
  const audience =
    audienceRaw || (normalizedIntent ? inferAudienceFromIntent(normalizedIntent) : '')
  const articleTypeRaw = data.articleType
  const articleType =
    BLOG_ARTICLE_TYPES.includes(articleTypeRaw as BlogArticleType)
      ? (articleTypeRaw as BlogArticleType)
      : normalizedIntent
        ? inferArticleTypeFromIntent(normalizedIntent)
        : articleTypeRaw
  const goalRaw = typeof data.goal === 'string' ? data.goal.trim() : ''
  const goal =
    goalRaw ||
    (normalizedIntent
      ? inferGoal({
          workingTitle,
          primaryKeyword,
          primaryIntent: normalizedIntent,
        })
      : '')
  const mustCoverRaw = Array.isArray(data.mustCover)
    ? data.mustCover.map((item) => String(item).trim()).filter(Boolean)
    : []
  const mustCover =
    mustCoverRaw.length > 0 || !normalizedIntent
      ? mustCoverRaw
      : inferMustCover({
          workingTitle,
          primaryKeyword,
          primaryIntent: normalizedIntent,
        })
  const ctaRaw = data.cta && typeof data.cta === 'object' ? (data.cta as Record<string, unknown>) : null
  const ctaType = ctaRaw?.type || 'soft-none'
  const ctaPath = typeof ctaRaw?.path === 'string' ? ctaRaw.path.trim() : ''

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push('Slug must be lowercase kebab-case.')
  }
  if (workingTitle.length < 10) {
    errors.push('Working title must be at least 10 characters.')
  }
  if (!normalizedIntent) {
    errors.push('Primary intent is invalid.')
  }
  if (primaryKeyword.length < 3) {
    errors.push('Primary keyword is required.')
  }
  if (audience.length < 3) {
    errors.push('Audience is required.')
  }
  if (!BLOG_ARTICLE_TYPES.includes(articleType as BlogArticleType)) {
    errors.push('Article type is invalid.')
  }
  if (goal.length < 10) {
    errors.push('Goal is required.')
  }
  if (mustCover.length < 2) {
    errors.push('Add at least two must-cover topics.')
  }
  if (!BLOG_CTA_TYPES.includes(ctaType as BlogCtaType)) {
    errors.push('CTA type is invalid.')
  }
  if (!ctaPath && ctaType !== 'soft-none') {
    errors.push('CTA path is required unless CTA type is soft-none.')
  }

  const brief: ArticleBrief = {
    slug,
    workingTitle,
    primaryIntent: primaryIntent as BlogPrimaryIntent,
    primaryKeyword,
    secondaryKeywords: Array.isArray(data.secondaryKeywords)
      ? data.secondaryKeywords.map((item) => String(item).trim()).filter(Boolean)
      : [],
    audience,
    articleType: articleType as BlogArticleType,
    goal,
    mustCover,
    niceToCover: Array.isArray(data.niceToCover)
      ? data.niceToCover.map((item) => String(item).trim()).filter(Boolean)
      : [],
    brandContext:
      data.brandContext && typeof data.brandContext === 'object'
        ? {
            relevantCollections: Array.isArray((data.brandContext as Record<string, unknown>).relevantCollections)
              ? ((data.brandContext as Record<string, unknown>).relevantCollections as unknown[])
                  .map((item) => String(item).trim())
                  .filter(Boolean)
              : [],
            customServiceRelevant: Boolean(
              (data.brandContext as Record<string, unknown>).customServiceRelevant
            ),
            productCategoriesRelevant: Array.isArray(
              (data.brandContext as Record<string, unknown>).productCategoriesRelevant
            )
              ? ((data.brandContext as Record<string, unknown>).productCategoriesRelevant as unknown[]).filter(
                  (item): item is BlogProductCategory =>
                    BLOG_PRODUCT_CATEGORIES.includes(item as BlogProductCategory)
                )
              : [],
          }
        : {},
    factsProvided: Array.isArray(data.factsProvided)
      ? data.factsProvided.map((item) => String(item).trim()).filter(Boolean)
      : [],
    linksToMention: Array.isArray(data.linksToMention)
      ? data.linksToMention.map((item) => String(item).trim()).filter(Boolean)
      : [],
    cta: {
      type: ctaType as BlogCtaType,
      path: ctaType === 'soft-none' ? '' : ctaPath,
      labelHint:
        typeof ctaRaw?.labelHint === 'string' && ctaRaw.labelHint.trim()
          ? ctaRaw.labelHint.trim()
          : undefined,
    },
    constraints:
      data.constraints && typeof data.constraints === 'object'
        ? {
            avoidClaims: Array.isArray((data.constraints as Record<string, unknown>).avoidClaims)
              ? ((data.constraints as Record<string, unknown>).avoidClaims as unknown[])
                  .map((item) => String(item).trim())
                  .filter(Boolean)
              : [],
            mustNotMention: Array.isArray((data.constraints as Record<string, unknown>).mustNotMention)
              ? ((data.constraints as Record<string, unknown>).mustNotMention as unknown[])
                  .map((item) => String(item).trim())
                  .filter(Boolean)
              : [],
            targetReadingMinutes:
              typeof (data.constraints as Record<string, unknown>).targetReadingMinutes === 'number'
                ? ((data.constraints as Record<string, unknown>).targetReadingMinutes as number)
                : undefined,
          }
        : {},
  }

  return { brief: errors.length === 0 ? brief : undefined, errors }
}

export function parseJsonObject<T>(text: string): T {
  const raw = text.trim()

  // 1. direct parse
  try {
    return JSON.parse(raw) as T
  } catch {}

  // 2. remove markdown fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as T
    } catch {}
  }

  // 3. find first balanced JSON object
  const extracted = extractFirstJsonObject(raw)
  if (extracted) {
    return JSON.parse(extracted) as T
  }

  throw new Error("Model did not return valid JSON.")
}

function extractFirstJsonObject(text: string): string | null {
  let depth = 0
  let inString = false
  let escape = false
  let start = -1

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (escape) {
      escape = false
      continue
    }

    if (ch === "\\") {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === "{") {
      if (depth === 0) start = i
      depth++
    } else if (ch === "}") {
      depth--
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1)
      }
    }
  }

  return null
}

export function isPlannerOutput(input: unknown): input is PlannerOutput {
  const data = input as PlannerOutput
  return (
    Boolean(data) &&
    typeof data.slug === 'string' &&
    typeof data.searchIntent === 'string' &&
    typeof data.readerQuestion === 'string' &&
    typeof data.articleAngle === 'string' &&
    typeof data.readerPromise === 'string' &&
    Array.isArray(data.titleOptions) &&
    data.titleOptions.length === 3 &&
    typeof data.recommendedTitle === 'string' &&
    Array.isArray(data.outline) &&
    data.outline.length > 0 &&
    typeof data.frontmatterDraft?.title === 'string'
  )
}

export function isArticlePackage(input: unknown): input is ArticlePackage {
  const data = input as ArticlePackage
  return (
    Boolean(data) &&
    typeof data.slug === 'string' &&
    typeof data.frontmatter?.title === 'string' &&
    typeof data.frontmatter?.excerpt === 'string' &&
    typeof data.frontmatter?.seoDescription === 'string' &&
    Array.isArray(data.frontmatter?.keywords) &&
    typeof data.frontmatter?.ogImage === 'string' &&
    typeof data.frontmatter?.ogImageAlt === 'string' &&
    typeof data.frontmatter?.publishedAt === 'string' &&
    typeof data.frontmatter?.author === 'string' &&
    Array.isArray(data.frontmatter?.tags) &&
    typeof data.frontmatter?.readingMinutes === 'number' &&
    typeof data.bodyMarkdown === 'string'
  )
}

export function isReviewerOutput(input: unknown): input is ReviewerOutput {
  const data = input as ReviewerOutput
  return (
    Boolean(data) &&
    (data.decision === 'approve' || data.decision === 'revise') &&
    typeof data.summary === 'string' &&
    Array.isArray(data.blockingIssues) &&
    Array.isArray(data.nonBlockingSuggestions) &&
    isArticlePackage(data.reviewedArticlePackage)
  )
}

export function isRewriterOutput(input: unknown): input is RewriterOutput {
  const data = input as RewriterOutput
  return (
    Boolean(data) &&
    typeof data.rewriteSummary === 'string' &&
    Array.isArray(data.addressedIssues) &&
    Array.isArray(data.remainingConcerns) &&
    isArticlePackage(data.rewrittenArticlePackage)
  )
}

export function renderMarkdownDocument(articlePackage: ArticlePackage) {
  const frontmatterLines = [
    '---',
    `title: ${toYamlString(articlePackage.frontmatter.title)}`,
    `excerpt: ${toYamlString(articlePackage.frontmatter.excerpt)}`,
    `seoDescription: ${toYamlString(articlePackage.frontmatter.seoDescription)}`,
    `keywords: ${toYamlArray(articlePackage.frontmatter.keywords)}`,
    `ogImage: ${toYamlString(articlePackage.frontmatter.ogImage)}`,
    `ogImageAlt: ${toYamlString(articlePackage.frontmatter.ogImageAlt)}`,
    `publishedAt: ${toYamlString(articlePackage.frontmatter.publishedAt)}`,
    ...(articlePackage.frontmatter.updatedAt
      ? [`updatedAt: ${toYamlString(articlePackage.frontmatter.updatedAt)}`]
      : []),
    `author: ${toYamlString(articlePackage.frontmatter.author)}`,
    `tags: ${toYamlArray(articlePackage.frontmatter.tags)}`,
    `readingMinutes: ${articlePackage.frontmatter.readingMinutes}`,
    '---',
    '',
    articlePackage.bodyMarkdown.trim(),
  ]

  return frontmatterLines.join('\n')
}

function toYamlString(value: string) {
  return JSON.stringify(value)
}

function toYamlArray(values: string[]) {
  return `[${values.map((value) => JSON.stringify(value)).join(', ')}]`
}

function normalizeDate(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeArticlePackage(articlePackage: ArticlePackage): ArticlePackage {
  const normalized: ArticlePackage = {
    slug: articlePackage.slug,
    frontmatter: {
      title: articlePackage.frontmatter.title.trim(),
      excerpt: articlePackage.frontmatter.excerpt.trim(),
      seoDescription: articlePackage.frontmatter.seoDescription.trim(),
      keywords: articlePackage.frontmatter.keywords.map((keyword) => keyword.trim()).filter(Boolean).slice(0, 10),
      ogImage: articlePackage.frontmatter.ogImage.trim(),
      ogImageAlt: articlePackage.frontmatter.ogImageAlt.trim(),
      publishedAt: normalizeDate(articlePackage.frontmatter.publishedAt),
      updatedAt: articlePackage.frontmatter.updatedAt ? normalizeDate(articlePackage.frontmatter.updatedAt) : undefined,
      author: articlePackage.frontmatter.author.trim() || '33 Pearl Atelier',
      tags: articlePackage.frontmatter.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      readingMinutes: Math.min(Math.max(Math.round(articlePackage.frontmatter.readingMinutes || 5), 1), 30),
    },
    bodyMarkdown: articlePackage.bodyMarkdown.trim(),
    internalLinks: articlePackage.internalLinks || [],
    qa: {
      primaryKeywordUsed: Boolean(articlePackage.qa?.primaryKeywordUsed),
      relatedReadingSectionIncluded: Boolean(articlePackage.qa?.relatedReadingSectionIncluded),
      notes: (articlePackage.qa?.notes || []).map((note) => note.trim()).filter(Boolean),
    },
  }

  normalized.markdownDocument = renderMarkdownDocument(normalized)
  return normalized
}

export function buildFallbackPlannerOutput(brief: ArticleBrief): PlannerOutput {
  const readableKeyword = brief.primaryKeyword.trim()
  const titleSeed = brief.workingTitle.trim()
  const fallbackTitle =
    titleSeed.length > 0 ? titleSeed : `${titleCase(readableKeyword)} Guide`
  const readingMinutes = Math.min(
    Math.max(brief.constraints?.targetReadingMinutes || Math.max(4, brief.mustCover.length + 2), 3),
    12
  )
  const outline = [
    {
      heading: `Why ${titleCase(readableKeyword)} matters`,
      purpose: 'Open with real reader relevance and frame the decision clearly.',
      mustCover: [brief.goal, brief.mustCover[0]].filter(Boolean),
      notes: ['Keep the introduction practical, not broad or ornamental.'],
    },
    {
      heading: 'What to understand first',
      purpose: 'Orient the reader with only the background needed for the rest of the article.',
      mustCover: brief.mustCover.slice(0, 2),
      notes: ['Avoid a glossary feel. Keep only context that supports the main decision.'],
    },
    ...brief.mustCover.slice(1).map((item, index) => ({
      heading:
        index === brief.mustCover.slice(1).length - 1
          ? 'How to decide with confidence'
          : titleCase(item),
      purpose:
        index === brief.mustCover.slice(1).length - 1
          ? 'Turn the explanation into practical guidance the reader can use.'
          : 'Develop one distinct part of the article without repeating earlier sections.',
      mustCover:
        index === brief.mustCover.slice(1).length - 1 ? [item, brief.goal] : [item],
      notes: [
        index === brief.mustCover.slice(1).length - 1
          ? 'Translate information into clear decision help.'
          : 'Keep this section distinct from the rest of the outline.',
      ],
    })),
  ].slice(0, 6)

  return {
    slug: brief.slug,
    searchIntent: `Reader wants practical guidance on ${readableKeyword}.`,
    readerQuestion: `How should I think about ${readableKeyword} in a way that actually helps me decide?`,
    articleAngle: `A decision-oriented ${brief.articleType.replace(/-/g, ' ')} that keeps the topic clear, useful, and commercially soft.`,
    readerPromise: brief.goal,
    titleOptions: [
      fallbackTitle,
      `${titleCase(readableKeyword)}: What to Know Before You Choose`,
      `A Clear Guide to ${titleCase(readableKeyword)}`,
    ],
    recommendedTitle: fallbackTitle,
    frontmatterDraft: {
      title: fallbackTitle,
      excerpt: `A practical guide to ${readableKeyword} for ${brief.audience}, with clear structure and editorially restrained guidance.`,
      seoDescription: `Learn how to approach ${readableKeyword} with clearer context, practical guidance, and a more confident decision-making framework.`,
      keywords: [brief.primaryKeyword, ...(brief.secondaryKeywords || [])].filter(Boolean).slice(0, 6),
      ogImage: '/images/og-home.png',
      ogImageAlt: `${fallbackTitle} editorial image`,
      publishedAt: '2026-04-20',
      author: '33 Pearl Atelier',
      tags: [titleCase(brief.primaryIntent), titleCase(brief.articleType.replace(/-/g, ' '))]
        .concat((brief.brandContext?.productCategoriesRelevant || []).slice(0, 2))
        .slice(0, 4),
      readingMinutes,
    },
    outline,
    internalLinkSuggestions: (brief.linksToMention || []).slice(0, 3).map((path) => ({
      path,
      reason: 'Mentioned in the brief as a relevant internal destination.',
      anchorHint: 'Use a natural descriptive anchor.',
    })),
    ctaRecommendation: {
      type: brief.cta.type,
      path: brief.cta.path,
      labelHint: brief.cta.labelHint || '',
      reason:
        brief.cta.type === 'soft-none'
          ? 'No CTA needed unless the final article naturally earns one.'
          : 'Use the CTA softly and only after the article delivers real value.',
    },
    riskNotes: [
      'Avoid broad statements that discuss the topic without helping the reader decide.',
      ...(brief.constraints?.avoidClaims || []).map((item) => `Avoid claim: ${item}`),
    ].slice(0, 6),
    writerInstructions: [
      'Keep each section distinct and avoid repeating the same idea with new phrasing.',
      'Make the article useful before making it elegant.',
      'Do not let metadata promise more than the body delivers.',
    ],
  }
}

export function buildFallbackWriterOutput(
  brief: ArticleBrief,
  planner: PlannerOutput
): ArticlePackage {
  const intro = `${planner.readerQuestion} This guide is designed for ${brief.audience} and stays focused on practical clarity rather than broad pearl lore.`
  const sections = planner.outline.map((section) => {
    const mustCoverLines = section.mustCover
      .map((item) => `- ${item}`)
      .join('\n')
    const noteLine = section.notes[0] ? `\n\n${section.notes[0]}` : ''

    return `## ${section.heading}\n\n${section.purpose}\n\n${mustCoverLines}${noteLine}`
  })

  const bodyMarkdown = [intro, ...sections, `## A calm final takeaway\n\n${planner.readerPromise}`]
    .join('\n\n')
    .trim()

  const articlePackage: ArticlePackage = {
    slug: planner.slug,
    frontmatter: {
      ...planner.frontmatterDraft,
      publishedAt:
        planner.frontmatterDraft.publishedAt === 'TBD'
          ? normalizeDate()
          : normalizeDate(planner.frontmatterDraft.publishedAt),
      updatedAt: planner.frontmatterDraft.updatedAt
        ? normalizeDate(planner.frontmatterDraft.updatedAt)
        : undefined,
    },
    bodyMarkdown,
    internalLinks: planner.internalLinkSuggestions.map((item) => ({
      path: item.path,
      anchorText: item.anchorHint,
    })),
    qa: {
      primaryKeywordUsed: bodyMarkdown.toLowerCase().includes(brief.primaryKeyword.toLowerCase()),
      relatedReadingSectionIncluded: false,
      notes: ['Fallback writer output generated locally.'],
    },
  }

  return normalizeArticlePackage(articlePackage)
}

export function buildFallbackReviewerOutput(
  articlePackage: ArticlePackage
): ReviewerOutput {
  const normalized = normalizeArticlePackage(articlePackage)
  return {
    decision: 'approve',
    summary: 'Fallback reviewer approved the article package for UI development.',
    checks: {
      briefAligned: true,
      plannerAligned: true,
      brandToneAligned: true,
      schemaValid: true,
      searchIntentAligned: true,
      unsupportedClaimsFound: false,
      manualRelatedReadingFound: false,
    },
    blockingIssues: [],
    nonBlockingSuggestions: ['Run the real reviewer stage when OpenAI is enabled for editorial QA.'],
    reviewedArticlePackage: normalized,
  }
}

export function buildFallbackRewriterOutput(
  articlePackage: ArticlePackage
): RewriterOutput {
  const normalized = normalizeArticlePackage(articlePackage)
  return {
    rewriteSummary: 'No rewrite was needed in the fallback path.',
    addressedIssues: [],
    remainingConcerns: [],
    rewrittenArticlePackage: normalized,
  }
}
