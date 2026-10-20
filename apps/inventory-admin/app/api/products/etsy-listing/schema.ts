import { z } from 'zod'
import {
  ETSY_DIMENSION_UNITS,
  ETSY_WEIGHT_UNITS,
} from '@/app/lib/etsyListingPackage'

const etsyTagSchema = z.string().trim().min(1).max(20).regex(/^[\p{L}\p{N}\p{Zs}\-'™©®]+$/u)
const etsyMaterialSchema = z.string().trim().min(1).max(45).regex(/^[\p{L}\p{N}\p{Zs}]+$/u)

export const etsyListingDraftSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(13_000),
    tags: z.array(etsyTagSchema).length(13),
    materials: z.array(etsyMaterialSchema).min(1).max(13),
    taxonomyId: z.number().int().positive(),
    attributes: z.array(
      z.object({
        propertyId: z.number().int().positive(),
        valueIds: z.array(z.number().int().positive()).default([]),
        values: z.array(z.string().trim().min(1)).default([]),
      })
    ),
    style: z.array(z.string().trim().min(1).max(45)).max(2),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    whoMade: z.enum(['i_did', 'someone_else', 'collective']),
    whenMade: z.enum([
      'made_to_order',
      '2020_2026',
      '2010_2019',
      '2007_2009',
      'before_2007',
      '2000_2006',
      '1990s',
      '1980s',
      '1970s',
      '1960s',
      '1950s',
      '1940s',
      '1930s',
      '1920s',
      '1910s',
      '1900s',
      '1800s',
      '1700s',
      'before_1700',
    ]),
    isSupply: z.boolean(),
    shippingProfileId: z.number().int().positive(),
    readinessStateId: z.number().int().positive(),
    itemWeight: z.number().positive(),
    itemWeightUnit: z.enum(ETSY_WEIGHT_UNITS),
    itemLength: z.number().positive(),
    itemWidth: z.number().positive(),
    itemHeight: z.number().positive(),
    itemDimensionsUnit: z.enum(ETSY_DIMENSION_UNITS),
    imageOrder: z.array(z.string().uuid()).min(1).max(20),
  })
  .superRefine((listing, context) => {
    if (/[\u0000-\u001f\u007f]/u.test(listing.title)) {
      context.addIssue({
        code: 'custom',
        path: ['title'],
        message: 'Title contains unsupported control characters.',
      })
    }
    for (const character of ['%', ':', '&', '+']) {
      if (listing.title.split(character).length - 1 > 1) {
        context.addIssue({
          code: 'custom',
          path: ['title'],
          message: `Title may contain the ${character} character at most once.`,
        })
      }
    }

    if (new Set(listing.tags.map((tag) => tag.toLocaleLowerCase())).size !== 13) {
      context.addIssue({
        code: 'custom',
        path: ['tags'],
        message: 'Tags must be unique.',
      })
    }

    if (new Set(listing.imageOrder).size !== listing.imageOrder.length) {
      context.addIssue({
        code: 'custom',
        path: ['imageOrder'],
        message: 'Image order cannot contain duplicate image IDs.',
      })
    }

  })

export type EtsyListingDraft = z.infer<typeof etsyListingDraftSchema>

export function validateEtsyListingDraft(input: unknown) {
  const result = etsyListingDraftSchema.safeParse(input)
  if (result.success) return { canCreateDraft: true as const, issues: [] }

  return {
    canCreateDraft: false as const,
    issues: result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'listing',
      message: issue.message,
    })),
  }
}
