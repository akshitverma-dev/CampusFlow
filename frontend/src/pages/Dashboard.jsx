import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowUpRight, 
  Check, 
  Clock3, 
  Sparkles, 
  MoreVertical, 
  ChevronDown, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  TrendingUp,
  Star,
  Zap,
  Mail,
  AlertCircle
} from 'lucide-react'
import { taskApi, gmailApi } from '../services/api'

const formatDate = (value) => {
  if (!value) return 'No deadline'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric'
  }).format(date)
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('')
  const [dateFilter, setDateFilter] = useState('This Semester')

  const loadTasks = () => {
    taskApi.list()
      .then(({ data }) => setTasks(data))
      .catch(() => {})
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
      setScanMessage(
        data.message || `Scanned ${data.processed} emails: created ${createdCount} new task${createdCount === 1 ? '' : 's'}!`
      )
      loadTasks()
    } catch (err) {
      setScanMessage(err.response?.data?.detail || 'Could not scan emails.')
    } finally {
      setScanning(false)
    }
  }

  const toggleTask = async (task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed'
    setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, status: next } : item)))
    try {
      await taskApi.update(task.id, { status: next })
    } catch {
      loadTasks()
    }
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const dueSoonTasks = pendingTasks.filter((t) => t.urgency === 'high' || t.urgency === 'critical')
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  // Coursework breakdown metrics
  const courseCounts = tasks.reduce((acc, t) => {
    const code = t.course_code || 'General'
    acc[code] = (acc[code] || 0) + 1
    return acc
  }, {})

  const topCourses = Object.entries(courseCounts).slice(0, 4)

  return (
    <div className="space-y-6 select-none">
      {/* Title Row with Date Dropdown (Matching Reference Image) */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight">
          Overview
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300 text-slate-800 shadow-sm cursor-pointer transition-colors"
            >
              <span>{dateFilter}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Scan Status Toast Banner */}
      {scanMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-sm ${
          scanMessage.includes('created') || scanMessage.includes('Scanned')
            ? 'dark:bg-[#bbf246]/10 bg-lime-500/15 border-lime-600/40 text-lime-900 dark:text-[#bbf246]'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className="font-medium">{scanMessage}</span>
          </div>
          <button onClick={() => setScanMessage('')} className="opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* 4 Top KPI Cards (Matching Image Grid & Gauge Ring) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Tasks */}
        <div className="p-5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-3">
          <div className="text-xs font-semibold dark:text-slate-400 text-slate-600">
            Pending Coursework
          </div>
          <div className="text-2xl md:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            {pendingTasks.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-[#a4dc32]">
            <TrendingUp size={13} />
            <span>{pendingTasks.length} active items</span>
          </div>
        </div>

        {/* KPI 2: Completed */}
        <div className="p-5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-3">
          <div className="text-xs font-semibold dark:text-slate-400 text-slate-600">
            Completed Tasks
          </div>
          <div className="text-2xl md:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            {completedTasks.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-[#a4dc32]">
            <TrendingUp size={13} />
            <span>{tasks.length > 0 ? `${completionRate}% of all tasks` : 'No tasks finished yet'}</span>
          </div>
        </div>

        {/* KPI 3: Semester Goal with Radial Gauge Ring (Quarterly Revenue Goal in Image!) */}
        <div className="p-5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <div className="text-xs font-semibold dark:text-slate-400 text-slate-600">
              Semester Goal
            </div>
            <div className="text-2xl md:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              {completionRate}%
            </div>
            <div className="text-[11px] dark:text-slate-400 text-slate-600 font-medium">
              Target: 100% on-time
            </div>
          </div>

          {/* Half-Circle Gauge SVG (Matching Reference Image) */}
          <div className="w-20 h-14 relative flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="currentColor"
                className="dark:text-[#252a36] text-slate-300"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#bbf246"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 * (1 - completionRate / 100)}
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: Upcoming Deadlines */}
        <div className="p-5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-3">
          <div className="text-xs font-semibold dark:text-slate-400 text-slate-600">
            Due Soon (72h)
          </div>
          <div className="text-2xl md:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            {dueSoonTasks.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-[#a4dc32]">
            <TrendingUp size={13} />
            <span>{dueSoonTasks.length > 0 ? 'Urgent priority' : 'No pressing deadlines'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Donut Breakdown + Wave Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Coursework Overview with Donut Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
              Coursework Breakdown
            </h2>
            <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-3">
            {/* Donut Chart SVG (Matching Image) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    className="dark:text-[#232731] text-slate-300"
                    strokeWidth="14"
                  />
                  {/* Segment 1: Lime */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#bbf246"
                    strokeWidth="14"
                    strokeDasharray="251.2"
                    strokeDashoffset="120"
                    strokeLinecap="round"
                  />
                  {/* Segment 2: Emerald */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray="251.2"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold dark:text-white text-slate-900 tracking-tight">
                    {completionRate}%
                  </span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-600 font-semibold">
                    On Track
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Stat Box + Legend (Matching Image) */}
            <div className="sm:col-span-7 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-transparent border-slate-300">
                <div className="w-8 h-8 rounded-lg dark:bg-[#bbf246]/20 bg-[#aee637]/30 text-emerald-800 dark:text-[#a4dc32] border border-[#8fc91c]/30 dark:border-transparent flex items-center justify-center font-bold text-xs">
                  $
                </div>
                <div>
                  <div className="text-[10px] dark:text-slate-400 text-slate-600 uppercase font-mono font-bold">
                    Total Tasks Ingested
                  </div>
                  <div className="text-sm font-bold dark:text-white text-slate-900">
                    {tasks.length} Active Course {tasks.length === 1 ? 'Item' : 'Items'}
                  </div>
                </div>
              </div>

              {/* Dynamic Course Categories */}
              {topCourses.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed dark:border-white/10 border-slate-300 text-center text-xs dark:text-slate-400 text-slate-500">
                  No courses ingested yet. Add a task or scan your inbox.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {topCourses.map(([course, count], idx) => {
                    const dots = ['bg-[#8fc91c] dark:bg-[#bbf246]', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500']
                    return (
                      <div key={course}>
                        <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-600 text-[11px] font-medium">
                          <span className={`w-2 h-2 rounded-full ${dots[idx % dots.length]}`} />
                          <span className="truncate">{course}</span>
                        </div>
                        <div className="font-bold dark:text-slate-200 text-slate-900 ml-3.5">
                          {count} Task{count === 1 ? '' : 's'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Wave Chart + Mini Pills (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm">
              <div className="w-7 h-7 rounded-lg dark:bg-[#bbf246]/20 bg-[#aee637]/30 text-emerald-800 dark:text-[#a4dc32] border border-[#8fc91c]/30 dark:border-transparent flex items-center justify-center mb-2">
                <Clock3 size={14} />
              </div>
              <div className="text-[10px] dark:text-slate-400 text-slate-600 font-medium">Pending Tasks</div>
              <div className="text-base font-bold dark:text-white text-slate-900">{pendingTasks.length} Active</div>
            </div>

            <div className="p-3.5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 size={14} />
              </div>
              <div className="text-[10px] dark:text-slate-400 text-slate-600 font-medium">Completed</div>
              <div className="text-base font-bold dark:text-white text-slate-900">{completedTasks.length} Done</div>
            </div>
          </div>

          {/* Glowing Wave Chart Card (Total Profit Card in Image) */}
          <div className="p-5 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold dark:text-white text-slate-900">
                  Task Completion Momentum
                </div>
                <div className="text-[10px] dark:text-slate-500 text-slate-500 font-medium">
                  Semester Tracking
                </div>
              </div>
              <div className="text-sm font-extrabold text-emerald-700 dark:text-[#bbf246]">
                +{completedTasks.length} Done
              </div>
            </div>

            {/* Glowing Smooth Wave SVG */}
            <div className="h-28 w-full pt-2">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8fc91c" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8fc91c" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path
                  d="M 0,80 Q 40,90 70,60 T 140,50 T 210,20 T 300,30 L 300,100 L 0,100 Z"
                  fill="url(#waveGradient)"
                />

                {/* Smooth Glowing Stroke Line */}
                <path
                  d="M 0,80 Q 40,90 70,60 T 140,50 T 210,20 T 300,30"
                  fill="none"
                  stroke="#7cb518"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Highlight Dot */}
                <circle cx="210" cy="20" r="4" fill="#ffffff" stroke="#7cb518" strokeWidth="2.5" />
                <circle cx="70" cy="60" r="3" fill="#7cb518" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Customer List / Recent Coursework + Pro Promo Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Tasks Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                Recent Coursework & Ingested Tasks
              </h2>
              <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <MoreVertical size={16} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs dark:text-slate-400 text-slate-500 font-medium">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-xs dark:text-slate-400 text-slate-500 font-medium">
                No tasks found. Click "Scan Academic Emails" below.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 4).map((task) => {
                  const isDone = task.status === 'completed'
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl dark:hover:bg-[#232832] hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(task)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone 
                              ? 'bg-[#aee637] dark:bg-[#bbf246] border-[#8fc91c] dark:border-[#bbf246] text-[#0f172a] dark:text-[#111317]' 
                              : 'dark:border-white/20 border-slate-400 hover:border-slate-600 dark:hover:border-[#bbf246]'
                          }`}
                        >
                          {isDone && <Check size={13} strokeWidth={3} />}
                        </button>

                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate ${
                            isDone ? 'line-through dark:text-slate-500 text-slate-400' : 'dark:text-slate-100 text-slate-900'
                          }`}>
                            {task.title}
                          </div>
                          <div className="text-[10px] dark:text-slate-500 text-slate-500 truncate font-mono font-medium">
                            {formatDate(task.due_date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.course_code && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold dark:bg-[#232832] bg-slate-200 border border-slate-300 dark:border-transparent dark:text-[#bbf246] text-emerald-900">
                            {task.course_code}
                          </span>
                        )}
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md ${
                          task.urgency === 'critical' || task.urgency === 'high'
                            ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                            : 'dark:bg-white/5 bg-slate-200 border border-slate-300 dark:border-transparent text-slate-700 dark:text-slate-400'
                        }`}>
                          {task.urgency}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t dark:border-white/5 border-slate-300 flex items-center justify-between text-xs">
            <Link to="/tasks" className="text-emerald-700 dark:text-[#a4dc32] font-bold hover:underline">
              Manage all tasks →
            </Link>
            <span className="text-[11px] text-slate-500 font-mono font-medium">
              {tasks.length} total active items
            </span>
          </div>
        </div>

        {/* Right: Premium Plan Promo Card (Matching $30 Card in Reference Image!) */}
        <div className="lg:col-span-5 p-6 rounded-2xl dark:bg-gradient-to-br dark:from-[#1c2918] dark:via-[#152014] dark:to-[#121915] bg-gradient-to-br from-[#1f2820] via-[#172118] to-[#131b15] border border-[#bbf246]/30 dark:border-[#bbf246]/20 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#bbf246]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#bbf246]/20 text-[#bbf246] border border-[#bbf246]/30">
                <Zap size={12} />
                <span>Academic Assistant</span>
              </span>
              <button className="text-slate-400 hover:text-white">
                <MoreVertical size={16} />
              </button>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  $0
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Free Student Plan
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Connect your inbox to automatically parse syllabi and deadlines into your personal focus list.
              </p>
            </div>
          </div>

          {/* Action Button (Matching Glowing Neon Lime Button in Image) */}
          <div className="pt-6 relative z-10 flex items-center gap-2">
            <button
              onClick={handleScanEmails}
              disabled={scanning}
              className="flex-1 py-3 px-4 rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-extrabold text-xs tracking-wide shadow-md shadow-[#8fc91c]/25 dark:shadow-[#bbf246]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={15} className={scanning ? 'animate-spin' : ''} />
              <span>{scanning ? 'Scanning...' : 'Scan Academic Emails'}</span>
            </button>

            <button 
              onClick={() => handleScanEmails()}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors border border-white/10"
              title="Sync now"
            >
              <Star size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
