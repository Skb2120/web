import { useEffect, useState } from 'react'
import { listRows } from '../../lib/portfolioApi'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    listRows('messages').then(setMessages)
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-semibold text-white">Messages</h2>
      <div className="mt-6 grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="glass-panel rounded-lg p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{message.name}</h3>
                <p className="text-sm text-cyan-100/62">{message.email}</p>
              </div>
              <span className="rounded-lg border border-emerald-300/25 px-3 py-1 text-xs text-emerald-100">{message.domain}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-cyan-100">{message.idea}</p>
            <p className="mt-2 text-sm leading-7 text-cyan-50/72">{message.message}</p>
            <p className="mt-4 text-xs text-cyan-100/45">{new Date(message.created_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
