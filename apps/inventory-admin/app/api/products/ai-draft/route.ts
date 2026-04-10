import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { validateAiDraft, type AiDraft } from './validation'
import {
  extractProductAttributesWithOpenAI,
  summarizeExtraction,
  type ExtractedProductAttributes,
} from './extraction'
import {
  normalizeExtractedProductAttributes,
  summarizeNormalization,
  type NormalizedProductAttributes,
} from './normalization'
import {
  enrichNormalizedProductAttributes,
  summarizeEnrichment,
  type EnrichedProductAttributes,
} from './enrichment'

type AiDraftRequest = {
  fileNames?: string[]
  imageDataUrls?: string[]
  notes?: string
}

type AiDraftResponse = { draft: AiDraft }

type OpenAIDraftResult =
  | { draft: AiDraftResponse['draft']; error?: undefined }
  | { draft: null; error: string }

function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim()
  }

  const outputItems = Array.isArray(data?.output) ? data.output : []

  for (const item of outputItems) {
    const contents = Array.isArray(item?.content) ? item.content : []

    for (const content of contents) {
      if (typeof content?.text === 'string' && content.text.trim()) {
        return content.text.trim()
      }

      if (typeof content?.output_text === 'string' && content.output_text.trim()) {
        return content.output_text.trim()
      }

      if (typeof content?.value === 'string' && content.value.trim()) {
        return content.value.trim()
      }

      if (typeof content?.json === 'string' && content.json.trim()) {
        return content.json.trim()
      }
    }
  }

  return null
}

const DEFAULT_DRAFT: AiDraftResponse['draft'] = {
  title: 'White South Sea Pearl Necklace',
  subtitle: 'White South Sea | 10-11mm | Luster: high | overtone: silver-blue',
  category: 'Necklaces',
  pearlType: 'WhiteSouthSea',
  shape: 'round',
  luster: 'high',
  overtone: 'silver-blue',
  description:
    'WHY YOU’LL LOVE IT\n• A luminous pearl presence that feels polished without feeling formal\n• Refined proportions designed for everyday elegance\n• Easy to wear on its own or layered with fine pieces\n\nPERFECT FOR\n• Daily wear\n• A soft, elevated look\n• Gifting and special occasions',
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildDescriptionFromSections(whyYoullLoveIt?: string[], perfectFor?: string[]) {
  const whyLines = (whyYoullLoveIt || []).filter(Boolean).slice(0, 3)
  const perfectLines = (perfectFor || []).filter(Boolean).slice(0, 3)

  return [
    'WHY YOU’LL LOVE IT',
    ...whyLines.map((line) => `• ${line.replace(/^•\s*/, '')}`),
    '',
    'PERFECT FOR',
    ...perfectLines.map((line) => `• ${line.replace(/^•\s*/, '')}`),
  ]
    .join('\n')
    .trim()
}

function inferDraftFromText(source: string): AiDraftResponse['draft'] {
  const normalized = source.toLowerCase()

  const pearlType = normalized.includes('tahitian')
    ? 'Tahitian'
    : normalized.includes('golden')
      ? 'GoldenSouthSea'
      : normalized.includes('south sea') || normalized.includes('southsea')
        ? 'WhiteSouthSea'
        : 'WhiteAkoya'

  const category = normalized.includes('ring')
    ? 'Rings'
    : normalized.includes('earring') || normalized.includes('stud')
      ? 'Earrings'
      : normalized.includes('bracelet')
        ? 'Bracelets'
        : normalized.includes('pendant')
          ? 'Pendants'
          : 'Necklaces'

  const shape = normalized.includes('baroque')
    ? 'baroque'
    : normalized.includes('drop')
      ? 'drop'
      : normalized.includes('oval')
        ? 'oval'
        : 'round'

  const luster = normalized.includes('soft') ? 'soft' : 'high'

  const overtone = normalized.includes('pink-green')
    ? 'pink-green iridescent'
    : normalized.includes('pink')
      ? 'pink'
      : normalized.includes('gold')
        ? 'gold'
        : normalized.includes('peacock')
          ? 'peacock'
          : normalized.includes('green')
            ? 'green iridescent'
            : 'silver-blue'

  const readablePearlType =
    pearlType === 'WhiteSouthSea'
      ? 'White South Sea'
      : pearlType === 'GoldenSouthSea'
        ? 'Golden South Sea'
        : pearlType === 'WhiteAkoya'
          ? 'White Akoya'
          : pearlType

  const hintedTitle = source
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const title =
    hintedTitle && hintedTitle.length > 5
      ? toTitleCase(hintedTitle)
      : `${readablePearlType} Pearl ${category.slice(0, -1)}`

  return {
    title,
    subtitle: `${readablePearlType} | 10-11mm | Luster: ${luster} | overtone: ${overtone}`,
    category,
    pearlType,
    shape,
    luster,
    overtone,
    why_youll_love_it: [
      `A ${shape === 'baroque' ? 'distinctive' : 'refined'} pearl presence designed for easy wear`,
      `${readablePearlType} tones that bring softness and light to the skin`,
      'Balanced proportions that feel polished without overthinking',
    ],
    perfect_for: ['Everyday wear', 'A soft, effortless look', 'Layering or gifting'],
    description: buildDescriptionFromSections(
      [
        `A ${shape === 'baroque' ? 'distinctive' : 'refined'} pearl presence designed for easy wear`,
        `${readablePearlType} tones that bring softness and light to the skin`,
        'Balanced proportions that feel polished without overthinking',
      ],
      ['Everyday wear', 'A soft, effortless look', 'Layering or gifting']
    ),
  }
}

async function generateDraftWithOpenAI(
  input: AiDraftRequest,
  extraction?: ExtractedProductAttributes | null,
  normalized?: NormalizedProductAttributes | null,
  enriched?: EnrichedProductAttributes | null
): Promise<OpenAIDraftResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { draft: null, error: 'OPENAI_API_KEY is missing on the server.' }
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

  const userContent: Array<Record<string, unknown>> = [
    {
      type: 'input_text',
      text: enriched
        ? [
            'Use this enriched product data as the source of truth for copy generation.',
            summarizeEnrichment(enriched),
            input.notes ? `Admin notes: ${input.notes}` : '',
          ]
            .filter(Boolean)
            .join('\n\n')
        : normalized
        ? [
            'Use this normalized product data as the source of truth for copy generation.',
            summarizeNormalization(normalized),
            input.notes ? `Admin notes: ${input.notes}` : '',
          ]
            .filter(Boolean)
            .join('\n\n')
        : extraction
        ? [
            'Use this structured product extraction as the source of truth for copy generation.',
            summarizeExtraction(extraction),
            input.notes ? `Admin notes: ${input.notes}` : '',
          ]
            .filter(Boolean)
            .join('\n\n')
        : [
            'Review these product photos and generate a first-pass pearl jewelry draft.',
            input.notes ? `Admin notes: ${input.notes}` : '',
            ...(input.fileNames || []).map((name) => `Image filename: ${name}`),
          ]
            .filter(Boolean)
            .join('\n'),
    },
  ]

  if (!extraction && !normalized && !enriched) {
    userContent.push(
      ...((input.imageDataUrls || []).map((url) => ({
        type: 'input_image',
        image_url: url,
      })) as Array<Record<string, unknown>>)
    )
  }

  if (userContent.length === 0) {
    userContent.push({
      type: 'input_text',
      text: 'No extra context provided.',
    })
  }

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
          content: [
            {
              type: 'input_text',
              text:
                `You are a pearl jewelry expert for a modern pearl brand.

Write product copy for a pearl jewelry piece in a refined, minimal, and editorial tone.
The brand aesthetic is similar to Mejuri, Mikimoto modern line, and a soft luxury DTC brand.

Avoid overly salesy language. Keep the voice calm, elegant, and quietly confident.

You must return valid JSON only.

Return these keys only:
- title
- subtitle
- category
- pearlType
- shape
- luster
- overtone
- why_youll_love_it
- perfect_for

PEARL TYPE RULES
- pearlType must be exactly one of:
  - WhiteAkoya
  - GreyAkoya
  - WhiteSouthSea
  - GoldenSouthSea
  - Tahitian
- Do not return Freshwater, Other, Mixed, or a freeform pearl type.

TITLE RULES
- Format: [Pearl Type] [Design Name]
- Add size or key feature in parentheses only if needed
- Keep it clean and product-focused

SUBTITLE RULES
- Format: [Size] [Pearl Type] • [Overtone]
- Keep it short, clean, and consistent
- Do not add marketing language
- If overtone is none, omit it instead of writing none

WHY YOU’LL LOVE IT RULES
- Exactly 3 bullet points
- Focus on:
  - design feeling
  - pearl quality
  - overall impression
- Keep each bullet concise and one line

PERFECT FOR RULES
- Exactly 3 bullet points
- Focus on:
  - occasions
  - styling
  - user intent
- Keep each bullet concise and one line

STYLE RULES
- Tone: calm, refined, editorial, not salesy
- Avoid words like: stunning, luxurious, best
- Prefer words like: refined, soft, clean, modern, effortless
- Keep sentences short and readable
- No emojis
- No exclamation marks

IMPORTANT
- Use the structured product attributes when provided. Infer from images only if structured attributes are not available.
- Do not invent certifications, pricing, rarity claims, or unsupported material details
- If uncertain, stay general rather than making strong factual claims
- Return JSON only`,
            },
          ],
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'product_draft',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: [
              'title',
              'subtitle',
              'category',
              'pearlType',
              'shape',
              'luster',
              'overtone',
              'why_youll_love_it',
              'perfect_for',
            ],
            properties: {
              title: { type: 'string' },
              subtitle: { type: 'string' },
              category: { type: 'string' },
              pearlType: {
                type: 'string',
                enum: ['WhiteAkoya', 'GreyAkoya', 'WhiteSouthSea', 'GoldenSouthSea', 'Tahitian'],
              },
              shape: { type: 'string' },
              luster: { type: 'string' },
              overtone: { type: 'string' },
              why_youll_love_it: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
              perfect_for: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return {
      draft: null,
      error: `OpenAI request failed (${response.status}): ${errorText.slice(0, 400)}`,
    }
  }

  const data = await response.json()
  const outputText = extractOutputText(data)
  if (!outputText) {
    return {
      draft: null,
      error: `OpenAI response did not include parsable text. Response keys: ${Object.keys(data || {}).join(', ')}`,
    }
  }

  try {
    const parsed = JSON.parse(outputText) as AiDraftResponse['draft']
    return {
      draft: {
        ...parsed,
        description: buildDescriptionFromSections(
          parsed.why_youll_love_it,
          parsed.perfect_for
        ),
      },
    }
  } catch (error) {
    return {
      draft: null,
      error: `Failed to parse OpenAI JSON output: ${error instanceof Error ? error.message : 'unknown error'}`,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin()
    if (errorResponse) return errorResponse

    const body = (await request.json()) as AiDraftRequest
    const fileNames = Array.isArray(body.fileNames)
      ? body.fileNames.map((value) => String(value || '').trim()).filter(Boolean)
      : []
    const imageDataUrls = Array.isArray(body.imageDataUrls)
      ? body.imageDataUrls.map((value) => String(value || '').trim()).filter(Boolean)
      : []
    const notes = String(body.notes || '').trim()

    const extractionResult = imageDataUrls.length
      ? await extractProductAttributesWithOpenAI({ fileNames, imageDataUrls, notes })
      : { extraction: null as ExtractedProductAttributes | null, error: 'No images provided for extraction.' }

    const normalized = extractionResult.extraction
      ? normalizeExtractedProductAttributes(extractionResult.extraction)
      : null
    const enriched = normalized ? enrichNormalizedProductAttributes(normalized) : null

    const openAIResult = await generateDraftWithOpenAI(
      { fileNames, imageDataUrls, notes },
      extractionResult.extraction,
      normalized,
      enriched
    )
    const aiDraft = openAIResult.draft
    const fallbackSource = [
      notes,
      ...fileNames,
      extractionResult.extraction ? summarizeExtraction(extractionResult.extraction) : '',
    ]
      .filter(Boolean)
      .join(' ')
    const draft = aiDraft || (fallbackSource ? inferDraftFromText(fallbackSource) : DEFAULT_DRAFT)
    const validation = validateAiDraft(draft)
    const pipelineDebug = {
      extraction: extractionResult.extraction
        ? { ok: true, message: 'Extraction completed.' }
        : { ok: false, message: extractionResult.error || 'Extraction did not return data.' },
      normalization: normalized
        ? { ok: true, message: 'Normalization completed.' }
        : {
            ok: false,
            message: extractionResult.extraction
              ? 'Normalization did not return data.'
              : 'Skipped because extraction did not return data.',
          },
      enrichment: enriched
        ? { ok: true, message: 'Enrichment completed.' }
        : {
            ok: false,
            message: normalized
              ? 'Enrichment did not return data.'
              : 'Skipped because normalization did not return data.',
          },
      generation: aiDraft
        ? { ok: true, message: 'Draft generation completed.' }
        : { ok: false, message: openAIResult.error || 'Draft generation did not return data.' },
    }

    return NextResponse.json({
      draft,
      extraction: extractionResult.extraction,
      normalized,
      enriched,
      validation,
      pipelineDebug,
      source: aiDraft ? 'openai' : 'fallback',
      debug: aiDraft
        ? extractionResult.extraction
          ? null
          : extractionResult.error || null
        : openAIResult.error || extractionResult.error || 'OpenAI returned no usable draft.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AI draft' },
      { status: 500 }
    )
  }
}
