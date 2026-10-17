import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Mail, 
  Settings as SettingsIcon, 
  Search, 
  ChevronRight, 
  LogOut 
} from 'lucide-react'

export default function Sidebar({ user, onLogout, taskCount = 0, onSelectOverview }) {
  const navigate = useNavigate()
  const displayName = user?.email ? user.email.split('@')[0] : 'Student'
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'S'

  const handleOverviewClick = (e) => {
    if (onSelectOverview) {
      onSelectOverview()
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between p-4 dark:bg-[#16191f] bg-[#f1f4f8] border-r dark:border-white/[0.07] border-slate-300 select-none z-30 transition-colors shadow-sm">
      <div className="space-y-6">
        {/* User Profile Pill at Top (Matching Reference Image) */}
        <div className="flex items-center justify-between p-2 rounded-2xl dark:bg-[#1f232c] bg-white border dark:border-white/5 border-slate-300 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm border border-[#8fc91c] dark:border-transparent">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold dark:text-white text-slate-900 truncate capitalize">
                {displayName}
              </div>
              <div className="text-[10px] dark:text-slate-400 text-slate-600 truncate font-medium">
                {user?.email || 'student@campusflow.edu'}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Search Bar with ⌘K Badge */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            onClick={() => navigate('/tasks')}
            className="w-full pl-9 pr-11 py-2 text-xs rounded-xl dark:bg-[#1c2027] bg-white border dark:border-white/5 border-slate-300 dark:text-white text-slate-900 placeholder-slate-500 focus:outline-none cursor-pointer shadow-sm"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold dark:bg-[#282d38] bg-slate-200 border dark:border-transparent border-slate-300 dark:text-slate-300 text-slate-700">
            ⌘K
          </span>
        </div>

        {/* Section 1: DASHBOARDS */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-wider font-mono">
            Dashboards
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={handleOverviewClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm'
                    : 'dark:text-slate-400 text-slate-700 dark:hover:text-white hover:text-slate-950 dark:hover:bg-white/[0.04] hover:bg-slate-200/80 hover:border-slate-300 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>Overview</span>
                  </div>
                  {isActive && <ChevronRight size={14} strokeWidth={2.5} />}
                </>
              )}
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm'
                    : 'dark:text-slate-400 text-slate-700 dark:hover:text-white hover:text-slate-950 dark:hover:bg-white/[0.04] hover:bg-slate-200/80 hover:border-slate-300 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <CheckSquare size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>My Tasks</span>
                  </div>
                  {taskCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isActive 
                        ? 'bg-[#0f172a] text-[#aee637] border-transparent' 
                        : 'dark:bg-[#252a36] bg-slate-200 border-slate-300 dark:border-transparent dark:text-slate-300 text-slate-800'
                    }`}>
                      {taskCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm'
                    : 'dark:text-slate-400 text-slate-700 dark:hover:text-white hover:text-slate-950 dark:hover:bg-white/[0.04] hover:bg-slate-200/80 hover:border-slate-300 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>Calendar</span>
                  </div>
                  {isActive && <ChevronRight size={14} strokeWidth={2.5} />}
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Section 2: SETTINGS */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-wider font-mono">
            Settings
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-sm'
                    : 'dark:text-slate-400 text-slate-700 dark:hover:text-white hover:text-slate-950 dark:hover:bg-white/[0.04] hover:bg-slate-200/80 hover:border-slate-300 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Mail size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>Email Ingestion</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </>
              )}
            </NavLink>

            <NavLink
              to="/settings"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold dark:text-slate-400 text-slate-700 dark:hover:text-white hover:text-slate-950 dark:hover:bg-white/[0.04] hover:bg-slate-200/80 hover:border-slate-300 border border-transparent transition-all"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon size={17} />
                <span>Preferences</span>
              </div>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Bottom Brand Mark (Matching Reference Image) */}
      <div 
        onClick={handleOverviewClick}
        className="pt-4 border-t dark:border-white/5 border-slate-300 flex items-center justify-between px-2 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#aee637] dark:bg-[#bbf246]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          </div>
          <span className="font-extrabold text-xs tracking-tight dark:text-white text-slate-900 uppercase font-mono">
            CampusFlow
          </span>
        </div>
        <span className="text-[10px] font-mono dark:text-slate-400 text-slate-600 font-bold">
          v2.4
        </span>
      </div>
    </aside>
  )
}
