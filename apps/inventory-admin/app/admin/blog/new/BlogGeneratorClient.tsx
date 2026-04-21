'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  BLOG_PRIMARY_INTENTS,
  BLOG_PRODUCT_CATEGORIES,
  inferArticleTypeFromIntent,
  inferAudienceFromIntent,
  inferGoal,
  inferMustCover,
  slugify,
  type ArticlePackage,
  type ArticleBrief,
  type BlogProductCategory,
  type PlannerOutput,
  type ReviewerOutput,
  type RewriterOutput,
} from '@/app/lib/blogPipeline'

type BriefFormState = {
  workingTitle: string
  primaryIntent: ArticleBrief['primaryIntent']
  primaryKeyword: string
  mustCoverText: string
  productCategoriesRelevant: BlogProductCategory[]
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
  workingTitle: '',
  primaryIntent: 'educational',
  primaryKeyword: '',
  mustCoverText: '',
  productCategoriesRelevant: [],
  targetReadingMinutes: '',
}

const ui = {
  colors: {
    white: '#ffffff',
    pearl: '#f8f6f0',
    champagne: '#f7e7ce',
    sand: '#f4ede2',
    gold: '#d4af37',
    goldSoft: 'rgba(212, 175, 55, 0.18)',
    ink: '#2c2c2c',
    text: '#5a4630',
    textSoft: '#7b6a55',
    border: '#e8ddcb',
    borderSoft: '#f0e7d9',
  },
  shadow: {
    soft: '0 12px 32px rgba(63, 45, 24, 0.08)',
    inset: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  },
}

const panelStyle = {
  border: `1px solid ${ui.colors.border}`,
  borderRadius: '20px',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,247,241,0.98) 100%)',
  boxShadow: ui.shadow.soft,
}

const formControlStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  borderRadius: '14px',
  border: `1px solid ${ui.colors.border}`,
  background: 'linear-gradient(180deg, #fffdfa 0%, #ffffff 100%)',
  color: ui.colors.ink,
  fontSize: '0.96rem',
  lineHeight: 1.6,
  boxShadow: ui.shadow.inset,
} as const

const readOnlyControlStyle = {
  ...formControlStyle,
  background: 'linear-gradient(180deg, #faf7f0 0%, #fdfbf7 100%)',
  color: ui.colors.textSoft,
}

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.85rem 1.35rem',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4438 100%)',
  color: '#fff',
  border: `1px solid rgba(212, 175, 55, 0.35)`,
  boxShadow: '0 10px 24px rgba(44, 44, 44, 0.18)',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
} 

const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.85rem 1.35rem',
  borderRadius: '14px',
  background: 'linear-gradient(180deg, #fffdf8 0%, #f7f0e3 100%)',
  color: ui.colors.text,
  border: `1px solid ${ui.colors.border}`,
  boxShadow: '0 8px 20px rgba(92, 71, 39, 0.08)',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildBriefPayload(state: BriefFormState): ArticleBrief {
  const slug = slugify(state.workingTitle)
  const articleType = inferArticleTypeFromIntent(state.primaryIntent)
  const audience = inferAudienceFromIntent(state.primaryIntent)
  const goal = inferGoal({
    workingTitle: state.workingTitle,
    primaryKeyword: state.primaryKeyword,
    primaryIntent: state.primaryIntent,
  })
  const manualMustCover = splitLines(state.mustCoverText)

  return {
    slug,
    workingTitle: state.workingTitle,
    primaryIntent: state.primaryIntent,
    primaryKeyword: state.primaryKeyword,
    secondaryKeywords: [],
    audience,
    articleType,
    goal,
    mustCover:
      manualMustCover.length > 0
        ? manualMustCover
        : inferMustCover({
            workingTitle: state.workingTitle,
            primaryKeyword: state.primaryKeyword,
            primaryIntent: state.primaryIntent,
          }),
    niceToCover: [],
    brandContext: {
      relevantCollections: [],
      customServiceRelevant: false,
      productCategoriesRelevant: state.productCategoriesRelevant,
    },
    factsProvided: [],
    linksToMention: [],
    cta: {
      type: 'soft-none',
      path: '',
    },
    constraints: {
      avoidClaims: [],
      mustNotMention: [],
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
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <div
              style={{
                fontSize: '0.82rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: ui.colors.gold,
                fontWeight: 600,
              }}
            >
              Journal Pipeline
            </div>
            <h1
              className="admin-page-title"
              style={{
                fontFamily: 'var(--font-playfair-display), serif',
                fontWeight: 400,
                letterSpacing: '0.02em',
                color: ui.colors.ink,
                margin: 0,
              }}
            >
              New Blog Article
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/blog" className="admin-link-btn" style={{ background: '#f5f5f5' }}>
            Back to Blog
          </Link>
        </div>
      </div>

      <div
        style={{
          marginBottom: '1.25rem',
          padding: '1.2rem 1.25rem',
          borderRadius: '18px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'linear-gradient(180deg, #f3eadc 0%, #fffdf8 100%)',
          color: ui.colors.text,
          lineHeight: 1.7,
          boxShadow: ui.shadow.soft,
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
        <section
          style={{
            ...panelStyle,
            display: 'grid',
            gap: '1.15rem',
            alignContent: 'start',
            padding: '1.4rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: ui.colors.ink,
                fontFamily: 'var(--font-playfair-display), serif',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              Brief Input
            </h2>
            <p style={{ margin: '0.45rem 0 0', color: ui.colors.textSoft, lineHeight: 1.7 }}>
              Keep the input light. Let the handbook and prompts do the heavier editorial work.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            <Field label="Working Title">
              <input
                value={form.workingTitle}
                style={formControlStyle}
                onChange={(event) => {
                  const workingTitle = event.target.value
                  setForm((prev) => ({
                    ...prev,
                    workingTitle,
                  }))
                }}
              />
            </Field>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Primary Keyword">
                <input
                  value={form.primaryKeyword}
                  style={formControlStyle}
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
                  style={formControlStyle}
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
              <Field label="Auto Slug">
                <input value={briefPreview.slug} readOnly style={readOnlyControlStyle} />
              </Field>
            </div>

            <Field label="Must Cover" hint="Optional. One topic per line if you want to steer the article.">
              <textarea
                value={form.mustCoverText}
                style={{ ...formControlStyle, minHeight: '130px', resize: 'vertical' }}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, mustCoverText: event.target.value }))
                }
                rows={5}
              />
            </Field>

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
                        border: selected ? `1px solid ${ui.colors.gold}` : `1px solid ${ui.colors.border}`,
                        background: selected
                          ? 'linear-gradient(180deg, #faf1dc 0%, #fffaf0 100%)'
                          : 'linear-gradient(180deg, #fffdfa 0%, #ffffff 100%)',
                        color: ui.colors.text,
                        borderRadius: '999px',
                        padding: '0.5rem 0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: selected ? '0 6px 16px rgba(212, 175, 55, 0.14)' : 'none',
                      }}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="Target Reading Minutes" hint="Optional. Leave blank to let AI decide.">
              <input
                type="number"
                min={3}
                max={20}
                value={form.targetReadingMinutes}
                style={formControlStyle}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, targetReadingMinutes: event.target.value }))
                }
              />
            </Field>

            <div
              style={{
                padding: '1rem 1.05rem',
                borderRadius: '16px',
                border: `1px solid ${ui.colors.border}`,
                background: 'linear-gradient(180deg, #fffdfa 0%, #f8f4ec 100%)',
                color: ui.colors.textSoft,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: ui.colors.text }}>AI will decide the rest.</strong>
              <div style={{ marginTop: '0.35rem' }}>
                Audience, goal, article type, slug, secondary keywords, internal links, CTA, and
                guardrails are inferred from the handbook plus the three required inputs above.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-btn"
              onClick={handleGenerateOutline}
              disabled={isGeneratingOutline || isRunningPipeline}
              style={{
                ...primaryButtonStyle,
                cursor: isGeneratingOutline || isRunningPipeline ? 'not-allowed' : 'pointer',
                opacity: isGeneratingOutline || isRunningPipeline ? 0.65 : 1,
              }}
            >
              {isGeneratingOutline ? 'Generating Outline...' : 'Generate Outline'}
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={handleRunFullPipeline}
              disabled={isGeneratingOutline || isRunningPipeline}
              style={{
                ...secondaryButtonStyle,
                cursor: isGeneratingOutline || isRunningPipeline ? 'not-allowed' : 'pointer',
                opacity: isGeneratingOutline || isRunningPipeline ? 0.65 : 1,
              }}
            >
              {isRunningPipeline ? 'Running Full Pipeline...' : 'Run Full Pipeline'}
            </button>
            <span style={{ color: ui.colors.textSoft, lineHeight: 1.6 }}>
              Planner-only is useful for structure checks. Full pipeline adds article, QA, and packaging previews.
            </span>
          </div>
        </section>

        <section
          style={{
            ...panelStyle,
            display: 'grid',
            gap: '1rem',
            alignContent: 'start',
            padding: '1.4rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: ui.colors.ink,
                fontFamily: 'var(--font-playfair-display), serif',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              Output Preview
            </h2>
            <p style={{ margin: '0.45rem 0 0', color: ui.colors.textSoft, lineHeight: 1.7 }}>
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
                    <p style={{ margin: '0.35rem 0 0', color: ui.colors.textSoft, lineHeight: 1.7 }}>
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
                    <p style={{ margin: '0.35rem 0 0', color: ui.colors.textSoft, lineHeight: 1.7 }}>
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
                      style={primaryButtonStyle}
                    >
                      {isSaving ? 'Saving...' : 'Save Article'}
                    </button>
                    <span style={{ color: ui.colors.textSoft, lineHeight: 1.6 }}>
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
    <label style={{ display: 'grid', gap: '0.5rem' }}>
      <span
        style={{
          fontWeight: 700,
          color: ui.colors.text,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
      {children}
      {hint ? <span style={{ color: ui.colors.textSoft, fontSize: '0.84rem', lineHeight: 1.55 }}>{hint}</span> : null}
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
          border: `1px solid ${ui.colors.border}`,
          borderRadius: '18px',
          background: 'linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)',
          overflow: 'hidden',
          boxShadow: '0 8px 22px rgba(92, 71, 39, 0.07)',
        }}
      >
        <summary
          style={{
            padding: '1rem 1.05rem',
            borderBottom: `1px solid ${ui.colors.borderSoft}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <span style={{ display: 'grid', gap: '0.18rem' }}>
            <strong style={{ color: ui.colors.ink }}>{title}</strong>
            <span style={{ color: ui.colors.textSoft, fontSize: '0.9rem' }}>{subtitle}</span>
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
        border: `1px solid ${ui.colors.border}`,
        borderRadius: '18px',
        background: 'linear-gradient(180deg, #fffdf9 0%, #ffffff 100%)',
        overflow: 'hidden',
        boxShadow: '0 8px 22px rgba(92, 71, 39, 0.07)',
      }}
    >
      <div
        style={{
          padding: '1rem 1.05rem',
          borderBottom: `1px solid ${ui.colors.borderSoft}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'grid', gap: '0.18rem' }}>
          <strong style={{ color: ui.colors.ink }}>{title}</strong>
          <span style={{ color: ui.colors.textSoft, fontSize: '0.9rem' }}>{subtitle}</span>
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
