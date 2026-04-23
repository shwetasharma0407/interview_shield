"use client";

import { motion } from "framer-motion";
import { Shield, Activity, Play, Terminal, ArrowRight, Video } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950 text-slate-200 min-h-screen">
      {/* Dark Premium Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">InterviewShield</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="/" className="text-white">Dashboard</Link>
          <Link href="/progress" className="hover:text-indigo-400 transition-colors">Progress</Link>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
            <span className="text-xs text-slate-300 font-bold">JS</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono uppercase tracking-widest w-fit border border-indigo-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Engine Online
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">telemetry.</span><br />
              Nail the interview.
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl font-medium">
              InterviewShield V3.0 utilizes edge-deployed ML models to analyze your pacing, track filler words, and monitor facial expressions in real-time.
            </p>

            <div className="flex items-center gap-4 mt-6">
              <Link href="/setup">
                <button className="group flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30">
                  <Play className="w-5 h-5 fill-current" />
                  Initialize Session
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Premium Dark Mode Visualizer Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
              {/* Glow overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-sm tracking-widest uppercase text-white">Live Telemetry</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active_Link
                </div>
              </div>

              <div className="flex items-end gap-1.5 h-32 w-full opacity-90 mb-8">
                {/* Sleek audio visualizer */}
                {[...Array(30)].map((_, i) => {
                  const height = 10 + Math.random() * 80;
                  const isStressed = i > 18 && i < 24;
                  return (
                    <motion.div 
                      key={i}
                      animate={{ height: [`${height}%`, `${height + (Math.random() * 30 - 15)}%`, `${height}%`] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                      className={`flex-1 rounded-t-sm ${isStressed ? 'bg-indigo-400' : 'bg-slate-700'}`}
                    />
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pacing_WPM</p>
                  <p className="text-3xl font-mono text-white">125</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expression_State</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono text-white uppercase mt-1">Neutral</p>
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating STT snippet */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-indigo-500/30 flex flex-col gap-2 w-72"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Speech-To-Text Output</span>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <p className="text-sm font-mono text-slate-300 leading-relaxed">
                <span className="text-indigo-500">{">"}</span> So I increased the conversion rate by... um... <span className="text-rose-400 border-b border-rose-400 border-dashed">about</span> 15%.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
