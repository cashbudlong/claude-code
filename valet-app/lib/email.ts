import nodemailer from 'nodemailer'

const FROM = 'Medicine Lake Valet <medicinelakevalet@gmail.com>'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendCheckinEmail(
  to: string,
  name: string,
  ticketNumber: number,
  requestUrl: string
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] Skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set')
    return
  }
  console.log(`[Email] Sending check-in confirmation to ${to}`)
  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject: `🚗 Valet Ticket #${ticketNumber} - Medicine Lake Valet`,
    html: checkinHtml(name, ticketNumber, requestUrl),
  })
  console.log(`[Email] Sent — ID: ${info.messageId}`)
}

export async function sendReadyEmail(
  to: string,
  name: string,
  ticketNumber: number,
  carColor: string,
  carMake: string,
  carModel: string
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] Skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set')
    return
  }
  console.log(`[Email] Sending ready notification to ${to}`)
  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject: `✅ Your car is ready - Medicine Lake Valet`,
    html: readyHtml(name, ticketNumber, carColor, carMake, carModel),
  })
  console.log(`[Email] Sent — ID: ${info.messageId}`)
}

export async function sendHostNotificationEmail(
  ticketNumber: number,
  guestName: string,
  carColor: string,
  carMake: string,
  carModel: string
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return
  console.log(`[Email] Sending host notification for ticket #${ticketNumber}`)
  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from: FROM,
    to: 'cashbudlong@gmail.com',
    subject: `🚗 Car Requested - Ticket #${ticketNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111;">
        <div style="font-size:40px;margin-bottom:8px;">🚗</div>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 20px;">Car Requested - Ticket #${ticketNumber}</h1>
        <p style="margin:0 0 12px;">Hi Cash!</p>
        <p style="margin:0 0 12px;"><strong>${guestName}</strong> is ready to leave.</p>
        <p style="margin:0 0 24px;">Their <strong>${carColor} ${carMake} ${carModel}</strong> is ticket <strong>#${ticketNumber}</strong>.</p>
        <p style="font-size:20px;font-weight:700;color:#111;">Go get their car! 🏃</p>
      </div>
    `,
  })
  console.log(`[Email] Host notified — ID: ${info.messageId}`)
}

function checkinHtml(name: string, ticketNumber: number, requestUrl: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111;background:#fff;">
      <div style="font-size:40px;margin-bottom:8px;">🚗</div>
      <h1 style="font-size:28px;font-weight:800;margin:0 0 4px;">Ticket #${ticketNumber}</h1>
      <p style="color:#888;margin:0 0 28px;font-size:14px;">Medicine Lake Valet</p>
      <p style="margin:0 0 12px;">Hi ${name}!</p>
      <p style="margin:0 0 24px;">Your valet ticket number is <strong>#${ticketNumber}</strong>. When you're ready to leave, tap the button below to request your car:</p>
      <a href="${requestUrl}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;margin-bottom:24px;">Request My Car</a>
      <p style="color:#888;font-size:14px;margin:0;">We'll email you again when your car is out front!</p>
    </div>
  `
}

function readyHtml(name: string, ticketNumber: number, carColor: string, carMake: string, carModel: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111;background:#fff;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <h1 style="font-size:28px;font-weight:800;margin:0 0 4px;">Your car is ready!</h1>
      <p style="color:#888;margin:0 0 28px;font-size:14px;">Medicine Lake Valet</p>
      <p style="margin:0 0 12px;">Hi ${name},</p>
      <p style="margin:0 0 12px;">Your <strong>${carColor} ${carMake} ${carModel}</strong> is ready out front!</p>
      <p style="margin:0 0 24px;">Show ticket <strong>#${ticketNumber}</strong> to the valet.</p>
      <p style="font-size:18px;margin:0;">See you next time! 🎉</p>
    </div>
  `
}
