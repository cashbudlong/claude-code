'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { ValetTicket } from '@/lib/supabase'

export default function RequestPage() {
  const { token } = useParams<{ token: string }>()
  const [ticket, setTicket] = useState<ValetTicket | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading')
  const [requestState, setRequestState] = useState<'idle' | 'pending' | 'done' | 'alreadyRequested'>('idle')

  useEffect(() => {
    fetch(`/api/request/${token}`)
      .then(r => r.json().catch(() => ({ error: 'Invalid response' })))
      .then(data => {
        if (data.error) {
          setStatus('notfound')
        } else {
          setTicket(data)
          setStatus('ready')
          if (data.status !== 'Parked') setRequestState('alreadyRequested')
        }
      })
      .catch(() => setStatus('notfound'))
  }, [token])

  async function handleRequest() {
    setRequestState('pending')
    try {
      const res = await fetch(`/api/request/${token}`, { method: 'POST' })
      const data = await res.json()
      if (data.status === 'Requested' || data.status) {
        setRequestState('done')
        setTicket(prev => prev ? { ...prev, status: data.status } : prev)
      }
    } catch {
      setRequestState('idle')
    }
  }

  if (status === 'loading') {
    return <Centered><p className="text-gray-500">Loading…</p></Centered>
  }

  if (status === 'notfound') {
    return (
      <Centered>
        <div className="text-center">
          <div className="mb-4 text-5xl">❓</div>
          <h1 className="text-xl font-bold text-gray-900">Ticket not found</h1>
          <p className="mt-2 text-gray-500">This link may be invalid.</p>
        </div>
      </Centered>
    )
  }

  const alreadyDone = ticket!.status === 'Picked Up'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">🚗</div>
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">Ticket</p>
          <div className="text-8xl font-black text-gray-900">#{ticket!.ticket_number}</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{ticket!.name}</p>
            <p className="mt-1">
              {ticket!.car_color} {ticket!.car_make} {ticket!.car_model}
            </p>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <StatusBadge status={ticket!.status} />
          </div>

          {alreadyDone ? (
            <p className="mt-4 text-center text-sm text-gray-400">Your car has been picked up. Enjoy!</p>
          ) : requestState === 'done' || requestState === 'alreadyRequested' ? (
            <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
              ✓ Request received — we're bringing your car now!
            </div>
          ) : (
            <button
              onClick={handleRequest}
              disabled={requestState === 'pending'}
              className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {requestState === 'pending' ? 'Requesting…' : "I'm ready to leave — bring my car"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">{children}</div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Parked':    'bg-gray-100 text-gray-600',
    'Requested': 'bg-amber-100 text-amber-700',
    'Ready':     'bg-green-100 text-green-700',
    'Picked Up': 'bg-gray-50 text-gray-400',
  }
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
