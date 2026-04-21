import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { extractOutputText } from '@/app/api/products/openaiOutput'
import {
  buildFallbackPlannerOutput,
  buildFallbackReviewerOutput,
  buildFallbackRewriterOutput,
  buildFallbackWriterOutput,
  isArticlePackage,
  isPlannerOutput,
  isReviewerOutput,
  isRewriterOutput,
  normalizeArticlePackage,
  parseJsonObject,
  renderMarkdownDocument,
  validateArticleBrief,
  type ArticlePackage,
  type ArticleBrief,
  type PlannerOutput,
  type ReviewerOutput,
  type RewriterOutput,
} from '@/app/lib/blogPipeline'

const blogPipelineDirectory = path.join(process.cwd(), '..', 'public-web', 'content', 'blog-pipeline')

type BlogGenerateRequest = {
  brief?: unknown
  mode?: 'planner' | 'full'
}

async function readReferenceFile(fileName: string) {
  return await fs.readFile(path.join(blogPipelineDirectory, fileName), 'utf8')
}

type StageResult<T> = {
  output: T
  source: 'openai' | 'fallback'
  debug?: string
}

async function runPlanner(brief: ArticleBrief): Promise<{ output: PlannerOutput; source: 'openai' | 'fallback'; debug?: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      output: buildFallbackPlannerOutput(brief),
      source: 'fallback',
      debug: 'OPENAI_API_KEY is missing on the server. Returned fallback planner output.',
    }
  }

  const [plannerPrompt, handbook, briefSchema, packageSchema] = await Promise.all([
    readReferenceFile('planner-prompt.md'),
    readReferenceFile('blog-ai-handbook.md'),
    readReferenceFile('article-brief.schema.json'),
    readReferenceFile('article-package.schema.json'),
  ])

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: plannerPrompt }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Required reference: blog-ai-handbook.md',
                handbook,
                '',
                'Required reference: article-brief.schema.json',
                briefSchema,
                '',
                'Required reference: article-package.schema.json',
                packageSchema,
                '',
                'Article brief:',
                JSON.stringify(brief, null, 2),
              ].join('\n'),
            },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Planner request failed')
  }

  const outputText = extractOutputText(data)
  if (!outputText) {
    throw new Error('Planner did not return output text')
  }

  const parsed = parseJsonObject<PlannerOutput>(outputText)
  if (!isPlannerOutput(parsed)) {
    throw new Error('Planner returned JSON, but the shape was invalid')
  }

  return { output: parsed, source: 'openai' }
}

async function runPromptStage<T>({
  promptFile,
  refs,
  blocks,
  validator,
}: {
  promptFile: string
  refs: string[]
  blocks: Array<{ label: string; value: unknown }>
  validator: (value: unknown) => value is T
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing on the server.')
  }

  const [promptText, ...referenceContents] = await Promise.all([
    readReferenceFile(promptFile),
    ...refs.map((ref) => readReferenceFile(ref)),
  ])
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

  const userText = [
    ...refs.map((ref, index) => [`Required reference: ${ref}`, referenceContents[index]].join('\n')),
    ...blocks.map(({ label, value }) => `${label}:\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`),
  ].join('\n\n')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: promptText }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userText }],
        },
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error?.message || `${promptFile} request failed`)
  }

  const outputText = extractOutputText(data)
  if (!outputText) {
    throw new Error(`${promptFile} did not return output text`)
  }

  const parsed = parseJsonObject<T>(outputText)
  if (!validator(parsed)) {
    throw new Error(`${promptFile} returned JSON, but the shape was invalid`)
  }

  return parsed
}

async function runWriter(
  brief: ArticleBrief,
  planner: PlannerOutput
): Promise<StageResult<ArticlePackage>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      output: buildFallbackWriterOutput(brief, planner),
      source: 'fallback',
      debug: 'OPENAI_API_KEY is missing on the server. Returned fallback writer output.',
    }
  }

  const output = await runPromptStage<ArticlePackage>({
    promptFile: 'writer-prompt.md',
    refs: [
      'blog-ai-handbook.md',
      'article-brief.schema.json',
      'article-package.schema.json',
      'planner-prompt.md',
    ],
    blocks: [
      { label: 'Article brief', value: brief },
      { label: 'Planner output', value: planner },
    ],
    validator: isArticlePackage,
  })

  return { output: normalizeArticlePackage(output), source: 'openai' }
}

async function runReviewer(
  brief: ArticleBrief,
  planner: PlannerOutput,
  writer: ArticlePackage
): Promise<StageResult<ReviewerOutput>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      output: buildFallbackReviewerOutput(writer),
      source: 'fallback',
      debug: 'OPENAI_API_KEY is missing on the server. Returned fallback reviewer output.',
    }
  }

  const output = await runPromptStage<ReviewerOutput>({
    promptFile: 'reviewer-prompt.md',
    refs: [
      'blog-ai-handbook.md',
      'article-brief.schema.json',
      'article-package.schema.json',
      'planner-prompt.md',
      'writer-prompt.md',
    ],
    blocks: [
      { label: 'Article brief', value: brief },
      { label: 'Planner output', value: planner },
      { label: 'Writer output', value: writer },
    ],
    validator: isReviewerOutput,
  })

  return {
    output: {
      ...output,
      reviewedArticlePackage: normalizeArticlePackage(output.reviewedArticlePackage),
    },
    source: 'openai',
  }
}

async function runRewriter(
  brief: ArticleBrief,
  planner: PlannerOutput,
  writer: ArticlePackage,
  reviewer: ReviewerOutput
): Promise<StageResult<RewriterOutput> | { skipped: true; reason: string }> {
  if (reviewer.decision === 'approve') {
    return { skipped: true, reason: 'Reviewer approved the draft, so rewrite was skipped.' }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      output: buildFallbackRewriterOutput(reviewer.reviewedArticlePackage),
      source: 'fallback',
      debug: 'OPENAI_API_KEY is missing on the server. Returned fallback rewriter output.',
    }
  }

  const output = await runPromptStage<RewriterOutput>({
    promptFile: 'rewriter-prompt.md',
    refs: [
      'blog-ai-handbook.md',
      'article-brief.schema.json',
      'article-package.schema.json',
      'planner-prompt.md',
      'writer-prompt.md',
      'reviewer-prompt.md',
    ],
    blocks: [
      { label: 'Article brief', value: brief },
      { label: 'Planner output', value: planner },
      { label: 'Writer output', value: writer },
      { label: 'Reviewer output', value: reviewer },
    ],
    validator: isRewriterOutput,
  })

  return {
    output: {
      ...output,
      rewrittenArticlePackage: normalizeArticlePackage(output.rewrittenArticlePackage),
    },
    source: 'openai',
  }
}

async function runPackaging(
  brief: ArticleBrief,
  planner: PlannerOutput,
  writer: ArticlePackage,
  reviewer: ReviewerOutput,
  rewriter: RewriterOutput | null
): Promise<StageResult<ArticlePackage>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      output: normalizeArticlePackage(rewriter?.rewrittenArticlePackage || reviewer.reviewedArticlePackage),
      source: 'fallback',
      debug: 'OPENAI_API_KEY is missing on the server. Returned fallback packaging output.',
    }
  }

  const output = await runPromptStage<ArticlePackage>({
    promptFile: 'packaging-prompt.md',
    refs: [
      'blog-ai-handbook.md',
      'article-brief.schema.json',
      'article-package.schema.json',
      'planner-prompt.md',
      'writer-prompt.md',
      'reviewer-prompt.md',
    ],
    blocks: [
      { label: 'Article brief', value: brief },
      { label: 'Planner output', value: planner },
      { label: 'Writer output', value: writer },
      { label: 'Reviewer output', value: reviewer },
      ...(rewriter ? [{ label: 'Optional rewritten article package', value: rewriter }] : []),
      { label: 'Optional metadata notes', value: '' },
      { label: 'Optional FAQ draft', value: '' },
      { label: 'Optional image prompt draft', value: '' },
    ],
    validator: isArticlePackage,
  })

  const normalized = normalizeArticlePackage(output)
  return { output: normalized, source: 'openai' }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  try {
    const body = (await request.json()) as BlogGenerateRequest
    const mode = body.mode === 'full' ? 'full' : 'planner'
    const { brief, errors } = validateArticleBrief(body.brief)

    if (!brief) {
      return NextResponse.json({ error: 'Invalid brief', validationErrors: errors }, { status: 400 })
    }

    const planner = await runPlanner(brief)

    if (mode === 'planner') {
      return NextResponse.json({
        status: 'ok',
        mode,
        brief,
        stages: {
          planner: {
            ok: true,
            source: planner.source,
            output: planner.output,
            debug: planner.debug || null,
          },
        },
        final: null,
      })
    }

    const writer = await runWriter(brief, planner.output)
    const reviewer = await runReviewer(brief, planner.output, writer.output)
    const rewriterResult = await runRewriter(brief, planner.output, writer.output, reviewer.output)
    const rewrittenPackage =
      'skipped' in rewriterResult ? null : rewriterResult.output.rewrittenArticlePackage
    const packaging = await runPackaging(
      brief,
      planner.output,
      writer.output,
      reviewer.output,
      'skipped' in rewriterResult ? null : rewriterResult.output
    )

    return NextResponse.json({
      status: 'ok',
      mode,
      brief,
      stages: {
        planner: {
          ok: true,
          source: planner.source,
          output: planner.output,
          debug: planner.debug || null,
        },
        writer: {
          ok: true,
          source: writer.source,
          output: writer.output,
          debug: writer.debug || null,
        },
        reviewer: {
          ok: true,
          source: reviewer.source,
          output: reviewer.output,
          debug: reviewer.debug || null,
        },
        rewriter:
          'skipped' in rewriterResult
            ? {
                ok: true,
                skipped: true,
                reason: rewriterResult.reason,
                output: null,
              }
            : {
                ok: true,
                source: rewriterResult.source,
                output: rewriterResult.output,
                debug: rewriterResult.debug || null,
              },
        packaging: {
          ok: true,
          source: packaging.source,
          output: {
            ...packaging.output,
            markdownDocument:
              packaging.output.markdownDocument || renderMarkdownDocument(packaging.output),
          },
          debug: packaging.debug || null,
        },
      },
      final: {
        articlePackage: packaging.output,
        rewrittenPackage,
      },
    })
  } catch (error) {
    console.error('Failed to generate blog pipeline output:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate blog pipeline output',
      },
      { status: 500 }
    )
  }
}
