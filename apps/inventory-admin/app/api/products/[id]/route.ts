/**
 * Single Product API
 * 
 * Endpoints:
 * - GET    /api/products/[id]     - Get single product (including images)
 * - PATCH  /api/products/[id]     - Update product data
 * - DELETE /api/products/[id]     - Delete product
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'
import {
  PRODUCT_IMAGE_BUCKET,
  PRODUCT_VIDEO_BUCKET,
  slugify,
  syncProductAvailabilitySnapshots,
} from '@pearl33atelier/shared'
import type { Database } from '@pearl33atelier/shared/types'

type ProductUpdate = Database['public']['Tables']['catalog_products']['Update']
type ProductImage = Database['public']['Tables']['product_images']['Row']

const PEARL_TYPES = [
  'WhiteAkoya',
  'GreyAkoya',
  'WhiteSouthSea',
  'GoldenSouthSea',
  'Tahitian',
  'Freshwater',
  'Other',
] as const

function getImageVariantPaths(storagePath: string): string[] {
  const match = storagePath.match(/^(.*)-(thumb|medium|large)\.([^.]+)$/)
  if (!match) return [storagePath]

  const [, basePath, , extension] = match
  return ['thumb', 'medium', 'large'].map((size) => `${basePath}-${size}.${extension}`)
}

function normalizeSizeRange(value: unknown): string | null {
  if (value == null) return null
  const size = String(value).trim()
  if (!size) return null
  const isValid = /^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(size)
  if (!isValid) {
    throw new Error('size_mm must be a number or range like 7, 7.5, 7-7.5, 3.5-8')
  }
  return size
}

function normalizeSku(value: unknown): string | null {
  if (value == null) return null
  const sku = String(value).trim().toUpperCase()
  if (!sku) return null
  if (!/^PA[0-9]{4}$/.test(sku)) {
    throw new Error('sku must match format PA0001')
  }
  return sku
}

function splitPearlTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePearlTypeValue(value: unknown): string {
  const selectedTypes = splitPearlTypes(value)
  if (selectedTypes.length === 0) {
    throw new Error('pearl_type is invalid or missing')
  }

  const invalidType = selectedTypes.find(
    (type) => !(PEARL_TYPES as readonly string[]).includes(type)
  )
  if (invalidType) {
    throw new Error(`Invalid pearl_type value: ${invalidType}`)
  }

  return Array.from(new Set(selectedTypes)).join(', ')
}

// GET /api/products/[id] - Get single product with images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError) throw productError

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })

    if (imagesError) throw imagesError

    const { data: videos, error: videosError } = await (supabase as any)
      .from('product_videos')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })

    if (videosError) throw videosError

    return NextResponse.json({ product, images, videos })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse
    let normalizedSize: string | null = null
    if ('size_mm' in body) {
      try {
        normalizedSize = normalizeSizeRange(body.size_mm)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid size_mm format' },
          { status: 400 }
        )
      }
    }

    const updates: ProductUpdate = {}
    
    // Only include fields that are present in the request body
    // Use nullish coalescing (??) to preserve falsy values like 0 and ''
    if ('title' in body) updates.title = body.title
    if ('sku' in body) {
      try {
        updates.sku = normalizeSku(body.sku)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid sku format' },
          { status: 400 }
        )
      }
    }
    if ('slug' in body) {
      const nextSlug = slugify(String(body.slug || '').trim())
      if (!nextSlug) {
        return NextResponse.json(
          { error: 'slug cannot be empty' },
          { status: 400 }
        )
      }
      updates.slug = nextSlug
    }
    if ('pearl_type' in body) {
      try {
        updates.pearl_type = normalizePearlTypeValue(body.pearl_type)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid pearl_type format' },
          { status: 400 }
        )
      }
    }
    if ('category' in body) updates.category = body.category ?? null
    if ('description' in body) updates.description = body.description ?? null
    if ('editors_pick' in body) updates.editors_pick = Boolean(body.editors_pick)
    if ('note' in body) updates.note = body.note ?? null
    if ('size_mm' in body) updates.size_mm = normalizedSize
    if ('shape' in body) updates.shape = body.shape ?? null
    if ('material' in body) updates.material = body.material ?? null
    if ('sell_price' in body) updates.sell_price = body.sell_price ?? null
    if ('original_price' in body) updates.original_price = body.original_price ?? null
    if ('availability' in body) updates.availability = body.availability
    if ('preorder_note' in body) updates.preorder_note = body.preorder_note ?? null
    if ('inventory_item_id' in body) updates.inventory_item_id = body.inventory_item_id ?? null

    const { data, error } = await supabase
      .from('catalog_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await syncProductAvailabilitySnapshots(supabase, [id])

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    // Step 1: Get all product images to delete from storage
    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id)
      .returns<Pick<ProductImage, 'storage_path'>[]>()

    // Step 2: Delete all image variants from storage
    if (images && images.length > 0) {
      const paths = [...new Set(images.flatMap((img) => getImageVariantPaths(img.storage_path)))]
      const { error: storageError } = await supabase
        .storage
        .from(PRODUCT_IMAGE_BUCKET)
        .remove(paths)
      
      if (storageError) {
        logger.error('Failed to delete images from storage', storageError)
        // Continue anyway, we'll delete the DB records
      }
    }

    // Step 3: Delete image records from database
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (imagesError) {
      logger.error('Failed to delete image records', imagesError)
      // Continue anyway, we'll delete the product
    }

    // Step 4: Delete product
    const { data: videos } = await (supabase as any)
      .from('product_videos')
      .select('storage_path')
      .eq('product_id', id)

    if (videos && videos.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from(PRODUCT_VIDEO_BUCKET)
        .remove(videos.map((video: { storage_path: string }) => video.storage_path))

      if (storageError) {
        logger.error('Failed to delete videos from storage', storageError)
      }
    }

    const { error: videosError } = await (supabase as any)
      .from('product_videos')
      .delete()
      .eq('product_id', id)

    if (videosError) {
      logger.error('Failed to delete video records', videosError)
    }

    // Step 5: Delete product
    const { error } = await supabase
      .from('catalog_products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Product and all related media deleted successfully' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    )
  }
}
