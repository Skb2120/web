import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
import { z } from 'zod'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const portfolioStorePath = path.join(__dirname, '..', '.logs', 'portfolio-store.json')
const portfolioTables = new Set(['skills', 'projects', 'services', 'lead_conversions', 'duty_exams'])
const frontendOrigins = process.env.FRONTEND_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(cors({ origin: frontendOrigins?.length ? frontendOrigins : '*' }))
app.use(express.json({ limit: '1mb' }))

const leadSchema = z.object({
  type: z.string().default('lead'),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  domain: z.string().optional(),
  service: z.string().optional(),
  idea: z.string().min(1),
  message: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    text: z.string(),
  })).optional(),
})

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'portfolio-notification-bridge' })
})

app.get('/', (_request, response) => {
  response.json({
    ok: true,
    service: 'portfolio-notification-bridge',
    health: '/health',
    endpoints: [
      '/api/portfolio/:table',
      '/api/notifications/lead',
    ],
  })
})

app.get('/api/portfolio/:table', async (request, response) => {
  const table = request.params.table
  if (!portfolioTables.has(table)) return response.status(404).json({ error: 'Unknown table' })

  const store = await readPortfolioStore()
  response.json(store[table] ?? [])
})

app.post('/api/portfolio/:table', async (request, response) => {
  const table = request.params.table
  if (!portfolioTables.has(table)) return response.status(404).json({ error: 'Unknown table' })

  const store = await readPortfolioStore()
  const now = new Date().toISOString()
  const row = normalizePortfolioRow(table, {
    ...request.body,
    id: request.body.id || randomUUID(),
    created_at: request.body.created_at || now,
    updated_at: now,
  })
  const rows = Array.isArray(store[table]) ? store[table] : []

  store[table] = rows.some((entry) => entry.id === row.id)
    ? rows.map((entry) => (entry.id === row.id ? row : entry))
    : [row, ...rows]

  await writePortfolioStore(store)
  response.json(row)
})

app.delete('/api/portfolio/:table/:id', async (request, response) => {
  const table = request.params.table
  if (!portfolioTables.has(table)) return response.status(404).json({ error: 'Unknown table' })

  const store = await readPortfolioStore()
  store[table] = (store[table] ?? []).filter((entry) => entry.id !== request.params.id)
  await writePortfolioStore(store)
  response.json({ ok: true })
})

async function handleLeadNotification(request, response) {
  const parsed = leadSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({ error: parsed.error.flatten() })
  }

  response.json({ ok: true })
  sendLeadEmail(parsed.data).catch((error) => console.error('Background email failed:', error))
}

app.post('/api/notifications/lead', handleLeadNotification)

async function readPortfolioStore() {
  try {
    const raw = await fs.readFile(portfolioStorePath, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      ...parsed,
      duty_exams: Array.isArray(parsed.duty_exams) ? parsed.duty_exams.map((row) => normalizePortfolioRow('duty_exams', row)) : [],
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error)
    return { duty_exams: [] }
  }
}

function normalizePortfolioRow(table, row) {
  if (table !== 'duty_exams') return row

  return {
    date: row.date,
    exam_name: row.exam_name,
    college_name: row.college_name,
    role: row.role === 'invigilator' ? 'Invigilator' : row.role,
    payment_status: row.payment_status || 'pending',
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function writePortfolioStore(store) {
  await fs.mkdir(path.dirname(portfolioStorePath), { recursive: true })
  await fs.writeFile(portfolioStorePath, JSON.stringify(store, null, 2))
}

async function sendLeadEmail(lead) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || smtpUser
  const smtpTo = process.env.SMTP_TO

  const missing = [
    ['SMTP_HOST', smtpHost],
    ['SMTP_PORT', process.env.SMTP_PORT || '587'],
    ['SMTP_FROM', smtpFrom],
    ['SMTP_TO', smtpTo],
  ].filter(([, value]) => !value).map(([name]) => name)

  if (missing.length) {
    console.log('[demo email - missing vars]', { missing, lead })
    return { demo: true, channel: 'email', missing }
  }

  const text = buildLeadText(lead)
  const html = buildLeadHtml(lead)
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  })

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: smtpTo,
      subject: buildLeadSubject(lead),
      text,
      html,
      replyTo: lead.email,
    })

    console.log('[email sent]', { to: smtpTo, messageId: info.messageId, leadName: lead.name })
    return {
      channel: 'email',
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('[email error]', {
      error: error.message,
      code: error.code,
      to: smtpTo,
      host: smtpHost,
      port: smtpPort,
      user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'none',
    })
    throw error
  }
}

function buildLeadSubject(lead) {
  return `${lead.type === 'chat_lead' ? 'New chatbot lead' : 'New contact lead'} from ${lead.name}`
}

function buildLeadText(lead) {
  const lines = [
    `New ${lead.type} received`,
    `Name: ${lead.name}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.domain ? `Domain: ${lead.domain}` : null,
    lead.service ? `Service: ${lead.service}` : null,
    `Idea: ${lead.idea}`,
    lead.message ? `Message: ${lead.message}` : null,
    lead.messages?.length
      ? `Conversation:\n${lead.messages.map((entry) => `- ${entry.role}: ${entry.text}`).join('\n')}`
      : null,
  ].filter(Boolean)

  return lines.join('\n')
}

function buildLeadHtml(lead) {
  const rows = [
    ['Type', lead.type],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Domain', lead.domain],
    ['Service', lead.service],
    ['Idea', lead.idea],
    ['Message', lead.message],
  ].filter(([, value]) => value)

  const conversation = lead.messages?.length
    ? `<h3 style="margin:24px 0 8px;">Conversation</h3><ul style="padding-left:18px;">${lead.messages
      .map((entry) => `<li><strong>${escapeHtml(entry.role)}:</strong> ${escapeHtml(entry.text)}</li>`)
      .join('')}</ul>`
    : ''

  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin:0 0 16px;">${escapeHtml(buildLeadSubject(lead))}</h2>
      <table style="border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
                <td style="padding:6px 0;">${escapeHtml(String(value))}</td>
              </tr>`,
          )
          .join('')}
      </table>
      ${conversation}
    </div>
  `
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

app.listen(port, () => {
  console.log(`Lead notification bridge listening on ${port}`)
})
