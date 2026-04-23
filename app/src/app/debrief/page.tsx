"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import { Shield, TrendingDown, Home, Play, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DebriefPage() {
  const router = useRouter();
  const { questions, reset } = useInterviewStore();

  const handleReturnHome = () => {
    reset();
    router.push("/");
  };

  // Mock debrief data
  const overallScore = 42;
  const previousScore = 58;
  const improvement = previousScore - overallScore;

  return (
    <main className="flex-1 flex flex-col relative min-h-screen bg-[#0f1117] text-white overflow-hidden p-6 md:p-12">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="w-full flex justify-between items-center z-10 mb-12 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">InterviewShield</span>
        </div>
        <button 
          onClick={handleReturnHome}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto z-10 flex flex-col gap-10 pb-20">
        
        <div className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold mb-6"
          >
            <TrendingDown className="w-5 h-5" />
            Stress Reduced by {improvement} points
          </motion.div>
          <h1 className="text-4xl font-extrabold mb-4">Session Debrief</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            You handled the pressure well. We detected a few spikes in pitch and tempo during behavioral questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <div className="col-span-1 md:col-span-1 glass-card rounded-3xl p-8 border border-white/10 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <h3 className="text-gray-400 font-semibold mb-6">Overall Stress Score</h3>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4 tracking-tighter">
              {overallScore}
            </div>
            <div className="text-emerald-400 font-bold text-lg uppercase tracking-wider mb-2">Optimal Zone</div>
            <p className="text-sm text-gray-500">Target score is &lt; 50.</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          </div>

          {/* Coaching Cards */}
          <div className="col-span-1 md:col-span-2 grid grid-rows-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-orange-500/30 flex gap-6 items-start relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Pacing Spike on Q2</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Your speech tempo increased to 210 WPM (words per minute) during the "greatest weakness" question. This is a common physiological response to threatening questions. 
                </p>
                <div className="px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 font-medium">
                  <span className="text-orange-400 font-bold mr-2">Coach Tip:</span> 
                  Force a 1-second pause before answering negative-valence questions. It grounds the nervous system.
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 flex gap-6 items-start relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Play className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="w-full">
                <h4 className="text-lg font-bold mb-2">Listen to your highest stress moment</h4>
                <p className="text-gray-400 text-sm mb-4">Question 4: Handling multiple deadlines.</p>
                
                {/* Mock Audio Player */}
                <div className="w-full h-12 bg-white/5 rounded-lg border border-white/10 flex items-center px-4 gap-4">
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-1" />
                  </button>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex">
                    {/* Mock waveform */}
                    <div className="w-[30%] h-full bg-indigo-500" />
                    <div className="w-[10%] h-full bg-orange-500 animate-pulse" />
                    <div className="flex-1 h-full" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">00:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button 
            onClick={handleReturnHome}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl"
          >
            Finish & Return to Dashboard
          </button>
        </div>

      </div>
    </main>
  );
}
