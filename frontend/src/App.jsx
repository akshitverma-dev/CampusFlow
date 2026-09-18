import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import CalendarView from './pages/CalendarView'
import Settings from './pages/Settings'
import { authApi } from './services/api'

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try { const { data } = await (mode === 'login' ? authApi.login(form) : authApi.register(form)); localStorage.setItem('campusflow_token', data.access_token); localStorage.setItem('campusflow_user', JSON.stringify(data.user)); onAuth(data.user) }
    catch (err) { setError(err.response?.data?.detail || 'Unable to authenticate') }
  }
  return <main className="auth-shell"><div className="auth-panel"><div className="brand-mark">CF</div><p className="eyebrow">STUDENT OPERATING SYSTEM</p><h1>Make room for<br /><span>deep work.</span></h1><p className="auth-copy">Turn scattered academic signals into a clear, calm plan for the week.</p><form onSubmit={submit} className="auth-form"><label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <p className="error-text">{error}</p>}<button className="primary-button" type="submit">{mode === 'login' ? 'Open workspace' : 'Create workspace'}</button></form><button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></div><div className="auth-art"><div className="art-note">01 <span>FOCUS / FLOW</span></div><div className="art-quote">Your semester,<br /><i>in motion.</i></div><div className="art-grid" /></div></main>
}

function Workspace({ user, onLogout }) {
  const location = useLocation(); const navigate = useNavigate()
  return <div className="app-shell"><Sidebar currentPath={location.pathname} onLogout={onLogout} user={user} /><main className="main-content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/tasks" element={<Tasks />} /><Route path="/calendar" element={<CalendarView />} /><Route path="/settings" element={<Settings user={user} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main><button className="mobile-nav-button" aria-label="Go to dashboard" onClick={() => navigate('/')}>CF</button></div>
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('campusflow_user') || 'null'))
  const logout = () => { localStorage.removeItem('campusflow_token'); localStorage.removeItem('campusflow_user'); setUser(null) }
  return user ? <Workspace user={user} onLogout={logout} /> : <AuthScreen onAuth={setUser} />
}
