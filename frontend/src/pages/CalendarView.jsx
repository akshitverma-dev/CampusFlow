import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarDays } from 'lucide-react'
import { calendarApi, taskApi } from '../services/api'

export default function CalendarView() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([taskApi.list(), calendarApi.list()])
      .then(([tasksRes, calendarRes]) => {
        const taskEvents = (tasksRes.data || [])
          .filter((task) => task.due_date)
          .map((task) => ({
            id: `task-${task.id}`,
            title: `${task.course_code ? `[${task.course_code}] ` : ''}${task.title}`,
            start: task.due_date,
            className: 'calendar-task',
          }))

        const generalEvents = (calendarRes.data || []).map((event) => ({
          id: `event-${event.id}`,
          title: event.event_name,
          start: event.event_date,
          className: 'calendar-event',
        }))

        setEvents([...taskEvents, ...generalEvents])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b dark:border-white/5 border-slate-300">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
            Deadlines, exams, and university schedules automatically synchronized in one view.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#aee637] dark:bg-[#bbf246] border border-[#8fc91c] dark:border-transparent shadow-sm" />
            <span className="dark:text-slate-300 text-slate-800">Coursework Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="dark:text-slate-300 text-slate-800">University Events & Exams</span>
          </div>
        </div>
      </div>

      {/* Calendar Card Container */}
      <div className="p-6 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 shadow-sm">
        {loading ? (
          <div className="py-24 text-center text-xs dark:text-slate-400 text-slate-500">
            Loading your academic schedule...
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={events}
            height="auto"
            dayMaxEvents={3}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        )}
      </div>
    </div>
  )
}
