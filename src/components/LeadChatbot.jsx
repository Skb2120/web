import { Bot, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createChatLead } from '../lib/portfolioApi'
import IconButton from './ui/IconButton'

const services = ['IoT', 'Embedded Systems', 'PCB Design', 'Web Development']

function getInitialState() {
  const saved = localStorage.getItem('debus-chat')
  if (saved) return JSON.parse(saved)

  return {
    open: false,
    step: 'name',
    name: '',
    phone: '',
    service: '',
    idea: '',
    messages: [{ role: 'bot', text: 'Hi, I am D.E.B.U.S Bot. What is your name?' }],
    complete: false,
  }
}

export default function LeadChatbot() {
  const [chat, setChat] = useState(getInitialState)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('debus-chat', JSON.stringify(chat))
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  function appendBot(text, extra = {}) {
    setTyping(true)
    setTimeout(() => {
      setChat((current) => ({ ...current, ...extra, messages: [...current.messages, { role: 'bot', text }] }))
      setTyping(false)
    }, 520)
  }

  async function completeLead(nextChat) {
    const finalChat = {
      ...nextChat,
      complete: true,
      messages: [...nextChat.messages, { role: 'bot', text: 'Thank you! I will contact you soon.' }],
    }
    setChat(finalChat)

    try {
      await createChatLead(finalChat)
    } catch (error) {
      console.error(error)
    }
  }

  function handleService(service) {
    const nextChat = {
      ...chat,
      service,
      step: 'phone',
      messages: [...chat.messages, { role: 'user', text: service }],
    }
    setChat(nextChat)
    appendBot('Great choice. What phone number should I use to reach you?', { step: 'phone' })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const value = input.trim()
    if (!value || chat.complete) return

    const nextMessages = [...chat.messages, { role: 'user', text: value }]
    setInput('')

    if (chat.step === 'name') {
      setChat((current) => ({ ...current, name: value, step: 'assist', messages: nextMessages }))
      appendBot('How can I assist you? Choose the closest service area.', { step: 'assist' })
      return
    }

    if (chat.step === 'phone') {
      setChat((current) => ({ ...current, phone: value, step: 'idea', messages: nextMessages }))
      appendBot('Tell me a little about your project idea.', { step: 'idea' })
      return
    }

    if (chat.step === 'idea') {
      completeLead({ ...chat, idea: value, messages: nextMessages })
    }
  }

  function resetChat() {
    const clean = {
      open: true,
      step: 'name',
      name: '',
      phone: '',
      service: '',
      idea: '',
      messages: [{ role: 'bot', text: 'Hi, I am D.E.B.U.S Bot. What is your name?' }],
      complete: false,
    }
    setChat(clean)
    localStorage.setItem('debus-chat', JSON.stringify(clean))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {!chat.open && (
        <button className="flex items-center gap-3 rounded-lg border border-cyan-300/35 bg-slate-950/90 px-4 py-3 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,.28)] backdrop-blur-xl hover:border-emerald-300/60" onClick={() => setChat((current) => ({ ...current, open: true }))}>
          <Bot size={20} />
          D.E.B.U.S Bot
        </button>
      )}

      {chat.open && (
        <section className="glass-panel fixed inset-x-3 bottom-3 flex h-[78vh] flex-col overflow-hidden rounded-lg md:inset-auto md:bottom-6 md:right-6 md:h-[560px] md:w-[390px]">
          <header className="flex items-center justify-between border-b border-cyan-300/15 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <Bot size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-white">D.E.B.U.S Bot</h3>
                <p className="text-xs text-emerald-200">Lead assistant online</p>
              </div>
            </div>
            <IconButton icon={X} label="Close chatbot" onClick={() => setChat((current) => ({ ...current, open: false }))} />
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {chat.messages.map((message, index) => (
              <div key={`${message.text}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'bg-cyan-300 text-slate-950' : 'border border-cyan-300/18 bg-slate-900/90 text-cyan-50'}`}>
                  {message.text}
                </p>
              </div>
            ))}
            {typing && <p className="text-xs text-cyan-200">D.E.B.U.S Bot is typing...</p>}
            {chat.step === 'assist' && !typing && (
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <button key={service} className="rounded-lg border border-emerald-300/25 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-300/10" onClick={() => handleService(service)}>
                    {service}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="border-t border-cyan-300/15 p-3" onSubmit={handleSubmit}>
            {chat.complete ? (
              <button type="button" className="w-full rounded-lg border border-cyan-300/25 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10" onClick={resetChat}>
                Start New Lead
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={chat.step === 'assist'}
                  placeholder={chat.step === 'assist' ? 'Choose a service above' : 'Type here...'}
                  className="min-w-0 flex-1 rounded-lg border border-cyan-300/18 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-emerald-300/70"
                />
                <IconButton icon={Send} label="Send message" />
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  )
}
