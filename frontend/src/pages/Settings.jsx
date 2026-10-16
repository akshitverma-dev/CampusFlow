import { CheckCircle2, ExternalLink, Mail, RefreshCw, ShieldCheck, Unlink, FileText, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { emailApi, gmailApi } from '../services/api'

export default function Settings({ user }) {
  const [body, setBody] = useState('')
  const [sender, setSender] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [gmailInfo, setGmailInfo] = useState({
    connected: false,
    oauth_configured: true
  })

  const loadStatus = () => {
    gmailApi.status()
      .then(({ data }) => setGmailInfo(data))
      .catch(() => setGmailInfo({ connected: false, oauth_configured: false }))
  }

  useEffect(() => {
    loadStatus()
    // Check if redirected back from Google OAuth callback with status
    const params = new URLSearchParams(window.location.search)
    if (params.get('gmail') === 'connected') {
      setStatus('Successfully connected your Google account! You can now sync your real emails.')
    } else if (params.get('gmail') === 'error') {
      setStatus('Failed to connect Gmail account. Please verify your Google Cloud OAuth credentials.')
    }
  }, [])

  const connectGmail = async () => {
    setStatus('')
    setBusy(true)
    try {
      const { data } = await gmailApi.authorize()
      window.location.href = data.authorization_url
    } catch (error) {
      setStatus(
        error.response?.data?.detail || 
        'Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are not configured on the backend server.'
      )
    } finally {
      setBusy(false)
    }
  }

  const disconnectGmail = async () => {
    setBusy(true)
    setStatus('')
    try {
      await gmailApi.disconnect()
      setStatus('Google account disconnected.')
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
      setStatus(data.message || `Synced ${data.processed} real emails; ${taskCount} task${taskCount === 1 ? '' : 's'} created.`)
      loadStatus()
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Gmail sync failed.')
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
      setStatus(`AI successfully parsed real email: ${taskCount} task${taskCount === 1 ? '' : 's'} added to your calendar.`)
      setBody('')
      setSender('')
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Sync failed. Check your API configuration.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">WORKSPACE SETTINGS</p>
          <h1>Settings.</h1>
          <p className="subtle">Manage Google OAuth connection and email coursework extraction.</p>
        </div>
      </header>

      <section className="settings-grid">
        <div className="settings-main">
          {/* Real Gmail Ingestion Section */}
          <div className="setting-section">
            <div className="setting-heading">
              <div className="setting-icon">
                <Mail size={18} />
              </div>
              <div>
                <h2>Real Gmail Inbox Integration</h2>
                <p>Connect your Google account with read-only access to scan actual coursework emails from professors.</p>
              </div>
            </div>

            {/* Connection Status Card */}
            <div className={`my-4 p-4 rounded-xl border ${
              gmailInfo.connected 
                ? 'border-emerald-500/30 bg-emerald-950/20' 
                : 'border-white/10 bg-white/5'
            } space-y-2`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    gmailInfo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`} />
                  <span className={`font-semibold text-sm ${
                    gmailInfo.connected ? 'text-emerald-300' : 'text-gray-200'
                  }`}>
                    {gmailInfo.connected ? 'Google Account Connected' : 'Google Account Not Connected'}
                  </span>
                </div>
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                  gmailInfo.connected 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {gmailInfo.connected ? 'OAuth Active' : 'OAuth Required'}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {gmailInfo.connected 
                  ? 'Your Gmail inbox is linked. Clicking sync will fetch real emails from your inbox and parse them with Gemini AI.'
                  : 'CampusFlow requires Google OAuth to read emails directly from your real inbox. Read-only permissions ensure your inbox remains secure.'}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {gmailInfo.connected ? (
                <>
                  <button 
                    className="primary-button" 
                    disabled={busy} 
                    onClick={syncGmail}
                  >
                    <RefreshCw size={16} className={busy ? 'spin' : ''} />
                    {busy ? 'Scanning Real Inbox...' : 'Sync Real Gmail Inbox'}
                  </button>
                  <button 
                    className="secondary-button flex items-center gap-2 text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-2 rounded-lg"
                    disabled={busy}
                    onClick={disconnectGmail}
                  >
                    <Unlink size={14} /> Disconnect Gmail
                  </button>
                </>
              ) : (
                <button 
                  className="primary-button flex items-center gap-2" 
                  disabled={busy} 
                  onClick={connectGmail}
                >
                  <ExternalLink size={16} />
                  {busy ? 'Opening Google...' : 'Connect Google Account (OAuth)'}
                </button>
              )}
            </div>

            {status && (
              <p className={`mt-3 ${
                status.includes('Successfully') || status.includes('real emails') || status.includes('added to your calendar')
                  ? 'success-text' 
                  : 'error-text'
              }`}>
                {status}
              </p>
            )}
          </div>

          {/* Manual Real Email Paste Section */}
          <div className="setting-section manual-section">
            <div className="setting-heading">
              <div className="setting-icon">
                <FileText size={18} />
              </div>
              <div>
                <h2>Manual Email Parser (No OAuth Required)</h2>
                <p>Paste any real professor email, syllabus announcement, or homework assignment to extract tasks immediately.</p>
              </div>
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
                  placeholder="Paste the actual email from your professor here..." 
                />
              </label>
              <button className="primary-button" disabled={busy} type="submit">
                <RefreshCw size={16} className={busy ? 'spin' : ''} />
                {busy ? 'Extracting with Gemini AI...' : 'Parse Real Email with AI'}
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
            <p className="eyebrow">GOOGLE OAUTH SETUP</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              To read actual Gmail inboxes, Google requires you to configure <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> on your server.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
