import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@33pearlatelier/shared/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const quality = body.quality as string
    const action = body.action as 'publish' | 'unpublish'

    if (!quality || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: quality and action' },
        { status: 400 }
      )
    }

    if (action !== 'publish' && action !== 'unpublish') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "publish" or "unpublish"' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // First check if product exists
    const { data: existingProduct, error: findError } = await supabase
      .from('catalog_products')
      .select('id, quality, title, published')
      .eq('quality', quality)
      .single()

    if (findError || !existingProduct) {
      return NextResponse.json(
        { error: `Product with quality "${quality}" not found` },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = existingProduct as any
    const productTitle = String(product?.title || 'Unknown')

    // Update product based on action
    if (action === 'publish') {
      const { data, error } = await (supabase as any)
        .from('catalog_products')
        .update({ 
          published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('quality', quality)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to publish: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully published "${productTitle}" (${quality})`,
        data
      })
    } else {
      const { data, error } = await (supabase as any)
        .from('catalog_products')
        .update({ 
          published: false, 
          published_at: null 
        })
        .eq('quality', quality)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to unpublish: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully unpublished "${productTitle}" (${quality})`,
        data
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
