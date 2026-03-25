/**
 * Product Image Management API
 * 
 * Endpoints:
 * - PATCH  /api/products/[id]/images/[imageId] - Update image attributes
 *   Supports: published (true/false), is_primary (true/false), sort_order (number)
 *   When is_primary=true, automatically unset other primary images
 * 
 * - DELETE /api/products/[id]/images/[imageId] - Delete image (from Storage and DB)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'
import { STORAGE_BUCKET } from '@pearl33atelier/shared'
import type { Database } from '@pearl33atelier/shared/types'

function getImageVariantPaths(storagePath: string): string[] {
  const match = storagePath.match(/^(.*)-(thumb|medium|large)\.([^.]+)$/)
  if (!match) return [storagePath]

  const [, basePath, , extension] = match
  return ['thumb', 'medium', 'large'].map((size) => `${basePath}-${size}.${extension}`)
}

// PATCH /api/products/[id]/images/[imageId] - Update image properties
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const body = await request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    // If setting as primary, first unset all other images
    if (body.is_primary === true) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id)
    }

    // Build updates object
    type ImageUpdate = Database['public']['Tables']['product_images']['Update']
    const updates: ImageUpdate = {}
    if ('published' in body) updates.published = body.published
    if ('is_primary' in body) updates.is_primary = body.is_primary
    if ('sort_order' in body) updates.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('product_images')
      .update(updates)
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      image: data,
      message: body.is_primary ? 'Set as primary image successfully' : 'Image updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update image' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/images/[imageId] - Delete image
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    // Get image info for storage deletion
    const { data: image } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('id', imageId)
      .single()

    // Step 1: Delete all size variants from storage first
    if (image?.storage_path) {
      const pathsToDelete = getImageVariantPaths(image.storage_path)
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(pathsToDelete)
      
      if (storageError) {
        logger.error('Failed to delete image from storage', storageError)
        throw storageError
      }
    }

    // Step 2: Delete from database (only after storage deletion succeeds)
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 }
    )
  }
}
