import { getSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getSupabase()

  const { data: ticket, error } = await supabase
    .from('valet_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const requestUrl = `${baseUrl}/request/${ticket.request_token}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 text-6xl">🎉</div>

        <p className="text-lg font-medium text-gray-500">Your ticket number is</p>
        <div className="my-4 text-9xl font-black tracking-tight text-gray-900">
          #{ticket.ticket_number}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-600">
            We'll email <span className="font-semibold text-gray-900">{ticket.email}</span> when
            your car is ready.
          </p>

          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4 text-left text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{ticket.name}</p>
            <p className="mt-0.5">
              {ticket.car_color} {ticket.car_make} {ticket.car_model}
            </p>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-500">
              Ready to leave early? Use this link to request your car:
            </p>
            <Link
              href={requestUrl}
              className="mt-3 block rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Request My Car
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Show ticket <span className="font-bold">#{ticket.ticket_number}</span> to the valet when you pick up.
        </p>
      </div>
    </main>
  )
}
