import { Send } from 'lucide-react'
import { useState } from 'react'
import { createContactMessage } from '../lib/portfolioApi'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  domain: 'SELECT',
  idea: '',
  message: '',
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    try {
      await createContactMessage(form)
      setStatus('sent')
      setErrorMessage('')
      setForm(initialForm)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setErrorMessage(error.message || 'Unable to send right now. Check Supabase/backend settings.')
    }
  }

  return (
    <form className="contact-form-panel glass-panel w-full max-w-lg justify-self-end rounded-lg p-4 md:p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-cyan-100/78">
          Name
          <input required name="name" value={form.name} onChange={updateField} className="contact-field rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70" />
        </label>
        <label className="grid gap-2 text-sm text-cyan-100/78">
          Email
          <input required type="email" name="email" value={form.email} onChange={updateField} className="contact-field rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70" />
        </label>
        <label className="grid gap-2 text-sm text-cyan-100/78">
          Phone number
          <input required type="tel" name="phone" value={form.phone} onChange={updateField} className="contact-field rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70" />
        </label>
        <label className="grid gap-2 text-sm text-cyan-100/78">
          Domain
          <select name="domain" value={form.domain} onChange={updateField} className="contact-field rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70">
            <option>IoT</option>
            <option>Embedded Systems</option>
            <option>PCB Design</option>
            <option>Web Development</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-cyan-100/78">
          Project idea
          <input required name="idea" value={form.idea} onChange={updateField} className="contact-field rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70" />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm text-cyan-100/78">
        Message
        <textarea required name="message" rows="4" value={form.message} onChange={updateField} className="contact-field resize-none rounded-lg border border-cyan-300/18 px-3 py-2.5 text-white outline-none focus:border-emerald-300/70" />
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button disabled={status === 'sending'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300">
          <Send size={18} />
          {status === 'sending' ? 'Sending...' : 'Send Lead'}
        </button>
        {status === 'sent' && <p className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">Lead Sent. I will contact you soon.</p>}
        {status === 'error' && <p className="rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{errorMessage || 'Unable to send right now. Check Supabase/backend settings.'}</p>}
      </div>
    </form>
  )
}
