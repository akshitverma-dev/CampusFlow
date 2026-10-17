import React from 'react'
import { 
  Layers, 
  Star, 
  Moon, 
  Sun, 
  RefreshCw, 
  Bell, 
  Globe
} from 'lucide-react'

export default function Topbar({ 
  currentRoute = 'Overview', 
  theme = 'dark', 
  onToggleTheme, 
  onSyncEmails, 
  isSyncing = false,
  onToggleRightPanel,
  unreadCount = 3,
  onBackToLanding
}) {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b dark:bg-[#16191f]/85 bg-white/95 backdrop-blur-md dark:border-white/[0.07] border-slate-300 sticky top-0 z-20 select-none transition-colors shadow-sm">
      {/* Left Breadcrumbs (Matching Image) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 dark:text-slate-400 text-slate-600">
          <Layers size={16} />
          <Star size={15} className="hover:text-amber-500 cursor-pointer transition-colors" />
        </div>
        <div className="h-4 w-[1px] dark:bg-white/10 bg-slate-300" />
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="dark:text-slate-400 text-slate-600 font-medium">Dashboards</span>
          <span className="dark:text-slate-500 text-slate-400">/</span>
          <span className="dark:text-white text-slate-900 font-extrabold capitalize">
            {currentRoute}
          </span>
        </div>
      </div>

      {/* Right Controls with Defined Borders and Darker Shade in Light Mode */}
      <div className="flex items-center gap-2.5">
        {/* Main Website Pill Button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold dark:text-slate-200 text-slate-800 dark:bg-[#1c2027] bg-slate-100 hover:text-black dark:hover:text-white dark:hover:bg-white/10 hover:bg-slate-200 border dark:border-white/10 border-slate-300 transition-all cursor-pointer mr-1 shadow-sm"
            title="Return to main website"
          >
            <Globe size={13} className="text-emerald-700 dark:text-[#a4dc32]" />
            <span>Main Website</span>
          </button>
        )}

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl dark:bg-[#1e222b] bg-slate-100 dark:text-slate-300 text-slate-700 hover:text-black dark:hover:text-[#bbf246] hover:bg-slate-200 border dark:border-white/5 border-slate-300 transition-colors cursor-pointer shadow-sm"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Email Sync Refresh */}
        <button
          onClick={onSyncEmails}
          disabled={isSyncing}
          aria-label="Scan Academic Emails"
          title="Scan academic emails now"
          className="p-2 rounded-xl dark:bg-[#1e222b] bg-slate-100 dark:text-slate-300 text-slate-700 hover:text-black dark:hover:text-[#bbf246] hover:bg-slate-200 border dark:border-white/5 border-slate-300 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin text-emerald-600 dark:text-[#bbf246]' : ''} />
        </button>

        {/* Notifications Toggle */}
        <button
          onClick={onToggleRightPanel}
          aria-label="Toggle Notifications & Activity"
          title="Toggle Notifications panel"
          className="p-2 rounded-xl dark:bg-[#1e222b] bg-slate-100 dark:text-slate-300 text-slate-700 hover:text-black dark:hover:text-[#bbf246] hover:bg-slate-200 border dark:border-white/5 border-slate-300 transition-colors cursor-pointer relative shadow-sm"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#aee637] dark:bg-[#bbf246] shadow-sm" />
          )}
        </button>
      </div>
    </header>
  )
}
