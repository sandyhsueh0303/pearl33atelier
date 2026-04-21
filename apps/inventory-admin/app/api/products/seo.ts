import { getProductImageUrl } from '@pearl33atelier/shared'
import { extractOutputText } from './openaiOutput'
import { getDefaultOpenAIModel } from '@/app/lib/openaiModel'
import {
  buildSeoTitle,
  normalizeSeoTitle,
  normalizeKeywords,
} from './seoHelpers'

export type ProductSeoDraftInput = {
  title?: string | null
  description?: string | null
  pearl_type?: string | null
  category?: string | null
  size_mm?: string | null
  shape?: string | null
  luster?: string | null
  overtone?: string | null
  material?: string | null
  availability?: string | null
  sell_price?: number | null
}

export type GeneratedProductSeo = {
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_image_alt: string
}

function buildContext(product: ProductSeoDraftInput) {
  return [
    `Title: ${String(product.title || '').trim()}`,
    `Description: ${String(product.description || '').trim()}`,
    `Pearl type: ${String(product.pearl_type || '').trim()}`,
    `Category: ${String(product.category || '').trim()}`,
    `Size: ${String(product.size_mm || '').trim()}`,
    `Shape: ${String(product.shape || '').trim()}`,
    `Luster: ${String(product.luster || '').trim()}`,
    `Overtone: ${String(product.overtone || '').trim()}`,
    `Material: ${String(product.material || '').trim()}`,
    `Availability: ${String(product.availability || '').trim()}`,
    `Price: ${product.sell_price ?? ''}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function buildFallbackSeoTitle(product: ProductSeoDraftInput) {
  return buildSeoTitle(
    String(product.title || '').trim(),
    String(product.category || '').trim(),
    String(product.pearl_type || '').trim(),
    product.size_mm ? String(product.size_mm).trim() : null
  )
}

export async function generateProductSeo(
  product: ProductSeoDraftInput,
  imageStoragePath?: string | null
): Promise<GeneratedProductSeo> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing on the server.')
  }

  const model = getDefaultOpenAIModel()
  const userContent: Array<Record<string, unknown>> = [
    {
      type: 'input_text',
      text: ['Generate SEO metadata for this product page.', buildContext(product)]
        .filter(Boolean)
        .join('\n\n'),
    },
  ]

  if (imageStoragePath) {
    userContent.push({
      type: 'input_image',
      image_url: getProductImageUrl(imageStoragePath),
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
              text: `You are an SEO editor for a refined pearl jewelry brand.

Return valid JSON only.

Return these keys only:
- seoTitle
- seoDescription
- seoKeywords
- ogImageAlt

Rules:
- seoTitle should usually be 50-65 characters
- If adding "33 Pearl Atelier" makes seoTitle too long, remove the brand name first
- seoDescription should usually be 120-160 characters
- seoKeywords should contain 4-8 concise keyword phrases
- ogImageAlt should clearly and accurately describe the main product image
- Keep language elegant, factual, and non-spammy
- Do not invent gemstone certifications, pearl origins, rarity claims, or materials not supported by the provided data
- Use the provided product fields as source of truth and the image only as supporting context
- Brand name may appear when useful: 33 Pearl Atelier`,
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
          name: 'product_seo_generation',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['seoTitle', 'seoDescription', 'seoKeywords', 'ogImageAlt'],
            properties: {
              seoTitle: { type: 'string' },
              seoDescription: { type: 'string' },
              seoKeywords: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 8,
              },
              ogImageAlt: { type: 'string' },
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI request failed (${response.status}): ${errorText.slice(0, 300)}`)
  }

  const data = await response.json()
  const outputText = extractOutputText(data)
  if (!outputText) {
    throw new Error('OpenAI response did not include parsable output text.')
  }

  const parsed = JSON.parse(outputText)
  const fallbackSeoTitle = buildFallbackSeoTitle(product)
  return {
    seo_title: normalizeSeoTitle(parsed.seoTitle, fallbackSeoTitle),
    seo_description: String(parsed.seoDescription || '').trim(),
    seo_keywords: normalizeKeywords(parsed.seoKeywords).join(', '),
    og_image_alt: String(parsed.ogImageAlt || '').trim(),
  }
}
