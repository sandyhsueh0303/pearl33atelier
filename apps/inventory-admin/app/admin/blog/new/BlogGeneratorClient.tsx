'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  BLOG_ARTICLE_TYPES,
  BLOG_CTA_TYPES,
  BLOG_PRIMARY_INTENTS,
  BLOG_PRODUCT_CATEGORIES,
  slugify,
  type ArticlePackage,
  type ArticleBrief,
  type BlogProductCategory,
  type PlannerOutput,
  type ReviewerOutput,
  type RewriterOutput,
} from '@/app/lib/blogPipeline'

type BriefFormState = {
  slug: string
  workingTitle: string
  primaryIntent: ArticleBrief['primaryIntent']
  primaryKeyword: string
  secondaryKeywordsText: string
  audience: string
  articleType: ArticleBrief['articleType']
  goal: string
  mustCoverText: string
  niceToCoverText: string
  factsProvidedText: string
  linksToMentionText: string
  relevantCollectionsText: string
  customServiceRelevant: boolean
  productCategoriesRelevant: BlogProductCategory[]
  ctaType: ArticleBrief['cta']['type']
  ctaPath: string
  ctaLabelHint: string
  avoidClaimsText: string
  mustNotMentionText: string
  targetReadingMinutes: string
}

type PlannerStageResponse = {
  ok: boolean
  source: 'openai' | 'fallback'
  output: PlannerOutput
  debug?: string | null
}

type PipelineStage<T> = {
  ok: boolean
  source?: 'openai' | 'fallback'
  output: T | null
  debug?: string | null
  skipped?: boolean
  reason?: string
}

type BlogGenerateFullResponse = {
  stages?: {
    planner?: PipelineStage<PlannerOutput>
    writer?: PipelineStage<ArticlePackage>
    reviewer?: PipelineStage<ReviewerOutput>
    rewriter?: PipelineStage<RewriterOutput>
    packaging?: PipelineStage<ArticlePackage>
  }
  final?: {
    articlePackage?: ArticlePackage | null
    rewrittenPackage?: ArticlePackage | null
  } | null
}

const defaultBrief: BriefFormState = {
  slug: '',
  workingTitle: '',
  primaryIntent: 'educational',
  primaryKeyword: '',
  secondaryKeywordsText: '',
  audience: '',
  articleType: 'evergreen-guide',
  goal: '',
  mustCoverText: '',
  niceToCoverText: '',
  factsProvidedText: '',
  linksToMentionText: '',
  relevantCollectionsText: '',
  customServiceRelevant: false,
  productCategoriesRelevant: [],
  ctaType: 'soft-none',
  ctaPath: '',
  ctaLabelHint: '',
  avoidClaimsText: '',
  mustNotMentionText: '',
  targetReadingMinutes: '',
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildBriefPayload(state: BriefFormState): ArticleBrief {
  return {
    slug: state.slug,
    workingTitle: state.workingTitle,
    primaryIntent: state.primaryIntent,
    primaryKeyword: state.primaryKeyword,
    secondaryKeywords: splitLines(state.secondaryKeywordsText),
    audience: state.audience,
    articleType: state.articleType,
    goal: state.goal,
    mustCover: splitLines(state.mustCoverText),
    niceToCover: splitLines(state.niceToCoverText),
    brandContext: {
      relevantCollections: splitLines(state.relevantCollectionsText),
      customServiceRelevant: state.customServiceRelevant,
      productCategoriesRelevant: state.productCategoriesRelevant,
    },
    factsProvided: splitLines(state.factsProvidedText),
    linksToMention: splitLines(state.linksToMentionText),
    cta: {
      type: state.ctaType,
      path: state.ctaType === 'soft-none' ? '' : state.ctaPath,
      labelHint: state.ctaLabelHint || undefined,
    },
    constraints: {
      avoidClaims: splitLines(state.avoidClaimsText),
      mustNotMention: splitLines(state.mustNotMentionText),
      targetReadingMinutes: state.targetReadingMinutes
        ? Number(state.targetReadingMinutes)
        : undefined,
    },
  }
}

export default function BlogGeneratorClient() {
  const [form, setForm] = useState<BriefFormState>(defaultBrief)
  const [plannerStage, setPlannerStage] = useState<PlannerStageResponse | null>(null)
  const [pipelineStages, setPipelineStages] = useState<BlogGenerateFullResponse['stages'] | null>(null)
  const [finalArticlePackage, setFinalArticlePackage] = useState<ArticlePackage | null>(null)
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false)
  const [isRunningPipeline, setIsRunningPipeline] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const briefPreview = useMemo(() => buildBriefPayload(form), [form])

  async function handleGenerateOutline() {
    setIsGeneratingOutline(true)
    setError(null)
    setNotice(null)
    setValidationErrors([])
    setPipelineStages(null)
    setFinalArticlePackage(null)

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefPreview, mode: 'planner' }),
      })

      const data = await response.json()
      if (!response.ok) {
        setPlannerStage(null)
        setValidationErrors(Array.isArray(data.validationErrors) ? data.validationErrors : [])
        throw new Error(data.error || 'Failed to generate outline')
      }

      setPlannerStage(data.stages?.planner || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outline')
    } finally {
      setIsGeneratingOutline(false)
    }
  }

  async function handleRunFullPipeline() {
    setIsRunningPipeline(true)
    setError(null)
    setNotice(null)
    setValidationErrors([])

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefPreview, mode: 'full' }),
      })

      const data = (await response.json()) as BlogGenerateFullResponse & {
        error?: string
        validationErrors?: string[]
      }

      if (!response.ok) {
        setValidationErrors(Array.isArray(data.validationErrors) ? data.validationErrors : [])
        throw new Error(data.error || 'Failed to run full pipeline')
      }

      setPipelineStages(data.stages || null)
      setPlannerStage((data.stages?.planner as PlannerStageResponse | undefined) || null)
      setFinalArticlePackage(data.final?.articlePackage || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run full pipeline')
    } finally {
      setIsRunningPipeline(false)
    }
  }

  async function handleSaveArticle() {
    if (!finalArticlePackage) return

    setIsSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articlePackage: finalArticlePackage }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article')
      }

      setNotice(`Saved ${data.slug}.md and ${data.slug}.schema.json`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title-row">
          <h1 className="admin-page-title">New Blog Article</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/blog" className="admin-link-btn" style={{ background: '#f5f5f5' }}>
            Back to Blog
          </Link>
        </div>
      </div>

      <div
        style={{
          marginBottom: '1rem',
          padding: '0.95rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(201, 169, 97, 0.22)',
          background: 'linear-gradient(145deg, #fffdf8 0%, #f8f3ea 100%)',
          color: '#5a4630',
          lineHeight: 1.6,
        }}
      >
        Start with the planner loop if you want to sanity-check the outline first. Once that looks
        right, run the full pipeline to preview writer, reviewer, rewriter, packaging, metadata,
        and the final Markdown.
      </div>

      {error ? (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #fecaca',
            background: '#fff1f2',
            color: '#9f1239',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      ) : null}

      {!error && notice ? (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#166534',
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      ) : null}

      {validationErrors.length > 0 ? (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid #fde68a',
            background: '#fffbeb',
            color: '#92400e',
          }}
        >
          <strong>Brief validation</strong>
          <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.2rem' }}>
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-card" style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'minmax(340px, 1.05fr) minmax(320px, 1fr)' }}>
        <section style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2f2418' }}>Article Brief</h2>
            <p style={{ margin: '0.45rem 0 0', color: '#6f5d48', lineHeight: 1.6 }}>
              Keep this close to the schema. The planner output on the right should become the
              writer-facing blueprint.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            <Field label="Working Title">
              <input
                value={form.workingTitle}
                onChange={(event) => {
                  const workingTitle = event.target.value
                  setForm((prev) => ({
                    ...prev,
                    workingTitle,
                    slug: prev.slug || slugify(workingTitle),
                  }))
                }}
              />
            </Field>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))
                  }
                />
              </Field>
              <Field label="Primary Keyword">
                <input
                  value={form.primaryKeyword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, primaryKeyword: event.target.value }))
                  }
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Primary Intent">
                <select
                  value={form.primaryIntent}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      primaryIntent: event.target.value as ArticleBrief['primaryIntent'],
                    }))
                  }
                >
                  {BLOG_PRIMARY_INTENTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Article Type">
                <select
                  value={form.articleType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      articleType: event.target.value as ArticleBrief['articleType'],
                    }))
                  }
                >
                  {BLOG_ARTICLE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Audience">
              <input
                value={form.audience}
                onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
              />
            </Field>

            <Field label="Goal">
              <textarea
                value={form.goal}
                onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
                rows={3}
              />
            </Field>

            <Field label="Must Cover" hint="One topic per line">
              <textarea
                value={form.mustCoverText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mustCoverText: event.target.value }))
                }
                rows={5}
              />
            </Field>

            <Field label="Nice to Cover" hint="Optional, one topic per line">
              <textarea
                value={form.niceToCoverText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, niceToCoverText: event.target.value }))
                }
                rows={3}
              />
            </Field>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Secondary Keywords" hint="One per line">
                <textarea
                  value={form.secondaryKeywordsText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, secondaryKeywordsText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
              <Field label="Links to Mention" hint="One path per line">
                <textarea
                  value={form.linksToMentionText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, linksToMentionText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Facts Provided" hint="One fact per line">
                <textarea
                  value={form.factsProvidedText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, factsProvidedText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
              <Field label="Relevant Collections" hint="One collection per line">
                <textarea
                  value={form.relevantCollectionsText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, relevantCollectionsText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
            </div>

            <Field label="Relevant Product Categories">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {BLOG_PRODUCT_CATEGORIES.map((category) => {
                  const selected = form.productCategoriesRelevant.includes(category)
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          productCategoriesRelevant: selected
                            ? prev.productCategoriesRelevant.filter((item) => item !== category)
                            : prev.productCategoriesRelevant.concat(category),
                        }))
                      }
                      style={{
                        border: selected ? '1px solid #a67c39' : '1px solid #ddd6c8',
                        background: selected ? '#f6f0e2' : '#fff',
                        color: '#5a4630',
                        borderRadius: '999px',
                        padding: '0.45rem 0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#5a4630' }}>
              <input
                type="checkbox"
                checked={form.customServiceRelevant}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, customServiceRelevant: event.target.checked }))
                }
              />
              Custom service is relevant to this article
            </label>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <Field label="CTA Type">
                <select
                  value={form.ctaType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      ctaType: event.target.value as ArticleBrief['cta']['type'],
                      ctaPath:
                        event.target.value === 'soft-none' ? '' : prev.ctaPath,
                    }))
                  }
                >
                  {BLOG_CTA_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="CTA Path">
                <input
                  value={form.ctaPath}
                  onChange={(event) => setForm((prev) => ({ ...prev, ctaPath: event.target.value }))}
                  disabled={form.ctaType === 'soft-none'}
                />
              </Field>
              <Field label="CTA Label Hint">
                <input
                  value={form.ctaLabelHint}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, ctaLabelHint: event.target.value }))
                  }
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr 160px' }}>
              <Field label="Avoid Claims" hint="One per line">
                <textarea
                  value={form.avoidClaimsText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, avoidClaimsText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
              <Field label="Must Not Mention" hint="One per line">
                <textarea
                  value={form.mustNotMentionText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, mustNotMentionText: event.target.value }))
                  }
                  rows={4}
                />
              </Field>
              <Field label="Target Reading Minutes">
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={form.targetReadingMinutes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, targetReadingMinutes: event.target.value }))
                  }
                />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-link-btn admin-link-btn-primary"
              onClick={handleGenerateOutline}
              disabled={isGeneratingOutline || isRunningPipeline}
            >
              {isGeneratingOutline ? 'Generating Outline...' : 'Generate Outline'}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              onClick={handleRunFullPipeline}
              disabled={isGeneratingOutline || isRunningPipeline}
              style={{ background: '#f5f5f5' }}
            >
              {isRunningPipeline ? 'Running Full Pipeline...' : 'Run Full Pipeline'}
            </button>
            <span style={{ color: '#7b6a55' }}>
              Planner-only is useful for structure checks. Full pipeline adds article, QA, and packaging previews.
            </span>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2f2418' }}>Planner Output</h2>
            <p style={{ margin: '0.45rem 0 0', color: '#6f5d48', lineHeight: 1.6 }}>
              Use this to confirm the article angle and outline before we generate the full draft.
            </p>
          </div>

          {plannerStage ? (
            <>
              <PipelineCard
                title="Planner"
                subtitle={
                  plannerStage.source === 'openai'
                    ? 'OpenAI planner output'
                    : 'Fallback planner output'
                }
                status="Ready"
                collapsible
                defaultOpen
              >
                <div style={{ display: 'grid', gap: '0.9rem', color: '#5a4630', lineHeight: 1.6 }}>
                  {plannerStage.debug ? (
                    <div
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                      }}
                    >
                      <strong>Fallback reason:</strong> {plannerStage.debug}
                    </div>
                  ) : null}

                  <div>
                    <strong>Search Intent</strong>
                    <div>{plannerStage.output.searchIntent}</div>
                  </div>
                  <div>
                    <strong>Reader Question</strong>
                    <div>{plannerStage.output.readerQuestion}</div>
                  </div>
                  <div>
                    <strong>Article Angle</strong>
                    <div>{plannerStage.output.articleAngle}</div>
                  </div>
                  <div>
                    <strong>Reader Promise</strong>
                    <div>{plannerStage.output.readerPromise}</div>
                  </div>
                </div>
              </PipelineCard>

              <PipelineCard
                title="Recommended Title"
                subtitle="Frontmatter direction"
                status="Ready"
                collapsible
                defaultOpen={false}
              >
                <div style={{ display: 'grid', gap: '0.75rem', color: '#5a4630', lineHeight: 1.6 }}>
                  <div>
                    <strong>{plannerStage.output.recommendedTitle}</strong>
                  </div>
                  <div>{plannerStage.output.frontmatterDraft.excerpt}</div>
                  <div style={{ color: '#7b6a55', fontSize: '0.92rem' }}>
                    Keywords: {plannerStage.output.frontmatterDraft.keywords.join(', ')}
                  </div>
                </div>
              </PipelineCard>

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {plannerStage.output.outline.map((section, index) => (
                  <PipelineCard
                    key={`${section.heading}-${index}`}
                    title={`Outline ${index + 1}`}
                    subtitle={section.heading}
                    status="Outline"
                    collapsible
                    defaultOpen={index === 0}
                  >
                    <div style={{ display: 'grid', gap: '0.75rem', color: '#5a4630', lineHeight: 1.6 }}>
                      <div>
                        <strong>Purpose</strong>
                        <div>{section.purpose}</div>
                      </div>
                      <div>
                        <strong>Must Cover</strong>
                        <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1.1rem' }}>
                          {section.mustCover.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      {section.notes.length > 0 ? (
                        <div>
                          <strong>Notes</strong>
                          <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1.1rem' }}>
                            {section.notes.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </PipelineCard>
                ))}
              </div>

              {pipelineStages ? (
                <>
                  <div>
                    <h3 style={{ margin: '0.5rem 0 0', color: '#2f2418' }}>Pipeline Cards</h3>
                    <p style={{ margin: '0.35rem 0 0', color: '#6f5d48', lineHeight: 1.6 }}>
                      This mirrors the current stage-by-stage pipeline view, so we can inspect each
                      artifact before saving.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '0.9rem' }}>
                    <StageArtifactCard title="Writer" stage={pipelineStages.writer} />
                    <StageArtifactCard title="Reviewer" stage={pipelineStages.reviewer} />
                    <StageArtifactCard title="Rewriter" stage={pipelineStages.rewriter} />
                    <StageArtifactCard title="Packaging" stage={pipelineStages.packaging} />
                  </div>
                </>
              ) : null}

              {finalArticlePackage ? (
                <>
                  <div>
                    <h3 style={{ margin: '0.5rem 0 0', color: '#2f2418' }}>Metadata Preview</h3>
                    <p style={{ margin: '0.35rem 0 0', color: '#6f5d48', lineHeight: 1.6 }}>
                      Final frontmatter preview before save.
                    </p>
                  </div>

                  <PipelineCard
                    title="Frontmatter"
                    subtitle={finalArticlePackage.slug}
                    status="Final"
                    collapsible
                    defaultOpen={false}
                  >
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#5a4630',
                        lineHeight: 1.6,
                        fontSize: '0.9rem',
                      }}
                    >
                      {JSON.stringify(finalArticlePackage.frontmatter, null, 2)}
                    </pre>
                  </PipelineCard>

                  <PipelineCard
                    title="Body Markdown"
                    subtitle="Final article content"
                    status="Preview"
                    collapsible
                    defaultOpen={false}
                  >
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#5a4630',
                        lineHeight: 1.65,
                        fontSize: '0.92rem',
                        maxHeight: '420px',
                        overflow: 'auto',
                      }}
                    >
                      {finalArticlePackage.bodyMarkdown}
                    </pre>
                  </PipelineCard>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="admin-link-btn admin-link-btn-primary"
                      onClick={handleSaveArticle}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Article'}
                    </button>
                    <span style={{ color: '#7b6a55' }}>
                      This writes <code>{finalArticlePackage.slug}.md</code> and{' '}
                      <code>{finalArticlePackage.slug}.schema.json</code> into{' '}
                      <code>apps/public-web/content/blog</code>.
                    </span>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div
              style={{
                border: '1px dashed #d8cebf',
                borderRadius: '14px',
                padding: '1.25rem',
                background: '#fffdf9',
                color: '#7b6a55',
                lineHeight: 1.6,
              }}
            >
              No outline yet. Generate one from the brief on the left to preview search intent,
              article angle, and section structure.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: '0.45rem' }}>
      <span style={{ fontWeight: 700, color: '#5a4630' }}>{label}</span>
      {children}
      {hint ? <span style={{ color: '#8a7862', fontSize: '0.84rem' }}>{hint}</span> : null}
    </label>
  )
}

function PipelineCard({
  title,
  subtitle,
  status,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string
  subtitle: string
  status: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  if (collapsible) {
    return (
      <details
        open={defaultOpen}
        style={{
          border: '1px solid #ece7de',
          borderRadius: '14px',
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '0.85rem 1rem',
            borderBottom: '1px solid #f1ece4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <span style={{ display: 'grid', gap: '0.18rem' }}>
            <strong style={{ color: '#2f2418' }}>{title}</strong>
            <span style={{ color: '#8a7862', fontSize: '0.9rem' }}>{subtitle}</span>
          </span>
          <span className="admin-pill admin-pill-gold">{status}</span>
        </summary>
        <div style={{ padding: '1rem' }}>{children}</div>
      </details>
    )
  }

  return (
    <section
      style={{
        border: '1px solid #ece7de',
        borderRadius: '14px',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid #f1ece4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'grid', gap: '0.18rem' }}>
          <strong style={{ color: '#2f2418' }}>{title}</strong>
          <span style={{ color: '#8a7862', fontSize: '0.9rem' }}>{subtitle}</span>
        </div>
        <span className="admin-pill admin-pill-gold">{status}</span>
      </div>
      <div style={{ padding: '1rem' }}>{children}</div>
    </section>
  )
}

function StageArtifactCard({
  title,
  stage,
}: {
  title: string
  stage: PipelineStage<unknown> | undefined
}) {
  const status = stage?.skipped
    ? 'Skipped'
    : stage?.ok
      ? stage.source === 'openai'
        ? 'OpenAI'
        : 'Fallback'
      : 'Waiting'

  return (
    <PipelineCard
      title={title}
      subtitle="Pipeline artifact"
      status={status}
      collapsible
      defaultOpen={false}
    >
      {stage?.skipped ? (
        <div style={{ color: '#7b6a55', lineHeight: 1.6 }}>{stage.reason}</div>
      ) : stage?.output ? (
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#5a4630',
            lineHeight: 1.6,
            fontSize: '0.88rem',
            maxHeight: '260px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(stage.output, null, 2)}
        </pre>
      ) : (
        <div style={{ color: '#7b6a55', lineHeight: 1.6 }}>
          {stage?.debug || 'No artifact available yet.'}
        </div>
      )}
    </PipelineCard>
  )
}
