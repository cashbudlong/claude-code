import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('valet_tickets')
      .update({ status: 'Picked Up' })
      .in('status', ['Parked', 'Requested', 'Ready'])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
