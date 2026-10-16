import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  ChevronRight, Shield, Activity, Lock, Users, ExternalLink, Globe, Zap, Menu, X, 
  ArrowUpRight, Check, Sparkles, LogOut, CheckSquare, CalendarDays, LayoutDashboard,
  Mail, Clock3, ListTodo, RefreshCw, FileText, CheckCircle2
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';
import { authApi } from './services/api';

// --- Large Anatomical AI Brain Synapses & Gyri Paths (High Detail) ---

const BRAIN_SYNAPSES = [
  // Left Frontal Lobe
  { id: 'lf1', cx: -32, cy: -82, burstX: -80, burstY: -140 },
  { id: 'lf2', cx: -64, cy: -60, burstX: -140, burstY: -110 },
  { id: 'lf3', cx: -26, cy: -50, burstX: -70, burstY: -95 },
  { id: 'lf4', cx: -54, cy: -34, burstX: -125, burstY: -65 },
  // Left Temporal & Lateral
  { id: 'lt1', cx: -82, cy: -20, burstX: -160, burstY: -35 },
  { id: 'lt2', cx: -88, cy: 12,  burstX: -165, burstY: 25 },
  { id: 'lt3', cx: -46, cy: -10, burstX: -95,  burstY: -20 },
  { id: 'lt4', cx: -36, cy: 16,  burstX: -85,  burstY: 30 },
  // Left Parietal & Occipital
  { id: 'lp1', cx: -72, cy: 46,  burstX: -145, burstY: 90 },
  { id: 'lp2', cx: -48, cy: 68,  burstX: -105, burstY: 130 },
  { id: 'lp3', cx: -24, cy: 84,  burstX: -55,  burstY: 155 },
  { id: 'lp4', cx: -14, cy: 64,  burstX: -35,  burstY: 120 },

  // Right Frontal Lobe
  { id: 'rf1', cx: 32, cy: -82, burstX: 80,  burstY: -140 },
  { id: 'rf2', cx: 64, cy: -60, burstX: 140, burstY: -110 },
  { id: 'rf3', cx: 26, cy: -50, burstX: 70,  burstY: -95 },
  { id: 'rf4', cx: 54, cy: -34, burstX: 125, burstY: -65 },
  // Right Temporal & Lateral
  { id: 'rt1', cx: 82, cy: -20, burstX: 160, burstY: -35 },
  { id: 'rt2', cx: 88, cy: 12,  burstX: 165, burstY: 25 },
  { id: 'rt3', cx: 46, cy: -10, burstX: 95,  burstY: -20 },
  { id: 'rt4', cx: 36, cy: 16,  burstX: 85,  burstY: 30 },
  // Right Parietal & Occipital
  { id: 'rp1', cx: 72, cy: 46,  burstX: 145, burstY: 90 },
  { id: 'rp2', cx: 48, cy: 68,  burstX: 105, burstY: 130 },
  { id: 'rp3', cx: 24, cy: 84,  burstX: 55,  burstY: 155 },
  { id: 'rp4', cx: 14, cy: 64,  burstX: 35,  burstY: 120 },

  // Central Midline / Corpus Callosum
  { id: 'cf1', cx: 0, cy: -55, burstX: 0, burstY: -110 },
  { id: 'cf2', cx: 0, cy: -25, burstX: 0, burstY: -50 },
  { id: 'cf3', cx: 0, cy: 0,   burstX: 0, burstY: 0 },
  { id: 'cf4', cx: 0, cy: 25,  burstX: 0, burstY: 50 },
  { id: 'cf5', cx: 0, cy: 55,  burstX: 0, burstY: 110 },
];

const LEFT_SULCI = [
  "M -12, -78 C -32, -82 -54, -70 -66, -50",
  "M -28, -64 C -46, -58 -66, -40 -58, -20",
  "M -10, -50 C -26, -46 -44, -34 -34, -14",
  "M -78, -32 C -64, -16 -40, -20 -24, -6",
  "M -82, -6 C -68, 10 -48, 2 -28, 14",
  "M -84, 22 C -68, 34 -48, 22 -26, 34",
  "M -10, 4 C -24, 8 -42, 18 -34, 38",
  "M -72, 44 C -56, 60 -36, 48 -20, 60",
  "M -52, 68 C -36, 78 -24, 70 -12, 82",
  "M -34, 82 C -24, 90 -12, 86 -6, 88"
];

const RIGHT_SULCI = [
  "M 12, -78 C 32, -82 54, -70 66, -50",
  "M 28, -64 C 46, -58 66, -40 58, -20",
  "M 10, -50 C 26, -46 44, -34 34, -14",
  "M 78, -32 C 64, -16 40, -20 24, -6",
  "M 82, -6 C 68, 10 48, 2 28, 14",
  "M 84, 22 C 68, 34 48, 22 26, 34",
  "M 10, 4 C 24, 8 42, 18 34, 38",
  "M 72, 44 C 56, 60 36, 48 20, 60",
  "M 52, 68 C 36, 78 24, 70 12, 82",
  "M 34, 82 C 24, 90 12, 86 6, 88"
];

const CALLOSUM_BRIDGES = [
  "M -4, -55 C 0, -52 0, -52 4, -55",
  "M -4, -30 C 0, -27 0, -27 4, -30",
  "M -4, 0 C 0, 3 0, 3 4, 0",
  "M -4, 30 C 0, 33 0, 33 4, 30",
  "M -4, 55 C 0, 58 0, 58 4, 55"
];

// --- Large Anatomical AI Brain Component (Directly at Cursor Tip) ---

const AIBrainFormation = ({ x, y }) => {
  return (
    <motion.div
      key={`ai-brain-${x}-${y}`}
      initial={{ scale: 0.1, opacity: 0, filter: 'blur(10px)' }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        filter: 'blur(0px)',
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
      }}
      exit={{ 
        scale: 1.5, 
        opacity: 0, 
        filter: 'blur(14px)',
        transition: { duration: 0.25, ease: 'easeIn' } 
      }}
      className="fixed pointer-events-none z-[9998] flex items-center justify-center"
      style={{
        left: x - 140,
        top: y - 140,
        width: 280,
        height: 280,
        transformOrigin: 'center center',
      }}
    >
      {/* Large Bio-Electric Cerebral Glow */}
      <motion.div 
        animate={{ scale: [0.95, 1.2, 0.95], opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/25 blur-[120px] pointer-events-none"
      />

      {/* Large Realistic AI Brain SVG */}
      <svg 
        viewBox="-115 -115 230 230" 
        className="w-full h-full overflow-visible relative z-10 drop-shadow-[0_0_18px_rgba(16,185,129,0.55)]"
      >
        <defs>
          <linearGradient id="brainGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="brainGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Left Cerebral Hemisphere */}
        <motion.path 
          d="M -4, -92 C -28, -95 -58, -84 -78, -60 C -94, -42 -98, -18 -92, 10 C -98, 28 -94, 52 -82, 68 C -68, 84 -48, 95 -28, 98 C -16, 99 -7, 95 -4, 88 C -1, 74 -2, -80 -4, -92 Z" 
          fill="url(#brainGradLeft)" 
          stroke="#10b981" 
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, scale: 1.25, transition: { duration: 0.2 } }}
        />

        {/* Right Cerebral Hemisphere */}
        <motion.path 
          d="M 4, -92 C 28, -95 58, -84 78, -60 C 94, -42 98, -18 92, 10 C 98, 28 94, 52 82, 68 C 68, 84 48, 95 28, 98 C 16, 99 7, 95 4, 88 C 1, 74 2, -80 4, -92 Z" 
          fill="url(#brainGradRight)" 
          stroke="#10b981" 
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, scale: 1.25, transition: { duration: 0.2 } }}
        />

        {/* Longitudinal Fissure Line */}
        <line 
          x1="0" 
          y1="-88" 
          x2="0" 
          y2="84" 
          stroke="#6ee7b7" 
          strokeWidth="2" 
          strokeDasharray="5 3" 
          opacity="0.85" 
        />

        {/* Corpus Callosum Bridges */}
        {CALLOSUM_BRIDGES.map((d, i) => (
          <path 
            key={`bridge-${i}`} 
            d={d} 
            stroke="#6ee7b7" 
            strokeWidth="1.6" 
            fill="none" 
            opacity="0.8"
          />
        ))}

        {/* Left Gyri & Sulci (Folds) */}
        {LEFT_SULCI.map((d, i) => (
          <motion.path
            key={`ls-${i}`}
            d={d}
            fill="none"
            stroke="#34d399"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0.5, 0.95, 0.6], 
              transition: { duration: 0.5, delay: i * 0.02 } 
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
        ))}

        {/* Right Gyri & Sulci (Folds) */}
        {RIGHT_SULCI.map((d, i) => (
          <motion.path
            key={`rs-${i}`}
            d={d}
            fill="none"
            stroke="#34d399"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0.5, 0.95, 0.6], 
              transition: { duration: 0.5, delay: i * 0.02 } 
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
        ))}

        {/* Synaptic Cortex Nodes */}
        {BRAIN_SYNAPSES.map((node, i) => (
          <motion.circle
            key={node.id}
            cx={node.cx}
            cy={node.cy}
            r="2.5"
            fill="#a7f3d0"
            filter="drop-shadow(0 0 4px #10b981)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.4, 0.8], 
              opacity: [0.6, 1, 0.6],
              transition: { duration: 1.6 + (i % 4) * 0.3, repeat: Infinity, ease: 'easeInOut' }
            }}
            exit={{ 
              cx: node.burstX, 
              cy: node.burstY, 
              scale: 0, 
              opacity: 0,
              transition: { duration: 0.25, ease: 'easeOut' }
            }}
          />
        ))}

        {/* Center Point - Positioned Exactly at the Cursor Tip */}
        <motion.circle 
          cx="0" 
          cy="0" 
          r="3.5" 
          fill="#ffffff" 
          filter="drop-shadow(0 0 8px #34d399)"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
};

// --- Cursor Follower (Clean pointer, No crosshair, Large Brain at Cursor Tip) ---

const CursorFollower = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(true);

  // Stationary AI Brain Formation States
  const [isBrainActive, setIsBrainActive] = useState(false);
  const [brainPos, setBrainPos] = useState({ x: -1000, y: -1000 });
  const idleTimerRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Fluid spring for the expansive ambient emerald spotlight
  const glowConfig = { damping: 24, stiffness: 150, mass: 0.5 };
  const glowX = useSpring(cursorX, glowConfig);
  const glowY = useSpring(cursorY, glowConfig);

  useEffect(() => {
    // Check if the current device supports fine pointer (mouse / trackpad)
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setIsPointerDevice(false);
      return;
    }

    const resetIdleTimer = (x, y) => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      // When cursor is stationary for ~1.2 seconds, form the AI brain at cursor tip
      idleTimerRef.current = setTimeout(() => {
        setBrainPos({ x, y });
        setIsBrainActive(true);
      }, 1200);
    };

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      cursorX.set(x);
      cursorY.set(y);
      if (!isVisible) setIsVisible(true);

      const dx = Math.abs(x - lastPosRef.current.x);
      const dy = Math.abs(y - lastPosRef.current.y);

      // Only treat as motion if movement exceeds jitter threshold (3px)
      if (dx > 3 || dy > 3) {
        lastPosRef.current = { x, y };

        // Disintegrate immediately as soon as the cursor moves!
        setIsBrainActive(false);

        // Restart stationary idle timer
        resetIdleTimer(x, y);
      }

      const target = e.target;
      if (
        target &&
        target.closest &&
        target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsBrainActive(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const handleMouseEnter = () => setIsVisible(true);

    const handleScroll = () => {
      // Disintegrate brain on scroll
      setIsBrainActive(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isPointerDevice) return null;

  return (
    <>
      {/* Large AI Anatomical Brain formed at cursor tip when stationary */}
      <AnimatePresence>
        {isBrainActive && (
          <AIBrainFormation x={brainPos.x} y={brainPos.y} />
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      >
        {/* 1. Expansive Ambient Cyber Spotlight Glow (Vastly Bigger - 1800px diameter) */}
        <motion.div
          className="fixed -top-[900px] -left-[900px] w-[1800px] h-[1800px] rounded-full pointer-events-none"
          style={{
            x: glowX,
            y: glowY,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.26) 0%, rgba(16, 185, 129, 0.15) 26%, rgba(16, 185, 129, 0.07) 50%, rgba(16, 185, 129, 0.015) 72%, transparent 85%)',
          }}
        />

        {/* 2. Precision Pointer Core Dot at Cursor Tip (No Crosshairs) */}
        <motion.div
          className="fixed -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] pointer-events-none"
          style={{
            x: cursorX,
            y: cursorY,
          }}
          animate={{
            scale: isHovered ? 1.5 : (isBrainActive ? 0 : 1),
            opacity: isBrainActive ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
      </div>
    </>
  );
};

// --- 3D Cybernetic Tokamak Reactor (Startup Ignition & Site Illumination) ---

const CyberReactor = ({ scrollYProgress, onIgnitionUpdate, retriggerIgnition, onTriggerReignition }) => {
  const canvasRef = useRef(null);
  const [telemetry, setTelemetry] = useState({
    status: 'INITIALIZING',
    power: '0.00 GW',
    containment: 'STANDBY',
    illumination: 0,
  });

  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    if (!scrollYProgress) return;
    const unsub = scrollYProgress.on('change', (val) => {
      scrollRef.current = val;
    });
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // --- Dynamic Reactor Lighting System ---
    // Starts in darkness, powers up dynamically during ignition sequence
    const ambientLight = new THREE.AmbientLight(0x064e3b, 0.02);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x10b981, 0, 50, 1.2);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const secondaryCoreLight = new THREE.PointLight(0x38bdf8, 0, 40, 1.5);
    secondaryCoreLight.position.set(0, 0, 0);
    scene.add(secondaryCoreLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 0.02);
    rimLight.position.set(8, 12, 10);
    scene.add(rimLight);

    // --- Reactor Master Assembly Group ---
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // 1. Tokamak Confinement Torus Rings
    // Ring 1 (Inner Plasma Accelerator Torus)
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.065, 24, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.1,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    reactorGroup.add(ring1);

    // Ring 2 (Middle Titanium Confinement Ring with Emitter Segments)
    const ring2Geo = new THREE.TorusGeometry(3.3, 0.11, 24, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0284c7,
      emissiveIntensity: 0.1,
      metalness: 0.95,
      roughness: 0.15,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    reactorGroup.add(ring2);

    // Ring 3 (Outer Magnetic Stator Girdle with Confinement Solenoids)
    const ring3Geo = new THREE.TorusGeometry(4.7, 0.13, 24, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x059669,
      emissiveIntensity: 0.05,
      metalness: 0.9,
      roughness: 0.3,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    reactorGroup.add(ring3);

    // Mount 8 Radial Confinement Solenoids onto Ring 3
    const solenoidGroup = new THREE.Group();
    const solenoidGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16);
    const solenoidMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const coilEmissiveMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const coilCapGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.48, 16);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const sol = new THREE.Mesh(solenoidGeo, solenoidMat);
      const cap = new THREE.Mesh(coilCapGeo, coilEmissiveMat);
      sol.add(cap);
      sol.position.set(Math.cos(angle) * 4.7, Math.sin(angle) * 4.7, 0);
      sol.rotation.z = angle + Math.PI / 2;
      solenoidGroup.add(sol);
    }
    ring3.add(solenoidGroup);

    // Ring 4 (Vertical Gimbal Precession Torus)
    const ring4Geo = new THREE.TorusGeometry(5.8, 0.06, 24, 100);
    const ring4Mat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x10b981,
      emissiveIntensity: 0.05,
      metalness: 0.85,
      roughness: 0.25,
    });
    const ring4 = new THREE.Mesh(ring4Geo, ring4Mat);
    ring4.rotation.x = Math.PI / 2;
    reactorGroup.add(ring4);

    // 2. Central Plasma Singularity (Core)
    const coreGroup = new THREE.Group();
    reactorGroup.add(coreGroup);

    // Inner Radiant Plasma Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(0.9, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Geodesic Wireframe Containment Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // Corona Energy Aura Shell
    const auraGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    coreGroup.add(auraMesh);

    // 3. Expanding Ignition Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.35, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.position.z = 0.1;
    reactorGroup.add(shockwave);

    // 4. Stator Induction Fins (6 radial stabilizers converging toward core)
    const finGroup = new THREE.Group();
    const finGeo = new THREE.BoxGeometry(0.12, 1.4, 0.35);
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
      fin.rotation.z = angle + Math.PI / 2;
      finGroup.add(fin);
    }
    reactorGroup.add(finGroup);

    // 5. Plasma Spark Particles Vortex (1,200 particle conduits)
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleElevations = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleRadii[i] = 1.0 + Math.random() * 4.2;
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
      particleElevations[i] = (Math.random() - 0.5) * 1.8;

      particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
      particlePositions[i * 3 + 1] = Math.sin(particleAngles[i]) * particleRadii[i];
      particlePositions[i * 3 + 2] = particleElevations[i];
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.055,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    reactorGroup.add(particles);

    // Mouse tilt listener
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePosRef.current.targetX = nx * 0.45;
      mousePosRef.current.targetY = ny * 0.35;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Ignition State Tracker
    const ignitionStartTime = performance.now();
    let shockwaveTriggered = false;
    let shockwaveScale = 1;
    let shockwaveOpacity = 0;

    // Animation & Real-Time Render Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      const now = performance.now();
      const ignitionTime = (now - ignitionStartTime) / 1000;

      // Smooth mouse follow
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.04;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.04;

      // Parallax scroll reaction: reactor tilts and drops gently as page scrolls
      const currentScroll = scrollRef.current;
      reactorGroup.position.y = -currentScroll * 4.2;
      reactorGroup.position.z = -currentScroll * 2.0;

      // Base orientation with gentle gyro tilt (halved speed)
      reactorGroup.rotation.x = 0.35 + mousePosRef.current.y + currentScroll * 0.35;
      reactorGroup.rotation.y = 0.2 + mousePosRef.current.x + elapsed * 0.025;

      // --- REACTOR IGNITION TIMELINE SEQUENCE (Half-Speed / Double Duration) ---
      // Phase 0: Standby (0s -> 0.8s)
      // Phase 1: Magnetic Acceleration & Pre-Charge (0.8s -> 2.6s)
      // Phase 2: Critical Ignition Surge (2.6s -> 3.8s)
      // Phase 3: Nominal 100% Online Illumination (3.8s+)

      let illuminationLevel = 0;
      let powerStr = '0.00 GW';
      let statusStr = 'INITIALIZING MAGNETICS';
      let containmentStr = 'STANDBY';

      if (ignitionTime < 0.8) {
        // Cold standby
        illuminationLevel = 0.02;
        coreLight.intensity = Math.random() > 0.85 ? 1.5 : 0.0;
        ambientLight.intensity = 0.04;
        rimLight.intensity = 0.02;
        ring1Mat.emissiveIntensity = 0.1;
        ring2Mat.emissiveIntensity = 0.1;
        particleMat.opacity = 0.05;
        powerStr = '0.12 GW';
        statusStr = 'MAGNETIC COIL PRE-CHARGE';
        containmentStr = 'ARMING (18%)';
      } else if (ignitionTime < 2.6) {
        // Spinup phase: coils accelerate, sparks jitter violently (halved rate)
        const p = (ignitionTime - 0.8) / 1.8;
        illuminationLevel = 0.05 + p * 0.25;
        const sparkFlicker = Math.random() * 8.0;
        coreLight.intensity = p * 18.0 + sparkFlicker;
        secondaryCoreLight.intensity = p * 12.0;
        ambientLight.intensity = 0.05 + p * 0.35;
        rimLight.intensity = 0.05 + p * 0.4;

        ring1Mat.emissiveIntensity = 0.5 + p * 2.5;
        ring2Mat.emissiveIntensity = 0.3 + p * 1.8;
        particleMat.opacity = 0.2 + p * 0.6;
        particleMat.size = 0.08 + p * 0.04;

        powerStr = `${(p * 2.8).toFixed(2)} GW`;
        statusStr = 'MAGNETIC FIELD ACCELERATING';
        containmentStr = `COUPLING (${Math.round(p * 90)}%)`;
      } else if (ignitionTime < 3.8) {
        // CRITICAL IGNITION SURGE: Light explodes outwards! (smooth, slow surge)
        const p = (ignitionTime - 2.6) / 1.2;
        if (!shockwaveTriggered) {
          shockwaveTriggered = true;
          shockwaveScale = 1;
          shockwaveOpacity = 1;
        }

        // Peak blinding flash at p ~ 0.3
        const flash = Math.sin(p * Math.PI);
        const peakSurge = flash * 120.0;
        coreLight.intensity = 38.0 + peakSurge;
        secondaryCoreLight.intensity = 25.0 + peakSurge * 0.6;
        ambientLight.intensity = 0.6 + flash * 1.4;
        rimLight.intensity = 0.6 + flash * 1.0;

        illuminationLevel = Math.min(1.0, 0.4 + p * 0.8 + flash * 0.3);

        ring1Mat.emissiveIntensity = 3.5 + flash * 4.0;
        ring2Mat.emissiveIntensity = 2.5 + flash * 2.5;
        coreMat.emissiveIntensity = 2.0 + flash * 5.0;

        powerStr = `${(2.8 + p * 2.02).toFixed(2)} GW`;
        statusStr = 'CRITICAL FUSION IGNITION';
        containmentStr = '100% CONFINED';
      } else {
        // Nominal Steady-State Online Operation (calibrated for high contrast & text legibility)
        const steadyTime = ignitionTime - 3.8;
        const breath = Math.sin(steadyTime * 1.1) * 0.12;

        illuminationLevel = 1.0;
        coreLight.intensity = 22.0 + breath * 8.0;
        secondaryCoreLight.intensity = 14.0 + breath * 5.0;
        ambientLight.intensity = 0.85 + breath * 0.1;
        rimLight.intensity = 0.65;

        ring1Mat.emissiveIntensity = 1.6 + breath * 0.4;
        ring2Mat.emissiveIntensity = 1.1 + breath * 0.3;
        coreMat.emissiveIntensity = 1.5 + breath * 0.3;
        particleMat.opacity = 0.55;

        powerStr = `${(4.82 + breath * 0.15).toFixed(2)} GW`;
        statusStr = 'FUSION CORE ONLINE // STABLE';
        containmentStr = 'OPTIMAL (99.8%)';
      }

      // Shockwave Ring Expansion (halved speed)
      if (shockwaveTriggered) {
        shockwaveScale += 0.42;
        shockwaveOpacity *= 0.965;
        shockwave.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwaveMat.opacity = shockwaveOpacity;
      }

      // Torus Rotations (halved counter-rotating magnetic containment speeds)
      const speedMultiplier = ignitionTime < 0.8 ? 0.15 : (ignitionTime < 2.6 ? 0.5 + ((ignitionTime - 0.8) / 1.8) * 1.0 : 1.25);
      ring1.rotation.x += 0.0125 * speedMultiplier;
      ring1.rotation.y += 0.0075 * speedMultiplier;
      ring2.rotation.y -= 0.009 * speedMultiplier;
      ring2.rotation.z += 0.006 * speedMultiplier;
      ring3.rotation.z += 0.004 * speedMultiplier;
      ring4.rotation.y += 0.0025 * speedMultiplier;

      // Singularity core vibration & pulsation (halved frequency)
      const corePulse = 1.0 + Math.sin(elapsed * 2.0) * 0.05;
      coreMesh.scale.set(corePulse, corePulse, corePulse);
      cageMesh.rotation.x -= 0.01;
      cageMesh.rotation.y += 0.0125;
      auraMesh.scale.set(1.5 + Math.sin(elapsed * 1.5) * 0.1, 1.5 + Math.sin(elapsed * 1.5) * 0.1, 1.5 + Math.sin(elapsed * 1.5) * 0.1);

      // Particle Vortex dynamics (halved vortex speed)
      const positions = particleGeo.attributes.position.array;
      const vortexSpeed = 0.0075 * speedMultiplier;

      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * vortexSpeed;
        const rad = particleRadii[i] + Math.sin(elapsed * 1.0 + i) * 0.08;
        positions[i * 3] = Math.cos(particleAngles[i]) * rad;
        positions[i * 3 + 1] = Math.sin(particleAngles[i]) * rad;
        positions[i * 3 + 2] = particleElevations[i] + Math.sin(particleAngles[i] * 2) * 0.3;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Telemetry update throttling
      if (Math.random() > 0.85) {
        setTelemetry({
          status: statusStr,
          power: powerStr,
          containment: containmentStr,
          illumination: Math.round(illuminationLevel * 100),
        });
      }

      if (onIgnitionUpdate) {
        onIgnitionUpdate(illuminationLevel, statusStr);
      }

      renderer.render(scene, camera);
    };

    render();

    // Window Resizing
    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      ring4Geo.dispose();
      ring4Mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      finGeo.dispose();
      finMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      solenoidGeo.dispose();
      solenoidMat.dispose();
      coilEmissiveMat.dispose();
      coilCapGeo.dispose();
    };
  }, [retriggerIgnition]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Cybernetic Spotlight Beam Wash */}
      <div 
        className="absolute top-0 right-0 w-[60vw] h-full pointer-events-none bg-gradient-to-l from-emerald-500/10 via-cyan-500/5 to-transparent transition-all duration-700"
      />

      {/* Floating Glassmorphic Telemetry Badge 1: Reactor Power Core Status (Top-Left) */}
      <div
        className="absolute top-24 left-6 sm:left-12 z-20 bg-[#070a0f]/92 backdrop-blur-2xl border border-emerald-500/35 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] pointer-events-auto min-w-[240px]"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${telemetry.illumination >= 90 ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-ping'}`} />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase drop-shadow-sm">
              CYBER REACTOR CORE
            </span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold shadow-sm">
            {telemetry.power}
          </span>
        </div>
        <div className="text-white font-bold text-sm tracking-tight flex items-center gap-2 drop-shadow-sm">
          {telemetry.status}
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-300">
          <span>GRID ILLUMINATION</span>
          <span className="text-emerald-400 font-bold">{telemetry.illumination}%</span>
        </div>
        {/* Illumination Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${telemetry.illumination}%` }}
          />
        </div>
      </div>

      {/* Floating Glassmorphic Telemetry Badge 2: Tokamak Field & Re-Ignition Control (Top-Right) */}
      <div
        className="absolute top-24 right-6 sm:right-12 z-20 bg-[#070a0f]/92 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] pointer-events-auto max-w-[260px]"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase drop-shadow-sm">
              Tokamak Field
            </span>
          </div>
          <span className="text-[9px] font-mono text-gray-300">
            {telemetry.containment}
          </span>
        </div>
        <p className="text-[11px] text-gray-300 leading-snug font-mono mb-2.5">
          Magnetic confinement accelerates and ignites plasma core to illuminate the entire interface.
        </p>
        <button
          onClick={() => {
            if (onTriggerReignition) onTriggerReignition();
          }}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-white/5 hover:bg-emerald-500/25 border border-white/15 hover:border-emerald-500/50 rounded-xl text-[10px] font-mono text-gray-200 hover:text-white transition-all cursor-pointer shadow-md"
        >
          <RefreshCw size={12} />
          <span>RE-IGNITE REACTOR</span>
        </button>
      </div>

      {/* Full-Bleed 3D WebGL Canvas with translucent opacity */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full relative z-10 pointer-events-none opacity-60 transition-opacity duration-1000" 
      />

      {/* Radial Dark Contrast Vignette (Protects foreground text legibility) */}
      <div 
        className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(5,5,5,0.45)_0%,_rgba(5,5,5,0.78)_70%,_#050505_100%)]" 
      />
    </div>
  );
};

// --- Subcomponents with Academic Email & Task Operating System Copy ---

const Navbar = ({ onOpenAuth, user, onLogout, activeView, setActiveView, authMode = 'login' }) => {
  const [switchMode, setSwitchMode] = useState(authMode || 'login');

  useEffect(() => {
    if (authMode) setSwitchMode(authMode);
  }, [authMode]);

  const handleFlip = () => {
    const nextMode = switchMode === 'login' ? 'register' : 'login';
    setSwitchMode(nextMode);
    onOpenAuth(nextMode);
  };

  const selectMode = (mode) => {
    setSwitchMode(mode);
    onOpenAuth(mode);
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 md:py-5 flex justify-between items-center bg-[#050505]/75 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] pointer-events-none">
      <div 
        className="flex items-center gap-3 pointer-events-auto cursor-pointer"
        onClick={() => setActiveView && setActiveView('landing')}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center font-black text-xs text-black tracking-tight shadow-[0_0_20px_rgba(16,185,129,0.5)]">
          CF
        </div>
        <div className="flex flex-col text-left">
          <span className="text-white font-black tracking-tight text-xl leading-tight flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            CampusFlow
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            AI EMAIL TO CALENDAR
          </span>
        </div>
      </div>
      <div className="pointer-events-auto flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView(activeView === 'workspace' ? 'landing' : 'workspace')}
              className="text-emerald-300 border border-emerald-500/40 bg-emerald-950/70 hover:bg-emerald-900/80 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              {activeView === 'workspace' ? 'View Website' : 'Open Workspace'}
            </button>
            <button 
              onClick={onLogout} 
              className="text-gray-300 hover:text-white text-xs transition-colors cursor-pointer font-medium drop-shadow-sm"
            >
              Sign out
            </button>
            <button 
              onClick={() => setActiveView(activeView === 'workspace' ? 'landing' : 'workspace')}
              className="w-12 h-6 bg-emerald-950/90 border border-emerald-500/50 rounded-full p-0.5 flex items-center cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              title="Toggle Workspace View"
            >
              <motion.div 
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-emerald-400 shadow-sm ${activeView === 'workspace' ? 'ml-auto' : ''}`} 
              />
            </button>
          </div>
        ) : (
          /* Flippable Switch on Top Right: Sign In <-> Sign Up */
          <div className="flex items-center gap-2 bg-[#090d16]/95 border border-white/20 p-1.5 rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            {/* Left Side: Sign In */}
            <button
              onClick={() => selectMode('login')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                switchMode === 'login'
                  ? 'text-black bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign in
            </button>

            {/* Flippable Toggle Switch Button */}
            <button
              onClick={handleFlip}
              type="button"
              className={`w-12 h-6 rounded-full p-0.5 flex items-center cursor-pointer transition-colors duration-300 relative shadow-inner ${
                switchMode === 'login'
                  ? 'bg-emerald-950/90 border border-emerald-500/60'
                  : 'bg-cyan-950/90 border border-cyan-500/60'
              }`}
              title={`Flipped to: ${switchMode === 'login' ? 'Sign in' : 'Sign up'}. Click to flip switch.`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                  switchMode === 'login'
                    ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                    : 'ml-auto bg-cyan-400 shadow-[0_0_12px_#38bdf8]'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-black/70" />
              </motion.div>
            </button>

            {/* Right Side: Sign Up */}
            <button
              onClick={() => selectMode('register')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                switchMode === 'register'
                  ? 'text-black bg-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const FloatingNav = ({ onOpenAuth, user, activeView, setActiveView }) => {
  const scrollTo = (id) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#0a0d14]/90 backdrop-blur-2xl border border-white/15 rounded-full px-6 py-3 flex items-center gap-5 md:gap-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <button 
          onClick={() => scrollTo('hero')} 
          className="text-xs uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer drop-shadow-sm"
        >
          Home
        </button>
        <button 
          onClick={() => scrollTo('workflow')} 
          className="text-xs uppercase tracking-widest font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          How It Works
        </button>
        <button 
          onClick={() => scrollTo('email-ai')} 
          className="text-xs uppercase tracking-widest font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          Email AI
        </button>
        <button 
          onClick={() => scrollTo('features')} 
          className="text-xs uppercase tracking-widest font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          Calendar Sync
        </button>
        {user ? (
          <button 
            onClick={() => setActiveView(activeView === 'workspace' ? 'landing' : 'workspace')} 
            className="text-xs uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            {activeView === 'workspace' ? 'Site' : 'Workspace'}
          </button>
        ) : (
          <button 
            onClick={onOpenAuth} 
            className="text-xs uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

const Hero = ({ onOpenAuth, user, onOpenWorkspace }) => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 overflow-hidden">
      {/* Light breathable ambient radial bloom behind hero */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[700px] h-[700px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* Elevated Content Plate: provides backdrop elevation and contrast against the 3D reactor */}
      <div className="relative z-10 max-w-5xl py-8 px-6 md:px-12 rounded-3xl bg-[#050505]/40 backdrop-blur-md border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-emerald-300 bg-[#091018]/95 border border-emerald-500/40 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] font-mono font-bold shadow-[0_4px_25px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            REACTOR IGNITED // CYBERNETIC EMAIL AGENT
          </span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
          Turn Unread Emails <br />
          <span className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            Into Tasks & Deadlines 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-[0_2px_15px_rgba(16,185,129,0.7)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
              Automatically.
            </span>
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-gray-100 text-sm md:text-base leading-relaxed mb-12 font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          Log in, grant secure permission to read your last 5 emails, and let AI extract coursework tasks into your focus list while scheduling deadlines directly onto your built-in website calendar.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
           <button 
             onClick={user ? onOpenWorkspace : onOpenAuth}
             className="flex items-center gap-4 bg-emerald-400 hover:bg-emerald-300 text-black px-9 py-4 rounded-full font-extrabold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_55px_rgba(16,185,129,0.7)] transition-all cursor-pointer transform hover:-translate-y-0.5"
           >
             <span>{user ? "Open Workspace" : "Get Started / Sign In"}</span>
             <ChevronRight size={18} />
           </button>

           <div className="flex items-center gap-2.5 text-xs text-white border border-white/20 px-6 py-4 rounded-full bg-[#0a0d14]/90 backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] font-semibold">
             <CalendarDays size={16} className="text-emerald-400" />
             <span>On-site calendar sync · Not Google Calendar</span>
           </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 hidden md:flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-[1px] h-10 bg-gradient-to-b from-emerald-400 to-transparent" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono drop-shadow-sm" style={{ writingMode: 'vertical-rl' }}>
          CYBER REACTOR CORE
        </span>
      </div>
    </section>
  );
};

const EmailParserHUD = ({ onOpenAuth, user, onOpenWorkspace }) => {
  return (
    <section id="workflow" className="py-24 bg-[#080c14]/95 text-white rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] my-16 mx-4 md:mx-12 border border-emerald-500/25 relative overflow-hidden backdrop-blur-2xl">
      <div className="container mx-auto px-6 grid md:grid-cols-2 items-center gap-20">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase font-bold drop-shadow-sm">AUTOMATED WORKFLOW</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Connect your inbox. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)]">AI reads last 5 emails.</span> <br />
            Tasks & deadlines scheduled. <br />
            All in one place.
          </h2>
          <p className="text-gray-100 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-medium drop-shadow-sm">
            Authenticate once with Google to grant read-only permission. CampusFlow reads your 5 most recent academic messages, extracts actionable homework into your Tasks board, and plots deadlines straight onto the on-site calendar.
          </p>
          <button 
            onClick={user ? onOpenWorkspace : onOpenAuth}
            className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/20 px-7 py-4 rounded-full group transition-all cursor-pointer shadow-lg"
          >
             <span className="text-white text-sm font-bold drop-shadow-sm">{user ? "Open Your Workspace" : "Connect Email & Sign In"}</span>
             <div className="w-8 h-4 bg-emerald-500 rounded-full p-1 flex items-center justify-end shadow-sm">
                <div className="w-2 h-2 bg-black rounded-full" />
             </div>
           </button>
        </div>

        {/* Live Email Scanner HUD Card */}
        <div className="relative aspect-square max-w-md mx-auto w-full">
          <div className="absolute inset-0 border border-emerald-500/35 rounded-3xl backdrop-blur-3xl overflow-hidden bg-[#0a0f18]/95 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
             {/* Animated Scan Beam */}
             <motion.div 
               animate={{ y: [0, 360, 0] }}
               transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
               className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-20 pointer-events-none"
             />

             {/* Header Telemetry */}
             <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider drop-shadow-sm">AI EMAIL SCANNER // LIVE</span>
                </div>
                <span className="text-[10px] font-mono text-gray-300 font-medium">BATCH: LAST 5 EMAILS</span>
             </div>

             {/* Simulated Incoming Email */}
             <div className="bg-white/10 border border-white/15 rounded-xl p-4 my-3 text-left shadow-md">
                <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1">
                  <span className="font-bold text-white drop-shadow-sm">Prof. Vance (CS301)</span>
                  <span className="font-mono text-[9px] text-emerald-400 font-semibold">2026/09/25</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 mb-2 drop-shadow-sm">Subject: Project 2 Submission & Lab Exam</div>
                <p className="text-[11px] text-gray-100 leading-snug font-medium">
                  "Please submit Project 2 by Friday at 11:59 PM. Lab exam will be held next Tuesday in Hall B."
                </p>
             </div>

             {/* Extracted Actions Preview */}
             <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg p-2.5 text-left shadow-sm">
                  <CheckSquare size={14} className="text-emerald-400 shrink-0" />
                  <div className="text-[11px]">
                    <span className="text-white font-bold">Task Extracted: </span>
                    <span className="text-emerald-300 font-mono font-semibold">Submit Project 2 (High)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg p-2.5 text-left shadow-sm">
                  <CalendarDays size={14} className="text-emerald-400 shrink-0" />
                  <div className="text-[11px]">
                    <span className="text-white font-bold">On-Site Calendar: </span>
                    <span className="text-emerald-300 font-mono font-semibold">Friday 11:59 PM · Lab Exam</span>
                  </div>
                </div>
             </div>

             {/* Bottom Status */}
             <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[9px] font-mono text-gray-400">
                <span className="text-emerald-400 font-bold">✓ 5 / 5 EMAILS PARSED</span>
                <span className="text-gray-300">SYNCED TO ON-SITE CALENDAR</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ title, desc, tag }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="min-w-[320px] md:min-w-[350px] bg-[#0c121d]/90 border border-white/15 p-8 rounded-3xl backdrop-blur-xl flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
  >
    <div className="flex justify-between items-start mb-12">
      <span className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold drop-shadow-sm">{tag}</span>
      <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center shadow-sm">
        <ChevronRight size={14} className="text-white" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl text-white font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{title}</h3>
      <p className="text-gray-100 text-sm leading-relaxed font-medium drop-shadow-sm">{desc}</p>
    </div>
  </motion.div>
);

const BentoGrid = () => (
  <section id="deep-work" className="py-24 bg-[#080c14]/95 text-white rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] my-16 mx-4 md:mx-12 border border-emerald-500/25 px-6 backdrop-blur-2xl">
    <div className="container mx-auto">
      <div className="text-center mb-20">
        <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase mb-3 block font-bold drop-shadow-sm">BUILT FOR STUDENTS & DEEP WORK</span>
        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)]">stay ahead</span> <br /> without touching a planner
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[600px]">
        {/* Main large cell */}
        <div className="md:col-span-2 bg-[#0c121d]/90 border border-white/15 rounded-[40px] p-10 flex flex-col justify-end relative overflow-hidden group min-h-[260px] shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-10">
            <Mail className="text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" size={120} />
          </div>
          <p className="text-gray-100 font-medium max-w-sm mb-4 drop-shadow-sm">Never dig through long university announcement threads or missed syllabi again.</p>
          <h4 className="text-3xl text-white font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">100% Automated Task Workflow</h4>
        </div>

        {/* Small cells */}
        <div className="bg-emerald-500 rounded-[40px] p-10 flex flex-col justify-between min-h-[220px] shadow-[0_15px_35px_rgba(16,185,129,0.4)]">
           <CalendarDays className="text-black" size={40} />
           <h4 className="text-3xl text-black font-black leading-tight">Built-In Calendar. <br /> Not Google Calendar.</h4>
        </div>

        <div className="bg-[#0c121d]/90 border border-white/15 rounded-[40px] p-10 flex flex-col justify-between min-h-[220px] shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
           <CheckSquare className="text-emerald-400" size={32} />
           <p className="text-white text-lg font-bold drop-shadow-sm">Course-tagged tasks ready in your focus list.</p>
        </div>

        <div className="md:col-span-2 bg-[#0c121d]/90 border border-white/15 rounded-[40px] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-h-[200px] shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
           <div className="max-w-md">
             <h4 className="text-2xl text-white font-black mb-2 drop-shadow-sm">Smart 5-Email Batch Parsing</h4>
             <p className="text-gray-100 text-sm font-medium drop-shadow-sm">Reads your 5 most recent academic emails in one pass, identifying assignments, deadlines, and exam dates instantly.</p>
           </div>
           <div className="flex -space-x-4">
              {['1', '2', '3'].map((step, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-black shadow-lg">
                  {step}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ onOpenAuth, user, onOpenWorkspace }) => (
  <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 px-6 border-t border-slate-800">
    <div className="container mx-auto">
      <div className="flex flex-col items-center text-center mb-40">
        <div className="relative mb-8">
           {/* Animated Pulse */}
           <div className="w-28 h-28 relative">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-emerald-500/50 rounded-full"
             />
             <div className="absolute inset-4 border-2 border-emerald-500 rounded-full flex items-center justify-center">
               <Mail size={24} className="text-emerald-400" />
             </div>
           </div>
        </div>
        <h2 className="text-5xl md:text-7xl font-medium text-white mb-8">Connect your inbox <br /> Today</h2>
        <button 
          onClick={user ? onOpenWorkspace : onOpenAuth}
          className="flex items-center gap-4 bg-emerald-500 px-8 py-5 rounded-full font-bold text-black hover:scale-105 transition-transform cursor-pointer"
        >
           {user ? "Open Workspace" : "Get Started Free"}
           <ExternalLink size={20} />
        </button>
      </div>

      <div className="border-t border-white/10 pt-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-6 h-6 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-[10px] text-black">CF</div>
            <span className="text-white font-bold tracking-tight text-lg">CampusFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Automated email-to-task and academic calendar operating system.</p>
        </div>
        
        <div>
          <h5 className="text-[10px] uppercase text-gray-500 tracking-[0.2em] font-bold mb-6">Workflow</h5>
          <ul className="space-y-4 text-white text-sm">
            <li>User Authentication</li>
            <li>5-Email Batch Read</li>
            <li>AI Task Extraction</li>
            <li>On-Site Calendar Sync</li>
          </ul>
        </div>

        <div>
          <h5 className="text-[10px] uppercase text-gray-500 tracking-[0.2em] font-bold mb-6">Workspace</h5>
          <ul className="space-y-4 text-white text-sm">
            <li>Overview Dashboard</li>
            <li>My Tasks List</li>
            <li>In-App Calendar</li>
            <li>Email Settings</li>
          </ul>
        </div>

        <div>
          <h5 className="text-[10px] uppercase text-gray-500 tracking-[0.2em] font-bold mb-6">Privacy</h5>
          <ul className="space-y-4 text-white text-sm">
            <li>Read-Only Email Permission</li>
            <li>No Password Storage</li>
            <li>Private On-Site Calendar</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] text-gray-600 uppercase tracking-widest gap-4">
        <span>© Copyright 2026 CampusFlow.</span>
        <span>All rights reserved.</span>
      </div>
    </div>
  </footer>
);

// --- Preserved Auth Modal (Preserving state variables and authApi endpoints) ---

const AuthModal = ({ isOpen, onClose, onAuth, initialMode = 'login', onModeChange }) => {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  const switchModalMode = (newMode) => {
    setMode(newMode);
    setError('');
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await (mode === 'login' ? authApi.login(form) : authApi.register(form));
      localStorage.setItem('campusflow_token', data.access_token);
      localStorage.setItem('campusflow_user', JSON.stringify(data.user));
      onAuth(data.user);
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const networkError = err.message === 'Network Error' ? 'Network error: could not connect to backend server. Please verify your connection.' : null;
      setError(detail || networkError || err.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0e1115] border border-white/10 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
        >
          {/* Emerald accent glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-[9px] text-black">CF</div>
              <span className="text-white font-bold tracking-tight text-sm">CAMPUSFLOW ACCESS</span>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="text-2xl font-medium text-white mb-2">
            {mode === 'login' ? 'Open your workspace' : 'Create an account'}
          </h3>
          <p className="text-gray-400 text-xs mb-6">
            {mode === 'login' 
              ? 'Enter your credentials to manage email sync, tasks, and calendar.' 
              : 'Register to connect your academic inbox and automate your coursework.'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@university.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                required 
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-black font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Open workspace' : 'Create workspace'}</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <button 
              type="button"
              onClick={() => switchModalMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {mode === 'login' ? "New here? Create an account" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Preserved Workspace Container ---

function Workspace({ user, onLogout, onBackToLanding }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <Sidebar currentPath={location.pathname} onLogout={onLogout} user={user} />
      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" aria-label="Go to dashboard" onClick={() => navigate('/')}>
            <span /><span /><span />
          </button>
          <div className="topbar-search">Search workspace</div>
          <div className="topbar-actions">
            {onBackToLanding && (
              <button 
                onClick={onBackToLanding} 
                className="text-xs text-emerald-400 hover:underline mr-2 cursor-pointer font-medium"
                title="View Website"
              >
                Website
              </button>
            )}
            <button aria-label="Messages">✉</button>
            <button aria-label="Notifications">●</button>
            <div className="topbar-user">
              <span className="avatar">{user.email[0].toUpperCase()}</span>
              <span>{user.email.split('@')[0]}</span>
            </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <button className="mobile-nav-button" aria-label="Go to dashboard" onClick={() => navigate('/')}>CF</button>
    </div>
  );
}

// --- Main Export: Preserves All Imports, State Variables & Endpoints ---

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('campusflow_user') || 'null'));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeView, setActiveView] = useState(() => (user ? 'workspace' : 'landing'));
  
  // Cybernetic Reactor Ignition & Illumination State
  const [retriggerCount, setRetriggerCount] = useState(0);
  const [illuminationLevel, setIlluminationLevel] = useState(0.05);
  
  const location = useLocation();

  // Scroll animations for the layout
  const { scrollYProgress } = useScroll();
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const logout = () => {
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
    setUser(null);
    setActiveView('landing');
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setActiveView('workspace');
  };

  const triggerReignition = () => {
    setRetriggerCount((c) => c + 1);
  };

  // If user is authenticated and navigating deep workspace paths like /tasks, /calendar, /settings
  const isDeepWorkspaceRoute = ['/tasks', '/calendar', '/settings'].includes(location.pathname);
  const showWorkspace = user && (activeView === 'workspace' || isDeepWorkspaceRoute);

  if (showWorkspace) {
    return (
      <>
        <CursorFollower />
        <Workspace user={user} onLogout={logout} onBackToLanding={() => setActiveView('landing')} />
      </>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-emerald-500 selection:text-black text-gray-200 relative overflow-x-hidden">
      <CursorFollower />
      
      {/* 3D Cybernetic Reactor Background (Powers up and lights up the site) */}
      <CyberReactor 
        scrollYProgress={scrollYProgress} 
        onIgnitionUpdate={(level) => setIlluminationLevel(level)}
        retriggerIgnition={retriggerCount}
        onTriggerReignition={triggerReignition}
      />

      {/* Cinematic Illumination Veil: Starts dim, turns on light as reactor starts */}
      <div 
        className="fixed inset-0 pointer-events-none z-25 transition-opacity duration-1000"
        style={{
          opacity: Math.max(0, 1.0 - illuminationLevel * 1.05),
          background: 'radial-gradient(circle at 50% 45%, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 75%, #050505 100%)',
        }}
      />

      {/* Radiant Core Energy Shockwave Bloom (Flashes on critical ignition) */}
      {illuminationLevel > 0.4 && illuminationLevel < 0.95 && (
        <div 
          className="fixed inset-0 pointer-events-none z-30 transition-all duration-700"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.3) 0%, rgba(56,189,248,0.15) 35%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      <Navbar 
        onOpenAuth={(mode) => openAuth(mode || 'login')} 
        user={user} 
        onLogout={logout}
        activeView={activeView}
        setActiveView={setActiveView}
        authMode={authMode}
      />
      <FloatingNav 
        onOpenAuth={() => openAuth('login')} 
        user={user} 
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <motion.main 
        style={{ 
          opacity: bgOpacity,
          filter: `brightness(${0.4 + illuminationLevel * 0.6})`,
          transition: 'filter 1.0s ease-out',
        }}
      >
        <Hero 
          onOpenAuth={() => openAuth('login')} 
          user={user} 
          onOpenWorkspace={() => setActiveView('workspace')} 
        />
        
        <EmailParserHUD 
          onOpenAuth={() => openAuth('login')} 
          user={user} 
          onOpenWorkspace={() => setActiveView('workspace')} 
        />

        <section id="features" className="py-24 bg-[#090d14]/90 text-white rounded-[40px] shadow-2xl my-16 mx-4 md:mx-12 border border-emerald-500/20 backdrop-blur-xl overflow-hidden">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-20">
              Three automated steps <br /> <span className="text-emerald-400">from inbox to organized calendar</span>
            </h2>
            
            <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar">
              <ServiceCard 
                tag="[ 01 : CONNECT ]"
                title="Sign In & Grant 5-Email Access" 
                desc="Authenticate securely and permit CampusFlow to read your latest 5 emails. Read-only permissions ensure your credentials and inbox remain strictly private."
              />
              <ServiceCard 
                tag="[ 02 : EXTRACT ]"
                title="AI Reads Emails & Extracts Tasks" 
                desc="Our AI parser reads through the email body, extracts assignments, homework, and to-dos, and populates your Tasks section with course tags and urgency."
              />
              <ServiceCard 
                tag="[ 03 : CALENDAR ]"
                title="Plots Deadlines on Your In-App Calendar" 
                desc="Any deadlines or exam dates mentioned in your emails are automatically scheduled onto the built-in calendar on this website—not your external Google Calendar."
              />
            </div>
          </div>
        </section>

        <BentoGrid />
        
        <Footer 
          onOpenAuth={() => openAuth('login')} 
          user={user} 
          onOpenWorkspace={() => setActiveView('workspace')} 
        />
      </motion.main>
      
      {/* Auth Modal integrated with backend endpoints and state */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuth={handleAuthSuccess}
        initialMode={authMode}
        onModeChange={(newMode) => setAuthMode(newMode)}
      />

      {/* Visual background noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
