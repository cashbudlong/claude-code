import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { sendReadyEmail, sendHostNotificationEmail } from '@/lib/email'
import type { TicketStatus } from '@/lib/supabase'

const NEXT_STATUS: Record<TicketStatus, TicketStatus | null> = {
  'Parked':    'Requested',
  'Requested': 'Ready',
  'Ready':     'Picked Up',
  'Picked Up': null,
}

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/status/[id]'>) {
  try {
    const { id } = await ctx.params
    const supabase = getSupabase()

    const { data: ticket, error: fetchError } = await supabase
      .from('valet_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    }

    const next = NEXT_STATUS[ticket.status as TicketStatus]
    if (!next) {
      return NextResponse.json({ error: 'Already at final status.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('valet_tickets')
      .update({ status: next })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (next === 'Requested') {
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
    }

    if (next === 'Ready') {
      try {
        await sendReadyEmail(
          ticket.email,
          ticket.name,
          ticket.ticket_number,
          ticket.car_color,
          ticket.car_make,
          ticket.car_model
        )
      } catch (emailErr) {
        console.error('[Email] Ready email failed:', emailErr)
      }
    }

    return NextResponse.json({ status: next })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
