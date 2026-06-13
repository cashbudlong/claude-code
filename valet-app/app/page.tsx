'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      car_make: (form.elements.namedItem('car_make') as HTMLInputElement).value.trim(),
      car_model: (form.elements.namedItem('car_model') as HTMLInputElement).value.trim(),
      car_color: (form.elements.namedItem('car_color') as HTMLInputElement).value.trim(),
    }

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Check-in failed. Are your credentials set up?')
      router.push(`/confirmation/${json.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🚗</div>
          <h1 className="text-3xl font-bold text-gray-900">Valet Check-In</h1>
          <p className="mt-2 text-gray-500">Fill in your details and we'll take it from here.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="space-y-5">
            <Field label="Full Name" name="name" type="text" placeholder="Jane Smith" required />
            <Field label="Email Address" name="email" type="email" placeholder="jane@example.com" required />

            <hr className="border-gray-100" />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Car Make" name="car_make" type="text" placeholder="Toyota" required />
              <Field label="Car Model" name="car_model" type="text" placeholder="Camry" required />
            </div>
            <Field label="Car Color" name="car_color" type="text" placeholder="Silver" required />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gray-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {loading ? 'Checking in…' : 'Check In My Car'}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({
  label, name, type, placeholder, required,
}: {
  label: string; name: string; type: string; placeholder: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  )
}
