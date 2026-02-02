/**
 * Product Images Upload API
 * 
 * Endpoint:
 * - POST /api/products/[id]/images - 上傳產品圖片
 *   支援多檔案上傳
 *   圖片儲存在 Supabase Storage (product_image bucket)
 *   預設 published=false（草稿狀態）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@33pearlatelier/shared/supabase'

// POST /api/products/[id]/images - Upload images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current max sort_order
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)

    let nextSortOrder = 0
    if (existingImages && existingImages.length > 0) {
      const lastImage = existingImages[0] as any
      nextSortOrder = (lastImage.sort_order || 0) + 1
    }

    const uploadedImages = []

    for (const file of files) {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product_image')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      // Create database record
      const { data: imageRecord, error: dbError } = await (supabase as any)
        .from('product_images')
        .insert({
          product_id: id,
          storage_path: filePath,
          published: false,
          is_primary: false,
          sort_order: nextSortOrder++
        })
        .select()
        .single()

      if (dbError) {
        console.error('DB error:', dbError)
        continue
      }

      uploadedImages.push(imageRecord)
    }

    return NextResponse.json({ images: uploadedImages }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload images' },
      { status: 500 }
    )
  }
}
