import React, { useEffect, useState } from 'react'
import { 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Unlink, 
  FileText,
  User,
  Info,
  AlertCircle
} from 'lucide-react'
import { emailApi, gmailApi } from '../services/api'

const SAMPLE_EMAIL = {
  sender: 'Prof. David Vance <vance@cs.university.edu>',
  body: `Dear CS301 Students,

Please make sure your Project 2 GitHub repositories are pushed before this Friday at 11:59 PM. Late submissions will receive a 10% penalty per day.

Also, our midterm Lab Exam will be held next Tuesday from 2:00 PM to 4:00 PM in Computer Lab Hall B. Attendance is mandatory.

Best regards,
Prof. Vance`
}

export default function Settings({ user }) {
  const [body, setBody] = useState('')
  const [sender, setSender] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [gmailInfo, setGmailInfo] = useState({
    connected: true,
    source: 'simulated',
    has_personal: false,
    description: 'Instant AI Academic Scanner Active'
  })

  const loadStatus = () => {
    gmailApi.status()
      .then(({ data }) => setGmailInfo(data))
      .catch(() => setGmailInfo({
        connected: true,
        source: 'simulated',
        has_personal: false,
        description: 'Instant AI Academic Scanner Active'
      }))
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const connectGmail = async () => {
    setStatus('')
    try {
      const { data } = await gmailApi.authorize()
      window.location.href = data.authorization_url
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Google OAuth is not configured on the backend.')
    }
  }

  const disconnectGmail = async () => {
    setBusy(true)
    setStatus('')
    try {
      await gmailApi.disconnect()
      setStatus('Personal Gmail disconnected. Switched to shared/instant academic scanner.')
      loadStatus()
    } catch {
      setStatus('Could not disconnect Gmail.')
    } finally {
      setBusy(false)
    }
  }

  const syncGmail = async () => {
    setBusy(true)
    setStatus('')
    try {
      const { data } = await gmailApi.sync()
      const taskCount = data.created_tasks?.length || 0
      setStatus(
        data.message || `${data.processed} emails scanned; ${taskCount} new task${taskCount === 1 ? '' : 's'} created.`
      )
      loadStatus()
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Email sync failed.')
    } finally {
      setBusy(false)
    }
  }

  const syncManual = async (event) => {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    try {
      const { data } = await emailApi.sync([{ raw_body: body, sender }])
      const taskCount = data.created_tasks?.length || 0
      setStatus(`Success! Extracted ${taskCount} task${taskCount === 1 ? '' : 's'} from this email. Check your Tasks and Calendar!`)
      setBody('')
      setSender('')
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Sync failed. Check your API configuration.')
    } finally {
      setBusy(false)
    }
  }

  const fillSampleEmail = () => {
    setSender(SAMPLE_EMAIL.sender)
    setBody(SAMPLE_EMAIL.body)
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="pb-2 border-b dark:border-white/5 border-slate-300">
        <h1 className="text-xl md:text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight">
          Settings & Email Ingestion
        </h1>
        <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
          Configure automated email synchronization, manual syllabus parsing, and account preferences.
        </p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-sm ${
          status.includes('created') || status.includes('processed') || status.includes('Success')
            ? 'dark:bg-[#bbf246]/10 bg-lime-500/15 border-lime-600/40 text-lime-900 dark:text-[#a4dc32]'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2.5">
            {status.includes('created') || status.includes('Success') ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="font-semibold">{status}</span>
          </div>
          <button onClick={() => setStatus('')} className="opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Scanner Card */}
          <div className="p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl dark:bg-[#bbf246]/20 bg-[#aee637]/30 text-emerald-800 dark:text-[#a4dc32] border border-[#8fc91c]/30 dark:border-transparent flex items-center justify-center font-bold">
                <Mail size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                  Academic Email Ingestion
                </h2>
                <p className="text-xs dark:text-slate-400 text-slate-600">
                  CampusFlow reads course announcements and automatically converts deadlines into tasks.
                </p>
              </div>
            </div>

            {/* Ingestion Mode Banner */}
            <div className="p-4 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-transparent border-slate-300 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8fc91c] dark:bg-[#bbf246] animate-pulse" />
                  <span className="font-bold text-xs dark:text-[#bbf246] text-emerald-900">
                    {gmailInfo.has_personal
                      ? 'Personal Gmail Account Connected'
                      : (gmailInfo.is_shared
                          ? 'CampusFlow Shared Academic Mailbox Active'
                          : 'Instant AI Academic Scanner Active')}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-[#bbf246]/10 bg-lime-500/15 text-emerald-900 dark:text-[#a4dc32] border border-[#8fc91c]/30 font-bold">
                  {gmailInfo.has_personal ? 'Personal OAuth' : 'Zero OAuth Required'}
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                {gmailInfo.description || 'You can scan coursework emails directly without individual Google OAuth setup.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                disabled={busy}
                onClick={syncGmail}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-bold text-xs shadow-md shadow-[#8fc91c]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
                <span>{busy ? 'Scanning...' : 'Scan Academic Emails'}</span>
              </button>

              {gmailInfo.has_personal ? (
                <button
                  disabled={busy}
                  onClick={disconnectGmail}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Unlink size={14} />
                  <span>Disconnect Personal Gmail</span>
                </button>
              ) : (
                <button
                  onClick={connectGmail}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl dark:bg-[#232832] bg-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-300 text-slate-800 border dark:border-transparent border-slate-300 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink size={14} />
                  <span>Link Personal Gmail (Optional)</span>
                </button>
              )}
            </div>
          </div>

          {/* Manual Ingestion Tester */}
          <div className="p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                    Manual Single Email Scan
                  </h2>
                  <p className="text-xs dark:text-slate-400 text-slate-600">
                    Paste any course syllabus, announcement, or homework update to parse immediately.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fillSampleEmail}
                className="text-xs font-bold text-emerald-700 dark:text-[#a4dc32] hover:underline cursor-pointer"
              >
                Pre-fill sample email
              </button>
            </div>

            <form onSubmit={syncManual} className="space-y-3.5 pt-1 text-xs">
              <div>
                <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                  Sender (Professor / Dept)
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Prof. Vance <vance@cs.university.edu>"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246]"
                />
              </div>

              <div>
                <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                  Email Body Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the full email text here with assignment due dates, quiz alerts, etc."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-bold text-xs shadow-md shadow-[#8fc91c]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
                <span>{busy ? 'Parsing with Gemini AI...' : 'Parse this email'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Aside / Account Column (1 col) */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-extrabold text-sm flex items-center justify-center shadow-sm">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-emerald-700 dark:text-[#a4dc32] uppercase tracking-wider font-bold">
                  Signed in as
                </div>
                <div className="text-xs font-bold dark:text-white text-slate-900 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t dark:border-white/5 border-slate-300 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="dark:text-slate-400 text-slate-600 font-medium">Plan:</span>
                <span className="font-bold text-emerald-900 dark:text-[#a4dc32] uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-lime-500/15 dark:bg-[#bbf246]/10 border border-[#8fc91c]/30">
                  {user?.tier || 'Free Tier'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="dark:text-slate-400 text-slate-600 font-medium">Daily Scan Limit:</span>
                <span className="font-bold dark:text-slate-200 text-slate-900 font-mono">
                  {user?.daily_limit || 5} emails / day
                </span>
              </div>
            </div>

            <div className="pt-3 border-t dark:border-white/5 border-slate-300 flex items-center gap-2 text-xs dark:text-slate-400 text-slate-600">
              <ShieldCheck size={16} className="text-emerald-700 dark:text-[#bbf246] shrink-0" />
              <span>Read-only permissions & secure token storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
