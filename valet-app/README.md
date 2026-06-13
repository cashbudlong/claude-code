# Valet App

A full-stack valet management app for party events. Guests check in via QR code; valets manage cars from a secret dashboard with email notifications via Resend.

---

## Secret Dashboard URL

```
/dashboard-valet-xk9p2m
```

Bookmark this. It's your access control — don't share it publicly.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env vars
cp .env.local.example .env.local

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000 for the guest check-in form.
Open http://localhost:3000/dashboard-valet-xk9p2m for the valet dashboard.

---

## Setting Up Supabase

1. Go to https://supabase.com and create a free account + new project.
2. In your project, go to **SQL Editor** and run the contents of `supabase/schema.sql`.
   - If you previously ran an older version of the schema (with a `phone` column), run `drop table if exists valet_tickets;` first, then re-run the schema.
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role (secret)** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Setting Up Resend (Email)

1. Go to https://resend.com and create a free account.
2. Go to **API Keys → Create API Key** and copy it → `RESEND_API_KEY`
3. That's it — emails send from `onboarding@resend.dev` with no domain setup needed.

> **Free tier:** 100 emails/day, 3,000/month — plenty for a party event.

> **Custom domain (optional):** If you want emails to come from your own domain (e.g. `valet@yourdomain.com`), go to **Domains** in the Resend dashboard and follow the DNS setup instructions. Then update the `FROM` address in `lib/email.ts`.

---

## Deploying to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel
```

Then in your Vercel project dashboard go to **Settings → Environment Variables** and add all variables from `.env.local`. Set `NEXT_PUBLIC_BASE_URL` to your Vercel deployment URL (e.g. `https://valet-app.vercel.app`).

Redeploy after adding env vars.

---

## QR Code

The QR code for the guest check-in URL is generated automatically on the dashboard.

1. Open `/dashboard-valet-xk9p2m`
2. Click **QR Code** in the top-right
3. Click **Download PNG** to save it
4. Print it or display it on a tablet at the valet table

---

## App Flow

| Who | URL | What happens |
|-----|-----|---|
| Guest | `/` | Fills in name, email, car info |
| Guest | `/confirmation/[id]` | Sees their ticket number + request link |
| Guest | `/request/[token]` | Taps button to request car |
| Valet | `/dashboard-valet-xk9p2m` | Sees all cars, advances status |

### Status stages
`Parked` → `Requested` → `Ready` → `Picked Up`

- **Check-in:** Guest receives a confirmation email with their ticket number and a link to request their car.
- **Ready:** When a valet marks a car Ready, guest receives an email that their car is out front.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_BASE_URL` | Full URL of your deployment (no trailing slash) |
