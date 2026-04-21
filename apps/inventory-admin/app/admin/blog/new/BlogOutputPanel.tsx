'use client'

import type { ArticlePackage } from '@/app/lib/blogPipeline'
import {
  type BlogGenerationStages,
  BLOG_GENERATOR_UI,
  BlogEmptyState,
  BlogInfoBlock,
  BlogJsonPreview,
  BlogSectionHeading,
  PipelineCard,
  StageArtifactCard,
  blogGeneratorContentBlockStyle,
  blogGeneratorInlineNoticeStyle,
  blogGeneratorPanelStyle,
  blogGeneratorPrimaryButtonStyle,
  type PlannerStageResponse,
} from './blogGeneratorShared'

interface BlogOutputPanelProps {
  plannerStage: PlannerStageResponse | null
  pipelineStages: BlogGenerationStages | null
  finalArticlePackage: ArticlePackage | null
  isSaving: boolean
  onSaveArticle: () => void
}

export default function BlogOutputPanel({
  plannerStage,
  pipelineStages,
  finalArticlePackage,
  isSaving,
  onSaveArticle,
}: BlogOutputPanelProps) {
  const plannerOutput = plannerStage?.output

  return (
    <section
      style={{
        ...blogGeneratorPanelStyle,
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
            color: BLOG_GENERATOR_UI.colors.ink,
            fontFamily: 'var(--font-playfair-display), serif',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          Output Preview
        </h2>
        <p style={{ margin: '0.45rem 0 0', color: BLOG_GENERATOR_UI.colors.textSoft, lineHeight: 1.7 }}>
          Use this to confirm the article angle and outline before we generate the full draft.
        </p>
      </div>

      {plannerStage && plannerOutput ? (
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
            <div style={{ ...blogGeneratorContentBlockStyle, gap: '0.9rem' }}>
              {plannerStage.debug ? (
                <div style={blogGeneratorInlineNoticeStyle}>
                  <strong>Fallback reason:</strong> {plannerStage.debug}
                </div>
              ) : null}

              <BlogInfoBlock label="Search Intent" value={plannerOutput.searchIntent} />
              <BlogInfoBlock label="Reader Question" value={plannerOutput.readerQuestion} />
              <BlogInfoBlock label="Article Angle" value={plannerOutput.articleAngle} />
              <BlogInfoBlock label="Reader Promise" value={plannerOutput.readerPromise} />
            </div>
          </PipelineCard>

          <PipelineCard
            title="Recommended Title"
            subtitle="Frontmatter direction"
            status="Ready"
            collapsible
            defaultOpen={false}
          >
            <div style={blogGeneratorContentBlockStyle}>
              <div><strong>{plannerOutput.recommendedTitle}</strong></div>
              <div>{plannerOutput.frontmatterDraft.excerpt}</div>
              <div style={{ color: '#7b6a55', fontSize: '0.92rem' }}>
                Keywords: {plannerOutput.frontmatterDraft.keywords.join(', ')}
              </div>
            </div>
          </PipelineCard>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {plannerOutput.outline.map((section, index) => (
              <PipelineCard
                key={`${section.heading}-${index}`}
                title={`Outline ${index + 1}`}
                subtitle={section.heading}
                status="Outline"
                collapsible
                defaultOpen={index === 0}
              >
                <div style={blogGeneratorContentBlockStyle}>
                  <BlogInfoBlock label="Purpose" value={section.purpose} />
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
              <BlogSectionHeading
                title="Pipeline Cards"
                copy="This mirrors the current stage-by-stage pipeline view, so we can inspect each artifact before saving."
              />

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
              <BlogSectionHeading
                title="Metadata Preview"
                copy="Final frontmatter preview before save."
              />

              <PipelineCard
                title="Frontmatter"
                subtitle={finalArticlePackage.slug}
                status="Final"
                collapsible
                defaultOpen={false}
              >
                <BlogJsonPreview value={JSON.stringify(finalArticlePackage.frontmatter, null, 2)} />
              </PipelineCard>

              <PipelineCard
                title="Body Markdown"
                subtitle="Final article content"
                status="Preview"
                collapsible
                defaultOpen={false}
              >
                <BlogJsonPreview
                  value={finalArticlePackage.bodyMarkdown}
                  style={{ lineHeight: 1.65, fontSize: '0.92rem', maxHeight: '420px', overflow: 'auto' }}
                />
              </PipelineCard>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="admin-link-btn admin-link-btn-primary"
                  onClick={onSaveArticle}
                  disabled={isSaving}
                  style={blogGeneratorPrimaryButtonStyle}
                >
                  {isSaving ? 'Saving...' : 'Save Article'}
                </button>
                <span style={{ color: BLOG_GENERATOR_UI.colors.textSoft, lineHeight: 1.6 }}>
                  This writes <code>{finalArticlePackage.slug}.md</code> and{' '}
                  <code>{finalArticlePackage.slug}.schema.json</code> into{' '}
                  <code>apps/public-web/content/blog</code>.
                </span>
              </div>
            </>
          ) : null}
        </>
      ) : (
        <BlogEmptyState>
          No outline yet. Generate one from the brief on the left to preview search intent,
          article angle, and section structure.
        </BlogEmptyState>
      )}
    </section>
  )
}
