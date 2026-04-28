import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/app/utils/adminAuth'

const allowedStatuses = new Set(['new', 'contacted', 'qualified', 'converted', 'archived'])

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, errorResponse } = await requireAdmin()
  if (errorResponse || !supabase) return errorResponse

  const { id } = await params
  const body = await request.json()
  const status = String(body?.status || '').trim()

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('crm_leads')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating CRM lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead: data })
}
