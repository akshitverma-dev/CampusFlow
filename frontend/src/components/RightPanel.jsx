import React, { useEffect, useState } from 'react'
import { 
  Calendar, 
  CheckCircle2, 
  Mail, 
  Clock, 
  Sparkles, 
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { taskApi } from '../services/api'

export default function RightPanel({ onClose }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    taskApi.list()
      .then(({ data }) => setTasks(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const urgentTasks = pendingTasks.filter((t) => t.urgency === 'high' || t.urgency === 'critical')
  
  // Unique courses extracted from user's actual tasks
  const courses = [...new Set(tasks.map((t) => t.course_code).filter(Boolean))]

  return (
    <aside className="w-80 flex-shrink-0 p-5 dark:bg-[#16191f] bg-white border-l dark:border-white/[0.07] border-slate-300 shadow-sm select-none overflow-y-auto no-scrollbar space-y-7 transition-colors">
      {/* 1. Notifications Section */}
      <div>
        <h3 className="text-xs font-bold dark:text-white text-slate-900 tracking-tight mb-4 flex items-center justify-between">
          <span>Priority Alerts</span>
          {urgentTasks.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {urgentTasks.length} Urgent
            </span>
          )}
        </h3>

        {urgentTasks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed dark:border-white/10 border-slate-300 text-center text-xs dark:text-slate-400 text-slate-500 space-y-1">
            <CheckCircle2 size={16} className="mx-auto text-emerald-600 dark:text-[#aee637]" />
            <p className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-[10px]">No high-urgency deadlines detected in your focus list.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl dark:bg-[#232832] bg-slate-50 border dark:border-transparent border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={12} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold dark:text-slate-200 text-slate-900 truncate">
                    {task.title}
                  </div>
                  <div className="text-[10px] text-rose-500 dark:text-rose-400 font-mono font-semibold">
                    {task.course_code ? `[${task.course_code}] ` : ''}Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Soon'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Activities Section */}
      <div>
        <h3 className="text-xs font-bold dark:text-white text-slate-900 tracking-tight mb-4">
          Recent Course Activity
        </h3>

        {tasks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed dark:border-white/10 border-slate-300 text-center text-xs dark:text-slate-400 text-slate-500 space-y-1">
            <Sparkles size={16} className="mx-auto text-amber-500" />
            <p className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">No activity yet</p>
            <p className="text-[10px]">Tasks added or synced will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  task.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[#aee637]/20 text-emerald-800 dark:text-[#a4dc32]'
                }`}>
                  {task.status === 'completed' ? <CheckCircle2 size={13} /> : <BookOpen size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold dark:text-slate-200 text-slate-800 truncate">
                    {task.title}
                  </div>
                  <div className="text-[10px] dark:text-slate-500 text-slate-400 font-medium">
                    {task.status === 'completed' ? 'Completed' : 'Active Coursework'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Real Active Course Subjects */}
      <div>
        <h3 className="text-xs font-bold dark:text-white text-slate-900 tracking-tight mb-4">
          Enrolled Course Codes
        </h3>

        {courses.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed dark:border-white/10 border-slate-300 text-center text-xs dark:text-slate-400 text-slate-500 space-y-1">
            <GraduationCap size={16} className="mx-auto text-cyan-500" />
            <p className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">No courses detected</p>
            <p className="text-[10px]">Course codes (e.g. CS301, MATH204) are automatically extracted from your emails.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course, idx) => (
              <div
                key={course}
                className="flex items-center justify-between p-2.5 rounded-xl dark:bg-[#232832] bg-slate-50 border dark:border-transparent border-slate-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8fc91c] dark:bg-[#bbf246]" />
                  <span className="text-xs font-bold dark:text-slate-200 text-slate-900 font-mono">
                    {course}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md dark:bg-white/5 bg-slate-200 text-slate-700 dark:text-slate-300">
                  {tasks.filter((t) => t.course_code === course).length} Tasks
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
