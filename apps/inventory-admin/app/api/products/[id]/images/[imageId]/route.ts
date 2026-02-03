/**
 * Product Image Management API
 * 
 * Endpoints:
 * - PATCH  /api/products/[id]/images/[imageId] - 更新圖片屬性
 *   支援: published (true/false), is_primary (true/false), sort_order (number)
 *   設定 is_primary=true 時會自動取消其他圖片的主圖狀態
 * 
 * - DELETE /api/products/[id]/images/[imageId] - 刪除圖片（從 Storage 和 DB）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase'

// PATCH /api/products/[id]/images/[imageId] - Update image properties
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params
    const body = await request.json()
    const supabase = await createAdminClient()

    // If setting as primary, first unset all other images
    if (body.is_primary === true) {
      await (supabase as any)
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id)
    }

    // Build updates object
    const updates: any = {}
    if ('published' in body) updates.published = body.published
    if ('is_primary' in body) updates.is_primary = body.is_primary
    if ('sort_order' in body) updates.sort_order = body.sort_order

    const { data, error } = await (supabase as any)
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params
    const supabase = await createAdminClient()

    // Get image info for storage deletion
    const { data: image } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('id', imageId)
      .single()

    // Step 1: Delete from storage first
    const imageData = image as any
    if (imageData?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([imageData.storage_path])
      
      if (storageError) {
        console.error('Failed to delete image from storage:', storageError)
        throw new Error('Failed to delete image from storage')
      }
    }

    // Step 2: Delete from database (only after storage deletion succeeds)
    const { error: dbError } = await (supabase as any)
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
