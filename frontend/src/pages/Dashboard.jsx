import { ArrowUpRight, Check, Clock3, ListTodo, Sparkles, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { taskApi, gmailApi } from '../services/api'

const formatDate = (value) => 
  value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) : 'No deadline'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('')

  const loadTasks = () => {
    taskApi.list()
      .then(({ data }) => setTasks(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleScanEmails = async () => {
    setScanning(true)
    setScanMessage('')
    try {
      const { data } = await gmailApi.sync()
      const createdCount = data.created_tasks?.length || 0
      setScanMessage(data.message || `Scanned ${data.processed} emails: created ${createdCount} new task${createdCount === 1 ? '' : 's'}!`)
      loadTasks()
    } catch (err) {
      setScanMessage(err.response?.data?.detail || 'Could not scan emails.')
    } finally {
      setScanning(false)
    }
  }

  const pending = tasks.filter((task) => task.status !== 'completed')
  const completed = tasks.length - pending.length
  const dueSoon = pending.filter((task) => task.urgency === 'high' || task.urgency === 'critical')
  const bars = [36, 50, 42, 68, 57, 76, 63, 88, 72, 94]

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">ACADEMIC WORKSPACE</p>
          <h1>Dashboard</h1>
          <p className="subtle">A quick read on your semester, workload, and deadlines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleScanEmails} 
            disabled={scanning}
            className="primary-button small-button flex items-center gap-2"
            title="Scan coursework emails directly (Zero OAuth required)"
          >
            <Sparkles size={15} className={scanning ? 'animate-spin text-emerald-300' : 'text-emerald-400'} />
            <span>{scanning ? 'Scanning...' : 'Scan Academic Emails'}</span>
          </button>
          <Link className="icon-link" to="/tasks">
            View all tasks <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      {scanMessage && (
        <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between ${
          scanMessage.includes('created') || scanMessage.includes('Successfully') || scanMessage.includes('Scanned')
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-red-950/40 border-red-500/30 text-red-300'
        }`}>
          <span>{scanMessage}</span>
          <button onClick={() => setScanMessage('')} className="text-xs opacity-70 hover:opacity-100 ml-4">✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <section className="metric-grid">
        <div className="metric-card">
          <span>OPEN TASKS</span>
          <strong>{pending.length}</strong>
          <small>{pending.length ? 'Awaiting completion' : 'All caught up'}</small>
        </div>
        <div className="metric-card">
          <span>COMPLETED</span>
          <strong>{completed}</strong>
          <small>Keep the rhythm going</small>
        </div>
        <div className="metric-card">
          <span>HIGH PRIORITY</span>
          <strong>{dueSoon.length}</strong>
          <small>{dueSoon.length ? 'Needs attention today' : 'Nothing urgent'}</small>
        </div>
        <div className="metric-card accent">
          <span>WEEKLY PROGRESS</span>
          <strong>{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%</strong>
          <small>{completed} of {tasks.length} tasks complete</small>
        </div>
      </section>

      {/* Charts & Progress */}
      <section className="chart-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Task activity</h2>
              <p>Work completed over the semester timeline</p>
            </div>
            <Link to="/tasks">View all</Link>
          </div>
          <div className="bar-chart">
            {bars.map((height, index) => (
              <div className="bar-column" key={index}>
                <div className="bar" style={{ height: `${height}%` }} />
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Completion rate</h2>
              <p>Your current semester momentum</p>
            </div>
            <span className="panel-value">
              {tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <strong>{completed}</strong>
              <span>done</span>
            </div>
            <div className="legend">
              <span><i className="legend-dot lime" />Completed</span>
              <span><i className="legend-dot muted" />Remaining</span>
              <Link to="/calendar">Open calendar <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Tasks */}
      <section className="dashboard-panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent tasks</h2>
            <p>Your latest academic actions extracted from coursework emails</p>
          </div>
          <Link to="/tasks">Manage tasks</Link>
        </div>
        {loading ? (
          <div className="empty-state">Loading your task activity...</div>
        ) : (
          <div className="recent-table">
            <div className="table-row table-head">
              <span>Task</span>
              <span>Course</span>
              <span>Due date</span>
              <span>Status</span>
            </div>
            {tasks.slice(0, 5).map((task) => (
              <div className="table-row" key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.course_code || 'General'}</span>
                <span>{formatDate(task.due_date)}</span>
                <span className={`status-pill ${task.status === 'completed' ? 'done' : ''}`}>
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
            {!tasks.length && (
              <div className="empty-state py-8 text-center">
                <p className="text-gray-400 mb-3">No tasks yet.</p>
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
      </section>
    </div>
  )
}
