'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminPageHeader from '../../components/AdminPageHeader'

type DraftPreview = {
  title: string
  subtitle: string
  category: string
  pearlType: string
  shape: string
  luster: string
  overtone: string
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords?: string[]
  ogImageAlt: string
}

type DraftValidationIssue = {
  severity: 'error' | 'warning'
  field: string
  message: string
}

type DraftValidation = {
  issues: DraftValidationIssue[]
  errorCount: number
  warningCount: number
  canCreateDraft: boolean
}

type PipelineArtifact = Record<string, unknown>
type PipelineDebug = Record<string, { ok: boolean; message: string }>

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export default function AiDraftClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/products'
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [draftPreview, setDraftPreview] = useState<DraftPreview | null>(null)
  const [extraction, setExtraction] = useState<PipelineArtifact | null>(null)
  const [normalized, setNormalized] = useState<PipelineArtifact | null>(null)
  const [enriched, setEnriched] = useState<PipelineArtifact | null>(null)
  const [pipelineDebug, setPipelineDebug] = useState<PipelineDebug | null>(null)
  const [draftValidation, setDraftValidation] = useState<DraftValidation | null>(null)
  const [draftSource, setDraftSource] = useState<'openai' | 'fallback' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugMessage, setDebugMessage] = useState<string | null>(null)

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  )
  const groupedIssues = useMemo(() => {
    const issues = draftValidation?.issues || []
    return {
      validation: issues.filter((issue) => (issue as DraftValidationIssue & { source?: string }).source !== 'consistency'),
      consistency: issues.filter((issue) => (issue as DraftValidationIssue & { source?: string }).source === 'consistency'),
    }
  }, [draftValidation])

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || [])
    setFiles(incoming)
  }

  const handleGenerateDraft = async () => {
    setIsGenerating(true)
    setError(null)
    setDebugMessage(null)
    setDraftValidation(null)
    setExtraction(null)
    setNormalized(null)
    setEnriched(null)
    setPipelineDebug(null)

    try {
      const imageDataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)))

      const response = await fetch('/api/products/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileNames: files.map((file) => file.name),
          imageDataUrls,
          notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI draft')
      }

      setDraftPreview(data.draft)
      setExtraction(data.extraction || null)
      setNormalized(data.normalized || null)
      setEnriched(data.enriched || null)
      setPipelineDebug(data.pipelineDebug || null)
      setDraftValidation(data.validation || null)
      setDraftSource(data.source === 'openai' ? 'openai' : 'fallback')
      setDebugMessage(data.debug || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI draft')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateDraftProduct = async () => {
    if (!draftPreview) return

    setIsCreatingDraft(true)
    setError(null)

    try {
      const response = await fetch('/api/products/ai-draft/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: draftPreview,
          notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create draft product')
      }

      const nextReturnTo = encodeURIComponent(returnTo)
      router.push(`/admin/products/${data.product.id}?returnTo=${nextReturnTo}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft product')
      setIsCreatingDraft(false)
    }
  }

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Create Product with AI"
        actions={
          <Link href={returnTo} className="admin-link-btn admin-btn-secondary">
            Back to Products
          </Link>
        }
      />

      <div className="admin-banner admin-banner-info">
        Upload one or more photos, generate AI suggestions, then create a draft product for final
        review. Uploaded images are now sent into OpenAI for visual analysis, and notes are used as
        extra guidance.
      </div>

      {error ? (
        <div className="admin-banner admin-banner-error">{error}</div>
      ) : null}

      {!error && debugMessage ? (
        <div className="admin-banner admin-banner-warning">
          <strong>Fallback reason:</strong> {debugMessage}
        </div>
      ) : null}

      <div className="admin-card admin-ai-draft-grid">
        <section className="admin-ai-draft-panel">
          <h2 className="admin-ai-draft-heading">Upload Photos</h2>
          <p className="admin-ai-draft-copy">
            Use clear front, close-up, and side views when possible. The AI draft will use these to
            suggest metadata and merchandising copy.
          </p>

          <label className="admin-ai-draft-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="admin-hidden-input"
            />
            <span>Upload Images</span>
            <small>PNG, JPG, or HEIC. Up to 6 images for the first draft.</small>
          </label>

          {previews.length > 0 ? (
            <div className="admin-ai-draft-previews">
              {previews.map(({ file, url }) => (
                <div key={`${file.name}-${file.lastModified}`} className="admin-ai-draft-preview-card">
                  <img src={url} alt={file.name} className="admin-ai-draft-preview-image" />
                  <div className="admin-ai-draft-preview-meta">
                    <strong>{file.name}</strong>
                    <span>{Math.round(file.size / 1024)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-ai-draft-empty">
              No images uploaded yet. Add photos to generate a draft preview.
            </div>
          )}

          <div className="admin-form-section" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <label className="admin-form-label" style={{ fontWeight: 700 }}>
              Notes for AI
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional: e.g. freshwater piece, very soft pink overtone, intended as everyday necklace..."
              className="admin-control admin-form-textarea-lg"
            />
          </div>

          <div className="admin-ai-draft-actions">
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={files.length === 0 || isGenerating}
              className={`admin-link-btn admin-link-btn-primary ${
                files.length === 0 || isGenerating ? 'admin-action-disabled' : ''
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </button>
          </div>
        </section>

        <section className="admin-ai-draft-panel">
          <div className="admin-ai-draft-header-row">
            <h2 className="admin-ai-draft-heading">AI Suggestions</h2>
            <span className="admin-ai-draft-badge">
              {draftPreview
                ? draftSource === 'openai'
                  ? 'OpenAI Draft'
                  : 'Fallback Draft'
                : 'Waiting for Images'}
            </span>
          </div>

          {draftPreview ? (
            <div className="admin-ai-draft-preview-layout">
              <div className="admin-ai-pipeline-grid">
                <PipelineDebugCard
                  title="Extraction"
                  subtitle="Image -> raw product attributes"
                  data={extraction}
                  debug={pipelineDebug?.extraction || null}
                />
                <PipelineDebugCard
                  title="Normalization"
                  subtitle="Raw attributes -> canonical values"
                  data={normalized}
                  debug={pipelineDebug?.normalization || null}
                />
                <PipelineDebugCard
                  title="Enrichment"
                  subtitle="Canonical values -> domain intelligence"
                  data={enriched}
                  debug={pipelineDebug?.enrichment || null}
                />
              </div>

              {draftValidation ? (
                <div className="admin-ai-draft-validation-card">
                  <div className="admin-ai-draft-validation-header">
                    <div>
                      <div className="admin-ai-draft-label">Validation</div>
                      <div className="admin-ai-draft-validation-summary">
                        {draftValidation.errorCount > 0
                          ? `${draftValidation.errorCount} error${draftValidation.errorCount === 1 ? '' : 's'} to fix`
                          : 'Ready to create draft'}
                        {draftValidation.warningCount > 0
                          ? ` · ${draftValidation.warningCount} warning${draftValidation.warningCount === 1 ? '' : 's'}`
                          : ''}
                      </div>
                    </div>
                    <span
                      className={`admin-ai-draft-validation-badge ${
                        draftValidation.canCreateDraft
                          ? 'admin-ai-draft-validation-badge-ready'
                          : 'admin-ai-draft-validation-badge-error'
                      }`}
                    >
                      {draftValidation.canCreateDraft ? 'Ready' : 'Needs Review'}
                    </span>
                  </div>

                  {draftValidation.issues.length > 0 ? (
                    <div className="admin-ai-draft-validation-groups">
                      {groupedIssues.validation.length > 0 ? (
                        <div className="admin-ai-draft-validation-group">
                          <div className="admin-ai-draft-validation-group-title">Validation</div>
                          <div className="admin-ai-draft-validation-list">
                            {groupedIssues.validation.map((issue, index) => (
                              <div
                                key={`validation-${issue.field}-${issue.message}-${index}`}
                                className={`admin-ai-draft-validation-item admin-ai-draft-validation-item-${issue.severity}`}
                              >
                                <strong>{issue.field}</strong>
                                <span>{issue.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {groupedIssues.consistency.length > 0 ? (
                        <div className="admin-ai-draft-validation-group">
                          <div className="admin-ai-draft-validation-group-title">Consistency Check</div>
                          <div className="admin-ai-draft-validation-list">
                            {groupedIssues.consistency.map((issue, index) => (
                              <div
                                key={`consistency-${issue.field}-${issue.message}-${index}`}
                                className={`admin-ai-draft-validation-item admin-ai-draft-validation-item-${issue.severity}`}
                              >
                                <strong>{issue.field}</strong>
                                <span>{issue.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="admin-ai-draft-helper">
                      This draft passed the first validation pass and is ready for product creation.
                    </div>
                  )}
                </div>
              ) : null}

              <div className="admin-ai-draft-meta-grid">
                <div>
                  <div className="admin-ai-draft-label">Title</div>
                  <div className="admin-ai-draft-value">{draftPreview.title}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Subtitle</div>
                  <div className="admin-ai-draft-value">{draftPreview.subtitle}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Category</div>
                  <div className="admin-ai-draft-value">{draftPreview.category}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Pearl Type</div>
                  <div className="admin-ai-draft-value">{draftPreview.pearlType}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Shape</div>
                  <div className="admin-ai-draft-value">{draftPreview.shape}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Luster</div>
                  <div className="admin-ai-draft-value">{draftPreview.luster}</div>
                </div>
                <div>
                  <div className="admin-ai-draft-label">Overtone</div>
                  <div className="admin-ai-draft-value">{draftPreview.overtone}</div>
                </div>
              </div>

              <div className="admin-ai-draft-description-card">
                <div className="admin-ai-draft-label">Generated Description</div>
                <pre className="admin-ai-draft-description">{draftPreview.description}</pre>
              </div>

              <div className="admin-ai-draft-description-card">
                <div className="admin-ai-draft-label">SEO</div>
                <div className="admin-ai-draft-seo-grid">
                  <div>
                    <strong>SEO Title</strong>
                    <div>{draftPreview.seoTitle}</div>
                  </div>
                  <div>
                    <strong>SEO Description</strong>
                    <div>{draftPreview.seoDescription}</div>
                  </div>
                  <div>
                    <strong>SEO Keywords</strong>
                    <div>{(draftPreview.seoKeywords || []).join(', ') || 'None'}</div>
                  </div>
                  <div>
                    <strong>OG Image Alt</strong>
                    <div>{draftPreview.ogImageAlt}</div>
                  </div>
                </div>
              </div>

              <div className="admin-ai-draft-actions">
                <button
                  type="button"
                  className={`admin-link-btn admin-link-btn-primary ${
                    isCreatingDraft || !draftValidation?.canCreateDraft ? 'admin-action-disabled' : ''
                  }`}
                  onClick={handleCreateDraftProduct}
                  disabled={isCreatingDraft || !draftValidation?.canCreateDraft}
                >
                  {isCreatingDraft ? 'Creating Draft...' : 'Create Draft Product'}
                </button>
                <span className="admin-ai-draft-helper">
                  {draftValidation?.canCreateDraft
                    ? 'This will create a draft product and open the normal edit form for final review.'
                    : 'Fix the validation errors above or regenerate before creating the draft product.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="admin-ai-draft-empty">
              Generate a draft to preview title, subtitle, pearl metadata, and storefront copy.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function PipelineDebugCard({
  title,
  subtitle,
  data,
  debug,
}: {
  title: string
  subtitle: string
  data: PipelineArtifact | null
  debug: { ok: boolean; message: string } | null
}) {
  return (
    <details className="admin-ai-pipeline-card">
      <summary className="admin-ai-pipeline-summary">
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <span className={`admin-ai-pipeline-status ${data ? 'admin-ai-pipeline-status-ready' : ''}`}>
          {data ? 'Ready' : 'Not available'}
        </span>
      </summary>
      {data ? (
        <pre className="admin-ai-pipeline-json">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div className="admin-ai-draft-helper">
          {debug?.message || 'This stage did not return data. Check fallback reason or regenerate with clearer photos.'}
        </div>
      )}
    </details>
  )
}
