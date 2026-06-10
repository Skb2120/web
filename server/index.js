import cors from 'cors'
import dns from 'node:dns'
import { resolve4 } from 'node:dns/promises'
import dotenv from 'dotenv'
import express from 'express'
import { randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
dns.setDefaultResultOrder('ipv4first')

const app = express()
const port = process.env.PORT || 4000
const portfolioTables = new Set(['skills', 'projects', 'services', 'lead_conversions', 'duty_exams'])
const frontendOrigins = process.env.FRONTEND_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)
const allowedOrigins = new Set([
  'https://sarathiotdev.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(frontendOrigins ?? []),
])

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked origin: ${origin}`))
  },
}))
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

  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  if (error) return response.status(500).json({ error: error.message })

  response.json(data ?? [])
})

app.post('/api/portfolio/:table', async (request, response) => {
  const table = request.params.table
  if (!portfolioTables.has(table)) return response.status(404).json({ error: 'Unknown table' })

  const id = request.body.id || randomUUID()

  if (request.body.id) {
    const { data, error } = await supabase
      .from(table)
      .update({ ...request.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return response.status(500).json({ error: error.message })
    return response.json(data)
  }

  const { data, error } = await supabase
    .from(table)
    .insert([{ ...request.body, id }])
    .select()
    .single()

  if (error) return response.status(500).json({ error: error.message })
  response.json(data)
})

app.delete('/api/portfolio/:table/:id', async (request, response) => {
  const table = request.params.table
  if (!portfolioTables.has(table)) return response.status(404).json({ error: 'Unknown table' })

  const { error } = await supabase.from(table).delete().eq('id', request.params.id)
  if (error) return response.status(500).json({ error: error.message })

  response.json({ ok: true })
})

async function handleLeadNotification(request, response) {
  const parsed = leadSchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({ error: parsed.error.flatten() })
  }

  const lead = parsed.data
  const table = lead.type === 'chat_lead' ? 'chat_leads' : 'messages'
  const leadRow = { ...lead }
  delete leadRow.type

  const { data: savedLead, error: dbError } = await supabase
    .from(table)
    .insert([leadRow])
    .select('id, created_at')
    .single()
  if (dbError) console.error(`Failed to save ${table}:`, dbError)

  try {
    const email = await sendLeadEmail(lead)
    response.json({
      ok: true,
      dbSaved: !dbError,
      id: savedLead?.id,
      created_at: savedLead?.created_at,
      email,
    })
  } catch (error) {
    response.status(502).json({
      ok: false,
      dbSaved: !dbError,
      id: savedLead?.id,
      created_at: savedLead?.created_at,
      error: error.message || 'Email delivery failed.',
    })
  }
}

app.post('/api/notifications/lead', handleLeadNotification)

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
    ['SMTP_USER', smtpUser],
    ['SMTP_PASS', smtpPass],
    ['SMTP_FROM', smtpFrom],
    ['SMTP_TO', smtpTo],
  ].filter(([, value]) => !value).map(([name]) => name)

  if (missing.length) {
    console.log('[demo email - missing vars]', { missing, lead })
    return { demo: true, channel: 'email', missing }
  }

  const text = buildLeadText(lead)
  const html = buildLeadHtml(lead)
  const smtpAttempts = await buildSmtpAttempts({ smtpHost, smtpPort, smtpSecure })
  let lastError = null

  for (const smtpAttempt of smtpAttempts) {
    const transporter = nodemailer.createTransport({
      host: smtpAttempt.host,
      port: smtpAttempt.port,
      secure: smtpAttempt.secure,
      family: 4,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 45000,
      tls: smtpAttempt.servername ? { servername: smtpAttempt.servername } : undefined,
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

      console.log('[email sent]', { to: smtpTo, messageId: info.messageId, leadName: lead.name, port: smtpAttempt.port })
      return {
        channel: 'email',
        accepted: info.accepted,
        rejected: info.rejected,
        messageId: info.messageId,
        port: smtpAttempt.port,
      }
    } catch (error) {
      lastError = error
      console.error('[email error]', {
        error: error.message,
        code: error.code,
        to: smtpTo,
        host: smtpAttempt.host,
        port: smtpAttempt.port,
        user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'none',
      })
    }
  }

  throw lastError
}

async function buildSmtpAttempts({ smtpHost, smtpPort, smtpSecure }) {
  const configuredAttempt = { host: smtpHost, port: smtpPort, secure: smtpSecure }
  const gmailSslAttempt = { host: smtpHost, port: 465, secure: true }
  const baseAttempts = [
    configuredAttempt,
    ...(smtpHost === 'smtp.gmail.com' && smtpPort !== 465 ? [gmailSslAttempt] : []),
  ]

  if (smtpHost !== 'smtp.gmail.com') return baseAttempts

  try {
    const addresses = await resolve4(smtpHost)
    const ipv4Attempts = addresses.flatMap((address) =>
      baseAttempts.map((attempt) => ({
        ...attempt,
        host: address,
        servername: smtpHost,
      })),
    )

    return [...ipv4Attempts, ...baseAttempts]
  } catch (error) {
    console.error('[smtp dns error]', { host: smtpHost, error: error.message })
    return baseAttempts
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
