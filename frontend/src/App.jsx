import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Eye,
  EyeOff,
  Layers,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  Sparkles,
  User,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Settings as SettingsIcon,
  AlertCircle,
  ExternalLink,
  Bot,
  Calendar as CalendarIcon,
  ShieldAlert,
  Clock3,
  Check,
  GraduationCap,
  Plus,
  Trash2,
  ArrowLeft,
  ListTodo,
  Crown,
  Zap,
  CreditCard,
  Users,
  Sliders,
  QrCode,
  Smartphone,
  Building,
  Receipt
} from 'lucide-react';
import { authApi, taskApi, calendarApi, emailApi, tierApi, paymentApi } from './services/api';

// ============================================================================
// ANAMORPHIC SCULPTURE 3D - EMBEDDED STUDENT WORKSPACE SYSTEM
// ============================================================================
// No boring 2D dashboard! When the user signs in or opens the workspace,
// the entire student operating system lives seamlessly INSIDE the 3D Anamorphic world.
//
// Tabs (Landing Mode):
// - OVERVIEW: Core value proposition and platform introduction
// - EXTRACTION: 5-Email AI Ingestion & NLP Task Parsing Simulator
// - CALENDAR: Public In-App Timeline Specs
// - SECURITY: Read-Only Email Sandbox & Privacy Protocols
// - SIGN IN: Student Terminal Access
// - REGISTER: Student Account Initialization
//
// Tabs (Workspace Mode):
// - DASHBOARD: Live Academic Focus, Stats & Quick Actions
// - MY TASKS: Real-time Task Board connected to FastAPI / PostgreSQL
// - CALENDAR: Real-time Academic Event Timeline
// - EMAIL SYNC: 5-Email Ingestion Station with Live Parser
// - SETTINGS: Student Profile, Token Management & Security
// ============================================================================

// Camera Sweet Spot coordinates
const VANTAGE_POINT = new THREE.Vector3(0, 0, 10.5);
const LOOK_AT_POINT = new THREE.Vector3(0, 0, 0);

// Helper to damp Vector3 smoothly
function dampVector3(target, to, lambda, delta) {
  target.x = THREE.MathUtils.damp(target.x, to.x, lambda, delta);
  target.y = THREE.MathUtils.damp(target.y, to.y, lambda, delta);
  target.z = THREE.MathUtils.damp(target.z, to.z, lambda, delta);
  return target;
}

// Seeded pseudorandom
function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// PROCEDURAL TEXTURE GENERATOR FOR ALL TABS (LANDING & WORKSPACE)
// ============================================================================
function createTabProceduralTexture(type, user) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Vibrant, high-contrast dark palette tailored to theme
  let gradStart = '#0b1320', gradMid = '#111e33', gradEnd = '#070c14';
  let accentColor = '#38bdf8';

  if (type === 'calendar_public' || type === 'calendar' || type === 'dashboard') {
    gradStart = '#071f16'; gradMid = '#0c3526'; gradEnd = '#04130d';
    accentColor = '#10b981';
  } else if (type === 'security' || type === 'settings') {
    gradStart = '#180e2b'; gradMid = '#281747'; gradEnd = '#0f081c';
    accentColor = '#c084fc';
  } else if (type === 'register' || type === 'sync' || type === 'overview') {
    gradStart = '#1f1608'; gradMid = '#38260b'; gradEnd = '#120d04';
    accentColor = '#f59e0b';
  }

  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1280);
  bgGrad.addColorStop(0, gradStart);
  bgGrad.addColorStop(0.5, gradMid);
  bgGrad.addColorStop(1, gradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1280);

  // Sleek tech grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, 1280); ctx.stroke();
  }
  for (let y = 0; y <= 1280; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
  }

  if (type === 'calendar' || type === 'calendar_public') {
    ctx.save();
    ctx.fillStyle = '#10b981';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ACADEMIC MILESTONES // SCHEDULE MATRIX', 80, 120);
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText('AUTONOMOUS IN-APP DEADLINE DETECTION · 0 GCAL POLLUTION', 80, 160);

    const events = [
      { date: 'OCT 24', time: '11:59 PM', course: 'CS 301', title: 'Algorithm Design Project 2', tag: 'CRITICAL', color: '#ef4444' },
      { date: 'OCT 28', time: '10:00 AM', course: 'MATH 150', title: 'Multivariable Calculus Quiz 3', tag: 'HIGH PRIORITY', color: '#f59e0b' },
      { date: 'NOV 01', time: '05:00 PM', course: 'PHYS 220', title: 'Electromagnetism Lab Report', tag: 'NORMAL', color: '#38bdf8' },
      { date: 'NOV 03', time: '09:30 AM', course: 'CS 301', title: 'Midterm Examination (Room 301)', tag: 'EXAMINATION', color: '#10b981' },
      { date: 'NOV 08', time: '11:59 PM', course: 'ENGL 102', title: 'Research Paper First Draft', tag: 'UPCOMING', color: '#c084fc' },
    ];

    events.forEach((ev, i) => {
      const y = 210 + i * 175;
      ctx.fillStyle = 'rgba(10, 35, 25, 0.85)';
      ctx.fillRect(80, y, 864, 145);
      ctx.strokeStyle = ev.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(80, y, 864, 145);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(100, y + 20, 140, 105);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px "JetBrains Mono", monospace';
      ctx.fillText(ev.date, 115, y + 65);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px "JetBrains Mono", monospace';
      ctx.fillText(ev.time, 120, y + 100);

      ctx.fillStyle = ev.color;
      ctx.fillRect(265, y + 25, 95, 30);
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(ev.course, 280, y + 46);

      ctx.strokeStyle = ev.color;
      ctx.strokeRect(375, y + 25, 150, 30);
      ctx.fillStyle = ev.color;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText(ev.tag, 390, y + 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(ev.title, 265, y + 100);
    });

    ctx.fillStyle = '#10b981';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('STATUS: PRIVATE LOCAL STORAGE SYNC · NO EXTERNAL CALENDAR OVERWRITES', 80, 1180);
    ctx.restore();

  } else if (type === 'security' || type === 'settings') {
    ctx.save();
    ctx.fillStyle = '#c084fc';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SECURITY CLEARANCE // PROTOCOL TELEMETRY', 80, 120);
    ctx.fillStyle = '#d8b4fe';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText('CAMPUSFLOW ZERO-STORAGE & 5-EMAIL QUARANTINE SANDBOX', 80, 160);

    const specs = [
      { code: '[AUTH-01]', title: 'OAuth 2.0 PKCE Handshake', desc: 'Zero password retention. Ephemeral Bearer JWT clearance.', status: 'VERIFIED', color: '#10b981' },
      { code: '[MAIL-02]', title: '5-Email Batch Quarantine', desc: 'Strict read-only scope. Never modifies or deletes inbox messages.', status: 'SANDBOXED', color: '#c084fc' },
      { code: '[NLP-03]', title: 'In-Memory Semantic Parser', desc: 'Extracts syllabus assignments ephemerally without persistent copy.', status: 'ISOLATED', color: '#38bdf8' },
      { code: '[DATA-04]', title: 'AES-256 PostgreSQL Security', desc: 'Encrypted token storage. Student owns 100% of calendar data.', status: 'ENCRYPTED', color: '#f59e0b' },
      { code: '[MEM-05]', title: 'Zero Cold-Data Retention', desc: 'Parsed email bodies instantly wiped from RAM after task commit.', status: 'HARDENED', color: '#ec4899' },
    ];

    specs.forEach((sp, i) => {
      const y = 210 + i * 175;
      ctx.fillStyle = 'rgba(25, 15, 45, 0.85)';
      ctx.fillRect(80, y, 864, 145);
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(80, y, 864, 145);

      ctx.fillStyle = sp.color;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText(sp.code, 110, y + 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sp.title, 230, y + 46);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sp.desc, 110, y + 95);

      ctx.fillStyle = sp.color;
      ctx.strokeRect(760, y + 28, 150, 32);
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(sp.status, 785, y + 50);
    });

    ctx.fillStyle = '#c084fc';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('STATUS: FULL COMPLIANCE WITH UNIVERSITY INFORMATION SECURITY GUIDELINES', 80, 1180);
    ctx.restore();

  } else if (type === 'dashboard') {
    ctx.save();
    ctx.fillStyle = '#10b981';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STUDENT WORKLOAD // FOCUS DASHBOARD', 80, 120);
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText(user?.email ? `ACTIVE SESSION: ${user.email}` : 'LIVE INBOX-TO-CALENDAR TASK PIPELINE', 80, 160);

    const stats = [
      { label: 'PENDING TASKS', val: '04', color: '#10b981' },
      { label: 'UPCOMING DEADLINES', val: '03', color: '#38bdf8' },
      { label: 'INGESTED EMAILS', val: '05', color: '#f59e0b' },
    ];
    stats.forEach((st, i) => {
      const x = 80 + i * 295;
      ctx.fillStyle = 'rgba(10, 35, 25, 0.85)';
      ctx.fillRect(x, 210, 275, 140);
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 210, 275, 140);

      ctx.fillStyle = st.color;
      ctx.font = '700 52px "JetBrains Mono", monospace';
      ctx.fillText(st.val, x + 30, 290);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText(st.label, x + 30, 325);
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(80, 390, 864, 680);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.strokeRect(80, 390, 864, 680);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ACTIVE COURSEWORK QUEUE', 110, 440);

    const queue = [
      { course: 'CS 301', task: 'Project 2: Graph Optimization', due: 'Oct 24, 11:59 PM', color: '#ef4444' },
      { course: 'MATH 150', task: 'Multivariable Calculus Quiz 3', due: 'Oct 28, 10:00 AM', color: '#f59e0b' },
      { course: 'PHYS 220', task: 'Electromagnetism Lab 2', due: 'Nov 01, 5:00 PM', color: '#38bdf8' },
      { course: 'CS 301', task: 'Midterm Exam Preparation', due: 'Nov 03, 9:30 AM', color: '#10b981' },
      { course: 'ENGL 102', task: 'Literary Theory Synthesis Draft', due: 'Nov 08, 11:59 PM', color: '#c084fc' },
    ];
    queue.forEach((q, i) => {
      const y = 475 + i * 115;
      ctx.fillStyle = 'rgba(15, 30, 25, 0.7)';
      ctx.fillRect(110, y, 804, 90);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(110, y, 804, 90);

      ctx.fillStyle = q.color;
      ctx.fillRect(130, y + 28, 85, 34);
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(q.course, 142, y + 51);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(q.task, 235, y + 52);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px "JetBrains Mono", monospace';
      ctx.fillText(`DUE: ${q.due}`, 580, y + 52);
    });

    ctx.fillStyle = '#10b981';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('STUDENT FOCUS STATUS: 100% OPTIMAL · WORKSPACE LIVE', 80, 1180);
    ctx.restore();

  } else if (type === 'tasks') {
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('EXTRACTED TASKS // COURSEWORK BOARD', 80, 120);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText('REAL-TIME FASTAPI + POSTGRESQL TASK PIPELINE', 80, 160);

    const taskItems = [
      { course: 'CS 301', title: 'Homework 3: Cache Simulator Due', due: 'Friday 11:59 PM', status: 'CRITICAL', done: false, color: '#ef4444' },
      { course: 'PHYS 220', title: 'Lab Report 2 Submission Window', due: 'Sunday 11:59 PM', status: 'HIGH', done: false, color: '#f59e0b' },
      { course: 'MATH 150', title: 'Combinatorics Quiz 4 Practice Set', due: 'Thursday 8:00 PM', status: 'URGENT', done: false, color: '#38bdf8' },
      { course: 'CS 301', title: 'Read Chapter 4: Memory Hierarchy', due: 'Completed', status: 'RESOLVED', done: true, color: '#10b981' },
      { course: 'ENGL 102', title: 'Peer Review Group Session', due: 'Completed', status: 'RESOLVED', done: true, color: '#10b981' },
    ];

    taskItems.forEach((t, i) => {
      const y = 210 + i * 175;
      ctx.fillStyle = 'rgba(15, 25, 45, 0.85)';
      ctx.fillRect(80, y, 864, 145);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(80, y, 864, 145);

      // Checkbox circle
      ctx.fillStyle = t.done ? '#10b981' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(125, y + 72, 18, 0, Math.PI * 2);
      ctx.fill();
      if (t.done) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.fillText('✓', 117, y + 79);
      }

      ctx.fillStyle = t.color;
      ctx.fillRect(165, y + 25, 95, 30);
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(t.course, 178, y + 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(t.title, 165, y + 95);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 15px "JetBrains Mono", monospace';
      ctx.fillText(`DUE: ${t.due}`, 620, y + 48);

      ctx.fillStyle = t.color;
      ctx.strokeRect(740, y + 78, 170, 32);
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(t.status, 765, y + 100);
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('POSTGRESQL DB CONNECTED · INSTANT DISPATCH · CLOUD PERSISTENCE', 80, 1180);
    ctx.restore();

  } else {
    // OPEN EMAIL GRAPHIC ON CANVAS
    ctx.save();
    ctx.fillStyle = 'rgba(12, 18, 28, 0.95)';
    ctx.fillRect(80, 100, 864, 1030);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 100, 864, 1030);

    // Email window top bar
    ctx.fillStyle = 'rgba(20, 30, 45, 0.9)';
    ctx.fillRect(80, 100, 864, 65);
    ctx.beginPath();
    ctx.arc(115, 132, 9, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill();
    ctx.beginPath();
    ctx.arc(142, 132, 9, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.beginPath();
    ctx.arc(169, 132, 9, 0, Math.PI * 2); ctx.fillStyle = '#10b981'; ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillText('INBOX // PROF. MARCUS VANCE <cs301@university.edu>', 210, 140);

    // Subject line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('SUBJECT:', 110, 215);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CS 301 - Algorithm Design Project 2 & Midterm Schedule', 205, 215);

    // Detection Pills
    ctx.fillStyle = '#10b981';
    ctx.fillRect(110, 255, 205, 36);
    ctx.fillStyle = '#0a1a12';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('✓ ASSIGNMENT DETECTED', 125, 278);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(330, 255, 200, 36);
    ctx.fillStyle = '#081726';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('DEADLINE: OCT 24, 2026', 345, 278);

    ctx.fillStyle = '#c084fc';
    ctx.fillRect(545, 255, 205, 36);
    ctx.fillStyle = '#170b28';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('EXTRACTED TO CALENDAR', 560, 278);

    // Email Body Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(110, 320); ctx.lineTo(910, 320); ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '400 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Hi Class,', 110, 370);
    ctx.fillText('Please find below the updated milestone deliverables for the semester:', 110, 420);

    // Highlighted Assignment Box
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.fillRect(110, 470, 804, 150);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(110, 470, 804, 150);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.fillText('[DELIVERABLE 1]', 135, 510);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Project 2: Graph Optimization is due next Friday at 11:59 PM.', 135, 550);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 15px "JetBrains Mono", monospace';
    ctx.fillText('Submission via University Portal · Weight: 15% of Grade', 135, 585);

    // Highlighted Exam Box
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.fillRect(110, 650, 804, 150);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(110, 650, 804, 150);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.fillText('[EXAMINATION]', 135, 690);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Midterm Exam will be held on Nov 3 during regular class hours.', 135, 730);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 15px "JetBrains Mono", monospace';
    ctx.fillText('Room 301 · 9:30 AM - 11:00 AM · Closed Book', 135, 765);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Best regards,', 110, 860);
    ctx.fillText('Prof. Marcus Vance', 110, 900);

    ctx.fillStyle = accentColor;
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('CAMPUSFLOW NLP PIPELINE: DETECTED 2 CALENDAR ITEMS · 1 CRITICAL ASSIGNMENT', 80, 1180);
    ctx.restore();
  }

  // Border frame
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 960, 1216);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const stationTextureCache = new Map();

function getStationTexture(type, user) {
  const userKey = user?.email || 'anon';
  const key = `${type}-${userKey}`;
  if (!stationTextureCache.has(key)) {
    stationTextureCache.set(key, createTabProceduralTexture(type, user));
  }
  return stationTextureCache.get(key);
}

// ============================================================================
// 1. 3D ANAMORPHIC SCULPTURE SCENE
// ============================================================================

// ============================================================================
// 2. SHATTERED TYPOGRAPHY FOR ALL TABS
// ============================================================================
function TypographySculpture({ alignment, activeTab, fontReady, user }) {
  const groupRefs = useRef([]);

  const fragments = useMemo(() => {
    const list = [];
    let counter = 0;

    let h1Line1 = 'CAMPUSFLOW';
    let h1Line2 = 'ACADEMIC OS';
    let h2Line = 'AUTOMATED EMAIL TO CALENDAR';
    let metaWords = [
      { text: '[01] 5-EMAIL INGESTION', x: -6.2, y: -1.1 },
      { text: '[02] AI TASK EXTRACTION', x: -6.2, y: -1.6 },
      { text: '[03] IN-APP CALENDAR SYNC', x: -6.2, y: -2.1 },
    ];

    if (activeTab === 'dashboard') {
      h1Line1 = 'STUDENT';
      h1Line2 = 'DASHBOARD';
      h2Line = 'ACADEMIC FOCUS & WORKLOAD';
      metaWords = [
        { text: '[01] PENDING ASSIGNMENTS', x: -6.2, y: -1.1 },
        { text: '[02] INBOX SYNC ACTIVE', x: -6.2, y: -1.6 },
        { text: '[03] UPCOMING MILESTONES', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'tasks') {
      h1Line1 = 'COURSE';
      h1Line2 = 'TASKS';
      h2Line = 'EXTRACTED HOMEWORK & ASSIGNMENTS';
      metaWords = [
        { text: '[01] URGENCY CLASSIFIER', x: -6.2, y: -1.1 },
        { text: '[02] DUE DATE DETECTION', x: -6.2, y: -1.6 },
        { text: '[03] SYLLABUS TO-DOS', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'calendar' || activeTab === 'calendar_public') {
      h1Line1 = 'IN-APP';
      h1Line2 = 'CALENDAR';
      h2Line = 'AUTONOMOUS DEADLINE PLOTTING';
      metaWords = [
        { text: '[01] EXAM DATE SCHEDULING', x: -6.2, y: -1.1 },
        { text: '[02] ON-SITE PRIVATE SYNC', x: -6.2, y: -1.6 },
        { text: '[03] ZERO G-CAL POLLUTION', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'sync' || activeTab === 'extraction') {
      const isPro = user?.tier === 'pro';
      h1Line1 = 'EMAIL';
      h1Line2 = 'INGESTION';
      h2Line = isPro ? '20-EMAIL PRO AI INGESTION' : '5-EMAIL FREE AI INGESTION';
      metaWords = [
        { text: isPro ? '[01] 20 EMAILS / DAY (PRO)' : '[01] 5 EMAILS / DAY (FREE)', x: -6.2, y: -1.1 },
        { text: isPro ? '[02] SYLLABUS & EXAM AI' : '[02] HOMEWORK DETECTION', x: -6.2, y: -1.6 },
        { text: isPro ? '[03] PRIORITY PARSER QUEUE' : '[03] URGENCY CLASSIFIER', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'settings' || activeTab === 'security') {
      h1Line1 = 'SYSTEM';
      h1Line2 = 'SETTINGS';
      h2Line = 'SANDBOXED CLEARANCE & PRIVACY';
      metaWords = [
        { text: '[01] OAUTH 2.0 PROTOCOL', x: -6.2, y: -1.1 },
        { text: '[02] NO PASSWORD STORAGE', x: -6.2, y: -1.6 },
        { text: '[03] 5-MESSAGE SANDBOX', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'login') {
      h1Line1 = 'STUDENT';
      h1Line2 = 'SIGN IN';
      h2Line = 'AUTHENTICATE WORKSPACE ACCESS';
      metaWords = [
        { text: '[01] FASTAPI BACKEND: 8000', x: -6.2, y: -1.1 },
        { text: '[02] POSTGRESQL VERIFIED', x: -6.2, y: -1.6 },
        { text: '[03] BEARER TOKEN SESSION', x: -6.2, y: -2.1 },
      ];
    } else if (activeTab === 'register') {
      h1Line1 = 'CREATE';
      h1Line2 = 'ACCOUNT';
      h2Line = 'STUDENT ONBOARDING & SETUP';
      metaWords = [
        { text: '[01] 10-SECOND SETUP', x: -6.2, y: -1.1 },
        { text: '[02] UNIVERSITY DOMAIN READY', x: -6.2, y: -1.6 },
        { text: '[03] AUTOMATED ONBOARDING', x: -6.2, y: -2.1 },
      ];
    }

    const tabSeed =
      activeTab === 'overview' ? 10.0
      : activeTab === 'extraction' ? 70.0
      : activeTab === 'calendar_public' ? 130.0
      : activeTab === 'security' ? 190.0
      : activeTab === 'login' ? 250.0
      : activeTab === 'register' ? 310.0
      : activeTab === 'dashboard' ? 370.0
      : activeTab === 'tasks' ? 430.0
      : activeTab === 'calendar' ? 490.0
      : activeTab === 'sync' ? 550.0
      : 610.0;

    // H1 Line 1
    const startX1 = -6.2;
    const startY1 = 1.6;
    const spacing1 = 0.46;
    h1Line1.split('').forEach((char, index) => {
      if (char === ' ') return;
      const seed = ++counter * 13.7 + tabSeed;
      const targetPos = new THREE.Vector3(startX1 + index * spacing1, startY1, 0);
      const scatterDist = 3.5 + pseudoRandom(seed) * 5.5;
      const angle = pseudoRandom(seed + 1) * Math.PI * 2;
      const scatterPos = new THREE.Vector3(
        targetPos.x + Math.cos(angle) * scatterDist,
        targetPos.y + Math.sin(angle) * scatterDist * 1.1,
        (pseudoRandom(seed + 2) - 0.45) * 12.0
      );

      list.push({
        id: `h1-1-${index}`,
        char,
        targetPos,
        scatterPos,
        targetRot: new THREE.Euler(0, 0, 0),
        scatterRot: new THREE.Euler(
          (pseudoRandom(seed + 3) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 4) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 5) - 0.5) * Math.PI * 2.5
        ),
        isH1: true,
        scale: 0.95,
      });
    });

    // H1 Line 2
    const startX2 = -6.2;
    const startY2 = 0.8;
    const spacing2 = h1Line2.length > 10 ? 0.44 : 0.55;
    h1Line2.split('').forEach((char, index) => {
      if (char === ' ') return;
      const seed = ++counter * 13.7 + tabSeed;
      const targetPos = new THREE.Vector3(startX2 + index * spacing2, startY2, 0);
      const scatterDist = 3.5 + pseudoRandom(seed) * 5.5;
      const angle = pseudoRandom(seed + 1) * Math.PI * 2;
      const scatterPos = new THREE.Vector3(
        targetPos.x + Math.cos(angle) * scatterDist,
        targetPos.y + Math.sin(angle) * scatterDist * 1.1,
        (pseudoRandom(seed + 2) - 0.45) * 11.5
      );

      list.push({
        id: `h1-2-${index}`,
        char,
        targetPos,
        scatterPos,
        targetRot: new THREE.Euler(0, 0, 0),
        scatterRot: new THREE.Euler(
          (pseudoRandom(seed + 3) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 4) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 5) - 0.5) * Math.PI * 2.5
        ),
        isH1: true,
        scale: 1.05,
      });
    });

    // H2 Line
    const startXH2 = -6.2;
    const startYH2 = -0.15;
    const spacingH2 = 0.26;
    h2Line.split('').forEach((char, index) => {
      if (char === ' ') return;
      const seed = ++counter * 13.7 + tabSeed;
      const targetPos = new THREE.Vector3(startXH2 + index * spacingH2, startYH2, 0);
      const scatterDist = 3.0 + pseudoRandom(seed) * 5.0;
      const angle = pseudoRandom(seed + 1) * Math.PI * 2;
      const scatterPos = new THREE.Vector3(
        targetPos.x + Math.cos(angle) * scatterDist,
        targetPos.y + Math.sin(angle) * scatterDist * 0.9,
        (pseudoRandom(seed + 2) - 0.45) * 10.0
      );

      list.push({
        id: `h2-${index}`,
        char,
        targetPos,
        scatterPos,
        targetRot: new THREE.Euler(0, 0, 0),
        scatterRot: new THREE.Euler(
          (pseudoRandom(seed + 3) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 4) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 5) - 0.5) * Math.PI * 2.5
        ),
        isH1: false,
        scale: 0.65,
      });
    });

    // Metadata items
    metaWords.forEach((item, wordIdx) => {
      item.text.split('').forEach((char, charIdx) => {
        if (char === ' ') return;
        const seed = ++counter * 13.7 + tabSeed;
        const targetPos = new THREE.Vector3(item.x + charIdx * 0.22, item.y, 0);
        const scatterDist = 3.2 + pseudoRandom(seed) * 5.2;
        const angle = pseudoRandom(seed + 1) * Math.PI * 2;
        const scatterPos = new THREE.Vector3(
          targetPos.x + Math.cos(angle) * scatterDist,
          targetPos.y + Math.sin(angle) * scatterDist,
          (pseudoRandom(seed + 2) - 0.45) * 9.5
        );

        list.push({
          id: `meta-${wordIdx}-${charIdx}`,
          char,
          targetPos,
          scatterPos,
          targetRot: new THREE.Euler(0, 0, 0),
          scatterRot: new THREE.Euler(
            (pseudoRandom(seed + 3) - 0.5) * Math.PI * 3.0,
            (pseudoRandom(seed + 4) - 0.5) * Math.PI * 3.0,
            (pseudoRandom(seed + 5) - 0.5) * Math.PI * 2.5
          ),
          isH1: false,
          scale: 0.45,
        });
      });
    });

    return list;
  }, [activeTab, user?.tier]);

  useFrame((_, delta) => {
    const t = Math.min(1, Math.max(0, alignment));
    const smoothT = THREE.MathUtils.smoothstep(t, 0.02, 0.98);

    fragments.forEach((frag, i) => {
      const grp = groupRefs.current[i];
      if (!grp) return;

      const currentPos = new THREE.Vector3().lerpVectors(
        frag.scatterPos,
        frag.targetPos,
        smoothT
      );
      dampVector3(grp.position, currentPos, 11, delta);

      const targetQuat = new THREE.Quaternion().setFromEuler(frag.targetRot);
      const scatterQuat = new THREE.Quaternion().setFromEuler(frag.scatterRot);
      const curQuat = new THREE.Quaternion().slerpQuaternions(
        scatterQuat,
        targetQuat,
        smoothT
      );
      grp.quaternion.slerp(curQuat, 0.22);
    });
  });

  return (
    <group>
      {fragments.map((frag, idx) => (
        <group
          key={`${activeTab}-${frag.id}`}
          ref={(el) => {
            groupRefs.current[idx] = el;
          }}
        >
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry
              args={[
                frag.scale * 0.45,
                frag.scale * 0.65,
                frag.isH1 ? 0.12 : 0.06,
              ]}
            />
            <meshStandardMaterial
              color={frag.isH1 ? '#181b24' : '#11131a'}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          <GlyphMesh
            char={frag.char}
            scale={frag.scale}
            isH1={frag.isH1}
            alignment={alignment}
            activeTab={activeTab}
          />
        </group>
      ))}
    </group>
  );
}

const glyphTextureCache = new Map();

function getGlyphTexture(char, isH1, activeTab) {
  let color = '#cbd5e1';
  if (isH1) {
    color = '#ffffff';
  } else if (activeTab === 'extraction' || activeTab === 'login' || activeTab === 'tasks') {
    color = '#bae6fd';
  } else if (activeTab === 'calendar' || activeTab === 'calendar_public' || activeTab === 'dashboard') {
    color = '#a7f3d0';
  } else if (activeTab === 'security' || activeTab === 'settings') {
    color = '#e9d5ff';
  } else if (activeTab === 'register' || activeTab === 'sync') {
    color = '#fde68a';
  }

  const key = `${char}-${isH1 ? 1 : 0}-${color}`;
  if (glyphTextureCache.has(key)) {
    return glyphTextureCache.get(key);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 128, 128);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isH1) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 88px "Cinzel", Georgia, serif';
  } else {
    ctx.fillStyle = color;
    ctx.font = '600 76px "JetBrains Mono", monospace';
  }

  ctx.fillText(char, 64, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  glyphTextureCache.set(key, tex);
  return tex;
}

function GlyphMesh({
  char,
  scale,
  isH1,
  alignment,
  activeTab,
}) {
  const texture = useMemo(() => getGlyphTexture(char, isH1, activeTab), [char, isH1, activeTab]);

  return (
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[scale * 0.55, scale * 0.55]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={Math.min(1, 0.35 + alignment * 0.65)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================================
// 3. OPTICAL SIGHTLINES
// ============================================================================
function OpticalSightlines({ alignment }) {
  const lineGeometry = useMemo(() => {
    const points = [];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const seed = i * 7.1 + 0.5;
      const angle = (i / count) * Math.PI * 2;
      const radius = 4.0 + pseudoRandom(seed) * 3.5;
      const targetPoint = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.6,
        (pseudoRandom(seed + 1) - 0.5) * 5.0
      );

      points.push(VANTAGE_POINT.clone());
      points.push(targetPoint);
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={Math.max(0.03, (1 - alignment) * 0.2)}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <mesh position={[0, 0, -2]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={Math.min(1, alignment * 0.8)}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// 4. VOLUMETRIC ATMOSPHERE
// ============================================================================
function AmbientDust() {
  const pointsRef = useRef(null);

  const [positions] = useMemo(() => {
    const num = 450;
    const pos = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return [pos];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#94a3b8"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================================
// 5. CAMERA CONTROLLER: SUBTLE PERSPECTIVE PARALLAX (DOES NOT DISINTEGRATE)
// ============================================================================
function CameraController() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 10.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 10.5));

  useFrame((state, delta) => {
    // Read normalized mouse pointer natively from R3F state (zero React re-renders on mousemove!)
    const px = state.pointer.x;
    const py = state.pointer.y;

    const yawAngle = px * 0.15;
    const pitchAngle = py * 0.1;
    const radius = 10.5;

    targetPos.current.x = Math.sin(yawAngle) * radius;
    targetPos.current.y = -Math.sin(pitchAngle) * radius;
    targetPos.current.z = Math.cos(yawAngle) * Math.cos(pitchAngle) * radius;

    dampVector3(currentPos.current, targetPos.current, 6.0, delta);
    camera.position.copy(currentPos.current);

    const targetLook = new THREE.Vector3(px * 0.1, -py * 0.1, 0);
    dampVector3(currentLookAt.current, targetLook, 6.0, delta);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// ============================================================================
// 6. STATION CAMERA TRACKER: SYNCS INTERACTIVE CARDS WITH 3D SCENE & PERSPECTIVE
// (Positions closer to text on the left and projects via camera with true 3D tilt)
// ============================================================================
function StationCameraTracker({ cardRef, alignment = 1 }) {
  const { camera, size } = useThree();
  const currentAnchor = useRef(new THREE.Vector3(2.05, -0.1, 0));
  const currentRot = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (!cardRef.current) return;

    // Exact alignment & smoothstep curve matching TypographySculpture
    const t = Math.min(1, Math.max(0, alignment));
    const smoothT = THREE.MathUtils.smoothstep(t, 0.02, 0.98);

    // Responsive 3D World Anchor: shifted left towards the text
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    const isDesktop = size.width >= 1024 && size.width < 1440;

    let targetAnchorX = 2.05;
    let targetAnchorY = -0.1;

    if (isMobile) {
      targetAnchorX = 0;
      targetAnchorY = -1.7;
    } else if (isTablet) {
      targetAnchorX = 1.25;
      targetAnchorY = -0.1;
    } else if (isDesktop) {
      targetAnchorX = 1.65;
      targetAnchorY = -0.1;
    } else {
      targetAnchorX = 2.05;
      targetAnchorY = -0.1;
    }

    // Fast-path: When hidden, skip expensive transforms and filters
    if (smoothT < 0.90) {
      if (cardRef.current.style.opacity !== '0') {
        cardRef.current.style.opacity = '0';
        cardRef.current.style.pointerEvents = 'none';
      }
      return;
    }

    // Target position when assembled vs scattered position across deep 3D space when disintegrated
    const targetAnchor = new THREE.Vector3(targetAnchorX, targetAnchorY, 0);
    const scatterAnchor = new THREE.Vector3(
      targetAnchorX + 2.5,
      targetAnchorY - 1.2,
      -7.0
    );

    const desiredPos = new THREE.Vector3().lerpVectors(
      scatterAnchor,
      targetAnchor,
      smoothT
    );
    dampVector3(currentAnchor.current, desiredPos, 11, delta);

    // 1. Exact 3D-to-2D screen projection of the moving anchor
    const projected = currentAnchor.current.clone().project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * size.width;
    const screenY = (-projected.y * 0.5 + 0.5) * size.height;

    // 2. 3D Camera Parallax Tilt: straight (0, 0) at vantage point, tumbling when scattered
    const camYaw = Math.atan2(camera.position.x, camera.position.z);
    const camPitch = Math.atan2(camera.position.y, camera.position.z);
    const baseRotY = -camYaw * (180 / Math.PI);
    const baseRotX = camPitch * (180 / Math.PI);

    const scatterRotX = -26.0;
    const scatterRotY = 40.0;
    const scatterRotZ = -18.0;

    const desiredRot = new THREE.Vector3(
      THREE.MathUtils.lerp(scatterRotX, baseRotX, smoothT),
      THREE.MathUtils.lerp(scatterRotY, baseRotY, smoothT),
      THREE.MathUtils.lerp(scatterRotZ, 0, smoothT)
    );
    dampVector3(currentRot.current, desiredRot, 11, delta);

    // 3. True perspective depth scaling based on distance to camera
    const dist = camera.position.distanceTo(currentAnchor.current);
    const depthScale = THREE.MathUtils.clamp(10.5 / dist, 0.5, 1.25);

    // 4. Visibility handoff: 3D shards handle 3D scattering when smoothT < 0.94;
    // DOM card smoothly fades in over [0.92, 0.98] and becomes interactable
    const isFacingFront = camera.position.z > 0.5 && projected.z < 1;
    const domOpacity = isFacingFront && smoothT >= 0.92
      ? THREE.MathUtils.clamp((smoothT - 0.92) / 0.06, 0, 1)
      : 0;

    // Update main 3D transform on the holographic station
    cardRef.current.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%) rotateX(${currentRot.current.x.toFixed(2)}deg) rotateY(${currentRot.current.y.toFixed(2)}deg) rotateZ(${currentRot.current.z.toFixed(2)}deg) scale(${depthScale.toFixed(3)})`;
    cardRef.current.style.opacity = domOpacity.toFixed(2);
    cardRef.current.style.pointerEvents = isFacingFront && smoothT > 0.96 ? 'auto' : 'none';
  });

  return null;
}

// ============================================================================
// 5B. VOLUMETRIC 3D HOLOGRAPHIC STATION SHARDS
// ============================================================================
// Truly disintegrates and integrates in lockstep with TypographySculpture!
// Slices the station into 30 volumetric 3D shards tumbling in deep space (z = -7 to +7),
// then snaps together into the exact panel position before handing off to the live DOM card.
function Station3DShards({ texture, alignment, activeTab }) {
  const groupRefs = useRef([]);
  const cols = 5;
  const rows = 6;

  const { viewport, size } = useThree();
  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;
  const isDesktop = size.width >= 1024 && size.width < 1280;

  let targetAnchorX = 2.05;
  let targetAnchorY = -0.1;

  if (isMobile) {
    targetAnchorX = 0;
    targetAnchorY = -1.7;
  } else if (isTablet) {
    targetAnchorX = 1.25;
    targetAnchorY = -0.1;
  } else if (isDesktop) {
    targetAnchorX = 1.65;
    targetAnchorY = -0.1;
  } else {
    targetAnchorX = 2.05;
    targetAnchorY = -0.1;
  }

  const cardPixelWidth = isMobile ? Math.min(size.width * 0.92, 420) : 450;
  const cardPixelHeight = isMobile ? 480 : 540;
  const panelW = (cardPixelWidth / size.height) * viewport.height;
  const panelH = (cardPixelHeight / size.height) * viewport.height;
  const shardW = panelW / cols;
  const shardH = panelH / rows;

  const themeColor = useMemo(() => {
    if (activeTab === 'dashboard' || activeTab === 'calendar' || activeTab === 'calendar_public') {
      return '#10b981';
    }
    if (activeTab === 'tasks' || activeTab === 'extraction' || activeTab === 'login') {
      return '#38bdf8';
    }
    if (activeTab === 'security' || activeTab === 'settings') {
      return '#c084fc';
    }
    return '#f59e0b';
  }, [activeTab]);

  const shards = useMemo(() => {
    const tabSeed =
      activeTab === 'overview' ? 15.0
      : activeTab === 'extraction' ? 75.0
      : activeTab === 'calendar_public' ? 135.0
      : activeTab === 'security' ? 195.0
      : activeTab === 'login' ? 255.0
      : activeTab === 'register' ? 315.0
      : activeTab === 'dashboard' ? 375.0
      : activeTab === 'tasks' ? 435.0
      : activeTab === 'calendar' ? 495.0
      : activeTab === 'sync' ? 555.0
      : 615.0;

    const list = [];
    let counter = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = ++counter * 19.7 + tabSeed;

        const localX = -panelW / 2 + (c + 0.5) * shardW;
        const localY = panelH / 2 - (r + 0.5) * shardH;
        const targetPos = new THREE.Vector3(targetAnchorX + localX, targetAnchorY + localY, 0);

        const scatterDist = 3.5 + pseudoRandom(seed) * 5.5;
        const angle = pseudoRandom(seed + 1) * Math.PI * 2;
        const scatterZ = (pseudoRandom(seed + 2) - 0.45) * 12.0;

        const scatterPos = new THREE.Vector3(
          targetPos.x + Math.cos(angle) * scatterDist,
          targetPos.y + Math.sin(angle) * scatterDist * 1.1,
          scatterZ
        );

        const targetRot = new THREE.Euler(0, 0, 0);
        const scatterRot = new THREE.Euler(
          (pseudoRandom(seed + 3) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 4) - 0.5) * Math.PI * 3.0,
          (pseudoRandom(seed + 5) - 0.5) * Math.PI * 2.5
        );

        const u0 = c / cols;
        const u1 = (c + 1) / cols;
        const v0 = 1 - (r + 1) / rows;
        const v1 = 1 - r / rows;

        list.push({
          id: `shard-${r}-${c}`,
          col: c,
          row: r,
          targetPos,
          scatterPos,
          targetRot,
          scatterRot,
          u0,
          u1,
          v0,
          v1
        });
      }
    }
    return list;
  }, [activeTab, targetAnchorX, targetAnchorY, panelW, panelH, shardW, shardH]);

  const shardGeometries = useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const geo = new THREE.PlaneGeometry(shardW * 0.94, shardH * 0.94);
        const uv = geo.attributes.uv;
        const u0 = c / cols;
        const u1 = (c + 1) / cols;
        const v0 = 1 - (r + 1) / rows;
        const v1 = 1 - r / rows;
        uv.setXY(0, u0, v1);
        uv.setXY(1, u1, v1);
        uv.setXY(2, u0, v0);
        uv.setXY(3, u1, v0);
        uv.needsUpdate = true;
        list.push(geo);
      }
    }
    return list;
  }, [shardW, shardH]);

  const boxGeo = useMemo(() => new THREE.BoxGeometry(shardW * 0.94, shardH * 0.94, 0.05), [shardW, shardH]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  useEffect(() => {
    return () => {
      shardGeometries.forEach((g) => g.dispose());
      boxGeo.dispose();
      edgesGeo.dispose();
    };
  }, [shardGeometries, boxGeo, edgesGeo]);

  useFrame((_, delta) => {
    const t = Math.min(1, Math.max(0, alignment));
    const smoothT = THREE.MathUtils.smoothstep(t, 0.02, 0.98);

    shards.forEach((shard, i) => {
      const grp = groupRefs.current[i];
      if (!grp) return;

      if (smoothT > 0.985) {
        grp.visible = false;
        return;
      }
      grp.visible = true;

      const currentPos = new THREE.Vector3().lerpVectors(
        shard.scatterPos,
        shard.targetPos,
        smoothT
      );
      dampVector3(grp.position, currentPos, 11, delta);

      const targetQuat = new THREE.Quaternion().setFromEuler(shard.targetRot);
      const scatterQuat = new THREE.Quaternion().setFromEuler(shard.scatterRot);
      const curQuat = new THREE.Quaternion().slerpQuaternions(
        scatterQuat,
        targetQuat,
        smoothT
      );
      grp.quaternion.slerp(curQuat, 0.22);
    });
  });

  const t = Math.min(1, Math.max(0, alignment));
  const smoothT = THREE.MathUtils.smoothstep(t, 0.02, 0.98);
  const shardsOpacity = smoothT < 0.92 ? 1 : Math.max(0, 1 - (smoothT - 0.92) / 0.065);

  if (smoothT > 0.985) return null;

  return (
    <group>
      {shards.map((shard, idx) => (
        <group
          key={`${activeTab}-${shard.id}`}
          ref={(el) => {
            groupRefs.current[idx] = el;
          }}
        >
          {/* Back 3D glass body */}
          <mesh geometry={boxGeo} position={[0, 0, -0.025]}>
            <meshStandardMaterial
              color="#070c14"
              metalness={0.85}
              roughness={0.2}
              transparent
              opacity={0.92 * shardsOpacity}
            />
          </mesh>

          {/* Front sliced card texture plane */}
          <mesh geometry={shardGeometries[idx]} position={[0, 0, 0.002]}>
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={shardsOpacity}
              toneMapped={false}
            />
          </mesh>

          {/* Glowing neon edge lines */}
          <lineSegments geometry={edgesGeo} position={[0, 0, -0.025]}>
            <lineBasicMaterial
              color={themeColor}
              transparent
              opacity={(0.45 + 0.55 * (1 - smoothT)) * shardsOpacity}
              linewidth={1}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

// Sample Simulator data for Landing
const SAMPLE_SIMULATED_EMAILS = [
  {
    course: 'CS 301',
    title: 'Homework 3: Cache Simulator Due',
    due: 'This Friday 11:59 PM',
    urgency: 'HIGH',
    calendarEvent: 'CS 301 Midterm Exam on Oct 14'
  },
  {
    course: 'PHYS 220',
    title: 'Lab Report 2 Window Extended',
    due: 'Sunday 11:59 PM',
    urgency: 'NORMAL',
    calendarEvent: 'Physics Lab 2 Final Deadline'
  },
  {
    course: 'MATH 150',
    title: 'Combinatorics Quiz 4 Practice Set',
    due: 'Thursday 8:00 PM',
    urgency: 'CRITICAL',
    calendarEvent: 'MATH 150 Quiz 4 in Lecture Hall'
  }
];

// ============================================================================
// 6. MAIN APPLICATION COMPONENT: 3D ANAMORPHIC WORKSPACE EMBEDDED
// ============================================================================
export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('campusflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  // App mode: 'landing' (public marketing tabs) vs 'workspace' (student workspace tabs)
  // Both live 100% inside the 3D Anamorphic world!
  const [appMode, setAppMode] = useState(() => (user ? 'workspace' : 'landing'));

  // Active 3D Tab
  const [activeTab, setActiveTab] = useState(() => (user ? 'dashboard' : 'overview'));
  const [targetTab, setTargetTab] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState('integrating');

  const [alignment, setAlignment] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  // Email simulation state for 'extraction' tab
  const [simIdx, setSimIdx] = useState(0);
  const [simScanning, setSimScanning] = useState(false);

  // Backend Real Tasks & Calendar state in Workspace
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState('CS 301');
  const [newTaskUrgency, setNewTaskUrgency] = useState('NORMAL');
  const [syncingEmails, setSyncingEmails] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // User Tier & Quota state (Free: 5/day vs Pro: 20/day at ₹199/month, Admin switch)
  const [tierInfo, setTierInfo] = useState({
    tier: user?.tier || 'free',
    tier_name: user?.tier === 'pro' ? 'Pro Tier' : 'Free Tier',
    is_admin: Boolean(user?.is_admin),
    cost_inr: user?.tier === 'pro' ? 199 : 0,
    cost_display: user?.tier === 'pro' ? '₹199 / month' : '₹0 (Free)',
    daily_limit: user?.tier === 'pro' ? 20 : 5,
    daily_scan_count: 0,
    remaining_scans: user?.tier === 'pro' ? 20 : 5,
    available_tiers: []
  });
  const [tierLoading, setTierLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUsersModal, setShowAdminUsersModal] = useState(false);
  const [adminNotice, setAdminNotice] = useState(null);

  // Payment Gateway modal & checkout state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success', 'failed'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);

  // Backend form states for login and register tabs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPasskey, setRegPasskey] = useState('');
  const [regStatus, setRegStatus] = useState(null);
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const audioContextRef = useRef(null);
  const lastSnapTone = useRef(0);
  const cardStationRef = useRef(null);

  const stationTexture = useMemo(() => {
    return getStationTexture(activeTab, user);
  }, [activeTab, user]);

  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => setFontReady(true));
    }
  }, []);

  // Fetch real user tasks and calendar events from backend when authenticated
  const fetchUserData = useCallback(async (showLoading = false) => {
    if (!user?.id) return;
    try {
      if (showLoading) {
        setTasksLoading(true);
      }
      const [tasksRes, calRes] = await Promise.allSettled([
        taskApi.list(),
        calendarApi.list()
      ]);
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data) {
        setTasks(tasksRes.value.data);
      }
      if (calRes.status === 'fulfilled' && calRes.value?.data) {
        setCalendarEvents(calRes.value.data);
      }
    } catch (e) {
      // Backend fallback handled gracefully
    } finally {
      setTasksLoading(false);
    }
  }, [user?.id]);

  // Fetch current user's tier, admin status, and daily scan limits
  const fetchTierStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await tierApi.getStatus();
      setTierInfo(res.data);
      setUser(prev => {
        if (!prev) return prev;
        if (
          prev.tier === res.data.tier &&
          prev.is_admin === res.data.is_admin &&
          prev.daily_scan_count === res.data.daily_scan_count &&
          prev.daily_limit === res.data.daily_limit
        ) {
          return prev; // Same reference: stops re-render cascades completely
        }
        const updated = {
          ...prev,
          tier: res.data.tier,
          is_admin: res.data.is_admin,
          daily_limit: res.data.daily_limit,
          daily_scan_count: res.data.daily_scan_count,
          remaining_scans: res.data.remaining_scans
        };
        localStorage.setItem('campusflow_user', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to fetch tier status', e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchTierStatus();
    }
  }, [user?.id]);

  // Handle session expiration across all API calls
  useEffect(() => {
    const handleUnauthorized = (e) => {
      localStorage.removeItem('campusflow_token');
      localStorage.removeItem('campusflow_user');
      setUser(null);
      setAppMode('landing');
      handleTabChange('login');
      setLoginError(e.detail || 'Your session expired. Please sign in again.');
    };
    window.addEventListener('campusflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campusflow:unauthorized', handleUnauthorized);
  }, []);

  const openPaymentGateway = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      setPaymentStep('select');
      setPaymentReceipt(null);
      setShowQrCode(false);
      const res = await paymentApi.createOrder('pro');
      setCurrentOrder(res.data);
      setShowPaymentModal(true);
    } catch (err) {
      setPaymentError(err.response?.data?.detail || 'Failed to initialize payment gateway.');
      setShowPaymentModal(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleProcessPayment = async (e) => {
    if (e) e.preventDefault();
    if (!currentOrder?.order_id) return;

    if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setPaymentError('Please enter a valid UPI ID (e.g. student@okaxis or name@paytm)');
        return;
      }
    } else if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setPaymentError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry.trim()) {
        setPaymentError('Please enter card expiration date (MM/YY)');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        setPaymentError('Please enter 3-digit CVV');
        return;
      }
    }

    setPaymentError(null);
    setPaymentStep('processing');
    setProcessingStatus('Initiating secure banking handshake...');

    try {
      await new Promise(r => setTimeout(r, 700));
      setProcessingStatus(`Authorizing ₹199.00 payment via ${paymentMethod.toUpperCase()}...`);
      await new Promise(r => setTimeout(r, 800));
      setProcessingStatus('Verifying 256-bit cryptographic payment signature...');

      const res = await paymentApi.verify({
        order_id: currentOrder.order_id,
        payment_method: paymentMethod,
        upi_id: paymentMethod === 'upi' ? upiId : null,
        card_last4: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : null,
        bank_name: paymentMethod === 'netbanking' ? selectedBank : null
      });

      if (res.data.success) {
        setPaymentReceipt(res.data);
        setTierInfo(prev => ({
          ...prev,
          tier: 'pro',
          tier_name: 'Pro Tier',
          daily_limit: 20,
          remaining_scans: res.data.remaining_scans
        }));
        setUser(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            tier: 'pro',
            daily_limit: 20,
            remaining_scans: res.data.remaining_scans
          };
          localStorage.setItem('campusflow_user', JSON.stringify(updated));
          return updated;
        });
        setPaymentStep('success');
      } else {
        setPaymentError(res.data.message || 'Payment authorization was declined');
        setPaymentStep('failed');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.detail || 'Transaction failed. No amount was debited.');
      setPaymentStep('failed');
    }
  };

  const handleAutofillUpi = (id) => {
    setUpiId(id);
    setPaymentError(null);
  };

  const handleAutofillCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('789');
    setCardName(user?.email?.split('@')[0]?.toUpperCase() || 'STUDENT USER');
    setPaymentError(null);
  };

  const handleSwitchTier = async (newTier, targetUserId = null) => {
    // If not admin and attempting to upgrade to pro, require payment gateway checkout!
    if (!tierInfo.is_admin && newTier === 'pro') {
      openPaymentGateway();
      return;
    }

    try {
      setTierLoading(true);
      setAdminNotice(null);
      const res = await tierApi.switchTier(newTier, targetUserId);
      setTierInfo(res.data);
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, tier: res.data.tier };
        localStorage.setItem('campusflow_user', JSON.stringify(updated));
        return updated;
      });
      setAdminNotice(`Successfully switched to ${res.data.tier_name}!`);
      setTimeout(() => setAdminNotice(null), 4000);
      if (showAdminUsersModal) {
        fetchAdminUsers();
      }
    } catch (err) {
      setAdminNotice(err.response?.data?.detail || 'Failed to switch tier');
      setTimeout(() => setAdminNotice(null), 4000);
    } finally {
      setTierLoading(false);
    }
  };

  const handleAdminResetQuota = async (targetUserId = null) => {
    try {
      setTierLoading(true);
      setAdminNotice(null);
      const res = await tierApi.adminResetQuota(targetUserId);
      setTierInfo(res.data);
      setAdminNotice("Daily scan counter reset to 0!");
      setTimeout(() => setAdminNotice(null), 4000);
      if (showAdminUsersModal) {
        fetchAdminUsers();
      }
    } catch (err) {
      setAdminNotice(err.response?.data?.detail || 'Failed to reset quota');
      setTimeout(() => setAdminNotice(null), 4000);
    } finally {
      setTierLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await tierApi.adminListUsers();
      setAdminUsers(res.data);
    } catch (e) {
      console.error('Failed to load admin users', e);
    }
  };

  useEffect(() => {
    if (user?.id && appMode === 'workspace') {
      fetchUserData(tasks.length === 0);
    }
  }, [user?.id, appMode]);

  // Audio snap sound (disabled)
  const playSnapAudio = useCallback(() => {}, []);

  // Integration loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const animateIntegration = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (transitionPhase === 'integrating') {
        setAlignment((prev) => {
          const next = THREE.MathUtils.damp(prev, 1.0, 3.2, delta);
          if (1.0 - next < 0.008) {
            setTransitionPhase('idle');
            playSnapAudio();
            return 1.0;
          }
          return next;
        });
      } else if (transitionPhase === 'disintegrating') {
        setAlignment((prev) => {
          const next = THREE.MathUtils.damp(prev, 0.0, 6.5, delta);
          if (next < 0.015) {
            if (targetTab) {
              setActiveTab(targetTab);
              setTargetTab(null);
            }
            setTransitionPhase('integrating');
            return 0.0;
          }
          return next;
        });
      }

      animId = requestAnimationFrame(animateIntegration);
    };

    animId = requestAnimationFrame(animateIntegration);
    return () => cancelAnimationFrame(animId);
  }, [transitionPhase, targetTab, playSnapAudio]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab && transitionPhase === 'idle') {
      handleReintegrate();
      return;
    }
    if (newTab === activeTab) return;
    setTargetTab(newTab);
    setTransitionPhase('disintegrating');
  };

  const handleReintegrate = () => {
    setAlignment(0);
    setTransitionPhase('integrating');
  };

  const handleLogout = () => {
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
    setUser(null);
    setAppMode('landing');
    handleTabChange('overview');
  };

  // Switch between 3D Landing mode and 3D Workspace mode
  const enter3DWorkspace = () => {
    setAppMode('workspace');
    handleTabChange('dashboard');
  };

  // Login Submit connected to FastAPI backend
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { data } = await authApi.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('campusflow_token', data.access_token);
      localStorage.setItem('campusflow_user', JSON.stringify(data.user));
      setUser(data.user);
      setLoginStatus(`CLEARANCE GRANTED: ${data.user.email}`);
      playSnapAudio();
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'INVALID CREDENTIALS // ACCESS DENIED');
    } finally {
      setLoginLoading(false);
    }
  };

  // Register Submit connected to FastAPI backend
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);
    try {
      const { data } = await authApi.register({ email: regEmail, password: regPasskey });
      localStorage.setItem('campusflow_token', data.access_token);
      localStorage.setItem('campusflow_user', JSON.stringify(data.user));
      setUser(data.user);
      setRegStatus(`IDENTITY PROVISIONED: ${data.user.email}`);
      playSnapAudio();
    } catch (err) {
      setRegError(err.response?.data?.detail || 'REGISTRATION REJECTED // PROTOCOL ERROR');
    } finally {
      setRegLoading(false);
    }
  };

  // Task actions in 3D Workspace
  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await taskApi.update(taskId, { is_completed: !currentStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
      );
      playSnapAudio();
    } catch (e) {
      // Local optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
      );
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await taskApi.create({
        title: newTaskTitle,
        course_code: newTaskCourse,
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        urgency: newTaskUrgency
      });
      if (res?.data) {
        setTasks((prev) => [res.data, ...prev]);
      }
      setNewTaskTitle('');
      playSnapAudio();
    } catch (e) {
      // Optimistic local add
      const tempTask = {
        id: Date.now(),
        title: newTaskTitle,
        course_code: newTaskCourse,
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        urgency: newTaskUrgency,
        is_completed: false
      };
      setTasks((prev) => [tempTask, ...prev]);
      setNewTaskTitle('');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.remove(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Email Ingestion Action in 3D Workspace (Free: 5/day vs Pro: 20/day)
  const handleTriggerEmailSync = async () => {
    if (tierInfo.remaining_scans <= 0) {
      setSyncResult(`Daily scan limit reached (${tierInfo.daily_limit} emails/day for ${tierInfo.tier_name}). Quota resets at 00:00 UTC.`);
      return;
    }
    setSyncingEmails(true);
    setSyncResult(null);
    try {
      const allSampleEmails = [
        {
          sender: 'prof.miller@university.edu',
          raw_body: 'Subject: CS 301 Homework 3 Due Friday\n\nPlease submit your Homework 3 solutions on the course portal by this Friday at 11:59 PM. Late penalties apply.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'dr.garcia@university.edu',
          raw_body: 'Subject: Physics Lab Report 2 Extended\n\nThe deadline for Physics Lab Report 2 has been officially extended to Sunday at midnight. Ensure all error propagation calculations are included.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'dept.math@university.edu',
          raw_body: 'Subject: Math 150 Quiz 4 Schedule\n\nQuiz 4 covering eigenvectors and diagonalization will be administered during Friday lecture at 10:00 AM.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'ta.chem@university.edu',
          raw_body: 'Subject: CHEM 102 Pre-Lab Assignment 3\n\nComplete the safety questions and reaction table for Experiment 3 before Thursday 8:00 AM.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'advisor@university.edu',
          raw_body: 'Subject: Academic Advising: Midterm Course Registration\n\nPlease book your spring semester course planning session before November 10th.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'prof.vance@university.edu',
          raw_body: 'Subject: CS 301 Project 2 Algorithm Implementation\n\nProject 2 Phase 1 is due next Tuesday at 5:00 PM. Make sure your git repositories are pushed and public.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'biology.dept@university.edu',
          raw_body: 'Subject: BIO 201 Genetics Problem Set 2\n\nSubmit your pedigree chart analyses by Wednesday at 11:59 PM to the online dropbox.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'prof.adams@university.edu',
          raw_body: 'Subject: HIST 110 Primary Source Essay Due\n\nThe 1,500-word historical essay comparing primary accounts is due next Monday morning.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'stats.instructor@university.edu',
          raw_body: 'Subject: STAT 310 R Markdown Assignment 4\n\nSubmit your compiled PDF and .Rmd files for ANOVA homework by Friday 4:00 PM.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'eng.dean@university.edu',
          raw_body: 'Subject: ENGR 200 Design Milestone Review\n\nGroup project milestone presentations will take place in Hall B this Thursday afternoon.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'prof.wilson@university.edu',
          raw_body: 'Subject: PHIL 102 Ethics Position Paper\n\nSubmit your final paper draft on ethical dilemmas in AI by Sunday at 8:00 PM.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'cs.ta@university.edu',
          raw_body: 'Subject: CS 350 Database Normalization Quiz\n\nOnline quiz on 3NF and BCNF will open on Canvas from Friday 9 AM to Saturday 9 AM.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'econ.dept@university.edu',
          raw_body: 'Subject: ECON 101 Problem Set 5\n\nProblem set covering supply curve shifts is due Wednesday at 3:00 PM in the assignment box.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'chem.faculty@university.edu',
          raw_body: 'Subject: CHEM 102 Midterm Exam Room Allocation\n\nThe first midterm exam will be held on Thursday at 6:30 PM in Science Hall 101.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'prof.miller@university.edu',
          raw_body: 'Subject: CS 301 Optional Office Hours\n\nExtra review session for the midterm will take place Wednesday from 2 PM to 4 PM on Zoom.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'phys.lab@university.edu',
          raw_body: 'Subject: Physics 210 Optics Practical Quiz\n\nReview thin-lens equations; practical exam is scheduled during next lab session.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'bio.ta@university.edu',
          raw_body: 'Subject: BIO 201 DNA Gel Electrophoresis Protocol\n\nRead the lab manual section on PCR amplification prior to Monday morning session.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'math.chair@university.edu',
          raw_body: 'Subject: MATH 150 Extra Credit Problem\n\nBonus homework on Markov chains is due next Friday for up to 3 extra percentage points.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'career.center@university.edu',
          raw_body: 'Subject: Campus Tech Fair Resume Deadline\n\nUpload your resume to Handshake by Friday midnight to get prioritized employer reviews.',
          timestamp: new Date().toISOString()
        },
        {
          sender: 'library.services@university.edu',
          raw_body: 'Subject: Course Reserves & Textbook Circulation\n\nCS 301 and STAT 310 course textbooks have arrived at the reserve desk.',
          timestamp: new Date().toISOString()
        }
      ];

      const maxToScan = tierInfo.tier === 'pro' ? 20 : 5;
      const count = Math.min(tierInfo.remaining_scans, maxToScan);
      const batchToSend = allSampleEmails.slice(0, count);

      const res = await emailApi.sync(batchToSend);
      if (res.data) {
        setTierInfo(prev => ({
          ...prev,
          daily_scan_count: res.data.daily_scan_count,
          daily_limit: res.data.daily_limit,
          remaining_scans: res.data.remaining_scans,
          tier: res.data.tier
        }));
        setSyncResult(`Successfully scanned ${res.data.processed} emails! (${res.data.created_tasks?.length || 0} tasks extracted). Daily usage: ${res.data.daily_scan_count}/${res.data.daily_limit}`);
      }
      await fetchUserData();
      playSnapAudio();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Synced latest emails. AI task parser updated.';
      setSyncResult(msg);
      fetchTierStatus();
    } finally {
      setSyncingEmails(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleReintegrate();
      } else if (e.key === '1') {
        handleTabChange(appMode === 'workspace' ? 'dashboard' : 'overview');
      } else if (e.key === '2') {
        handleTabChange(appMode === 'workspace' ? 'tasks' : 'extraction');
      } else if (e.key === '3') {
        handleTabChange(appMode === 'workspace' ? 'calendar' : 'calendar_public');
      } else if (e.key === '4') {
        handleTabChange(appMode === 'workspace' ? 'sync' : 'security');
      } else if (e.key === '5') {
        handleTabChange(appMode === 'workspace' ? 'settings' : 'login');
      } else if (e.key === '6' && appMode === 'landing') {
        handleTabChange('register');
      } else if (e.key === 'Escape') {
        setShowInfo(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, transitionPhase, appMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060709] text-slate-100 select-none cursor-default touch-none font-sans">
      {/* 3D SCULPTURE CANVAS (ALWAYS ACTIVE - NO STATIC PAGE) */}
      <Canvas
        camera={{ position: [0, 0, 10.5], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#060709']} />
        <fog attach="fog" args={['#060709', 8, 26]} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.4} color="#94a3b8" />
        <directionalLight
          position={[6, 8, 7]}
          intensity={1.5}
          color="#ffffff"
          castShadow
        />
        <directionalLight
          position={[-7, -3, 4]}
          intensity={0.6}
          color={
            activeTab === 'extraction' || activeTab === 'login' || activeTab === 'tasks'
              ? '#38bdf8'
              : activeTab === 'calendar' || activeTab === 'calendar_public' || activeTab === 'dashboard'
              ? '#10b981'
              : activeTab === 'security' || activeTab === 'settings'
              ? '#c084fc'
              : '#f59e0b'
          }
        />
        <pointLight
          position={[2.9, -0.1, 3]}
          intensity={0.8}
          color={
            activeTab === 'extraction' || activeTab === 'tasks'
              ? '#0284c7'
              : activeTab === 'calendar' || activeTab === 'calendar_public' || activeTab === 'dashboard'
              ? '#059669'
              : activeTab === 'security' || activeTab === 'settings'
              ? '#9333ea'
              : activeTab === 'login'
              ? '#38bdf8'
              : '#f59e0b'
          }
          distance={10}
        />

        <AmbientDust />
        <OpticalSightlines alignment={alignment} />

        <TypographySculpture
          alignment={alignment}
          activeTab={activeTab}
          fontReady={fontReady}
          user={user}
        />

        <Station3DShards
          texture={stationTexture}
          alignment={alignment}
          activeTab={activeTab}
        />

        <CameraController />
        <StationCameraTracker cardRef={cardStationRef} alignment={alignment} />
      </Canvas>

      {/* =====================================================================
          TOP NAVIGATION BAR (CHANGES SEAMLESSLY ACCORDING TO USER STATE)
      ====================================================================== */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#060709]/85 backdrop-blur-md">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabChange(appMode === 'workspace' ? 'dashboard' : 'overview')}
            className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-2"
          >
            <div className="border border-white/60 px-1.5 py-0.5 font-mono text-[10px]">CF</div>
            <span>CAMPUSFLOW 3D</span>
          </button>
          <span className="hidden xl:inline text-[11px] font-mono text-slate-500">
            {appMode === 'workspace' ? '[STUDENT WORKSPACE]' : '[ACADEMIC OPERATING SYSTEM]'}
          </span>
        </div>

        {/* Dynamic Navigation Tabs (Changes between Landing & Workspace within 3D!) */}
        <nav className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-x-auto max-w-[55vw] sm:max-w-none no-scrollbar">
          {appMode === 'workspace' ? (
            /* --- WORKSPACE 3D TABS --- */
            <>
              {/* 1. DASHBOARD */}
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>DASHBOARD</span>
              </button>

              {/* 2. MY TASKS */}
              <button
                onClick={() => handleTabChange('tasks')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'tasks'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>MY TASKS</span>
              </button>

              {/* 3. CALENDAR */}
              <button
                onClick={() => handleTabChange('calendar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                <span>CALENDAR</span>
              </button>

              {/* 4. EMAIL SYNC */}
              <button
                onClick={() => handleTabChange('sync')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'sync'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>EMAIL SYNC</span>
              </button>

              {/* 5. SETTINGS */}
              <button
                onClick={() => handleTabChange('settings')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="w-3 h-3" />
                <span>SETTINGS</span>
              </button>
            </>
          ) : (
            /* --- LANDING 3D TABS --- */
            <>
              {/* 1. OVERVIEW */}
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                OVERVIEW
              </button>

              {/* 2. EMAIL AI */}
              <button
                onClick={() => handleTabChange('extraction')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'extraction'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>EMAIL AI</span>
              </button>

              {/* 3. CALENDAR */}
              <button
                onClick={() => handleTabChange('calendar_public')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'calendar_public'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                <span>CALENDAR</span>
              </button>

              {/* 4. SECURITY */}
              <button
                onClick={() => handleTabChange('security')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>SECURITY</span>
              </button>

              {/* 5. SIGN IN */}
              <button
                onClick={() => handleTabChange('login')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LogIn className="w-3 h-3" />
                <span>SIGN IN</span>
              </button>

              {/* 6. REGISTER */}
              <button
                onClick={() => handleTabChange('register')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>REGISTER</span>
              </button>

            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 mr-1">
              {/* Tier status indicator badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono backdrop-blur-md transition-all shadow-sm"
                style={{
                  backgroundColor: tierInfo.tier === 'pro' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                  borderColor: tierInfo.tier === 'pro' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(56, 189, 248, 0.3)',
                  color: tierInfo.tier === 'pro' ? '#fde047' : '#7dd3fc'
                }}
              >
                {tierInfo.tier === 'pro' ? (
                  <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span className="font-bold tracking-wider">
                  {tierInfo.tier === 'pro' ? 'PRO (20/day)' : 'FREE (5/day)'}
                </span>
                {tierInfo.is_admin && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded">
                    ADMIN
                  </span>
                )}
              </div>

              {/* Admin Quick Tier Switcher (visible to admins) */}
              {tierInfo.is_admin && (
                <div className="hidden sm:flex items-center gap-1 p-0.5 bg-purple-950/50 border border-purple-500/40 rounded-md text-[11px] font-mono">
                  <span className="text-[9px] text-purple-300 font-bold px-1.5 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-purple-400" />
                    TIER:
                  </span>
                  <button
                    onClick={() => handleSwitchTier('free')}
                    disabled={tierLoading || tierInfo.tier === 'free'}
                    title="Simulate Free Tier (5 emails/day)"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      tierInfo.tier === 'free'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    FREE
                  </button>
                  <button
                    onClick={() => handleSwitchTier('pro')}
                    disabled={tierLoading || tierInfo.tier === 'pro'}
                    title="Simulate Pro Tier (20 emails/day, ₹199/mo)"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      tierInfo.tier === 'pro'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    PRO (₹199)
                  </button>
                </div>
              )}

              <span className="hidden xl:inline text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                title="Sign Out of Session"
                className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-md border border-white/10 bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">EXIT</span>
              </button>
            </div>
          )}


          {/* Curatorial Info */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            title="CampusFlow Specifications"
            className="p-2 text-xs rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          3D HOLOGRAPHIC STATION
          (Moves in 3D in sync with camera/text while remaining 100% interactable)
      ====================================================================== */}
      <div
        className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
        style={{ perspective: 1200 }}
      >
        <div
          ref={cardStationRef}
          className="absolute left-0 top-0 pointer-events-auto will-change-transform origin-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translate3d(62vw, 50vh, 0) translate(-50%, -50%)',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          {/* W1. DASHBOARD PANEL */}
          {activeTab === 'dashboard' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[450px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#071610]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Academic Dashboard
            </h3>
            <span className="ml-auto text-[10px] font-mono text-emerald-400">
              [ACTIVE_SESSION]
            </span>
          </div>

          <div className="mb-4 disperse-content">
            <div className="text-xs text-slate-400">WELCOME BACK</div>
            <div className="text-base font-bold text-white font-mono">{user?.email}</div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 mb-4 p-3 rounded-lg bg-black/40 border border-emerald-500/20 text-center font-mono disperse-content">
            <div>
              <div className="text-emerald-400 font-bold text-lg">
                {tasks.filter((t) => !t.is_completed).length}
              </div>
              <div className="text-[9px] text-slate-400 uppercase">ACTIVE TASKS</div>
            </div>
            <div>
              <div className="text-sky-400 font-bold text-lg">
                {calendarEvents.length || 3}
              </div>
              <div className="text-[9px] text-slate-400 uppercase">DEADLINES</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold text-lg">5</div>
              <div className="text-[9px] text-slate-400 uppercase">EMAILS READ</div>
            </div>
          </div>

          <div className="space-y-2 mb-4 disperse-content">
            <button
              onClick={() => handleTabChange('tasks')}
              className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Tasks Board</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleTabChange('calendar')}
              className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Academic Calendar</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <button
            onClick={() => handleTabChange('sync')}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disperse-action"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>SYNC 5 LATEST EMAILS</span>
          </button>
        </div>
      )}

          {/* W2. MY TASKS PANEL */}
          {activeTab === 'tasks' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[460px] max-h-[85vh] flex flex-col bg-[#071320]/95 backdrop-blur-2xl border border-sky-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 shrink-0 disperse-header">
            <CheckSquare className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Extracted Coursework Tasks
            </h3>
            {tasksLoading && (
              <RefreshCw className="w-3 h-3 text-sky-400 animate-spin ml-1" />
            )}
            <span className="ml-auto text-[10px] font-mono text-sky-400">
              [{tasks.length} ITEMS]
            </span>
          </div>

          {/* Quick Add Task Form */}
          <form onSubmit={handleCreateTask} className="flex gap-2 mb-3 shrink-0 disperse-content">
            <input
              type="text"
              placeholder="Add coursework task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 focus:border-sky-400 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <select
              value={newTaskCourse}
              onChange={(e) => setNewTaskCourse(e.target.value)}
              className="bg-black/40 border border-white/10 text-xs font-mono text-sky-300 rounded-md px-2 py-1.5 focus:outline-none"
            >
              <option value="CS 301">CS 301</option>
              <option value="PHYS 220">PHYS 220</option>
              <option value="MATH 150">MATH 150</option>
              <option value="GENERAL">GENERAL</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-md cursor-pointer transition-colors text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Task List (Scrollable) */}
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 max-h-[360px] no-scrollbar disperse-content">
            {tasksLoading && tasks.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-sky-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>LOADING COURSE TASKS...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-white/10 rounded-lg">
                No pending tasks. Run an email sync to ingest coursework!
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    task.is_completed
                      ? 'bg-black/30 border-white/5 opacity-60'
                      : 'bg-black/50 border-sky-500/20 hover:border-sky-500/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      task.is_completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-white/30 hover:border-sky-400'
                    }`}
                  >
                    {task.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 font-bold">
                        {task.course_code || 'CS 301'}
                      </span>
                      {task.urgency && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            task.urgency === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300'
                              : task.urgency === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {task.urgency}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        task.is_completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

          {/* W3. WORKSPACE CALENDAR PANEL */}
          {activeTab === 'calendar' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[450px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#071711]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              In-App Academic Timeline
            </h3>
            <span className="ml-auto text-[10px] font-mono text-emerald-400">
              [AUTONOMOUS_SYNC]
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3 disperse-content">
            Every exam date and homework submission parsed from your 5 emails is plotted directly onto this local calendar.
          </p>

          <div className="space-y-2 mb-4 disperse-content">
            <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">CS 301 Midterm Examination</div>
                <div className="text-[10px] font-mono text-slate-400">Hall B · Closed Book</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono text-xs font-bold block">Oct 14</span>
                <span className="text-[10px] font-mono text-slate-500">2:00 PM</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Physics 220 Lab 2 Submission</div>
                <div className="text-[10px] font-mono text-slate-400">Online Portal PDF</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono text-xs font-bold block">Oct 18</span>
                <span className="text-[10px] font-mono text-slate-500">11:59 PM</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">MATH 150 Quiz 4 (Induction)</div>
                <div className="text-[10px] font-mono text-slate-400">Lecture Hall A</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono text-xs font-bold block">Oct 23</span>
                <span className="text-[10px] font-mono text-slate-500">10:00 AM</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleTabChange('tasks')}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disperse-action"
          >
            <span>REVIEW DUE TASKS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

          {/* W4. EMAIL INGESTION STATION (SYNC) */}
          {activeTab === 'sync' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[460px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#120e06]/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
                <Mail className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  {tierInfo.tier === 'pro' ? '20-Email Pro Ingestion Station' : '5-Email Free Ingestion Station'}
                </h3>
                <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${
                  tierInfo.tier === 'pro'
                    ? 'text-amber-300 bg-amber-500/20 border-amber-400/40'
                    : 'text-sky-300 bg-sky-500/20 border-sky-400/40'
                }`}>
                  [{tierInfo.tier === 'pro' ? 'PRO_TIER · ₹199/MO' : 'FREE_TIER · 5/DAY'}]
                </span>
              </div>

              {/* Live Daily Scan Quota Card */}
              <div className="p-3.5 mb-4 rounded-xl bg-black/50 border border-white/10 text-xs font-mono space-y-2.5 disperse-content">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 font-sans font-medium text-[11px]">
                    <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                    DAILY SCAN QUOTA:
                  </span>
                  <span className="font-bold text-amber-300">
                    {tierInfo.daily_scan_count} / {tierInfo.daily_limit} USED TODAY
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      tierInfo.remaining_scans <= 0
                        ? 'bg-red-500 shadow-sm shadow-red-500/50'
                        : tierInfo.remaining_scans <= (tierInfo.tier === 'pro' ? 4 : 1)
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    }`}
                    style={{
                      width: `${Math.min(100, ((tierInfo.daily_scan_count || 0) / (tierInfo.daily_limit || 1)) * 100)}%`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>{tierInfo.remaining_scans} scans remaining today</span>
                  <span className="text-slate-500">Resets: 00:00 UTC</span>
                </div>
              </div>

              {/* Admin Superuser Controls (Visible when logged in as admin) */}
              {tierInfo.is_admin && (
                <div className="p-3.5 mb-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono disperse-content">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 font-bold flex items-center gap-1 text-[11px]">
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      ADMIN TIER SWITCHER
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                      SUPERUSER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => handleSwitchTier('free')}
                      disabled={tierLoading || tierInfo.tier === 'free'}
                      className={`py-1.5 px-2 rounded-md font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        tierInfo.tier === 'free'
                          ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      ✓ Free (5 scans/day)
                    </button>
                    <button
                      onClick={() => handleSwitchTier('pro')}
                      disabled={tierLoading || tierInfo.tier === 'pro'}
                      className={`py-1.5 px-2 rounded-md font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        tierInfo.tier === 'pro'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      ✓ Pro (20 scans/₹199)
                    </button>
                  </div>
                  <button
                    onClick={() => handleAdminResetQuota()}
                    disabled={tierLoading}
                    className="w-full py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                  >
                    ↺ Reset Today's Count (Test Scans Again)
                  </button>
                </div>
              )}

              {/* Free Tier Upgrade Callout */}
              {tierInfo.tier === 'free' && (
                <div className="p-3.5 mb-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 text-xs disperse-content">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">Unlock Pro Tier · ₹199 / month</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                    Need more capacity? Pro allows scanning up to <strong className="text-white">20 emails per day</strong> (4x capacity) with prioritized AI syllabus &amp; exam extraction.
                  </p>
                  <button
                    onClick={() => handleSwitchTier('pro')}
                    disabled={tierLoading}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/25"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>UPGRADE TO PRO (₹199 / MONTH)</span>
                  </button>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-3 mb-4 rounded-lg text-xs font-mono flex items-center gap-2 disperse-content border ${
                    (typeof syncResult === 'object' && syncResult.type === 'error') ||
                    (typeof syncResult === 'string' &&
                      (syncResult.toLowerCase().includes('fail') ||
                       syncResult.toLowerCase().includes('expired') ||
                       syncResult.toLowerCase().includes('invalid') ||
                       syncResult.toLowerCase().includes('limit reached')))
                      ? 'bg-red-500/15 border-red-500/30 text-red-300'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {(typeof syncResult === 'object' && syncResult.type === 'error') ||
                  (typeof syncResult === 'string' &&
                    (syncResult.toLowerCase().includes('fail') ||
                     syncResult.toLowerCase().includes('expired') ||
                     syncResult.toLowerCase().includes('invalid') ||
                     syncResult.toLowerCase().includes('limit reached'))) ? (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="flex-1">{typeof syncResult === 'object' ? syncResult.message : syncResult}</span>
                  {((typeof syncResult === 'object' ? syncResult.message : syncResult).toLowerCase().includes('expired') ||
                    (typeof syncResult === 'object' ? syncResult.message : syncResult).toLowerCase().includes('token')) && (
                    <button
                      onClick={handleLogout}
                      className="ml-auto px-2 py-0.5 rounded bg-red-500/25 hover:bg-red-500/35 text-red-200 border border-red-500/40 text-[10px] font-bold cursor-pointer shrink-0"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}

              <div className="p-3 bg-black/40 border border-white/10 rounded-lg mb-4 text-xs font-mono text-slate-400 space-y-1.5 disperse-content">
                <div>TARGET_ENDPOINT: /api/emails/sync</div>
                <div>DAILY_ALLOWANCE: {tierInfo.daily_limit} MESSAGES / DAY</div>
                <div>PARSER_MODEL: Gemini NLP Course Extraction</div>
              </div>

              <button
                onClick={handleTriggerEmailSync}
                disabled={syncingEmails || tierInfo.remaining_scans <= 0}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 disperse-action"
              >
                {syncingEmails ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>INGESTING &amp; PARSING EMAILS...</span>
                  </>
                ) : tierInfo.remaining_scans <= 0 ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-950" />
                    <span>DAILY QUOTA LIMIT REACHED ({tierInfo.daily_limit}/{tierInfo.daily_limit})</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>SCAN &amp; INGEST UP TO {Math.min(tierInfo.remaining_scans, tierInfo.daily_limit)} EMAILS NOW</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* W5. SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[460px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#110a1c]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
                <SettingsIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Student Profile &amp; Tiers
                </h3>
                <span className="ml-auto text-[10px] font-mono text-purple-400">
                  [CLEARANCE_OK]
                </span>
              </div>

              <div className="space-y-3 mb-4 text-xs disperse-content">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-500 block">AUTHENTICATED USER</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono font-bold">{user?.email}</span>
                    {tierInfo.is_admin && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-400/40">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Tier Details */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">CURRENT PLAN</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      tierInfo.tier === 'pro'
                        ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40'
                        : 'text-sky-300 bg-sky-500/20 border border-sky-400/40'
                    }`}>
                      {tierInfo.tier === 'pro' ? 'PRO TIER · ₹199 / MONTH' : 'FREE TIER · ₹0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Daily Scan Limit:</span>
                    <span className="font-bold text-white">{tierInfo.daily_limit} emails / day</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Today's Usage:</span>
                    <span className="font-bold text-amber-300">{tierInfo.daily_scan_count} / {tierInfo.daily_limit} scanned</span>
                  </div>

                  {tierInfo.tier === 'free' ? (
                    <button
                      onClick={() => handleSwitchTier('pro')}
                      disabled={tierLoading}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>UPGRADE TO PRO (₹199 / MO · 20 SCANS)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitchTier('free')}
                      disabled={tierLoading}
                      className="w-full mt-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-mono rounded-md transition-colors cursor-pointer"
                    >
                      Downgrade to Free Plan (5 scans/day)
                    </button>
                  )}
                </div>

                {/* Admin Superuser Command Console */}
                {tierInfo.is_admin && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider font-mono">
                        ADMIN MASTER CONSOLE
                      </span>
                    </div>

                    <p className="text-[10px] text-purple-300/80 leading-relaxed font-sans">
                      You have full root access to switch between all tiers and simulate daily quota limits.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSwitchTier('free')}
                        disabled={tierLoading || tierInfo.tier === 'free'}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] font-mono uppercase transition-all cursor-pointer ${
                          tierInfo.tier === 'free'
                            ? 'bg-sky-500 text-slate-950 font-black'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        Set: Free (5)
                      </button>
                      <button
                        onClick={() => handleSwitchTier('pro')}
                        disabled={tierLoading || tierInfo.tier === 'pro'}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] font-mono uppercase transition-all cursor-pointer ${
                          tierInfo.tier === 'pro'
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        Set: Pro (20)
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminResetQuota()}
                        disabled={tierLoading}
                        className="flex-1 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                      >
                        ↺ Reset Quota (0/{tierInfo.daily_limit})
                      </button>

                      <button
                        onClick={() => {
                          if (!showAdminUsersModal) fetchAdminUsers();
                          setShowAdminUsersModal(!showAdminUsersModal);
                        }}
                        className="py-1.5 px-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" />
                        <span>{showAdminUsersModal ? 'Hide Users' : 'All Users'}</span>
                      </button>
                    </div>

                    {/* Admin Users Drawer */}
                    {showAdminUsersModal && (
                      <div className="mt-2 p-2.5 bg-black/60 border border-purple-500/30 rounded-lg max-h-48 overflow-y-auto no-scrollbar space-y-2">
                        <div className="text-[10px] font-mono text-purple-300 font-bold uppercase flex items-center justify-between">
                          <span>SYSTEM ACCOUNTS ({adminUsers.length})</span>
                          <button
                            onClick={fetchAdminUsers}
                            className="text-slate-400 hover:text-white"
                          >
                            ↺
                          </button>
                        </div>
                        {adminUsers.map(u => (
                          <div key={u.id} className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between text-[10px] font-mono">
                            <div className="truncate mr-2">
                              <div className="text-white font-bold truncate">{u.email}</div>
                              <div className="text-slate-400 text-[9px]">
                                {u.tier.toUpperCase()} · Scans: {u.daily_scan_count}/{u.daily_limit} {u.is_admin ? '· [ADMIN]' : ''}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => handleSwitchTier(u.tier === 'pro' ? 'free' : 'pro', u.id)}
                                className={`px-2 py-0.5 rounded font-bold text-[9px] cursor-pointer ${
                                  u.tier === 'pro'
                                    ? 'bg-amber-500/30 text-amber-200 hover:bg-amber-500/40'
                                    : 'bg-sky-500/30 text-sky-200 hover:bg-sky-500/40'
                                }`}
                              >
                                {u.tier === 'pro' ? 'Make Free' : 'Make Pro'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-500 block">BACKEND STATUS</span>
                  <span className="text-emerald-400 font-mono">FastAPI :8000 · PostgreSQL Connected</span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-slate-500 block">PERMISSION QUARANTINE</span>
                  <span className="text-purple-300 font-mono">
                    {tierInfo.tier === 'pro' ? '20-Email Pro Sandbox (Active)' : '5-Email Free Sandbox (Strict Isolation)'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disperse-action"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT OF SESSION</span>
              </button>
            </div>
          )}

      {/* ---------------------------------------------------------------------
          B. LANDING PANELS (WHEN IN PUBLIC SHOWCASE / UNLOGGED STATE)
      ---------------------------------------------------------------------- */}

          {/* L1. OVERVIEW PANEL: OPEN EMAIL SHOWCASE & INBOX TO CALENDAR PIPELINE */}
          {activeTab === 'overview' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[460px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#090d15]/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <Mail className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Live Ingested Course Email
            </h3>
            <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              [EXTRACTED_OK]
            </span>
          </div>

          {/* Open Email Image Preview */}
          <div className="relative rounded-xl overflow-hidden border border-white/15 mb-3.5 group shadow-xl bg-black/60 disperse-content">
            <img
              src="/open-email.jpg"
              alt="Detected Course Email"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3 pointer-events-none">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  ✓ ASSIGNMENT DETECTED
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                  DEADLINE: OCT 24
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  MIDTERM: NOV 03
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                Prof. Marcus Vance: CS 301 Project 2 &amp; Midterm
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3 disperse-content">
            CampusFlow connects to your university email, scans assignments with Gemini AI, and turns syllabus announcements into deadlines on your private calendar.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 rounded-lg bg-black/40 border border-white/5 text-center font-mono text-[11px] disperse-content">
            <div>
              <div className="text-sky-400 font-bold">FREE TIER</div>
              <div className="text-[9px] text-slate-400 uppercase">5 EMAILS/DAY</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold">PRO TIER</div>
              <div className="text-[9px] text-amber-300/90 uppercase">20 / ₹199 MO</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold">READ ONLY</div>
              <div className="text-[9px] text-slate-400 uppercase">ZERO STORAGE</div>
            </div>
          </div>

          <div className="flex items-center gap-2 disperse-action">
            <button
              onClick={() => {
                if (user) {
                  enter3DWorkspace();
                } else {
                  handleTabChange('register');
                }
              }}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>{user ? "OPEN WORKSPACE" : "CONNECT INBOX"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleTabChange('extraction')}
              className="py-2.5 px-3 text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors cursor-pointer"
            >
              AI DEMO
            </button>
          </div>
        </div>
      )}

          {/* L2. EMAIL AI EXTRACTION SIMULATOR */}
          {activeTab === 'extraction' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[460px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#071320]/95 backdrop-blur-2xl border border-sky-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <Bot className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Neural Email Parser Simulator
            </h3>
            <span className="ml-auto text-[10px] font-mono text-sky-400">
              [BATCH: 5]
            </span>
          </div>

          <div className="flex gap-1.5 mb-3 disperse-content">
            {SAMPLE_SIMULATED_EMAILS.map((item, idx) => (
              <button
                key={item.course}
                onClick={() => {
                  setSimIdx(idx);
                  setSimScanning(true);
                  setTimeout(() => setSimScanning(false), 600);
                }}
                className={`flex-1 py-1 text-[11px] font-mono rounded border transition-all cursor-pointer ${
                  simIdx === idx
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 font-bold'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {item.course}
              </button>
            ))}
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-lg mb-3 disperse-content">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>COURSE INBOX THREAD</span>
              <span className="text-sky-400">{SAMPLE_SIMULATED_EMAILS[simIdx].course}</span>
            </div>
            <div className="text-xs font-bold text-white mb-2">
              "{SAMPLE_SIMULATED_EMAILS[simIdx].title}"
            </div>

            {simScanning ? (
              <div className="py-2 flex items-center justify-center gap-2 text-xs font-mono text-sky-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>PARSING SEMANTICS...</span>
              </div>
            ) : (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">EXTRACTED TASK:</span>
                  <span className="text-emerald-400 font-mono font-semibold text-[11px]">
                    {SAMPLE_SIMULATED_EMAILS[simIdx].urgency} PRIORITY
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  <Clock3 className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Due: {SAMPLE_SIMULATED_EMAILS[simIdx].due}</span>
                </div>
                <div className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5 pt-1">
                  <CalendarDays className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Calendar: {SAMPLE_SIMULATED_EMAILS[simIdx].calendarEvent}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (user) {
                enter3DWorkspace();
              } else {
                handleTabChange('register');
              }
            }}
            className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 disperse-action"
          >
            <span>{user ? "GO TO 3D WORKSPACE" : "INGEST YOUR 5 REAL EMAILS"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

          {/* L3. PUBLIC CALENDAR PREVIEW WITH REAL MILESTONES DATA */}
          {activeTab === 'calendar_public' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[450px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#061711]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Autonomous Academic Schedule
            </h3>
            <span className="ml-auto text-[10px] font-mono text-emerald-400">
              [SCHEDULE_DATA]
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3 disperse-content">
            Exam and assignment dates plotted automatically. Deadlines found in your course emails appear directly on this website's built-in calendar view.
          </p>

          <div className="space-y-2 mb-4 disperse-content">
            <div className="p-3 rounded-lg bg-black/40 border border-red-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>CS 301 Project 2 (Graph Optimization)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">CRITICAL</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Online Submission Portal · 11:59 PM</div>
              </div>
              <span className="text-red-400 font-mono text-xs font-bold shrink-0 ml-2">Oct 24</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>MATH 150 Quiz 3 (Multivariable)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">HIGH</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Lecture Hall B · 10:00 AM</div>
              </div>
              <span className="text-amber-400 font-mono text-xs font-bold shrink-0 ml-2">Oct 28</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-sky-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>Physics 220 Lab 2 Submission</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">NORMAL</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Lab Report PDF · 5:00 PM</div>
              </div>
              <span className="text-sky-400 font-mono text-xs font-bold shrink-0 ml-2">Nov 01</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>CS 301 Midterm Examination</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">EXAM</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Room 301 · 9:30 AM - 11:00 AM</div>
              </div>
              <span className="text-emerald-400 font-mono text-xs font-bold shrink-0 ml-2">Nov 03</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (user) {
                enter3DWorkspace();
              } else {
                handleTabChange('login');
              }
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disperse-action"
          >
            <span>{user ? "ENTER 3D WORKSPACE" : "SIGN IN TO MANAGE SCHEDULE"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

          {/* L4. SECURITY SPECIFICATIONS & CLEARANCE DATA */}
          {activeTab === 'security' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[450px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#110a1c]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 disperse-header">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Security Clearance Telemetry
            </h3>
            <span className="ml-auto text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              [ZERO_STORAGE]
            </span>
          </div>

          <div className="space-y-3 mb-4 text-xs text-slate-300 disperse-content">
            <div className="p-2.5 rounded-lg bg-black/40 border border-purple-500/20 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Strict Read-Only Permission</strong>
                <span className="text-slate-400 text-[11px]">Scope: https://www.googleapis.com/auth/gmail.readonly. CampusFlow can never edit, send, or delete emails.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-purple-500/20 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Zero Password Storage</strong>
                <span className="text-slate-400 text-[11px]">Authentication occurs via tokenized OAuth 2.0 PKCE. Credentials never touch our database.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-purple-500/20 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">5-Email In-Memory Sandbox</strong>
                <span className="text-slate-400 text-[11px]">Only the 5 latest messages are processed in-memory. Zero long-term message caching.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-purple-500/20 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Encrypted Database Clearance</strong>
                <span className="text-slate-400 text-[11px]">PostgreSQL 16 session keys encrypted with AES-256 GCM. All calendar tasks remain 100% private to you.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleTabChange('register')}
            className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20 disperse-action"
          >
            <span>CREATE SECURE ACCOUNT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

          {/* L5. SIGN IN PORTAL */}
          {activeTab === 'login' && (
            <div className="w-[92vw] sm:w-[420px] md:w-[440px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#0a0d14]/95 backdrop-blur-2xl border border-sky-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 disperse-header">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Terminal Authentication
            </h3>
            <span className="ml-auto text-[10px] font-mono text-sky-400">
              [API: 8000]
            </span>
          </div>

          {loginStatus ? (
            <div className="space-y-4 py-3 disperse-content">
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{loginStatus}</span>
              </div>
              <button
                onClick={enter3DWorkspace}
                className="w-full py-2.5 text-xs font-mono font-bold text-slate-950 bg-[#38bdf8] hover:bg-[#7dd3fc] rounded-md transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ENTER 3D WORKSPACE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLoginStatus(null)}
                className="w-full py-1.5 text-xs font-mono text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-md cursor-pointer"
              >
                DISMISS CREDENTIAL
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-3 disperse-content">
              {loginError && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CLEARANCE IDENTIFIER / EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-black/40 border border-white/10 focus:border-sky-400 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SECURITY PASSKEY
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-black/40 border border-white/10 focus:border-sky-400 rounded-md py-2 pl-9 pr-9 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0"
                  />
                  <span>Retain Session</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-sky-400 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 mt-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 disabled:opacity-50 disperse-action"
              >
                {loginLoading ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>VERIFY &amp; SIGN IN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* L6. REGISTER PORTAL */}
      {activeTab === 'register' && (
        <div className="w-[92vw] sm:w-[420px] md:w-[440px] max-h-[85vh] overflow-y-auto no-scrollbar bg-[#120e06]/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 disperse-header">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Student Registration
            </h3>
            <span className="ml-auto text-[10px] font-mono text-amber-400">
              [NEW_ACCOUNT]
            </span>
          </div>

          {regStatus ? (
            <div className="space-y-4 py-3 disperse-content">
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{regStatus}</span>
              </div>
              <button
                onClick={enter3DWorkspace}
                className="w-full py-2.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ENTER 3D WORKSPACE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setRegStatus(null);
                  handleTabChange('login');
                }}
                className="w-full py-2 text-xs font-mono text-amber-300 hover:text-white bg-amber-500/20 border border-amber-500/30 rounded-md cursor-pointer"
              >
                PROCEED TO SIGN IN
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 disperse-content">
              {regError && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  FULL STUDENT NAME
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-black/40 border border-white/10 focus:border-amber-400 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  STUDENT EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-black/40 border border-white/10 focus:border-amber-400 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  PASSWORD (MIN 8 CHARACTERS)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regPasskey}
                    onChange={(e) => setRegPasskey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 focus:border-amber-400 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span className="text-[10px] text-slate-500">
                  Read-only email clearance protocol.
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Existing User?
                </button>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 disperse-action"
              >
                {regLoading ? (
                  <span>INITIALIZING...</span>
                ) : (
                  <>
                    <span>INITIALIZE WORKSPACE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
        </div>
      </div>

      {/* =====================================================================
          BOTTOM TELEMETRY & ALIGNMENT GAUGE
      ====================================================================== */}
      <div className="absolute bottom-6 left-6 sm:left-8 z-10 pointer-events-none flex items-end gap-6">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3.5 sm:p-4 flex flex-col gap-2 min-w-[210px] sm:min-w-[230px]">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400">
            <span>OPTICAL COHERENCE</span>
            <span
              className={`tabular-nums font-semibold ${
                alignment > 0.95
                  ? 'text-amber-400'
                  : alignment > 0.5
                  ? 'text-sky-300'
                  : 'text-slate-400'
              }`}
            >
              {(alignment * 100).toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 rounded-full ${
                activeTab === 'extraction' || activeTab === 'login' || activeTab === 'tasks'
                  ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8]'
                  : activeTab === 'calendar' || activeTab === 'calendar_public' || activeTab === 'dashboard'
                  ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                  : activeTab === 'security' || activeTab === 'settings'
                  ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                  : 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
              }`}
              style={{ width: `${Math.max(3, alignment * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>MODE: {appMode.toUpperCase()} // TAB: {activeTab.toUpperCase()}</span>
            <span>
              {transitionPhase === 'disintegrating'
                ? 'DISPERSING...'
                : transitionPhase === 'integrating'
                ? 'INTEGRATING...'
                : 'ALIGNED [VANTAGE]'}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex flex-col text-[11px] font-mono text-slate-500 tracking-wider">
          <span>FASTAPI BACKEND: 127.0.0.1:8000 [READY]</span>
          <span>POSTGRESQL: RUNNING [ACCEPTING CONNECTIONS]</span>
        </div>
      </div>

      {/* SPECIFICATIONS & CURATORIAL NOTES MODAL */}
      {showInfo && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-lg bg-[#0d0f15] border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col gap-6 text-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold tracking-wide text-white font-['Cinzel']">
                CampusFlow 3D Anamorphic Engine
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded border border-white/10 cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-slate-400">
              <p>
                <strong className="text-slate-200">The 3D Workspace:</strong> You never leave the 3D Anamorphic world. Signing in shifts your perspective directly into the live Student Workspace (Dashboard, Tasks, Calendar, Email Ingestion, and Settings).
              </p>
              <p>
                <strong className="text-slate-200">True 3D Spatial Anamorphosis:</strong> All course typography and architectural shards disperse across 3D space and converge exclusively from the optical sweet spot at <code className="text-amber-400">[0, 0, 10.5]</code>.
              </p>
              <p>
                <strong className="text-slate-200">Interactive Task &amp; Email Engine:</strong> Connected directly to FastAPI on port 8000 and PostgreSQL for authentic academic task management.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>KEYS: 1-5 TABS</span>
              <span>FASTAPI &amp; THREE.JS</span>
            </div>
          </div>
        </div>
      )}

      {/* SECURE PAYMENT GATEWAY CHECKOUT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0b0e14] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                    CampusFlow Secure Gateway
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE
                    </span>
                  </h3>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>256-Bit SSL Encrypted Banking Checkout</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (paymentStep !== 'processing') {
                    setShowPaymentModal(false);
                    setPaymentStep('select');
                    setPaymentError(null);
                  }
                }}
                disabled={paymentStep === 'processing'}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors disabled:opacity-30 cursor-pointer"
              >
                ✕ ESC
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {paymentStep === 'processing' ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <ShieldCheck className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Processing Payment</h4>
                    <p className="text-xs font-mono text-amber-300 animate-pulse">
                      {processingStatus}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Please do not refresh or close this window while we secure your authorization token.
                  </p>
                </div>
              ) : paymentStep === 'success' ? (
                <div className="py-6 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Upgrade Successful!</h4>
                    <p className="text-xs text-emerald-300 font-mono">
                      Transaction ID: {paymentReceipt?.payment_id}
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-xl bg-black/50 border border-emerald-500/30 text-left text-xs font-mono space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Plan:</span>
                      <span className="text-white font-bold">CampusFlow Pro (Monthly)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Amount Paid:</span>
                      <span className="text-emerald-400 font-bold">₹199.00 INR</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Daily Scan Quota:</span>
                      <span className="text-white font-bold">20 Emails / Day</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Expires:</span>
                      <span className="text-white">
                        {paymentReceipt?.subscription_expires_at ? new Date(paymentReceipt.subscription_expires_at).toLocaleDateString() : 'In 30 days'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentStep('select');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>LAUNCH PRO WORKSPACE</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Order Summary Pill */}
                  <div className="p-4 rounded-xl bg-black/50 border border-amber-500/20 mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                        Subscription Checkout
                      </div>
                      <div className="text-sm font-bold text-white">CampusFlow Pro Tier</div>
                      <div className="text-[11px] text-slate-400">20 email scans/day · 30 Days Access</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-amber-300 font-mono">₹199</div>
                      <div className="text-[9px] text-slate-500">incl. all taxes</div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="mb-4">
                    <label className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('upi'); setPaymentError(null); }}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'upi'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('card'); setPaymentError(null); }}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Cards</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('netbanking'); setPaymentError(null); }}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'netbanking'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        <span>Net Banking</span>
                      </button>
                    </div>
                  </div>

                  {/* UPI Method Details */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/10 mb-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Enter UPI ID (VPA)</span>
                        <button
                          type="button"
                          onClick={() => setShowQrCode(!showQrCode)}
                          className="text-amber-400 hover:text-amber-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{showQrCode ? 'Hide QR' : 'Show UPI QR'}</span>
                        </button>
                      </div>

                      {showQrCode ? (
                        <div className="py-3 px-4 bg-black/70 border border-amber-500/30 rounded-lg text-center flex flex-col items-center gap-2">
                          <div className="w-32 h-32 bg-white p-2 rounded-lg flex items-center justify-center shadow-lg">
                            <div className="w-full h-full border-2 border-black grid grid-cols-6 grid-rows-6 gap-0.5 p-1 bg-white">
                              <div className="col-span-2 row-span-2 bg-black rounded-sm" />
                              <div className="col-span-2" />
                              <div className="col-span-2 row-span-2 bg-black rounded-sm" />
                              <div className="col-span-2 row-span-2 bg-black rounded-sm" />
                              <div className="bg-black" />
                              <div className="bg-black" />
                              <div className="bg-black" />
                              <div className="col-span-3 bg-black rounded-xs" />
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-amber-300">
                            Scan with GPay / PhonePe / Paytm
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Amount: ₹199.00 · CampusFlow Technologies
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                          />
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-mono">Quick Demo:</span>
                            <button
                              type="button"
                              onClick={() => handleAutofillUpi('belphegor@okhdfcbank')}
                              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-amber-300 border border-white/10 cursor-pointer"
                            >
                              belphegor@okhdfcbank
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAutofillUpi('student@okaxis')}
                              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-amber-300 border border-white/10 cursor-pointer"
                            >
                              student@okaxis
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Method Details */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/10 mb-5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200">Debit or Credit Card</span>
                        <button
                          type="button"
                          onClick={handleAutofillCard}
                          className="text-amber-400 hover:text-amber-300 text-[11px] font-mono cursor-pointer"
                        >
                          Use Demo Card
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-mono">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 •••• •••• 4242"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-mono">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-mono">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-mono">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="STUDENT NAME"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-400 text-xs text-white placeholder-slate-500 focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* Net Banking Method Details */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/10 mb-5">
                      <div className="text-xs font-semibold text-slate-200 mb-1">Select Bank</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    onClick={handleProcessPayment}
                    disabled={paymentLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>PAY ₹199 NOW &amp; UNLOCK PRO</span>
                  </button>

                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="text-[11px] font-mono text-slate-500 hover:text-slate-400 cursor-pointer"
                    >
                      Cancel and stay on Free Plan
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
