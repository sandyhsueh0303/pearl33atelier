'use client'

import type { ArticlePackage } from '@/app/lib/blogPipeline'
import {
  type BlogGenerationStages,
  BlogEmptyState,
  BlogInfoBlock,
  BlogJsonPreview,
  BlogSectionHeading,
  PipelineCard,
  StageArtifactCard,
  type PlannerStageResponse,
} from './blogGeneratorShared'
import styles from './BlogOutputPanel.module.css'

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
    <section className={styles.panel}>
      <div>
        <h2 className={styles.title}>
          Output Preview
        </h2>
        <p className={styles.description}>
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
            <div className={`${styles.contentBlock} ${styles.contentBlockLoose}`}>
              {plannerStage.debug ? (
                <div className={styles.inlineNotice}>
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
            <div className={styles.contentBlock}>
              <div><strong>{plannerOutput.recommendedTitle}</strong></div>
              <div>{plannerOutput.frontmatterDraft.excerpt}</div>
              <div className={styles.keywordLine}>
                Keywords: {plannerOutput.frontmatterDraft.keywords.join(', ')}
              </div>
            </div>
          </PipelineCard>

          <div className={styles.cardGrid}>
            {plannerOutput.outline.map((section, index) => (
              <PipelineCard
                key={`${section.heading}-${index}`}
                title={`Outline ${index + 1}`}
                subtitle={section.heading}
                status="Outline"
                collapsible
                defaultOpen={index === 0}
              >
                <div className={styles.contentBlock}>
                  <BlogInfoBlock label="Purpose" value={section.purpose} />
                  <div>
                    <strong>Must Cover</strong>
                    <ul className={styles.detailList}>
                      {section.mustCover.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {section.notes.length > 0 ? (
                    <div>
                      <strong>Notes</strong>
                      <ul className={styles.detailList}>
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

              <div className={styles.cardGrid}>
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
                  className={styles.markdownPreview}
                />
              </PipelineCard>

              <div className={styles.saveActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={onSaveArticle}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Article'}
                </button>
                <span className={styles.saveHint}>
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
