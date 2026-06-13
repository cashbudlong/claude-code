import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/tickets/[id]'>) {
  try {
    const { id } = await ctx.params
    const { location } = await req.json()
    const supabase = getSupabase()

    const { error } = await supabase
      .from('valet_tickets')
      .update({ location })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/tickets/[id]'>) {
  try {
    const { id } = await ctx.params
    const supabase = getSupabase()

    const { error } = await supabase
      .from('valet_tickets')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
