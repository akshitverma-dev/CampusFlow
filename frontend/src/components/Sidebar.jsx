import { CalendarDays, CheckSquare, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [{ to: '/', label: 'Overview', icon: LayoutDashboard }, { to: '/tasks', label: 'My tasks', icon: CheckSquare }, { to: '/calendar', label: 'Calendar', icon: CalendarDays }, { to: '/settings', label: 'Settings', icon: Settings }]
export default function Sidebar({ currentPath, onLogout, user }) {
  return <aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark small">CF</div><span>CampusFlow</span></div><div className="side-label">WORKSPACE</div><nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><div className="ai-prompt"><Sparkles size={17} /><p><strong>AI inbox</strong><br /><span>Turn email into action.</span></p></div><div className="user-row"><div className="avatar">{user.email[0].toUpperCase()}</div><div className="user-email">{user.email}</div><button onClick={onLogout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div></div></aside>
}
