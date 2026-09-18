import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { calendarApi, taskApi } from '../services/api'

export default function CalendarView() {
  const [events, setEvents] = useState([])
  useEffect(() => { Promise.all([taskApi.list(), calendarApi.list()]).then(([tasks, calendar]) => setEvents([...tasks.data.filter((task) => task.due_date).map((task) => ({ id: `task-${task.id}`, title: task.title, start: task.due_date, className: 'calendar-task' })), ...calendar.data.map((event) => ({ id: `event-${event.id}`, title: event.event_name, start: event.event_date, className: 'calendar-event' }))])) }, [])
  return <div className="page calendar-page"><header className="page-header compact"><div><p className="eyebrow">ACADEMIC RHYTHM</p><h1>Calendar.</h1><p className="subtle">Deadlines and events, in one steady view.</p></div></header><div className="calendar-wrap"><FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }} events={events} height="auto" /></div></div>
}
