import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { sendHostNotificationEmail } from '@/lib/email'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/request/[token]'>) {
  try {
    const { token } = await ctx.params
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('valet_tickets')
      .select('*')
      .eq('request_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/request/[token]'>) {
  try {
    const { token } = await ctx.params
    const supabase = getSupabase()

    const { data: ticket, error: fetchError } = await supabase
      .from('valet_tickets')
      .select('*')
      .eq('request_token', token)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    }

    if (ticket.status !== 'Parked') {
      return NextResponse.json({ status: ticket.status })
    }

    const { error } = await supabase
      .from('valet_tickets')
      .update({ status: 'Requested' })
      .eq('id', ticket.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      await sendHostNotificationEmail(
        ticket.ticket_number,
        ticket.name,
        ticket.car_color,
        ticket.car_make,
        ticket.car_model
      )
    } catch (emailErr) {
      console.error('[Email] Host notification failed:', emailErr)
    }

    return NextResponse.json({ status: 'Requested' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
