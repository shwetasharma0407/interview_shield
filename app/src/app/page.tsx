"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Activity, Shield, ArrowRight, Play, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 border-b border-indigo-100 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">InterviewShield</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          <Link href="/progress" className="hover:text-indigo-600 transition-colors">Progress</Link>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors">
            <span className="text-xs text-indigo-700 font-bold">JS</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold w-fit border border-indigo-200">
              <Activity className="w-4 h-4" />
              <span>Real-time AI Coaching & Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-800">
              Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">nerves.</span><br />
              Nail the interview.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              InterviewShield V2.0 analyzes your speech, tracks filler words, monitors your pacing, and watches your expressions to provide real-time coaching.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <Link href="/setup">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  Start Practice Session
                </button>
              </Link>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all text-slate-700 shadow-sm">
                <Settings className="w-5 h-5 text-slate-400" />
                Configure Mic & Cam
              </button>
            </div>
          </motion.div>

          {/* Right Column: Visualizer Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">Live Feedback</h3>
                  <p className="text-xs text-slate-500 font-medium">Speech & Expression Analysis</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Listening
                </div>
              </div>

              <div className="flex items-end gap-1 h-40 w-full opacity-80">
                {/* Mock wave bars */}
                {[...Array(40)].map((_, i) => {
                  const height = 20 + Math.random() * 60;
                  const isStressed = i > 25 && i < 35;
                  return (
                    <motion.div 
                      key={i}
                      animate={{ height: [`${height}%`, `${height + (Math.random() * 20 - 10)}%`, `${height}%`] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                      className={`flex-1 rounded-t-sm ${isStressed ? 'bg-orange-400' : 'bg-indigo-400'}`}
                    />
                  )
                })}
              </div>

              <div className="mt-8 flex justify-between items-center bg-white/60 p-4 rounded-xl border border-slate-100 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-500">Speaking Pace</p>
                  <p className="text-3xl font-bold text-slate-800">125<span className="text-sm text-slate-500 ml-1">WPM</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="text-lg font-bold text-emerald-500">Optimal Range</p>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      </div>
    </main>
  );
}
