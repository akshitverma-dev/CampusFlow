import React, { useEffect, useState } from 'react'
import { 
  Check, 
  Filter, 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  Calendar, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react'
import { taskApi, gmailApi } from '../services/api'

const formatDate = (value) => {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

const getUrgencyBadge = (urgency) => {
  switch (urgency) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case 'high':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'low':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    default:
      return 'bg-[#bbf246]/10 text-[#a4dc32] border-[#bbf246]/30'
  }
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  // Add Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    course_code: '',
    due_date: '',
    urgency: 'normal',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadTasks = () => {
    taskApi.list()
      .then(({ data }) => setTasks(data))
      .catch(() => setError('Could not load tasks.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleScanEmails = async () => {
    setScanning(true)
    setMessage('')
    setError('')
    try {
      const { data } = await gmailApi.sync()
      const count = data.created_tasks?.length || 0
      setMessage(
        data.message || `Scanned ${data.processed} emails: created ${count} new task${count === 1 ? '' : 's'}!`
      )
      loadTasks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Email scan failed.')
    } finally {
      setScanning(false)
    }
  }

  const toggleTask = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    setTasks((items) =>
      items.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    )
    try {
      await taskApi.update(task.id, { status: nextStatus })
    } catch {
      loadTasks()
    }
  }

  const deleteTask = async (id) => {
    try {
      await taskApi.remove(id)
      setTasks((items) => items.filter((task) => task.id !== id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setSubmitting(true)
    try {
      const payload = {
        title: newTask.title.trim(),
        course_code: newTask.course_code.trim().toUpperCase() || null,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
        urgency: newTask.urgency,
        description: newTask.description.trim() || null,
        status: 'pending'
      }
      const { data } = await taskApi.create(payload)
      setTasks((prev) => [data, ...prev])
      setIsModalOpen(false)
      setNewTask({
        title: '',
        course_code: '',
        due_date: '',
        urgency: 'normal',
        description: ''
      })
      setMessage('Task added successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task.')
    } finally {
      setSubmitting(false)
    }
  }

  const courses = ['all', ...new Set(tasks.map((task) => task.course_code).filter(Boolean))]

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse = courseFilter === 'all' || task.course_code === courseFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && task.status !== 'completed') ||
      (statusFilter === 'completed' && task.status === 'completed')
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.course_code && task.course_code.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCourse && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b dark:border-white/5 border-slate-300">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
            Coursework and homework items automatically extracted from university emails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 hover:bg-slate-100 dark:text-white text-slate-800 font-bold text-xs shadow-sm hover:border-[#8fc91c] dark:hover:border-[#bbf246] transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>

          <button
            onClick={handleScanEmails}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-extrabold text-xs shadow-md shadow-[#8fc91c]/20 transition-all cursor-pointer disabled:opacity-50"
            title="Scan coursework emails directly"
          >
            <Sparkles size={15} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Scanning...' : 'Scan Emails'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3.5 rounded-xl border border-lime-600/40 bg-lime-500/15 dark:bg-[#bbf246]/10 text-lime-900 dark:text-[#a4dc32] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className="font-semibold">{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          {/* Status Tabs */}
          <div className="flex items-center dark:bg-[#232832] bg-slate-200/90 border dark:border-transparent border-slate-300 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm' 
                  : 'dark:text-slate-400 text-slate-700 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'pending' 
                  ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm' 
                  : 'dark:text-slate-400 text-slate-700 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'completed' 
                  ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm' 
                  : 'dark:text-slate-400 text-slate-700 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Done
            </button>
          </div>

          {/* Course Dropdown */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none cursor-pointer font-medium"
          >
            {courses.map((item) => (
              <option key={item} value={item} className="dark:bg-[#1c2027] bg-white">
                {item === 'all' ? 'All Courses' : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Card */}
      <div className="p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs dark:text-slate-400 text-slate-500 font-medium">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="dark:text-slate-400 text-slate-600 text-xs mb-3 font-medium">No tasks found matching your filter.</p>
            <button
              onClick={handleScanEmails}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent text-xs font-bold shadow-md shadow-[#8fc91c]/20 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Scan Academic Emails</span>
            </button>
          </div>
        ) : (
          <div className="divide-y dark:divide-white/5 divide-slate-200">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'completed'
              return (
                <div
                  key={task.id}
                  className="py-3.5 flex items-start justify-between gap-4 group dark:hover:bg-[#232832]/60 hover:bg-slate-100/80 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleTask(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-[#aee637] dark:bg-[#bbf246] border-[#8fc91c] dark:border-[#bbf246] text-[#0f172a] dark:text-[#111317]'
                          : 'dark:border-white/20 border-slate-400 hover:border-slate-600 dark:hover:border-[#bbf246]'
                      }`}
                    >
                      {isDone && <Check size={13} strokeWidth={3} />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold tracking-tight ${
                          isDone ? 'line-through dark:text-slate-500 text-slate-400' : 'dark:text-slate-100 text-slate-900'
                        }`}>
                          {task.title}
                        </span>
                        {task.course_code && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold dark:bg-[#232832] bg-slate-200 border border-slate-300 dark:border-transparent dark:text-[#bbf246] text-emerald-900">
                            {task.course_code}
                          </span>
                        )}
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(task.urgency)}`}>
                          {task.urgency}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs dark:text-slate-400 text-slate-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] dark:text-slate-500 text-slate-500 mt-1.5 font-mono font-medium">
                        <Calendar size={12} />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md dark:bg-[#1c2027] bg-white border dark:border-white/10 border-slate-300 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-white/10 border-slate-300">
              <h3 className="text-base font-bold dark:text-white text-slate-900">Create New Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Problem Set 3"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={newTask.course_code}
                    onChange={(e) => setNewTask({ ...newTask, course_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246]"
                  />
                </div>

                <div>
                  <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246]"
                />
              </div>

              <div>
                <label className="block font-bold dark:text-slate-300 text-slate-700 mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional assignment instructions..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#8fc91c] dark:focus:ring-[#bbf246] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-white/10 border-slate-300">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-bold rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm cursor-pointer transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
