import React, { useState } from 'react'
import { X, Mail, Lock, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { authApi } from '../services/api'

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      let res
      if (isLogin) {
        res = await authApi.login({ email, password })
      } else {
        res = await authApi.register({ email, password })
      }

      const { access_token, user } = res.data
      localStorage.setItem('campusflow_token', access_token)
      localStorage.setItem('campusflow_user', JSON.stringify(user))
      onSuccess(user, access_token)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.detail || (isLogin ? 'Failed to sign in. Please check your credentials.' : 'Registration failed. Email may already be in use.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      const res = await authApi.demo()
      const { access_token, user } = res.data
      localStorage.setItem('campusflow_token', access_token)
      localStorage.setItem('campusflow_user', JSON.stringify(user))
      onSuccess(user, access_token)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl dark:bg-[#16191f] bg-white border dark:border-white/10 border-slate-300 p-7 md:p-8 shadow-2xl relative select-none transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl dark:bg-[#202530] bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex items-center -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#aee637] dark:bg-[#bbf246]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          </div>
          <span className="dark:text-white text-slate-900 font-extrabold text-base tracking-tight">
            CampusFlow
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#aee637]/20 dark:bg-[#bbf246]/20 text-emerald-800 dark:text-[#a4dc32] border border-[#8fc91c]/30">
            SECURE ACCESS
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl dark:bg-[#1c2027] bg-slate-100 p-1 mb-6 border dark:border-white/5 border-slate-200">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLogin
                ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] shadow-sm font-extrabold'
                : 'dark:text-slate-400 text-slate-600 hover:text-black dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLogin
                ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] shadow-sm font-extrabold'
                : 'dark:text-slate-400 text-slate-600 hover:text-black dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-1.5">
              University / Personal Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-[#1c2027] bg-slate-50 border dark:border-white/10 border-slate-300 dark:text-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 dark:focus:border-[#bbf246] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold dark:text-slate-300 text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-[#1c2027] bg-slate-50 border dark:border-white/10 border-slate-300 dark:text-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 dark:focus:border-[#bbf246] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent font-extrabold text-xs shadow-lg shadow-[#8fc91c]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-[1px] flex-1 dark:bg-white/10 bg-slate-200" />
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Or Instant Access</span>
          <div className="h-[1px] flex-1 dark:bg-white/10 bg-slate-200" />
        </div>

        {/* 1-Click Sandbox Account Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl dark:bg-[#202530] bg-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-200 text-slate-800 border dark:border-white/5 border-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={14} className="text-emerald-600 dark:text-[#bbf246]" />
          <span>Launch Clean Sandbox Student Account</span>
        </button>

        <p className="mt-4 text-[11px] text-center text-slate-500 leading-relaxed">
          Your credentials are cryptographically hashed on the server with bcrypt and protected by JWT authorization tokens.
        </p>
      </div>
    </div>
  )
}
