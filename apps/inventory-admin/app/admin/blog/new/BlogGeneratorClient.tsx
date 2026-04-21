'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import AdminPageHeader from '../../components/AdminPageHeader'
import BlogBriefPanel from './BlogBriefPanel'
import BlogOutputPanel from './BlogOutputPanel'
import {
  type BlogApiErrorResponse,
  type BlogGenerateResponse,
  type BlogGenerationFinal,
  type BlogGenerationStages,
  type BlogSaveResponse,
  buildBriefPayload,
  defaultBrief,
  type BriefFormState,
} from './blogGeneratorShared'

type GenerationResultState = {
  stages: BlogGenerationStages
  final: BlogGenerationFinal | null
} | null

function getValidationErrors(error: unknown) {
  if (!(error instanceof Error) || !('validationErrors' in error)) {
    return []
  }

  const validationErrors = (error as Error & { validationErrors?: string[] }).validationErrors
  return Array.isArray(validationErrors) ? validationErrors : []
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & BlogApiErrorResponse
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed') as Error & {
      validationErrors?: string[]
    }
    error.validationErrors = Array.isArray(data.validationErrors) ? data.validationErrors : []
    throw error
  }

  return data
}

export default function BlogGeneratorClient() {
  const [form, setForm] = useState<BriefFormState>(defaultBrief)
  const [generationResult, setGenerationResult] = useState<GenerationResultState>(null)
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
    setGenerationResult(null)

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefPreview, mode: 'planner' }),
      })

      const data = await parseApiResponse<BlogGenerateResponse>(response)
      setGenerationResult({
        stages: data.stages,
        final: data.final,
      })
    } catch (err) {
      setGenerationResult(null)
      setValidationErrors(getValidationErrors(err))
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

      const data = await parseApiResponse<BlogGenerateResponse>(response)
      setGenerationResult({
        stages: data.stages,
        final: data.final,
      })
    } catch (err) {
      setValidationErrors(getValidationErrors(err))
      setError(err instanceof Error ? err.message : 'Failed to run full pipeline')
    } finally {
      setIsRunningPipeline(false)
    }
  }

  async function handleSaveArticle() {
    if (!generationResult?.final?.articlePackage) return

    setIsSaving(true)
    setError(null)
    setNotice(null)

    try {
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articlePackage: generationResult.final.articlePackage }),
      })

      const data = await parseApiResponse<BlogSaveResponse>(response)

      setNotice(`Saved ${data.slug}.md and ${data.slug}.schema.json`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="New Blog Article"
        actions={
          <Link href="/admin/blog" className="admin-link-btn admin-btn-secondary">
            Back to Blog
          </Link>
        }
      />

      <div className="admin-banner admin-banner-info">
        Start with the planner loop if you want to sanity-check the outline first. Once that looks
        right, run the full pipeline to preview writer, reviewer, rewriter, packaging, metadata,
        and the final Markdown.
      </div>

      {error ? <div className="admin-banner admin-banner-error">{error}</div> : null}

      {!error && notice ? <div className="admin-banner admin-banner-success">{notice}</div> : null}

      {validationErrors.length > 0 ? (
        <div className="admin-banner admin-banner-warning">
          <strong>Brief validation</strong>
          <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.2rem' }}>
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        className="admin-card"
        style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          padding: '0.1rem',
          background: 'transparent',
          boxShadow: 'none',
        }}
      >
        <BlogBriefPanel
          form={form}
          setForm={setForm}
          briefPreview={briefPreview}
          isGeneratingOutline={isGeneratingOutline}
          isRunningPipeline={isRunningPipeline}
          onGenerateOutline={handleGenerateOutline}
          onRunFullPipeline={handleRunFullPipeline}
        />

        <BlogOutputPanel
          plannerStage={generationResult?.stages.planner || null}
          pipelineStages={generationResult?.stages || null}
          finalArticlePackage={generationResult?.final?.articlePackage || null}
          isSaving={isSaving}
          onSaveArticle={handleSaveArticle}
        />
      </div>
    </main>
  )
}
