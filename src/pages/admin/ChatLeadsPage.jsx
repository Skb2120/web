import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import IconButton from '../../components/ui/IconButton'
import { listRows } from '../../lib/portfolioApi'

export default function ChatLeadsPage() {
  const [leads, setLeads] = useState([])
  const [activeLead, setActiveLead] = useState(null)

  useEffect(() => {
    listRows('chat_leads').then(setLeads)
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-semibold text-white">Chat Leads</h2>
      <div className="mt-6 hidden overflow-hidden rounded-lg border border-cyan-300/12 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-900 text-cyan-100/72">
            <tr>
              {['Name', 'Phone', 'Service', 'Idea', 'Date', 'View'].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-cyan-300/10">
                <td className="px-4 py-3 text-white">{lead.name}</td>
                <td className="px-4 py-3 text-cyan-50/76">{lead.phone}</td>
                <td className="px-4 py-3 text-cyan-50/76">{lead.service}</td>
                <td className="max-w-sm px-4 py-3 text-cyan-50/76">{lead.idea}</td>
                <td className="px-4 py-3 text-cyan-50/60">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><IconButton icon={Eye} label="View conversation" onClick={() => setActiveLead(lead)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {leads.map((lead) => (
          <article key={lead.id} className="glass-panel rounded-lg p-4">
            <h3 className="font-semibold text-white">{lead.name}</h3>
            <p className="mt-1 text-sm text-cyan-100/68">{lead.phone} | {lead.service}</p>
            <p className="mt-3 text-sm text-cyan-50/76">{lead.idea}</p>
            <div className="mt-4"><IconButton icon={Eye} label="View conversation" onClick={() => setActiveLead(lead)} /></div>
          </article>
        ))}
      </div>

      {activeLead && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <section className="glass-panel max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{activeLead.name}</h3>
                <p className="text-sm text-cyan-100/62">{activeLead.phone} | {activeLead.service}</p>
              </div>
              <button className="rounded-lg border border-cyan-300/25 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-300/10" onClick={() => setActiveLead(null)}>Close</button>
            </div>
            <div className="mt-5 space-y-3">
              {(activeLead.messages ?? []).map((message, index) => (
                <p key={index} className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto max-w-[80%] bg-cyan-300 text-slate-950' : 'max-w-[80%] border border-cyan-300/20 bg-slate-900 text-cyan-50'}`}>
                  {message.text}
                </p>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
