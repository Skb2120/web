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
const leadStorePath = path.join(__dirname, '..', '.logs', 'lead-store.json')
const portfolioStorePath = path.join(__dirname, '..', '.logs', 'portfolio-store.json')
const portfolioTables = new Set(['skills', 'projects', 'services', 'lead_conversions', 'duty_exams'])

app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*' }))
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

app.get('/api/messages', async (_request, response) => {
  const store = await readLeadStore()
  response.json(store.messages)
})

app.get('/api/chat-leads', async (_request, response) => {
  const store = await readLeadStore()
  response.json(store.chat_leads)
})

app.get('/api/portfolio/:table', async (request, response) => {
  const table = request.params.table
  if (!isKnownTable(table)) return response.status(404).json({ error: 'Unknown table' })

  const rows = await readTableRows(table)
  response.json(rows)
})

app.post('/api/portfolio/:table', async (request, response) => {
  const table = request.params.table
  if (!isKnownTable(table)) return response.status(404).json({ error: 'Unknown table' })

  const row = await upsertTableRow(table, request.body)
  response.json(row)
})

app.delete('/api/portfolio/:table/:id', async (request, response) => {
  const table = request.params.table
  if (!isKnownTable(table)) return response.status(404).json({ error: 'Unknown table' })

  await deleteTableRow(table, request.params.id)
  response.json({ ok: true })
})

async function handleLeadNotification(request, response) {
  const parsed = leadSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    const stored = await storeLead(parsed.data)
    const result = await sendLeadEmail(parsed.data)
    response.json({ ok: true, stored, result })
  } catch (error) {
    console.error(error)
    response.status(502).json({ error: 'Lead email notification failed' })
  }
}

app.post('/api/notifications/lead', handleLeadNotification)
app.post('/api/whatsapp/lead', handleLeadNotification)

async function readLeadStore() {
  try {
    const raw = await fs.readFile(leadStorePath, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      chat_leads: Array.isArray(parsed.chat_leads) ? parsed.chat_leads : [],
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error)
    return { messages: [], chat_leads: [] }
  }
}

async function writeLeadStore(store) {
  await fs.mkdir(path.dirname(leadStorePath), { recursive: true })
  await fs.writeFile(leadStorePath, JSON.stringify(store, null, 2))
}

async function readPortfolioStore() {
  try {
    const raw = await fs.readFile(portfolioStorePath, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      services: Array.isArray(parsed.services) ? parsed.services : [],
      lead_conversions: Array.isArray(parsed.lead_conversions) ? parsed.lead_conversions : [],
      duty_exams: Array.isArray(parsed.duty_exams) ? parsed.duty_exams : [],
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error)
    return { skills: [], projects: [], services: [], lead_conversions: [], duty_exams: [] }
  }
}

async function writePortfolioStore(store) {
  await fs.mkdir(path.dirname(portfolioStorePath), { recursive: true })
  await fs.writeFile(portfolioStorePath, JSON.stringify(store, null, 2))
}

function isKnownTable(table) {
  return portfolioTables.has(table) || table === 'messages' || table === 'chat_leads'
}

async function readTableRows(table) {
  if (table === 'messages' || table === 'chat_leads') {
    const store = await readLeadStore()
    return store[table]
  }

  const store = await readPortfolioStore()
  return store[table] ?? []
}

async function upsertTableRow(table, payload) {
  const store = table === 'messages' || table === 'chat_leads'
    ? await readLeadStore()
    : await readPortfolioStore()
  const rows = Array.isArray(store[table]) ? store[table] : []
  const now = new Date().toISOString()
  const row = {
    ...payload,
    id: payload.id || randomUUID(),
    created_at: payload.created_at || now,
    updated_at: now,
  }
  store[table] = rows.some((entry) => entry.id === row.id)
    ? rows.map((entry) => (entry.id === row.id ? row : entry))
    : [row, ...rows]

  if (table === 'messages' || table === 'chat_leads') await writeLeadStore(store)
  else await writePortfolioStore(store)

  return row
}

async function deleteTableRow(table, id) {
  const store = table === 'messages' || table === 'chat_leads'
    ? await readLeadStore()
    : await readPortfolioStore()
  store[table] = (store[table] ?? []).filter((entry) => entry.id !== id)

  if (table === 'messages' || table === 'chat_leads') await writeLeadStore(store)
  else await writePortfolioStore(store)
}

async function storeLead(lead) {
  const store = await readLeadStore()
  const created_at = new Date().toISOString()
  const id = randomUUID()

  if (lead.type === 'chat_lead') {
    const row = {
      id,
      name: lead.name,
      phone: lead.phone || '',
      service: lead.service || '',
      idea: lead.idea,
      messages: lead.messages || [],
      status: 'new',
      created_at,
    }
    store.chat_leads = [row, ...store.chat_leads]
    await writeLeadStore(store)
    return { table: 'chat_leads', id }
  }

  const row = {
    id,
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    domain: lead.domain || '',
    idea: lead.idea,
    message: lead.message || '',
    status: 'new',
    created_at,
  }
  store.messages = [row, ...store.messages]
  await writeLeadStore(store)
  return { table: 'messages', id }
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
    console.log('[demo email]', { missing, lead })
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

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: smtpTo,
    subject: buildLeadSubject(lead),
    text,
    html,
    replyTo: lead.email,
  })

  return {
    channel: 'email',
    accepted: info.accepted,
    rejected: info.rejected,
    messageId: info.messageId,
  }
}

function buildLeadSubject(lead) {
  return `[Portfolio] ${lead.type === 'chat_lead' ? 'New chatbot lead' : 'New contact lead'} from ${lead.name}`
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
