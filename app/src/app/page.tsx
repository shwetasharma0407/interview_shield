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
      <header className="w-full p-6 flex justify-between items-center z-10 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">InterviewShield</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white text-white transition-colors">Dashboard</Link>
          <Link href="/progress" className="hover:text-white transition-colors">Progress</Link>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <span className="text-xs">JS</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium w-fit border border-indigo-500/20">
              <Activity className="w-4 h-4" />
              <span>Real-time physiological feedback</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">nerves.</span><br />
              Nail the interview.
            </h1>
            
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              InterviewShield is an AI practice coach that detects stress in your voice in real-time, providing immediate corrective feedback before the real interview.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <Link href="/setup">
                <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  Start Practice Session
                </button>
              </Link>
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all">
                <Settings className="w-5 h-5 text-gray-400" />
                Configure Mic
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
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-semibold text-lg">Stress Radar</h3>
                  <p className="text-xs text-gray-400">Live Voice Analysis</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
                      className={`flex-1 rounded-t-sm ${isStressed ? 'bg-orange-500' : 'bg-indigo-500'}`}
                    />
                  )
                })}
              </div>

              <div className="mt-8 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm text-gray-400">Current Score</p>
                  <p className="text-3xl font-bold text-white">42<span className="text-sm text-gray-500 ml-1">/100</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-lg font-medium text-emerald-400">Optimal Range</p>
                </div>
              </div>
            </div>
            
            {/* Floating element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 glass rounded-xl p-4 shadow-xl shadow-black/50 border border-white/10 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Elevated Pitch Detected</p>
                <p className="text-xs text-gray-400">Remember to breathe slowly.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
