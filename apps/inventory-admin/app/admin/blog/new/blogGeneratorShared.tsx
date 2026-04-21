'use client'

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react'
import {
  BLOG_PRIMARY_INTENTS,
  BLOG_PRODUCT_CATEGORIES,
  inferArticleTypeFromIntent,
  inferAudienceFromIntent,
  inferGoal,
  inferMustCover,
  slugify,
  type ArticleBrief,
  type ArticlePackage,
  type BlogProductCategory,
  type PlannerOutput,
  type ReviewerOutput,
  type RewriterOutput,
} from '@/app/lib/blogPipeline'

export type BriefFormState = {
  workingTitle: string
  primaryIntent: ArticleBrief['primaryIntent']
  primaryKeyword: string
  mustCoverText: string
  productCategoriesRelevant: BlogProductCategory[]
  targetReadingMinutes: string
}

export type PipelineStage<T> = {
  ok: boolean
  source?: 'openai' | 'fallback'
  output: T | null
  debug?: string | null
  skipped?: boolean
  reason?: string
}

export type PlannerStageResponse = PipelineStage<PlannerOutput>

export type BlogGenerationStages = {
  planner?: PipelineStage<PlannerOutput>
  writer?: PipelineStage<ArticlePackage>
  reviewer?: PipelineStage<ReviewerOutput>
  rewriter?: PipelineStage<RewriterOutput>
  packaging?: PipelineStage<ArticlePackage>
}

export type BlogGenerationFinal = {
  articlePackage?: ArticlePackage | null
  rewrittenPackage?: ArticlePackage | null
}

export type BlogGenerateResponse = {
  status: 'ok'
  mode: 'planner' | 'full'
  brief: ArticleBrief
  stages: BlogGenerationStages
  final: BlogGenerationFinal | null
}

export type BlogSaveResponse = {
  ok: true
  slug: string
  files: {
    markdownPath: string
    schemaPath: string
  }
}

export type BlogApiErrorResponse = {
  error?: string
  validationErrors?: string[]
}

export const BLOG_GENERATOR_LABELS = {
  plannerOnlyHint:
    'Planner-only is useful for structure checks. Full pipeline adds article, QA, and packaging previews.',
  aiAssistTitle: 'AI will decide the rest.',
  aiAssistCopy:
    'Audience, goal, article type, slug, secondary keywords, internal links, CTA, and guardrails are inferred from the handbook plus the three required inputs above.',
  generateOutline: 'Generate Outline',
  generatingOutline: 'Generating Outline...',
  runFullPipeline: 'Run Full Pipeline',
  runningFullPipeline: 'Running Full Pipeline...',
} as const

export const defaultBrief: BriefFormState = {
  workingTitle: '',
  primaryIntent: 'educational',
  primaryKeyword: '',
  mustCoverText: '',
  productCategoriesRelevant: [],
  targetReadingMinutes: '',
}

export const BLOG_GENERATOR_UI = {
  colors: {
    white: '#ffffff',
    pearl: '#fcfbf8',
    champagne: '#f7f1e7',
    sand: '#f3eadc',
    gold: '#c9a961',
    goldSoft: 'rgba(201, 169, 97, 0.16)',
    ink: '#1f2937',
    text: '#5a4630',
    textSoft: '#6b7280',
    border: '#e5e7eb',
    borderSoft: '#ece7dd',
    primary: '#2c5f8d',
    primaryDark: '#274869',
    successSoft: '#ecfdf5',
    warningSoft: '#fffbeb',
  },
  shadow: {
    soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
    inset: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  },
}

export const blogGeneratorPanelStyle = {
  border: `1px solid ${BLOG_GENERATOR_UI.colors.border}`,
  borderRadius: '14px',
  background: 'linear-gradient(180deg, #ffffff 0%, #fcfbf8 100%)',
  boxShadow: BLOG_GENERATOR_UI.shadow.soft,
}

export const blogGeneratorFormControlStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  borderRadius: '14px',
  border: `1px solid ${BLOG_GENERATOR_UI.colors.border}`,
  background: 'linear-gradient(180deg, #fffdfa 0%, #ffffff 100%)',
  color: BLOG_GENERATOR_UI.colors.ink,
  fontSize: '0.96rem',
  lineHeight: 1.6,
  boxShadow: BLOG_GENERATOR_UI.shadow.inset,
} as const

export const blogGeneratorReadOnlyControlStyle = {
  ...blogGeneratorFormControlStyle,
  background: 'linear-gradient(180deg, #faf7f0 0%, #fdfbf7 100%)',
  color: BLOG_GENERATOR_UI.colors.textSoft,
}

export const blogGeneratorPrimaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.85rem 1.35rem',
  borderRadius: '999px',
  background: `linear-gradient(135deg, ${BLOG_GENERATOR_UI.colors.primary} 0%, ${BLOG_GENERATOR_UI.colors.primaryDark} 100%)`,
  color: '#fff',
  border: '1px solid rgba(44, 95, 141, 0.28)',
  boxShadow: '0 10px 24px rgba(44, 95, 141, 0.18)',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.04em',
}

export const blogGeneratorSecondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '48px',
  padding: '0.85rem 1.35rem',
  borderRadius: '999px',
  background: 'linear-gradient(145deg, #fffdf8 0%, #f7f1e7 100%)',
  color: BLOG_GENERATOR_UI.colors.text,
  border: `1px solid ${BLOG_GENERATOR_UI.colors.goldSoft}`,
  boxShadow: '0 8px 20px rgba(92, 71, 39, 0.08)',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.03em',
}

export const blogGeneratorSectionHeadingTitleStyle = {
  margin: '0.5rem 0 0',
  color: BLOG_GENERATOR_UI.colors.ink,
} as const

export const blogGeneratorSectionHeadingCopyStyle = {
  margin: '0.35rem 0 0',
  color: BLOG_GENERATOR_UI.colors.textSoft,
  lineHeight: 1.7,
} as const

export const blogGeneratorContentBlockStyle = {
  display: 'grid',
  gap: '0.75rem',
  color: BLOG_GENERATOR_UI.colors.text,
  lineHeight: 1.6,
} as const

export const blogGeneratorJsonPreviewStyle = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: BLOG_GENERATOR_UI.colors.text,
  lineHeight: 1.6,
  fontSize: '0.9rem',
} as const

export const blogGeneratorEmptyStateStyle = {
  border: '1px dashed #d8cebf',
  borderRadius: '14px',
  padding: '1.25rem',
  background: '#fffdf9',
  color: '#7b6a55',
  lineHeight: 1.6,
} as const

export const blogGeneratorInlineNoticeStyle = {
  padding: '0.75rem 0.85rem',
  borderRadius: '12px',
  background: BLOG_GENERATOR_UI.colors.warningSoft,
  border: '1px solid #fde68a',
  color: '#92400e',
} as const

export const blogGeneratorTagButtonBaseStyle = {
  color: BLOG_GENERATOR_UI.colors.text,
  borderRadius: '999px',
  padding: '0.5rem 0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
} as const

export const blogGeneratorAssistCardStyle = {
  padding: '1rem 1.05rem',
  borderRadius: '12px',
  border: '1px solid rgba(201, 169, 97, 0.28)',
  background: 'linear-gradient(145deg, #fffdf8 0%, #f7f1e7 100%)',
  color: BLOG_GENERATOR_UI.colors.textSoft,
  lineHeight: 1.7,
} as const

export function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildBriefPayload(state: BriefFormState): ArticleBrief {
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

export function BlogField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: '0.5rem' }}>
      <span
        style={{
          fontWeight: 700,
          color: BLOG_GENERATOR_UI.colors.text,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
      {children}
      {hint ? (
        <span
          style={{
            color: BLOG_GENERATOR_UI.colors.textSoft,
            fontSize: '0.84rem',
            lineHeight: 1.55,
          }}
        >
          {hint}
        </span>
      ) : null}
    </label>
  )
}

export function BlogSectionHeading({
  title,
  copy,
}: {
  title: string
  copy: string
}) {
  return (
    <div>
      <h3 style={blogGeneratorSectionHeadingTitleStyle}>{title}</h3>
      <p style={blogGeneratorSectionHeadingCopyStyle}>{copy}</p>
    </div>
  )
}

export function BlogInfoBlock({
  label,
  value,
}: {
  label: ReactNode
  value: ReactNode
}) {
  return (
    <div>
      <strong>{label}</strong>
      <div>{value}</div>
    </div>
  )
}

export function BlogJsonPreview({
  value,
  style,
}: {
  value: string
  style?: CSSProperties
}) {
  return <pre style={{ ...blogGeneratorJsonPreviewStyle, ...style }}>{value}</pre>
}

export function BlogEmptyState({ children }: { children: ReactNode }) {
  return <div style={blogGeneratorEmptyStateStyle}>{children}</div>
}

export function BlogAssistCard({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div style={blogGeneratorAssistCardStyle}>
      <strong style={{ color: BLOG_GENERATOR_UI.colors.text }}>{title}</strong>
      <div style={{ marginTop: '0.35rem' }}>{children}</div>
    </div>
  )
}

export function getBlogGeneratorActionState(params: {
  isGeneratingOutline: boolean
  isRunningPipeline: boolean
}) {
  const isBusy = params.isGeneratingOutline || params.isRunningPipeline

  return {
    isBusy,
    generateOutlineLabel: params.isGeneratingOutline
      ? BLOG_GENERATOR_LABELS.generatingOutline
      : BLOG_GENERATOR_LABELS.generateOutline,
    runFullPipelineLabel: params.isRunningPipeline
      ? BLOG_GENERATOR_LABELS.runningFullPipeline
      : BLOG_GENERATOR_LABELS.runFullPipeline,
  }
}

export function updateBriefField<K extends keyof BriefFormState>(
  setForm: Dispatch<SetStateAction<BriefFormState>>,
  key: K,
  value: BriefFormState[K]
) {
  setForm((prev) => ({ ...prev, [key]: value }))
}

export function toggleBriefCategory(
  setForm: Dispatch<SetStateAction<BriefFormState>>,
  category: BlogProductCategory
) {
  setForm((prev) => {
    const selected = prev.productCategoriesRelevant.includes(category)

    return {
      ...prev,
      productCategoriesRelevant: selected
        ? prev.productCategoriesRelevant.filter((item) => item !== category)
        : prev.productCategoriesRelevant.concat(category),
    }
  })
}

export function PipelineCard({
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
  children: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const cardStyle = {
    border: `1px solid ${BLOG_GENERATOR_UI.colors.border}`,
    borderRadius: '12px',
    background: 'linear-gradient(180deg, #fffdf8 0%, #fcfbf8 100%)',
    overflow: 'hidden',
    boxShadow: '0 8px 22px rgba(92, 71, 39, 0.07)',
  } as const

  const headerContent = (
    <>
      <span style={{ display: 'grid', gap: '0.18rem' }}>
        <strong style={{ color: BLOG_GENERATOR_UI.colors.ink }}>{title}</strong>
        <span style={{ color: BLOG_GENERATOR_UI.colors.textSoft, fontSize: '0.9rem' }}>
          {subtitle}
        </span>
      </span>
      <span className="admin-pill admin-pill-gold">{status}</span>
    </>
  )

  const headerStyle = {
    padding: '1rem 1.05rem',
    borderBottom: `1px solid ${BLOG_GENERATOR_UI.colors.borderSoft}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  } as const

  if (collapsible) {
    return (
      <details
        open={defaultOpen}
        style={cardStyle}
      >
        <summary
          style={{
            ...headerStyle,
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          {headerContent}
        </summary>
        <div style={{ padding: '1rem' }}>{children}</div>
      </details>
    )
  }

  return (
    <section style={cardStyle}>
      <div style={headerStyle}>{headerContent}</div>
      <div style={{ padding: '1rem' }}>{children}</div>
    </section>
  )
}

export function StageArtifactCard({
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
        <BlogJsonPreview
          value={JSON.stringify(stage.output, null, 2)}
          style={{ fontSize: '0.88rem', maxHeight: '260px', overflow: 'auto' }}
        />
      ) : (
        <div style={{ color: '#7b6a55', lineHeight: 1.6 }}>
          {stage?.debug || 'No artifact available yet.'}
        </div>
      )}
    </PipelineCard>
  )
}

export { BLOG_PRIMARY_INTENTS, BLOG_PRODUCT_CATEGORIES }
