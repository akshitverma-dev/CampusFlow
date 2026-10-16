import { CheckCircle2, ExternalLink, Mail, RefreshCw, ShieldCheck, Sparkles, Unlink, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
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
    } catch (error) {
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
      setStatus(data.message || `${data.processed} emails scanned; ${taskCount} new task${taskCount === 1 ? '' : 's'} created.`)
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
      setStatus(`${taskCount} task${taskCount === 1 ? '' : 's'} created from this email.`)
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
    <div className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">WORKSPACE SETTINGS</p>
          <h1>Settings.</h1>
          <p className="subtle">Tune email scanning, AI parsing, and coursework extraction.</p>
        </div>
      </header>

      <section className="settings-grid">
        <div className="settings-main">
          {/* Email Ingestion Section */}
          <div className="setting-section">
            <div className="setting-heading">
              <div className="setting-icon">
                <Mail size={18} />
              </div>
              <div>
                <h2>Email Scanner & Inbox Ingestion</h2>
                <p>Scan emails to automatically extract assignments, quizzes, and deadlines into your calendar.</p>
              </div>
            </div>

            {/* Mode Banner */}
            <div className="my-4 p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-sm text-emerald-300">
                    {gmailInfo.has_personal 
                      ? 'Personal Gmail Account Connected' 
                      : (gmailInfo.is_shared 
                          ? 'CampusFlow Shared Academic Mailbox Active' 
                          : 'Instant AI Academic Scanner Active')}
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {gmailInfo.has_personal ? 'Personal OAuth' : 'Zero OAuth Required'}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {gmailInfo.description || 'New users can scan coursework emails directly without individual Google OAuth configuration.'}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button 
                className="primary-button" 
                disabled={busy} 
                onClick={syncGmail}
              >
                <RefreshCw size={16} className={busy ? 'spin' : ''} />
                {busy ? 'Scanning & Parsing...' : 'Scan Academic Emails'}
              </button>

              {gmailInfo.has_personal ? (
                <button 
                  className="secondary-button flex items-center gap-2 text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-2 rounded-lg"
                  disabled={busy}
                  onClick={disconnectGmail}
                >
                  <Unlink size={14} /> Disconnect Personal Gmail
                </button>
              ) : (
                <button 
                  className="secondary-button flex items-center gap-2 text-xs text-gray-300 hover:text-white border border-white/15 px-3 py-2 rounded-lg"
                  onClick={connectGmail}
                >
                  <ExternalLink size={14} /> Link Personal Gmail (Optional)
                </button>
              )}
            </div>

            {status && (
              <p className={`mt-3 ${status.includes('created') || status.includes('processed') || status.includes('Successfully') ? 'success-text' : 'error-text'}`}>
                {status}
              </p>
            )}
          </div>

          {/* Manual / Direct Email Ingestion */}
          <div className="setting-section manual-section">
            <div className="setting-heading flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="setting-icon">
                  <FileText size={18} />
                </div>
                <div>
                  <h2>Manual or Single Email Scan</h2>
                  <p>Paste any announcement, syllabus update, or email to extract tasks immediately.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={fillSampleEmail}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                Pre-fill sample email
              </button>
            </div>

            <form className="sync-form" onSubmit={syncManual}>
              <label>
                Sender
                <input 
                  required 
                  value={sender} 
                  onChange={(event) => setSender(event.target.value)} 
                  placeholder="professor@university.edu" 
                />
              </label>
              <label>
                Email content
                <textarea 
                  required 
                  rows="6" 
                  value={body} 
                  onChange={(event) => setBody(event.target.value)} 
                  placeholder="Paste the professor's coursework email here..." 
                />
              </label>
              <button className="primary-button" disabled={busy} type="submit">
                <RefreshCw size={16} className={busy ? 'spin' : ''} />
                {busy ? 'Parsing with Gemini...' : 'Parse this email'}
              </button>
            </form>
          </div>
        </div>

        {/* Aside */}
        <aside className="settings-aside">
          <div className="account-card">
            <div className="avatar large">{user.email[0].toUpperCase()}</div>
            <p className="eyebrow">SIGNED IN AS</p>
            <strong>{user.email}</strong>
            <div className="secure-line">
              <ShieldCheck size={15} /> Account protected
            </div>
          </div>

          <div className="setting-note">
            <p className="eyebrow">ZERO-FRICTION SCANNING</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              New users do not need to perform Google OAuth. CampusFlow automatically parses academic emails via the shared campus connection or the instant Gemini AI academic scanner.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
