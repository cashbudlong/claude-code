import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}

export type TicketStatus = 'Parked' | 'Requested' | 'Ready' | 'Picked Up'

export interface ValetTicket {
  id: string
  ticket_number: number
  name: string
  email: string
  car_make: string
  car_model: string
  car_color: string
  status: TicketStatus
  request_token: string
  location: string | null
  created_at: string
}
