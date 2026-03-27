import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'
import { logger } from '@/app/utils/logger'
import { PRODUCT_VIDEO_BUCKET } from '@pearl33atelier/shared'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { videoId } = await params
    const body = await request.json()
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const updates: Record<string, unknown> = {}
    if ('published' in body) updates.published = Boolean(body.published)

    const { data, error } = await (supabase as any)
      .from('product_videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ video: data })
  } catch (error) {
    logger.error('Failed to update video', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { videoId } = await params
    const { supabase, errorResponse } = await requireAdmin()
    if (errorResponse || !supabase) return errorResponse

    const { data: video, error: fetchError } = await (supabase as any)
      .from('product_videos')
      .select('storage_path')
      .eq('id', videoId)
      .single()

    if (fetchError) throw fetchError

    if (video?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(PRODUCT_VIDEO_BUCKET)
        .remove([video.storage_path])

      if (storageError) {
        logger.error('Failed to delete video from storage', storageError)
        throw storageError
      }
    }

    const { error: deleteError } = await (supabase as any)
      .from('product_videos')
      .delete()
      .eq('id', videoId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete video', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 }
    )
  }
}
