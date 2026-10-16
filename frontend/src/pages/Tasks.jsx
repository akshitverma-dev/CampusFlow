import { Check, Filter, Plus, Trash2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { taskApi, gmailApi } from '../services/api'

const formatDate = (value) => 
  value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) : 'No date'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [course, setCourse] = useState('all')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    taskApi.list()
      .then(({ data }) => setTasks(data))
      .catch(() => setError('Could not load tasks.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleScanEmails = async () => {
    setScanning(true)
    setMessage('')
    setError('')
    try {
      const statusRes = await gmailApi.status()
      if (!statusRes.data.connected) {
        try {
          const authRes = await gmailApi.authorize()
          window.location.href = authRes.data.authorization_url
          return
        } catch (authErr) {
          setError(
            authErr.response?.data?.detail || 
            'Gmail is not connected. Please configure Google OAuth in Settings to connect your real inbox.'
          )
          setScanning(false)
          return
        }
      }
      const { data } = await gmailApi.sync()
      const count = data.created_tasks?.length || 0
      setMessage(data.message || `Scanned ${data.processed} real emails: created ${count} new task${count === 1 ? '' : 's'}!`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Email scan failed.')
    } finally {
      setScanning(false)
    }
  }

  const toggle = async (task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed'
    setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, status: next } : item)))
    try {
      await taskApi.update(task.id, { status: next })
    } catch {
      load()
    }
  }

  const remove = async (id) => {
    await taskApi.remove(id)
    setTasks((items) => items.filter((task) => task.id !== id))
  }

  const courses = ['all', ...new Set(tasks.map((task) => task.course_code).filter(Boolean))]
  const visible = tasks.filter((task) => course === 'all' || task.course_code === course)

  return (
    <div className="page">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">TASKS / {tasks.length} TOTAL</p>
          <h1>Your focus list.</h1>
          <p className="subtle">Coursework, homework, and exams automatically extracted from your emails.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="secondary-button small-button flex items-center gap-2 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            disabled={scanning}
            onClick={handleScanEmails}
            title="Scan coursework emails directly (Zero OAuth required)"
          >
            <Sparkles size={15} className={scanning ? 'animate-spin text-emerald-300' : 'text-emerald-400'} />
            {scanning ? 'Scanning...' : 'Scan Academic Emails'}
          </button>
        </div>
      </header>

      {message && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-sm flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs opacity-70 hover:opacity-100 ml-4">✕</button>
        </div>
      )}
      {error && <p className="error-text mb-4">{error}</p>}

      <div className="toolbar">
        <div className="filter-label">
          <Filter size={15} /> FILTER BY COURSE
        </div>
        <select value={course} onChange={(event) => setCourse(event.target.value)}>
          {courses.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? 'All courses' : item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : (
        <div className="task-list">
          {visible.map((task) => (
            <div className={`task-card ${task.status === 'completed' ? 'is-complete' : ''}`} key={task.id}>
              <button
                className="check-button"
                onClick={() => toggle(task)}
                aria-label={`Mark ${task.title} ${task.status === 'completed' ? 'pending' : 'complete'}`}
              >
                {task.status === 'completed' && <Check size={15} />}
              </button>
              <div className="task-card-content">
                <strong>{task.title}</strong>
                <p>{task.description || 'No additional notes.'}</p>
                <div className="task-meta">
                  <span>{task.course_code || 'General'}</span>
                  <span>{formatDate(task.due_date)}</span>
                </div>
              </div>
              <span className={`urgency ${task.urgency}`}>{task.urgency}</span>
              <button 
                className="delete-button" 
                onClick={() => remove(task.id)} 
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {!visible.length && (
            <div className="empty-state py-8 text-center">
              <p className="text-gray-400 mb-3">No tasks match this filter.</p>
              <button 
                onClick={handleScanEmails} 
                disabled={scanning}
                className="secondary-button text-xs py-2 px-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Sparkles size={14} /> Scan emails now (Zero OAuth required)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
