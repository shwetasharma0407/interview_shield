"use client";

import { motion } from "framer-motion";
import { Shield, Home, TrendingUp, Calendar, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInterviewStore } from "@/store/useInterviewStore";
import { useEffect, useState } from "react";

export default function ProgressPage() {
  const { history } = useInterviewStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format data for chart
  const chartData = [...history].reverse().map((record, index) => ({
    name: `Session ${index + 1}`,
    score: record.overallScore,
    wpm: record.averageWpm,
    date: new Date(record.date).toLocaleDateString(),
  }));

  const totalInterviews = history.length;
  const avgWpm = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.averageWpm, 0) / history.length) : 0;
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / history.length) : 0;

  if (!mounted) return null; // Avoid hydration errors due to persist middleware

  return (
    <main className="flex-1 flex flex-col relative min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden p-6 md:p-12">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[60%] -translate-x-1/2 w-[70%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px]" />
      </div>

      <header className="w-full flex justify-between items-center z-10 mb-12 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">InterviewShield</span>
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto z-10 flex flex-col gap-10 pb-20">
        
        <div>
          <h1 className="text-4xl font-black mb-2 text-slate-800">Your Progress</h1>
          <p className="text-slate-500 text-lg">Track your interview performance and consistency over time.</p>
        </div>

        {history.length === 0 ? (
          <div className="glass-card bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <Activity className="w-16 h-16 text-indigo-300" />
            <h2 className="text-2xl font-bold text-slate-800">No Data Yet</h2>
            <p className="text-slate-500 max-w-md">Complete your first interview session to start tracking your performance metrics and historical progress here.</p>
            <Link href="/setup" className="mt-4 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
              Start a Session
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800">{totalInterviews}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Interviews</div>
                </div>
              </div>

              <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800">{avgScore}/100</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Overall Score</div>
                </div>
              </div>

              <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800">{avgWpm}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Pacing (WPM)</div>
                </div>
              </div>
            </div>

            <div className="glass-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl text-slate-800">Score Trajectory</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-xl text-slate-800">Past Sessions History</h3>
              <div className="grid grid-cols-1 gap-4">
                {history.map((record) => (
                  <div key={record.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-indigo-500 mb-1">{new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <h4 className="text-lg font-bold text-slate-800">{record.role}</h4>
                      <p className="text-sm text-slate-500">Level: {record.level} • Dominant Emotion: <span className="capitalize">{record.dominantExpression}</span></p>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase">WPM</div>
                        <div className="text-lg font-bold text-slate-700">{record.averageWpm}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase">Fillers</div>
                        <div className="text-lg font-bold text-slate-700">{record.totalFillerWords}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
                        <div className="text-2xl font-black text-emerald-500">{record.overallScore}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
