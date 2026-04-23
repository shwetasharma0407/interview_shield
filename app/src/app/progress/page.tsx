"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Calendar, Award } from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
  return (
    <main className="flex-1 flex flex-col relative min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 border-b border-white/5 /80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-slate-800" />
          </div>
          <span className="text-xl font-bold tracking-tight">InterviewShield</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-800 transition-colors">Dashboard</Link>
          <Link href="/progress" className="text-slate-800 hover:text-slate-800 transition-colors">Progress</Link>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
            <span className="text-xs">JS</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Your Progress</h1>
            <p className="text-slate-500">Track your stress management over time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Avg Stress Score</h3>
              </div>
              <div className="text-4xl font-bold mb-1">42</div>
              <p className="text-sm text-slate-500">-15% from last week</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4 text-indigo-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold">Practice Sessions</h3>
              </div>
              <div className="text-4xl font-bold mb-1">12</div>
              <p className="text-sm text-slate-500">Total sessions completed</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4 text-orange-400">
                <Award className="w-5 h-5" />
                <h3 className="font-semibold">Readiness Status</h3>
              </div>
              <div className="text-3xl font-bold mb-1">Interview Ready</div>
              <p className="text-sm text-slate-500">Based on last 3 sessions</p>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="glass-card rounded-2xl p-8 border border-slate-200 h-80 flex items-center justify-center mt-6">
            <p className="text-slate-400 font-medium">Stress Trend Chart (Coming Soon in V2)</p>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
