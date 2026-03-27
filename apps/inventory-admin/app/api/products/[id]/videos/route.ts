import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'
import { PRODUCT_VIDEO_BUCKET, STORAGE_FOLDER } from '@pearl33atelier/shared'

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const formData = await request.formData()
    const files = formData.getAll('videos') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No videos provided' }, { status: 400 })
    }

    const { data: existingVideos } = await (supabase as any)
      .from('product_videos')
      .select('sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: false })
      .limit(1)

    let nextSortOrder = 0
    if (existingVideos && existingVideos.length > 0) {
      nextSortOrder = (existingVideos[0].sort_order || 0) + 1
    }

    const uploadedVideos = []

    for (const file of files) {
      if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Unsupported video type: ${file.type || 'unknown'}` },
          { status: 400 }
        )
      }

      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Video exceeds 25MB limit. Please compress it before uploading.' },
          { status: 400 }
        )
      }

      const fileExt = file.name.split('.').pop() || 'mp4'
      const filePath = `${STORAGE_FOLDER}/${id}/video-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_VIDEO_BUCKET)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        logger.error('Video upload failed', uploadError)
        throw uploadError
      }

      const { data: videoRecord, error: dbError } = await (supabase as any)
        .from('product_videos')
        .insert({
          product_id: id,
          storage_path: filePath,
          published: false,
          sort_order: nextSortOrder++,
        })
        .select()
        .single()

      if (dbError) {
        logger.error('Failed to create video record', dbError)
        await supabase.storage.from(PRODUCT_VIDEO_BUCKET).remove([filePath])
        throw dbError
      }

      uploadedVideos.push(videoRecord)
    }

    return NextResponse.json({ videos: uploadedVideos }, { status: 201 })
  } catch (error) {
    logger.error('Video upload failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload videos' },
      { status: 500 }
    )
  }
}
