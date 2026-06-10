import { supabase, hasSupabase } from './supabase'
import {
  fallbackChatLeads,
  fallbackDutyExams,
  fallbackMessages,
  fallbackProjects,
  fallbackServices,
  fallbackSkills,
} from '../data/fallbackData'

const fallbackByTable = {
  skills: fallbackSkills,
  projects: fallbackProjects,
  services: fallbackServices,
  messages: fallbackMessages,
  chat_leads: fallbackChatLeads,
  duty_exams: fallbackDutyExams,
  lead_conversions: [],
}

const backendURL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')
const backendTableEndpoints = {
  skills: '/api/portfolio/skills',
  projects: '/api/portfolio/projects',
  services: '/api/portfolio/services',
  messages: '/api/portfolio/messages',
  chat_leads: '/api/portfolio/chat_leads',
  duty_exams: '/api/portfolio/duty_exams',
  lead_conversions: '/api/portfolio/lead_conversions',
}
const fallbackWhenEmptyTables = new Set(['skills', 'projects', 'services'])
export const portfolioDataUpdatedEvent = 'portfolio-data-updated'

export async function listRows(table) {
  const backendRows = await listBackendRows(table)
  if (backendRows?.length) return backendRows
  if (!hasSupabase) return fallbackByTable[table] ?? []

  try {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) throw error
    if ((!data || data.length === 0) && fallbackWhenEmptyTables.has(table)) {
      return fallbackByTable[table] ?? []
    }
    return data ?? []
  } catch (error) {
    console.warn(`Supabase read failed for ${table}; trying backend/fallback data.`, error)
    return await listBackendRows(table) ?? fallbackByTable[table] ?? []
  }
}

export async function upsertRow(table, payload) {
  const backendRow = await upsertBackendRow(table, payload)
  if (backendRow) {
    notifyPortfolioDataUpdated(table)
    return backendRow
  }
  if (!hasSupabase) {
    const row = { ...payload, id: payload.id ?? crypto.randomUUID(), created_at: new Date().toISOString() }
    notifyPortfolioDataUpdated(table)
    return row
  }

  const { data, error } = await supabase.from(table).upsert(payload).select().single()
  if (error) throw normalizeSupabaseError(error)
  notifyPortfolioDataUpdated(table)
  return data
}

export async function deleteRow(table, id) {
  const deleted = await deleteBackendRow(table, id)
  if (deleted) {
    notifyPortfolioDataUpdated(table)
    return true
  }
  if (!hasSupabase) {
    notifyPortfolioDataUpdated(table)
    return true
  }

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw normalizeSupabaseError(error)
  notifyPortfolioDataUpdated(table)
  return true
}

export async function createContactMessage(payload) {
  const cleanPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    domain: payload.domain,
    idea: payload.idea.trim(),
    message: payload.message.trim(),
    status: 'new',
  }

  if (backendURL) {
    const notification = await notifyLeadNotification({ type: 'contact', ...cleanPayload })
    return {
      ...cleanPayload,
      id: notification.id ?? crypto.randomUUID(),
      created_at: notification.created_at ?? new Date().toISOString(),
      notification,
    }
  }

  const row = await insertPublicRowBestEffort('messages', cleanPayload)
  return { ...row, notification: null }
}

export async function createChatLead(payload) {
  const rowPayload = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    service: payload.service,
    idea: payload.idea.trim(),
    messages: payload.messages,
    status: 'new',
  }

  if (backendURL) {
    const notification = await notifyLeadNotification({ type: 'chat_lead', ...rowPayload })
    return {
      ...rowPayload,
      id: notification.id ?? crypto.randomUUID(),
      created_at: notification.created_at ?? new Date().toISOString(),
      notification,
    }
  }

  const row = await insertPublicRowBestEffort('chat_leads', rowPayload)
  return { ...row, notification: null }
}

export async function uploadProjectImage(file) {
  if (!file) return ''
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (!hasSupabase) return await fileToDataUrl(file)

  const extension = file.name.split('.').pop()?.toLowerCase() || 'image'
  const filePath = `projects/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('portfolio-media').upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath)
  if (!data.publicUrl) throw new Error('Supabase did not return a public image URL.')
  return data.publicUrl
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

async function notifyLeadNotification(payload) {
  if (!backendURL) throw new Error('Backend URL is missing. Set VITE_BACKEND_URL to your notification server.')

  const response = await fetch(`${backendURL}/api/notifications/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = 'Lead email notification failed.'
    try {
      const body = await response.json()
      message = body.error || message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return response.json()
}

async function listBackendRows(table) {
  const endpoint = backendTableEndpoints[table]
  if (!backendURL || !endpoint) return null

  try {
    const response = await fetch(`${backendURL}${endpoint}`)
    if (!response.ok) throw new Error(response.statusText || 'Backend fetch failed')
    return await response.json()
  } catch (error) {
    console.warn(`Backend read failed for ${table}.`, error)
    return null
  }
}

async function upsertBackendRow(table, payload) {
  const endpoint = backendTableEndpoints[table]
  if (!backendURL || !endpoint) return null

  try {
    const response = await fetch(`${backendURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(response.statusText || 'Backend save failed')
    return await response.json()
  } catch (error) {
    console.warn(`Backend save failed for ${table}.`, error)
    return null
  }
}

async function deleteBackendRow(table, id) {
  const endpoint = backendTableEndpoints[table]
  if (!backendURL || !endpoint) return false

  try {
    const response = await fetch(`${backendURL}${endpoint}/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(response.statusText || 'Backend delete failed')
    return true
  } catch (error) {
    console.warn(`Backend delete failed for ${table}.`, error)
    return false
  }
}

async function insertPublicRow(table, payload) {
  if (!hasSupabase) return { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }

  const { error } = await supabase.from(table).insert(payload)
  if (error) throw normalizeSupabaseError(error)
  return { ...payload }
}

async function insertPublicRowBestEffort(table, payload) {
  try {
    return await insertPublicRow(table, payload)
  } catch (error) {
    console.warn(`Supabase insert failed for ${table}; email notification was already sent.`, error)
    return {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      storage_warning: normalizeSupabaseError(error).message,
    }
  }
}

function normalizeSupabaseError(error) {
  if (error?.code === 'PGRST205') {
    return new Error('Supabase table setup is missing. Run supabase/schema.sql in the Supabase SQL editor.')
  }

  if (error?.code === '42501') {
    return new Error('Supabase RLS blocked this action. Check your insert policies for the public form tables.')
  }

  return error instanceof Error ? error : new Error(error?.message || 'Supabase request failed.')
}

function notifyPortfolioDataUpdated(table) {
  window.dispatchEvent(new CustomEvent(portfolioDataUpdatedEvent, { detail: { table } }))
}
