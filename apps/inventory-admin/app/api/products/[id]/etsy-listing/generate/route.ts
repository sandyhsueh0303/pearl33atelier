import { NextRequest, NextResponse } from 'next/server'
import { getProductImageUrl } from '@pearl33atelier/shared'
import { requireAdmin } from '@/app/utils/adminAuth'
import { getDefaultOpenAIModel } from '@/app/lib/openaiModel'
import { extractOutputText } from '../../../openaiOutput'
import { readinessStateForAvailability } from '../../../etsy-listing/readinessProfiles'
import {
  parseTaxonomySuggestionOptions,
  resolveTaxonomySuggestion,
} from '../../../etsy-listing/taxonomySuggestion'
import {
  logEtsyGenerationMetric,
  readOpenAIUsage,
  type EtsyGenerationOutcome,
  type EtsyGenerationStage,
} from '../../../etsy-listing/generationMetrics'

function outputSchema(taxonomyIds: number[]) {
  return {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'tags', 'materials', 'style', 'imageOrder', 'attributeSuggestions', 'taxonomyId'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' }, minItems: 13, maxItems: 13 },
    materials: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 13 },
    style: { type: 'array', items: { type: 'string' }, maxItems: 2 },
    taxonomyId: taxonomyIds.length
      ? { type: ['integer', 'null'], enum: [null, ...taxonomyIds] }
      : { type: 'null' },
    imageOrder: { type: 'array', items: { type: 'string' } },
    attributeSuggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'values'],
        properties: {
          name: { type: 'string' },
          values: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  } as const
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin()
  if (errorResponse) return errorResponse

  const startedAt = Date.now()
  const model = getDefaultOpenAIModel()
  let stage: EtsyGenerationStage = 'configuration'
  let outcome: EtsyGenerationOutcome = 'configuration_error'
  let imageCount = 0
  let taxonomyCandidateCount = 0
  let hasAdminNotes = false
  let openAIStatus: number | null = null
  let usage = readOpenAIUsage(null)

  const recordMetrics = () => {
    logEtsyGenerationMetric({
      outcome,
      stage,
      model,
      durationMs: Date.now() - startedAt,
      imageCount,
      taxonomyCandidateCount,
      hasAdminNotes,
      openAIStatus,
      usage,
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    recordMetrics()
    return NextResponse.json({ error: 'OPENAI_API_KEY is missing on the server.' }, { status: 503 })
  }

  stage = 'preflight'
  outcome = 'preflight_rejected'
  try {
    const { id } = await params
    const { supabase } = await requireAdmin()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('id, title, description, pearl_type, size_mm, shape, luster, overtone, material, category, sell_price, availability')
      .eq('id', id)
      .single()
    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }
    let readinessState: ReturnType<typeof readinessStateForAvailability>
    try {
      readinessState = readinessStateForAvailability(product.availability)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Product availability is not ready for Etsy.' },
        { status: 409 }
      )
    }

    const { data: images, error: imageError } = await supabase
      .from('product_images')
      .select('id, storage_path, sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })
    if (imageError) throw imageError
    imageCount = images?.length || 0
    if (!images?.length) {
      return NextResponse.json({ error: 'Upload at least one product image before generating an Etsy listing.' }, { status: 400 })
    }
    if (images.length > 20) {
      return NextResponse.json({ error: 'Etsy supports up to 20 listing images. Reduce the product image count first.' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 2_000) : ''
    const taxonomyOptions = parseTaxonomySuggestionOptions(body.taxonomyOptions)
    hasAdminNotes = Boolean(notes)
    taxonomyCandidateCount = taxonomyOptions.length
    const userContent: Array<Record<string, unknown>> = [
      {
        type: 'input_text',
        text: [
          'Create an Etsy listing draft using only the product facts below. Do not infer or invent origin, certification, grade, karat, warranty, or care claims.',
          `Product facts: ${JSON.stringify(product)}`,
          `Image ID order candidates: ${JSON.stringify(images.map(({ id: imageId }) => imageId))}`,
          taxonomyOptions.length
            ? `Allowed Etsy category candidates: ${JSON.stringify(taxonomyOptions)}`
            : 'No Etsy category candidates are available; return null for taxonomyId.',
          notes ? `Admin guidance: ${notes}` : '',
        ].filter(Boolean).join('\n\n'),
      },
      ...images.map((image) => ({
        type: 'input_image',
        image_url: getProductImageUrl(image.storage_path),
      })),
    ]

    stage = 'openai_request'
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
            content: [{
              type: 'input_text',
              text: [
                'You write factual Etsy listings for 33 Pearl Atelier pearl jewelry.',
                'Return one concise, readable title, a detailed but accurate description, exactly 13 unique Etsy search tags (each at most 20 characters), and materials grounded in product facts.',
                'Suggest at most two Etsy styles. Attribute suggestions are plain names and values only; they are not Etsy taxonomy IDs and must be reviewed/mapped by the seller.',
                'Choose the most specific accurate Etsy taxonomyId only from the supplied category candidates. Return null if none is clearly appropriate.',
                'Rank every supplied image ID exactly once for an Etsy listing: best representative hero image first, then detail and alternate views. Never omit or invent an image ID.',
                'If facts are absent, omit the claim instead of guessing. Do not mention that content was AI-generated.',
              ].join('\n'),
            }],
          },
          { role: 'user', content: userContent },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'etsy_listing_draft',
            strict: true,
            schema: outputSchema(taxonomyOptions.map((option) => option.id)),
          },
        },
      }),
    })
    openAIStatus = response.status

    if (!response.ok) {
      outcome = 'openai_http_error'
      const error = await response.text()
      throw new Error(`Listing generation failed (${response.status}): ${error.slice(0, 300)}`)
    }
    const responseData = await response.json()
    usage = readOpenAIUsage(responseData)
    stage = 'output_validation'
    const outputText = extractOutputText(responseData)
    if (!outputText) throw new Error('The model did not return a listing draft.')

    const draft = JSON.parse(outputText)
    const taxonomySuggestion = resolveTaxonomySuggestion(
      draft.taxonomyId,
      taxonomyOptions
    )
    const allowedImageIds = new Set(images.map((image) => image.id))
    const imageOrder = Array.isArray(draft.imageOrder) ? draft.imageOrder : []
    if (
      imageOrder.length !== images.length ||
      new Set(imageOrder).size !== images.length ||
      imageOrder.some((imageId: string) => !allowedImageIds.has(imageId))
    ) {
      throw new Error('Generated image order did not match the product images. Please try again.')
    }

    stage = 'complete'
    outcome = 'success'
    return NextResponse.json({
      draft: {
        ...draft,
        taxonomyId: taxonomySuggestion?.id ?? null,
        price: product.sell_price,
        imageOrder,
      },
      taxonomySuggestion,
      product: {
        id: product.id,
        title: product.title,
        category: product.category,
        sellPrice: product.sell_price,
        readinessState,
      },
      images: images.map((image) => ({
        id: image.id,
        url: getProductImageUrl(image.storage_path),
        sortOrder: image.sort_order,
      })),
    })
  } catch (error) {
    if (outcome !== 'openai_http_error') {
      if (stage === 'preflight') outcome = 'preflight_error'
      else if (stage === 'openai_request') outcome = 'openai_network_error'
      else outcome = 'invalid_model_output'
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate Etsy listing.' },
      { status: 500 }
    )
  } finally {
    recordMetrics()
  }
}
