import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { sendCheckinEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, car_make, car_model, car_color } = body

    if (!name || !email || !car_make || !car_model || !car_color) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('valet_tickets')
      .insert({ name, email, car_make, car_model, car_color })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app'
    const requestUrl = `${baseUrl}/request/${data.request_token}`

    try {
      await sendCheckinEmail(email, name, data.ticket_number, requestUrl)
    } catch (emailErr) {
      console.error('[Email] Check-in email failed:', emailErr)
    }

    return NextResponse.json({ id: data.id, ticket_number: data.ticket_number })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
