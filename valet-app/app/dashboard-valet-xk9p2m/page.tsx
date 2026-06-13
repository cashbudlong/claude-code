'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import type { ValetTicket, TicketStatus } from '@/lib/supabase'

const STATUS_STYLES: Record<TicketStatus, { card: string; badge: string; label: string }> = {
  'Parked':    { card: 'bg-white border-gray-200',        badge: 'bg-gray-100 text-gray-600',    label: 'Parked' },
  'Requested': { card: 'bg-amber-50 border-amber-300',    badge: 'bg-amber-100 text-amber-800',  label: 'Requested' },
  'Ready':     { card: 'bg-green-50 border-green-300',    badge: 'bg-green-100 text-green-800',  label: 'Ready' },
  'Picked Up': { card: 'bg-gray-50 border-gray-100 opacity-60', badge: 'bg-gray-100 text-gray-400', label: 'Picked Up' },
}

const NEXT_LABEL: Record<TicketStatus, string | null> = {
  'Parked':    'Mark Requested',
  'Requested': 'Mark Ready',
  'Ready':     'Mark Picked Up',
  'Picked Up': null,
}

function playAlert() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch { /* ignore */ }
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<ValetTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [showQr, setShowQr] = useState(false)
  const prevRequestedCount = useRef(0)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets')
      if (!res.ok) return
      const data: ValetTicket[] = await res.json().catch(() => [])
      if (!Array.isArray(data)) return
      setTickets(data)

      const requestedCount = data.filter(t => t.status === 'Requested').length
      if (requestedCount > prevRequestedCount.current && prevRequestedCount.current >= 0) {
        playAlert()
      }
      prevRequestedCount.current = requestedCount
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 10000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  useEffect(() => {
    if (!baseUrl) return
    QRCode.toDataURL(`${baseUrl}/`, { width: 400, margin: 2 }).then(setQrUrl)
  }, [baseUrl])

  async function advanceStatus(id: string) {
    setAdvancing(id)
    await fetch(`/api/status/${id}`, { method: 'POST' })
    await fetchTickets()
    setAdvancing(null)
  }

  async function handleLocationSave(id: string, location: string) {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    })
    setTickets(prev => prev.map(t => t.id === id ? { ...t, location } : t))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ticket?')) return
    setDeleting(id)
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
    setTickets(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
  }

  async function clearAll() {
    if (!confirm('Mark ALL remaining cars as Picked Up?')) return
    setClearing(true)
    await fetch('/api/clear', { method: 'POST' })
    await fetchTickets()
    setClearing(false)
  }

  function downloadQr() {
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'valet-checkin-qr.png'
    a.click()
  }

  const counts = {
    Parked:      tickets.filter(t => t.status === 'Parked').length,
    Requested:   tickets.filter(t => t.status === 'Requested').length,
    Ready:       tickets.filter(t => t.status === 'Ready').length,
    'Picked Up': tickets.filter(t => t.status === 'Picked Up').length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 px-4 py-4 text-white shadow-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🚗 Valet Dashboard</h1>
            <p className="mt-0.5 text-xs text-gray-400">Auto-refreshes every 10s</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQr(v => !v)}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
            >
              QR Code
            </button>
            <button
              onClick={clearAll}
              disabled={clearing}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-60"
            >
              {clearing ? 'Clearing…' : 'End of Night'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Status counts */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          {(['Parked', 'Requested', 'Ready', 'Picked Up'] as TicketStatus[]).map(s => (
            <div key={s} className={`rounded-xl border p-3 text-center ${STATUS_STYLES[s].card}`}>
              <div className={`text-2xl font-bold ${s === 'Picked Up' ? 'text-gray-400' : 'text-gray-900'}`}>
                {counts[s]}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">{s}</div>
            </div>
          ))}
        </div>

        {/* QR Code panel */}
        {showQr && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Guest Check-In QR Code</h2>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {qrUrl && (
                <img src={qrUrl} alt="Check-in QR code" className="h-48 w-48 rounded-xl" />
              )}
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">Guests scan this to check in.</p>
                <p className="mt-1 break-all text-gray-500">{baseUrl}/</p>
                <button
                  onClick={downloadQr}
                  className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket list */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No cars checked in yet.</div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => {
              const style = STATUS_STYLES[ticket.status as TicketStatus]
              const nextLabel = NEXT_LABEL[ticket.status as TicketStatus]
              const checkedInAt = new Date(ticket.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border p-4 shadow-sm transition-all ${style.card}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: ticket # + info */}
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="text-4xl font-black leading-none text-gray-900 shrink-0">
                        #{ticket.ticket_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{ticket.name}</p>
                        <p className="text-sm text-gray-600">
                          {ticket.car_color} {ticket.car_make} {ticket.car_model}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">{ticket.email}</p>
                        <p className="mt-0.5 text-xs text-gray-400">Checked in {checkedInAt}</p>

                        {/* Location field */}
                        <input
                          key={`loc-${ticket.id}`}
                          defaultValue={ticket.location || ''}
                          placeholder="📍 Parking location…"
                          onBlur={(e) => handleLocationSave(ticket.id, e.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white/70 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                      </div>
                    </div>

                    {/* Right: badge + buttons */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                      {nextLabel && (
                        <button
                          onClick={() => advanceStatus(ticket.id)}
                          disabled={advancing === ticket.id}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-60"
                        >
                          {advancing === ticket.id ? '…' : nextLabel}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleting === ticket.id}
                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-sm text-red-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-40"
                        title="Delete ticket"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
