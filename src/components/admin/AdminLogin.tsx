import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, ArrowLeft, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { loginAdmin } from '../../api';

// Audio Context Management
let sharedAudioCtx: AudioContext | null = null;

const initAudio = () => {
  if (sharedAudioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
    }
  } catch (e) {}
};

const playKnockSynth = () => {
  if (!sharedAudioCtx || sharedAudioCtx.state !== 'running') return;
  try {
    const ctx = sharedAudioCtx;
    [0, 0.25].forEach(time => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime + time);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + time + 0.05);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.1);
    });
  } catch (e) {}
};

const playKnockSound = () => {
  try {
    const audio = new Audio('/knock.mp3');
    audio.play().catch(() => {
      playKnockSynth();
    });
  } catch (e) {
    playKnockSynth();
  }
};

const playErrorSound = () => {
  if (!sharedAudioCtx || sharedAudioCtx.state !== 'running') return;
  try {
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mountTime] = useState(() => Date.now());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Initialize audio on first user interaction
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Sync knocking sound with animation loop
  useEffect(() => {
    if (isSuccess || prefersReducedMotion) return;

    const cycle = 1800; // 1.8s loop
    const elapsed = Date.now() - mountTime;
    const remainder = elapsed % cycle;
    const timeToNext = cycle - remainder;

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      playKnockSound();
      intervalId = setInterval(() => {
        playKnockSound();
      }, cycle);
    }, timeToNext);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isSuccess, prefersReducedMotion, mountTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    initAudio(); // Ensure audio is ready if they clicked the button
    
    if (!username || !password) {
      playErrorSound();
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAdmin(username, password);
      setIsSuccess(true);
      
      if (prefersReducedMotion) {
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        // Wait for the full door animation
        setTimeout(() => {
          onLoginSuccess();
        }, 1600);
      }
    } catch (err: any) {
      playErrorSound();
      setError(err.message || 'Login failed. Check your username and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4 sm:p-6 overflow-hidden relative" id="admin-login-page">
      {/* Background Blobs */}
      <motion.div
        className="absolute top-[5%] left-[5%] w-[40vw] h-[40vw] bg-[#c9d6fb] rounded-full blur-[100px] opacity-70 pointer-events-none"
        animate={prefersReducedMotion ? {} : { x: [0, 60, -40, 0], y: [0, -50, 30, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[5%] w-[35vw] h-[35vw] bg-[#b9a8f5] rounded-full blur-[100px] opacity-50 pointer-events-none"
        animate={prefersReducedMotion ? {} : { x: [0, -50, 40, 0], y: [0, 60, -30, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
      />

      <div className="w-full max-w-5xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative">
        {/* Left: Login Card */}
        <div className="w-full max-w-md mx-auto lg:ml-0 bg-[#ffffff] rounded-3xl border-[0.5px] border-slate-200 shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 space-y-6" id="admin-login-card">
          {/* Top Back Link */}
          <button
            onClick={onBackToSite}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8a8a92] hover:text-[#5b52e0] transition-colors"
            id="back-to-portfolio-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portfolio</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eeedfe] flex items-center justify-center text-[#5b52e0]">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portfolio Administration
            </h1>
            <p className="text-xs text-[#8a8a92] leading-relaxed max-w-[280px] mx-auto">
              Secure administrative route (<code className="text-[#5b52e0] font-semibold">/admin</code>) to manage portfolio contents, publications, and database records.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-start space-x-2 animate-fadeIn" id="login-error-alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5" id="admin-login-form">
            <div>
              <label className="block text-xs font-semibold text-[#8a8a92] mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#fafafb] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5b52e0]/20 focus:border-[#5b52e0] transition-all"
                  id="admin-username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8a8a92] mb-1.5">
                Secret Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#fafafb] border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5b52e0]/20 focus:border-[#5b52e0] transition-all"
                  id="admin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a8a92] hover:text-[#5b52e0] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#5b52e0] hover:bg-[#5b52e0]/90 disabled:opacity-50 shadow-md shadow-[#5b52e0]/20 transition-all cursor-pointer flex items-center justify-center space-x-2 mt-2"
              id="admin-login-submit-btn"
            >
              <Lock className="w-4 h-4" />
              <span>{loading || isSuccess ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
            </button>
          </form>
        </div>

        {/* Right: Scene Illustration & Status */}
        <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[400px]">
          
          {/* Status Text Box */}
          <div className="mb-8 text-center max-w-sm h-16 flex items-center justify-center">
            {isSuccess ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h3 className="text-sm font-bold text-[#5b52e0]">Access Granted</h3>
                <p className="text-xs text-[#8a8a92]">Credentials verified. Opening the administrative dashboard...</p>
              </motion.div>
            ) : error ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h3 className="text-sm font-bold text-red-500">Access Denied</h3>
                <p className="text-xs text-[#8a8a92]">The credentials provided are incorrect. Please try again.</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700">Awaiting Access</h3>
                <p className="text-xs text-[#8a8a92]">Enter your administrator credentials to unlock the dashboard.</p>
              </motion.div>
            )}
          </div>

          <div className="relative w-64 h-80 flex items-end justify-center" style={{ perspective: '1000px' }}>
            
            {/* Floating Admin Section Tags */}
            <motion.div
              className="absolute -top-6 -right-12 bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#5b52e0] flex items-center gap-1.5 z-30 pointer-events-none"
              animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
            >
              Publications
            </motion.div>
            <motion.div
              className="absolute top-10 -left-16 bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#5b52e0] flex items-center gap-1.5 z-30 pointer-events-none"
              animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1 }}
            >
              Projects
            </motion.div>
            <motion.div
              className="absolute top-28 -right-20 bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#5b52e0] flex items-center gap-1.5 z-30 pointer-events-none"
              animate={prefersReducedMotion ? {} : { y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.5 }}
            >
              Honors
            </motion.div>
            <motion.div
              className="absolute top-44 -left-14 bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#5b52e0] flex items-center gap-1.5 z-30 pointer-events-none"
              animate={prefersReducedMotion ? {} : { y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.5 }}
            >
              Messages
            </motion.div>

            {/* Wall/Doorway Frame */}
            <div className="absolute bottom-0 w-36 h-56 border-t-8 border-l-8 border-r-8 border-[#fafafb] rounded-t-sm flex justify-center bg-slate-800 overflow-hidden shadow-inner z-0">
               {/* Warm glow on success */}
               <div className={`absolute inset-0 bg-yellow-400/40 blur-2xl transition-opacity duration-1000 ${isSuccess ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Door */}
            <motion.div
              className="absolute bottom-0 w-[128px] h-[216px] bg-[#5b52e0] rounded-t-xs border-r border-black/10 flex items-center shadow-lg z-10"
              style={{ transformOrigin: 'left', left: 'calc(50% - 64px)' }}
              animate={
                isSuccess 
                  ? (prefersReducedMotion ? { opacity: 0 } : { rotateY: -105 })
                  : { rotateY: 0, opacity: 1 }
              }
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              {/* Door Handle */}
              <div className="absolute right-3 top-1/2 w-1.5 h-5 bg-white/50 rounded-full" />
            </motion.div>

            {/* Character */}
            <motion.div
              className="absolute bottom-0 flex flex-col items-center justify-end z-20"
              style={{ left: '55%' }}
              animate={
                isSuccess
                  ? (prefersReducedMotion ? { opacity: 0 } : { x: -45, y: -5, scale: 0.7, opacity: 0 })
                  : { x: 0, y: 0, scale: 1, opacity: 1 }
              }
              transition={
                isSuccess 
                  ? { duration: 1.2, delay: 0.3, ease: 'easeIn' }
                  : { duration: 0 }
              }
            >
              {/* Head */}
              <div className="w-12 h-12 bg-slate-300 rounded-full mb-1 border-2 border-white shadow-sm" />
              
              {/* Body */}
              <div className="w-14 h-20 bg-slate-400 rounded-t-3xl border-2 border-white relative shadow-sm">
                
                {/* Knocking Arm (Looping animation on idle) */}
                {!isSuccess && !prefersReducedMotion && (
                  <motion.div
                    className="absolute top-4 -left-3 w-3.5 h-10 bg-slate-300 rounded-full border-2 border-white shadow-sm"
                    style={{ transformOrigin: 'top center' }}
                    animate={{ rotate: [0, -35, 0, -35, 0, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  />
                )}
                
                {/* Static Arm (When walking or reduced motion) */}
                {(isSuccess || prefersReducedMotion) && (
                  <div className="absolute top-4 -left-1 w-3.5 h-10 bg-slate-300 rounded-full border-2 border-white shadow-sm" />
                )}
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
};
