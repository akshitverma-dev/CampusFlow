import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  LogOut, 
  CheckSquare, 
  CalendarDays, 
  LayoutDashboard,
  Mail, 
  Clock3, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Layers,
  Search,
  Check,
  X,
  Globe,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  MoreVertical,
  Calendar,
  Star,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RightPanel from './components/RightPanel';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';
import { authApi, gmailApi, taskApi } from './services/api';

// --- Aesthetic Main Website Navbar (Matching Dashboard Identity) ---
const WebsiteNavbar = ({ onOpenDashboard, onOpenAuth, user, onLogout, theme, onToggleTheme }) => {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center dark:bg-[#111317]/90 bg-[#eaedf2]/90 backdrop-blur-xl border-b dark:border-white/[0.07] border-slate-300 select-none transition-colors shadow-sm">
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={onOpenDashboard}
      >
        <div className="flex items-center -space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#aee637] dark:bg-[#bbf246]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
        </div>
        <div className="flex flex-col text-left">
          <span className="dark:text-white text-slate-900 font-extrabold tracking-tight text-base leading-tight">
            CampusFlow
          </span>
          <span className="text-[9px] font-mono text-emerald-700 dark:text-[#a4dc32] font-bold tracking-wider uppercase">
            Academic Flow
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8 text-xs font-bold dark:text-slate-300 text-slate-700">
        <a href="#how-it-works" className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors">
          Workflow
        </a>
        <a href="#features" className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors">
          Features
        </a>
        <a href="#demo" className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors">
          Live Sandbox
        </a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Switcher */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl dark:bg-[#1c2027] bg-white border dark:border-white/5 border-slate-300 dark:text-slate-300 text-slate-800 hover:text-black dark:hover:text-[#bbf246] shadow-sm transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenDashboard}
              className="flex items-center gap-2 text-[#0f172a] dark:text-[#111317] bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] border border-[#8fc91c] dark:border-transparent px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#8fc91c]/25 cursor-pointer"
            >
              <span>Dashboard ({user.email.split('@')[0]})</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-2 rounded-xl dark:bg-[#1c2027] bg-white border dark:border-white/5 border-slate-300 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 rounded-xl dark:bg-[#1c2027] bg-white dark:text-slate-200 text-slate-800 border dark:border-white/10 border-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm"
            >
              Sign In
            </button>
            <button 
              onClick={() => onOpenAuth('register')}
              className="flex items-center gap-1.5 text-[#0f172a] dark:text-[#111317] bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] border border-[#8fc91c] dark:border-transparent px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#8fc91c]/25 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// --- Aesthetic Hero Section with Embedded Interactive Replica ---
const WebsiteHero = ({ onOpenDashboard, onOpenAuth, user }) => {
  return (
    <section className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
      {/* Background ambient spotlight */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[#bbf246]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Badge Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full dark:bg-[#1c2027] bg-white border dark:border-white/10 border-slate-300 text-emerald-800 dark:text-[#a4dc32] text-xs font-bold shadow-sm mb-6">
        <span className="w-2 h-2 rounded-full bg-[#8fc91c] dark:bg-[#bbf246] animate-pulse" />
        <span>Intelligent Academic Task & Deadline Engine</span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-[1.08] max-w-4xl">
        Your Academic Workspace, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 dark:from-[#bbf246] dark:via-emerald-400 dark:to-teal-400">
          Engineered for Coursework.
        </span>
      </h1>

      <p className="max-w-2xl mx-auto dark:text-slate-300 text-slate-700 text-sm md:text-base leading-relaxed mt-5 font-normal">
        CampusFlow automatically connects your university inbox to extract homework assignments, lab exam alerts, and syllabus due dates into an organized focus list and on-site calendar.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        {user ? (
          <button 
            onClick={onOpenDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-xl shadow-[#8fc91c]/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-xl shadow-[#8fc91c]/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl dark:bg-[#1c2027] bg-white dark:text-slate-200 text-slate-800 border dark:border-white/10 border-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm"
            >
              <span>Sign In</span>
            </button>
          </div>
        )}

        <a
          href="#demo"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl dark:bg-[#1c2027] bg-white dark:text-slate-200 text-slate-800 border dark:border-white/10 border-slate-300 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-sm"
        >
          <span>Try Demo Simulator</span>
          <ChevronRight size={16} />
        </a>
      </div>

      {/* Embedded Miniature Dashboard Preview (Matching The Exact Reference UI!) */}
      <div 
        onClick={user ? onOpenDashboard : () => onOpenAuth('login')}
        className="w-full mt-16 p-3 md:p-4 rounded-3xl dark:bg-[#16191f] bg-slate-200/80 border dark:border-white/10 border-slate-300 shadow-2xl cursor-pointer group hover:border-[#8fc91c] dark:hover:border-[#bbf246]/50 transition-all"
        title="Click to open the live interactive dashboard"
      >
        <div className="rounded-2xl dark:bg-[#111317] bg-white p-5 md:p-6 border dark:border-white/5 border-slate-300 text-left space-y-5 shadow-sm">
          {/* Topbar Replica */}
          <div className="flex items-center justify-between pb-3 border-b dark:border-white/5 border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] font-extrabold text-[10px] flex items-center justify-center border border-[#8fc91c] dark:border-transparent">
                CF
              </div>
              <span className="text-xs font-bold dark:text-white text-slate-900">
                Dashboards / Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent">
                LIVE PREVIEW
              </span>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-[#a4dc32] transition-colors flex items-center gap-1">
                <span>Click to enter</span>
                <ArrowUpRight size={13} />
              </span>
            </div>
          </div>

          {/* 4 Mini KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-1">
              <div className="text-[10px] text-slate-500 font-medium">Pending Tasks</div>
              <div className="text-xl font-extrabold dark:text-white text-slate-900">14</div>
              <div className="text-[9px] font-bold text-emerald-700 dark:text-[#a4dc32]">↗ 0.4% vs last week</div>
            </div>

            <div className="p-3.5 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-1">
              <div className="text-[10px] text-slate-500 font-medium">Completed</div>
              <div className="text-xl font-extrabold dark:text-white text-slate-900">28</div>
              <div className="text-[9px] font-bold text-emerald-700 dark:text-[#a4dc32]">↗ 32% this semester</div>
            </div>

            <div className="p-3.5 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">Semester Goal</div>
                <div className="text-xl font-extrabold dark:text-white text-slate-900">78%</div>
                <div className="text-[9px] text-slate-500 font-medium">On Track</div>
              </div>
              {/* Mini Radial Gauge */}
              <div className="w-12 h-8 relative flex items-end justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="dark:text-[#252a36] text-slate-300" strokeWidth="12" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#7cb518" strokeWidth="12" strokeDasharray="125.6" strokeDashoffset="28" />
                </svg>
              </div>
            </div>

            <div className="p-3.5 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-1">
              <div className="text-[10px] text-slate-500 font-medium">Due Soon (72h)</div>
              <div className="text-xl font-extrabold dark:text-white text-slate-900">5</div>
              <div className="text-[9px] font-bold text-emerald-700 dark:text-[#a4dc32]">↗ 11% vs last month</div>
            </div>
          </div>

          {/* Mini Wave Chart & Tasks Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold dark:text-white text-slate-900">
                <span>Task Activity Momentum</span>
                <span className="text-emerald-700 dark:text-[#a4dc32]">+34 Done</span>
              </div>
              <div className="h-16 w-full">
                <svg viewBox="0 0 300 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="heroWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8fc91c" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8fc91c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,60 Q 50,70 90,45 T 180,35 T 260,15 T 300,20 L 300,80 L 0,80 Z" fill="url(#heroWave)" />
                  <path d="M 0,60 Q 50,70 90,45 T 180,35 T 260,15 T 300,20" fill="none" stroke="#7cb518" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            <div className="p-4 rounded-xl dark:bg-[#1c2027] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-2">
              <div className="text-xs font-bold dark:text-white text-slate-900">
                Coursework Breakdown
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8fc91c] dark:bg-[#bbf246]" /> CS301 Systems</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> MATH204 Algebra</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> PHYS102 Optics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Workflow Section (Matching Reference Card Aesthetics) ---
const WebsiteWorkflow = ({ onOpenDashboard }) => {
  const steps = [
    {
      step: '01',
      title: 'Automated Inbox Sync',
      tag: 'ZERO OAUTH REQUIRED',
      desc: 'CampusFlow scans your 5 most recent academic emails via the shared campus mailbox or your personal Gmail.',
      icon: Mail,
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Gemini AI Dissection',
      tag: 'COURSE TAGS & URGENCY',
      desc: 'Our AI model identifies the course code (CS301, MATH204), due dates, assignment descriptions, and priority.',
      icon: Sparkles,
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Board & Calendar Sync',
      tag: 'ON-SITE CALENDAR',
      desc: 'Deadlines appear on your focus list and calendar automatically, without cluttering your personal external calendar.',
      icon: CalendarDays,
      badge: 'Step 3'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto border-t dark:border-white/5 border-slate-300">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-[#a4dc32] font-bold">
          Automated Workflow
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
          How CampusFlow powers your semester.
        </h2>
        <p className="text-sm dark:text-slate-400 text-slate-600">
          From unread university announcements straight into organized tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div 
              key={i}
              className="p-7 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 hover:border-slate-400 dark:hover:border-[#bbf246]/40 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl dark:bg-[#bbf246]/20 bg-[#aee637]/30 text-emerald-800 dark:text-[#a4dc32] border border-[#8fc91c]/30 dark:border-transparent flex items-center justify-center font-bold text-sm">
                  <Icon size={18} />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold dark:bg-[#232832] bg-slate-100 border dark:border-transparent border-slate-300 text-emerald-800 dark:text-[#a4dc32]">
                  {st.step}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-[#a4dc32] font-bold tracking-wider uppercase block mb-1">
                  {st.tag}
                </span>
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                  {st.title}
                </h3>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// --- Features Grid Section ---
const WebsiteFeatures = () => {
  const cards = [
    {
      tag: 'TAGGING',
      title: 'Course-Code Auto Tagging',
      desc: 'Assignments are categorized by course code (CS301, MATH204, PHYS102, ENG210), letting you filter and focus on specific subjects instantly.'
    },
    {
      tag: 'PRIVATE TIMELINE',
      title: 'Dedicated On-Site Calendar',
      desc: 'Keep all university assignment deadlines, midterm exams, and TA office hours on this private site so your Google Calendar stays clean.'
    },
    {
      tag: 'PRIORITY MATRIX',
      title: 'Smart Urgency Detection',
      desc: 'Critical assignments due in under 24 to 72 hours are color-coded in high-priority badges so you always tackle high-impact coursework first.'
    },
    {
      tag: 'ACCESSIBLE',
      title: 'Zero-OAuth Ingestion & Manual Parser',
      desc: 'New users can scan coursework emails directly with zero Google OAuth configuration or paste syllabus text into the instant parser.'
    }
  ];

  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto border-t dark:border-white/5 border-slate-300">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-[#a4dc32] font-bold">
          Engineered for Academics
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
          Every tool you need to stay on track.
        </h2>
        <p className="text-sm dark:text-slate-400 text-slate-600">
          Clean, distraction-free productivity without gimmick elements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <div 
            key={i}
            className="p-8 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 hover:border-slate-400 dark:hover:border-white/10 transition-all space-y-3 shadow-sm"
          >
            <span className="text-[10px] font-mono text-emerald-700 dark:text-[#a4dc32] font-bold tracking-wider uppercase">
              {c.tag}
            </span>
            <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
              {c.title}
            </h3>
            <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- Interactive Demo Simulator Section ---
const WebsiteDemoSimulator = ({ onOpenDashboard }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const samples = [
    {
      course: 'CS301 Systems',
      code: 'CS301',
      sender: 'Prof. David Vance <vance@cs.university.edu>',
      subject: 'CS301: Project 2 Submission & Lab Exam Schedule',
      body: 'Dear Students, please make sure your Project 2 GitHub repositories are pushed before this Friday at 11:59 PM. Also, our Midterm Lab Exam is next Tuesday from 2:00 PM to 4:00 PM in Lab Hall B.',
      task: 'Push Project 2 to GitHub Classroom',
      due: 'Friday 11:59 PM',
      urgency: 'high',
      event: 'CS301 Midterm Lab Exam (Hall B)'
    },
    {
      course: 'MATH204 Algebra',
      code: 'MATH204',
      sender: 'Dr. Sarah Lin <slin@math.university.edu>',
      subject: 'MATH204: Problem Set 4 Eigenvalues & Decompositions',
      body: 'Hi Class, Problem Set 4 has been posted on Canvas. It is due next Monday at 5:00 PM. Please show intermediate matrix steps for full credit.',
      task: 'Complete Problem Set 4 (Matrix Decompositions)',
      due: 'Next Monday 5:00 PM',
      urgency: 'normal',
      event: 'Problem Set 4 Deadline'
    }
  ];

  const current = samples[activeIdx];

  return (
    <section id="demo" className="py-24 px-6 max-w-6xl mx-auto border-t dark:border-white/5 border-slate-300">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-[#a4dc32] font-bold">
          Live Interactive Sandbox
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
          See the email extraction in action.
        </h2>
        <p className="text-sm dark:text-slate-400 text-slate-600">
          Click between course announcements to see real-time extraction logic.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {samples.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeIdx === idx
                ? 'bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent shadow-md'
                : 'dark:bg-[#1c2027] bg-white dark:text-slate-300 text-slate-800 border dark:border-white/5 border-slate-300 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {s.course}
          </button>
        ))}
      </div>

      {/* Showcase Grid (Matching Reference UI Styling) */}
      <div className="p-6 md:p-8 rounded-2xl dark:bg-[#1c2027] bg-white border dark:border-white/[0.07] border-slate-300 grid md:grid-cols-2 gap-8 items-center shadow-lg">
        {/* Left: Email */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            Simulated University Announcement
          </div>
          <div className="p-4 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-2">
            <div className="text-xs font-semibold dark:text-slate-300 text-slate-700">
              {current.sender}
            </div>
            <div className="text-xs font-bold text-emerald-800 dark:text-[#a4dc32]">
              {current.subject}
            </div>
            <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed font-sans">
              "{current.body}"
            </p>
          </div>
        </div>

        {/* Right: AI Output Cards */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-emerald-700 dark:text-[#a4dc32] uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Extracted Coursework & Schedule</span>
          </div>

          <div className="space-y-3">
            {/* Task Card */}
            <div className="p-3.5 rounded-xl dark:bg-[#232832] bg-slate-100 border dark:border-white/5 border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-white text-slate-900">
                  {current.task}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#aee637] dark:bg-[#bbf246] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent">
                  {current.code}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono font-medium">
                <span>Due: {current.due}</span>
                <span className="text-amber-600 dark:text-amber-400 uppercase font-semibold">Priority: {current.urgency}</span>
              </div>
            </div>

            {/* Calendar Event */}
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <span className="text-xs font-bold dark:text-white text-slate-900">
                {current.event}
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                CALENDAR SYNCED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct CTA */}
      <div className="text-center mt-10">
        <button
          onClick={onOpenDashboard}
          className="inline-flex items-center gap-2 bg-[#aee637] dark:bg-[#bbf246] hover:bg-[#9ed929] dark:hover:bg-[#aee83b] text-[#0f172a] dark:text-[#111317] border border-[#8fc91c] dark:border-transparent px-7 py-3 rounded-xl font-extrabold text-xs shadow-lg shadow-[#8fc91c]/25 transition-all cursor-pointer"
        >
          <span>Open Full Interactive Dashboard</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

// --- Website Footer ---
const WebsiteFooter = ({ onOpenDashboard }) => (
  <footer className="py-16 px-6 border-t dark:border-white/5 border-slate-300 dark:bg-[#111317] bg-[#eaedf2] select-none">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center -space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#aee637] dark:bg-[#bbf246]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
        </div>
        <span className="dark:text-white text-slate-900 font-extrabold text-sm tracking-tight">CampusFlow</span>
        <span className="dark:text-slate-600 text-slate-400">·</span>
        <span className="text-slate-500 font-medium">Academic Task & Calendar Operating System</span>
      </div>

      <div className="flex items-center gap-6 text-slate-600 font-semibold">
        <a href="#how-it-works" className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors">Workflow</a>
        <a href="#features" className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors">Features</a>
        <button onClick={onOpenDashboard} className="hover:text-emerald-700 dark:hover:text-[#bbf246] transition-colors font-bold text-emerald-800 dark:text-[#a4dc32] cursor-pointer">
          Dashboard
        </button>
      </div>

      <div className="dark:text-slate-500 text-slate-500 font-medium">
        © 2026 CampusFlow. Built for student productivity.
      </div>
    </div>
  </footer>
);

// --- Workspace Layout Shell (Matching 3-Panel Reference Image) ---
function WorkspaceLayout({ 
  user, 
  onLogout, 
  onBackToLanding, 
  onSelectOverview,
  theme, 
  onToggleTheme 
}) {
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    taskApi.list()
      .then(({ data }) => setTasks(data || []))
      .catch(() => {});
  }, [location.pathname]);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const urgentTasksCount = tasks.filter((t) => (t.urgency === 'high' || t.urgency === 'critical') && t.status !== 'completed').length;

  // Derive route name for breadcrumb
  const routeName = location.pathname === '/' 
    ? 'Overview' 
    : location.pathname.replace('/', '')

  const handleSyncEmails = async () => {
    setIsSyncing(true);
    try {
      await gmailApi.sync();
      window.location.reload();
    } catch {
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden dark:bg-[#111317] bg-[#eaedf2] transition-colors">
      {/* 1. Left Sidebar (Fixed 256px) */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        taskCount={pendingTasksCount} 
        onSelectOverview={onSelectOverview}
      />

      {/* 2. Main Middle Area (Topbar + View) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          currentRoute={routeName}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSyncEmails={handleSyncEmails}
          isSyncing={isSyncing}
          onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
          unreadCount={urgentTasksCount}
          onBackToLanding={onBackToLanding}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* 3. Right Activity & Notifications Panel (320px) */}
      {showRightPanel && (
        <div className="hidden xl:block">
          <RightPanel onClose={() => setShowRightPanel(false)} />
        </div>
      )}
    </div>
  );
}

// --- Main App Root ---
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusflow_user');
    const token = localStorage.getItem('campusflow_token');
    return (saved && token) ? JSON.parse(saved) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Active view: default to 'workspace' if logged in, otherwise 'landing'
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'landing') return 'landing';
    const token = localStorage.getItem('campusflow_token');
    return token ? 'workspace' : 'landing';
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('campusflow_theme') || 'dark');

  // Apply dark/light class to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('campusflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setActiveView('landing');
      setAuthMode('login');
      setAuthModalOpen(true);
    };
    window.addEventListener('campusflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campusflow:unauthorized', handleUnauthorized);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setActiveView('workspace');
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
    setUser(null);
    setActiveView('landing');
    navigate('/');
  };

  // Navigating to Main Website: sets view to 'landing' and navigates to '/'
  const handleBackToLanding = () => {
    setActiveView('landing');
    navigate('/');
  };

  // Navigating to Workspace Dashboard: if logged in, opens workspace; if not, opens AuthModal
  const handleOpenWorkspace = () => {
    if (user && localStorage.getItem('campusflow_token')) {
      setActiveView('workspace');
      navigate('/');
    } else {
      handleOpenAuth('login');
    }
  };

  // When Overview in sidebar is clicked: ALWAYS stays in workspace and navigates to '/'
  const handleSelectOverview = () => {
    setActiveView('workspace');
    navigate('/');
  };

  // Render workspace layout if user is authenticated and workspace is active
  if (activeView === 'workspace' && user) {
    return (
      <WorkspaceLayout 
        user={user} 
        onLogout={handleLogout} 
        onBackToLanding={handleBackToLanding}
        onSelectOverview={handleSelectOverview}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Otherwise, render the Main Website with AuthModal support
  return (
    <div className="dark:bg-[#111317] bg-[#eaedf2] min-h-screen dark:text-slate-100 text-slate-900 transition-colors">
      <WebsiteNavbar 
        onOpenDashboard={handleOpenWorkspace}
        onOpenAuth={handleOpenAuth}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        <WebsiteHero 
          onOpenDashboard={handleOpenWorkspace}
          onOpenAuth={handleOpenAuth}
          user={user}
        />

        <WebsiteWorkflow 
          onOpenDashboard={handleOpenWorkspace}
        />

        <WebsiteFeatures />

        <WebsiteDemoSimulator 
          onOpenDashboard={handleOpenWorkspace}
        />

        <WebsiteFooter 
          onOpenDashboard={handleOpenWorkspace}
        />
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
}
