type AiDraftRequest = {
  fileNames?: string[]
  imageDataUrls?: string[]
  notes?: string
}

export type ExtractedProductAttributes = {
  product_type: string
  category_hint: string
  pearl_type: string
  color: string
  overtone_raw: string
  size_mm_raw: string
  shape: string
  luster: string
  surface: string
  metal_raw: string
  style: string
  confidence: {
    product_type: number
    pearl_type: number
    overtone_raw: number
    category_hint: number
    shape: number
    luster: number
  }
  uncertain_fields: string[]
  reasoning_notes: string[]
}

type ExtractionResult =
  | { extraction: ExtractedProductAttributes; error?: undefined }
  | { extraction: null; error: string }

function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim()
  }

  const outputItems = Array.isArray(data?.output) ? data.output : []
  for (const item of outputItems) {
    const contents = Array.isArray(item?.content) ? item.content : []
    for (const content of contents) {
      if (typeof content?.text === 'string' && content.text.trim()) return content.text.trim()
      if (typeof content?.output_text === 'string' && content.output_text.trim()) {
        return content.output_text.trim()
      }
      if (typeof content?.value === 'string' && content.value.trim()) return content.value.trim()
      if (typeof content?.json === 'string' && content.json.trim()) return content.json.trim()
    }
  }

  return null
}

export function summarizeExtraction(extraction: ExtractedProductAttributes) {
  return [
    `Product type: ${extraction.product_type || 'unknown'}`,
    `Category hint: ${extraction.category_hint || 'unknown'}`,
    `Pearl type: ${extraction.pearl_type || 'unknown'}`,
    `Color: ${extraction.color || 'unknown'}`,
    `Overtone: ${extraction.overtone_raw || 'unknown'}`,
    `Size: ${extraction.size_mm_raw || 'unknown'}`,
    `Shape: ${extraction.shape || 'unknown'}`,
    `Luster: ${extraction.luster || 'unknown'}`,
    `Surface: ${extraction.surface || 'unknown'}`,
    `Metal: ${extraction.metal_raw || 'unknown'}`,
    `Style: ${extraction.style || 'unknown'}`,
    extraction.uncertain_fields?.length
      ? `Uncertain fields: ${extraction.uncertain_fields.join(', ')}`
      : '',
    extraction.reasoning_notes?.length
      ? `Reasoning notes: ${extraction.reasoning_notes.join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function extractProductAttributesWithOpenAI(
  input: AiDraftRequest
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { extraction: null, error: 'OPENAI_API_KEY is missing on the server.' }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  const userContent: Array<Record<string, unknown>> = [
    {
      type: 'input_text',
      text: [
        'Review these product photos and extract structured product attributes only.',
        input.notes ? `Admin notes: ${input.notes}` : '',
        ...(input.fileNames || []).map((name) => `Image filename: ${name}`),
      ]
        .filter(Boolean)
        .join('\n'),
    },
    ...((input.imageDataUrls || []).map((url) => ({
      type: 'input_image',
      image_url: url,
    })) as Array<Record<string, unknown>>),
  ]

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
                `You are a jewelry product extraction model.

Your task is to examine uploaded product photos and return structured product attributes only.

Do not write marketing copy.
Do not generate descriptions.
Do not invent unsupported claims.

Prefer broad but correct answers over specific but risky ones.
If a field is uncertain, include it in uncertain_fields.
Use reasoning_notes for brief factual explanations only.

Return valid JSON only with these keys:
- product_type
- category_hint
- pearl_type
- color
- overtone_raw
- size_mm_raw
- shape
- luster
- surface
- metal_raw
- style
- confidence
- uncertain_fields
- reasoning_notes`,
            },
          ],
        },
        { role: 'user', content: userContent },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'product_extraction',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: [
              'product_type',
              'category_hint',
              'pearl_type',
              'color',
              'overtone_raw',
              'size_mm_raw',
              'shape',
              'luster',
              'surface',
              'metal_raw',
              'style',
              'confidence',
              'uncertain_fields',
              'reasoning_notes',
            ],
            properties: {
              product_type: { type: 'string' },
              category_hint: { type: 'string' },
              pearl_type: { type: 'string' },
              color: { type: 'string' },
              overtone_raw: { type: 'string' },
              size_mm_raw: { type: 'string' },
              shape: { type: 'string' },
              luster: { type: 'string' },
              surface: { type: 'string' },
              metal_raw: { type: 'string' },
              style: { type: 'string' },
              confidence: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'product_type',
                  'pearl_type',
                  'overtone_raw',
                  'category_hint',
                  'shape',
                  'luster',
                ],
                properties: {
                  product_type: { type: 'number' },
                  pearl_type: { type: 'number' },
                  overtone_raw: { type: 'number' },
                  category_hint: { type: 'number' },
                  shape: { type: 'number' },
                  luster: { type: 'number' },
                },
              },
              uncertain_fields: {
                type: 'array',
                items: { type: 'string' },
              },
              reasoning_notes: {
                type: 'array',
                items: { type: 'string' },
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
      extraction: null,
      error: `OpenAI extraction failed (${response.status}): ${errorText.slice(0, 400)}`,
    }
  }

  const data = await response.json()
  const outputText = extractOutputText(data)
  if (!outputText) {
    return {
      extraction: null,
      error: `OpenAI extraction response did not include parsable text. Response keys: ${Object.keys(data || {}).join(', ')}`,
    }
  }

  try {
    return { extraction: JSON.parse(outputText) as ExtractedProductAttributes }
  } catch (error) {
    return {
      extraction: null,
      error: `Failed to parse extraction JSON output: ${error instanceof Error ? error.message : 'unknown error'}`,
    }
  }
}
