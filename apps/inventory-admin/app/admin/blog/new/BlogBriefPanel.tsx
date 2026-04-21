'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { ArticleBrief } from '@/app/lib/blogPipeline'
import {
  BLOG_GENERATOR_LABELS,
  BLOG_GENERATOR_UI,
  BLOG_PRIMARY_INTENTS,
  BLOG_PRODUCT_CATEGORIES,
  BlogAssistCard,
  BlogField,
  blogGeneratorFormControlStyle,
  blogGeneratorPanelStyle,
  blogGeneratorPrimaryButtonStyle,
  blogGeneratorReadOnlyControlStyle,
  blogGeneratorSecondaryButtonStyle,
  blogGeneratorTagButtonBaseStyle,
  getBlogGeneratorActionState,
  toggleBriefCategory,
  updateBriefField,
  type BriefFormState,
} from './blogGeneratorShared'

interface BlogBriefPanelProps {
  form: BriefFormState
  setForm: Dispatch<SetStateAction<BriefFormState>>
  briefPreview: ArticleBrief
  isGeneratingOutline: boolean
  isRunningPipeline: boolean
  onGenerateOutline: () => void
  onRunFullPipeline: () => void
}

export default function BlogBriefPanel({
  form,
  setForm,
  briefPreview,
  isGeneratingOutline,
  isRunningPipeline,
  onGenerateOutline,
  onRunFullPipeline,
}: BlogBriefPanelProps) {
  const actionState = getBlogGeneratorActionState({
    isGeneratingOutline,
    isRunningPipeline,
  })

  return (
    <section
      style={{
        ...blogGeneratorPanelStyle,
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
            color: BLOG_GENERATOR_UI.colors.ink,
            fontFamily: 'var(--font-playfair-display), serif',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          Brief Input
        </h2>
        <p style={{ margin: '0.45rem 0 0', color: BLOG_GENERATOR_UI.colors.textSoft, lineHeight: 1.7 }}>
          Keep the input light. Let the handbook and prompts do the heavier editorial work.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <BlogField label="Working Title">
          <input
            value={form.workingTitle}
            style={blogGeneratorFormControlStyle}
            onChange={(event) => updateBriefField(setForm, 'workingTitle', event.target.value)}
          />
        </BlogField>

        <div
          style={{
            display: 'grid',
            gap: '0.9rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <BlogField label="Primary Keyword">
            <input
              value={form.primaryKeyword}
              style={blogGeneratorFormControlStyle}
              onChange={(event) => updateBriefField(setForm, 'primaryKeyword', event.target.value)}
            />
          </BlogField>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '0.9rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <BlogField label="Primary Intent">
            <select
              value={form.primaryIntent}
              style={blogGeneratorFormControlStyle}
              onChange={(event) =>
                updateBriefField(
                  setForm,
                  'primaryIntent',
                  event.target.value as ArticleBrief['primaryIntent']
                )
              }
            >
              {BLOG_PRIMARY_INTENTS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </BlogField>
          <BlogField label="Auto Slug">
            <input value={briefPreview.slug} readOnly style={blogGeneratorReadOnlyControlStyle} />
          </BlogField>
        </div>

        <BlogField label="Must Cover" hint="Optional. One topic per line if you want to steer the article.">
          <textarea
            value={form.mustCoverText}
            style={{ ...blogGeneratorFormControlStyle, minHeight: '130px', resize: 'vertical' }}
            onChange={(event) => updateBriefField(setForm, 'mustCoverText', event.target.value)}
            rows={5}
          />
        </BlogField>

        <BlogField label="Relevant Product Categories">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {BLOG_PRODUCT_CATEGORIES.map((category) => {
              const selected = form.productCategoriesRelevant.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleBriefCategory(setForm, category)}
                  style={{
                    ...blogGeneratorTagButtonBaseStyle,
                    border: selected
                      ? `1px solid ${BLOG_GENERATOR_UI.colors.gold}`
                      : `1px solid ${BLOG_GENERATOR_UI.colors.border}`,
                    background: selected
                      ? 'linear-gradient(145deg, #fffdf8 0%, #f7f1e7 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #fcfbf8 100%)',
                    boxShadow: selected ? '0 8px 18px rgba(201, 169, 97, 0.12)' : 'none',
                  }}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </BlogField>

        <BlogField label="Target Reading Minutes" hint="Optional. Leave blank to let AI decide.">
          <input
            type="number"
            min={3}
            max={20}
            value={form.targetReadingMinutes}
            style={blogGeneratorFormControlStyle}
            onChange={(event) =>
              updateBriefField(setForm, 'targetReadingMinutes', event.target.value)
            }
          />
        </BlogField>

        <BlogAssistCard title={BLOG_GENERATOR_LABELS.aiAssistTitle}>
          {BLOG_GENERATOR_LABELS.aiAssistCopy}
        </BlogAssistCard>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="admin-btn"
          onClick={onGenerateOutline}
          disabled={actionState.isBusy}
          style={{
            ...blogGeneratorPrimaryButtonStyle,
            cursor: actionState.isBusy ? 'not-allowed' : 'pointer',
            opacity: actionState.isBusy ? 0.65 : 1,
          }}
        >
          {actionState.generateOutlineLabel}
        </button>
        <button
          type="button"
          className="admin-btn"
          onClick={onRunFullPipeline}
          disabled={actionState.isBusy}
          style={{
            ...blogGeneratorSecondaryButtonStyle,
            cursor: actionState.isBusy ? 'not-allowed' : 'pointer',
            opacity: actionState.isBusy ? 0.65 : 1,
          }}
        >
          {actionState.runFullPipelineLabel}
        </button>
        <span style={{ color: BLOG_GENERATOR_UI.colors.textSoft, lineHeight: 1.6 }}>
          {BLOG_GENERATOR_LABELS.plannerOnlyHint}
        </span>
      </div>
    </section>
  )
}
