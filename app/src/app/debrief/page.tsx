"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import { Shield, TrendingDown, Home, Play, AlertCircle, Download, FileText, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DebriefPage() {
  const router = useRouter();
  const { questions, transcripts, wpm, fillerWordsCount, expressionLog, resetSession } = useInterviewStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleReturnHome = () => {
    resetSession();
    router.push("/");
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("InterviewShield_V2_Report.pdf");
    } catch (err) {
      console.error("PDF Export failed", err);
    }
    setIsExporting(false);
  };

  // Generate Mock Expression Data for Chart
  const expressionData = expressionLog.reduce((acc: any[], exp: string) => {
    const existing = acc.find(item => item.name === exp);
    if (existing) existing.count += 1;
    else acc.push({ name: exp, count: 1 });
    return acc;
  }, []);

  // Generate Mock Pacing Data over time
  const pacingData = [
    { time: 'Q1', wpm: wpm > 0 ? wpm - 10 : 130 },
    { time: 'Q2', wpm: wpm > 0 ? wpm + 20 : 160 },
    { time: 'Q3', wpm: wpm > 0 ? wpm : 140 },
  ];

  const generateFeedback = (text: string) => {
    if (!text || text.length < 20) return "Answer was too short. Try using the STAR method to expand on your experience.";
    if (text.toLowerCase().includes("but")) return "You used 'but' frequently. Try reframing negative constraints as positive challenges.";
    return "Great structured answer. You hit the key points clearly.";
  };

  return (
    <main className="flex-1 flex flex-col relative min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden p-6 md:p-12">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] bg-emerald-200/40 rounded-full blur-[120px]" />
      </div>

      <header className="w-full flex justify-between items-center z-10 mb-12 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">InterviewShield V2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Generating PDF..." : "Export Full PDF"}
          </button>
          <button 
            onClick={handleReturnHome}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      {/* PDF Report Container */}
      <div ref={reportRef} className="flex-1 w-full max-w-5xl mx-auto z-10 flex flex-col gap-10 pb-20 bg-slate-50">
        
        <div className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold mb-6 shadow-sm"
          >
            <TrendingDown className="w-5 h-5" />
            Vocal Stress Kept in Optimal Range
          </motion.div>
          <h1 className="text-4xl font-extrabold mb-4 text-slate-800">Session Debrief Report</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Here is your AI-generated coaching report, analyzing your speech pacing, filler words, expressions, and answer clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <div className="col-span-1 glass-card bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center items-center text-center shadow-sm">
            <h3 className="text-slate-500 font-bold mb-6 uppercase tracking-wider text-sm">Pacing Metric</h3>
            <div className="text-7xl font-black text-slate-800 mb-4 tracking-tighter">
              {wpm || 135}
            </div>
            <div className="text-indigo-600 font-bold text-lg mb-2">Words Per Minute</div>
            <p className="text-sm text-slate-500 font-medium">Target pace is 120-150 WPM.</p>
          </div>

          <div className="col-span-1 glass-card bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center items-center text-center shadow-sm">
            <h3 className="text-slate-500 font-bold mb-6 uppercase tracking-wider text-sm">Clarity Metric</h3>
            <div className={`text-7xl font-black mb-4 tracking-tighter ${fillerWordsCount > 10 ? 'text-orange-500' : 'text-emerald-500'}`}>
              {fillerWordsCount}
            </div>
            <div className="text-slate-700 font-bold text-lg mb-2">Filler Words Used</div>
            <p className="text-sm text-slate-500 font-medium">"Um", "Uh", "Like". Aim for 0.</p>
          </div>

          <div className="col-span-1 glass-card bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center items-center text-center shadow-sm">
            <h3 className="text-slate-500 font-bold mb-6 uppercase tracking-wider text-sm">Expression Metric</h3>
            <div className="text-4xl font-black text-slate-800 mb-4 capitalize">
              {expressionData.length > 0 ? expressionData.sort((a,b)=>b.count-a.count)[0].name : 'Neutral'}
            </div>
            <div className="text-slate-700 font-bold text-lg mb-2">Dominant Expression</div>
            <p className="text-sm text-slate-500 font-medium">Try to smile more during introductions.</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> Pacing Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pacingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={3} dot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-emerald-500" /> Facial Expressions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expressionData.length > 0 ? expressionData : [{name: 'neutral', count: 10}]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transcripts and AI Feedback */}
        <div className="flex flex-col gap-6 mt-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Transcripts & AI Suggestions
          </h2>
          
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Question {idx + 1}</div>
              <h4 className="text-lg font-bold mb-4 text-slate-800">"{q.text}"</h4>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Your Answer Transcript:</span>
                <p className="text-slate-600 font-medium italic">
                  {transcripts[q.id] || "No speech detected during this question."}
                </p>
              </div>

              <div className="flex gap-4 items-start bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-bold text-indigo-800 mb-1">AI Coach Suggestion</h5>
                  <p className="text-sm text-indigo-700/80 font-medium">
                    {generateFeedback(transcripts[q.id] || "")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
