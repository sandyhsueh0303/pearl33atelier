'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { ArticleBrief } from '@/app/lib/blogPipeline'
import {
  BLOG_GENERATOR_LABELS,
  BLOG_PRIMARY_INTENTS,
  BLOG_PRODUCT_CATEGORIES,
  BlogAssistCard,
  BlogField,
  getBlogGeneratorActionState,
  toggleBriefCategory,
  updateBriefField,
  type BriefFormState,
} from './blogGeneratorShared'
import styles from './BlogBriefPanel.module.css'

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
    <section className={styles.panel}>
      <div>
        <h2 className={styles.title}>
          Brief Input
        </h2>
        <p className={styles.description}>
          Keep the input light. Let the handbook and prompts do the heavier editorial work.
        </p>
      </div>

      <div className={styles.formGrid}>
        <BlogField label="Working Title">
          <input
            aria-label="Working title"
            placeholder="Enter a working title"
            value={form.workingTitle}
            className={styles.control}
            onChange={(event) => updateBriefField(setForm, 'workingTitle', event.target.value)}
          />
        </BlogField>

        <div className={styles.responsiveGrid}>
          <BlogField label="Primary Keyword">
            <input
              aria-label="Primary keyword"
              placeholder="Enter the primary keyword"
              value={form.primaryKeyword}
              className={styles.control}
              onChange={(event) => updateBriefField(setForm, 'primaryKeyword', event.target.value)}
            />
          </BlogField>
        </div>

        <div className={styles.responsiveGrid}>
          <BlogField label="Primary Intent">
            <select
              aria-label="Primary intent"
              value={form.primaryIntent}
              className={styles.control}
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
            <input
              aria-label="Auto slug"
              value={briefPreview.slug}
              readOnly
              className={`${styles.control} ${styles.readOnlyControl}`}
            />
          </BlogField>
        </div>

        <BlogField label="Must Cover" hint="Optional. One topic per line if you want to steer the article.">
          <textarea
            aria-label="Must cover topics"
            placeholder="One topic per line"
            value={form.mustCoverText}
            className={`${styles.control} ${styles.textarea}`}
            onChange={(event) => updateBriefField(setForm, 'mustCoverText', event.target.value)}
            rows={5}
          />
        </BlogField>

        <BlogField label="Relevant Product Categories">
          <div className={styles.categoryList}>
            {BLOG_PRODUCT_CATEGORIES.map((category) => {
              const selected = form.productCategoriesRelevant.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleBriefCategory(setForm, category)}
                  className={selected ? `${styles.categoryButton} ${styles.categoryButtonSelected}` : styles.categoryButton}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </BlogField>

        <BlogField label="Target Reading Minutes" hint="Optional. Leave blank to let AI decide.">
          <input
            aria-label="Target reading minutes"
            placeholder="Optional"
            type="number"
            min={3}
            max={20}
            value={form.targetReadingMinutes}
            className={styles.control}
            onChange={(event) =>
              updateBriefField(setForm, 'targetReadingMinutes', event.target.value)
            }
          />
        </BlogField>

        <BlogAssistCard title={BLOG_GENERATOR_LABELS.aiAssistTitle}>
          {BLOG_GENERATOR_LABELS.aiAssistCopy}
        </BlogAssistCard>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.primaryButton} ${actionState.isBusy ? styles.busyButton : ''}`}
          onClick={onGenerateOutline}
          disabled={actionState.isBusy}
        >
          {actionState.generateOutlineLabel}
        </button>
        <button
          type="button"
          className={`${styles.secondaryButton} ${actionState.isBusy ? styles.busyButton : ''}`}
          onClick={onRunFullPipeline}
          disabled={actionState.isBusy}
        >
          {actionState.runFullPipelineLabel}
        </button>
        <span className={styles.actionHint}>
          {BLOG_GENERATOR_LABELS.plannerOnlyHint}
        </span>
      </div>
    </section>
  )
}
