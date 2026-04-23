"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, ChevronRight, Mic, CheckCircle2 } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const { setRoleAndLevel, startSession } = useInterviewStore();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Mid-Level");
  const [micStatus, setMicStatus] = useState<"idle" | "testing" | "ready">("idle");

  const roles = ["Software Engineer", "Product Manager", "Data Analyst", "Marketing", "Sales"];
  const levels = ["Entry Level", "Mid-Level", "Senior", "Lead"];

  const handleMicTest = () => {
    setMicStatus("testing");
    // Simulate mic test delay
    setTimeout(() => {
      setMicStatus("ready");
    }, 2000);
  };

  const handleStart = () => {
    setRoleAndLevel(role, level);
    startSession();
    router.push("/session");
  };

  return (
    <main className="flex-1 flex flex-col relative min-h-screen  text-slate-800 overflow-hidden p-6">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="w-full flex justify-between items-center z-10 mb-12 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">InterviewShield</span>
        </Link>
        <div className="text-sm text-slate-500 font-medium">Session Setup</div>
      </header>

      <div className="flex-1 w-full max-w-2xl mx-auto z-10 flex flex-col justify-center pb-20">
        
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Configure your session</h2>
              <p className="text-slate-500">Select your target role and seniority to generate relevant questions.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Target Role</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map(r => (
                    <button 
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${role === r ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Seniority Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {levels.map(l => (
                    <button 
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${level === l ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Microphone Check</h2>
              <p className="text-slate-500">InterviewShield needs your microphone to analyze physiological stress signals in your voice.</p>
            </div>

            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-6 border border-slate-200">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${micStatus === 'idle' ? 'bg-slate-100' : micStatus === 'testing' ? 'bg-indigo-100 animate-pulse-ring' : 'bg-emerald-500/20'}`}>
                {micStatus === 'ready' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                ) : (
                  <Mic className={`w-10 h-10 ${micStatus === 'testing' ? 'text-indigo-400' : 'text-slate-500'}`} />
                )}
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">
                  {micStatus === 'idle' ? 'Test your microphone' : micStatus === 'testing' ? 'Calibrating baseline...' : 'Microphone Ready'}
                </h3>
                <p className="text-sm text-slate-500">
                  {micStatus === 'idle' ? 'Click below to allow access and test levels.' : micStatus === 'testing' ? 'Please say something for 3 seconds.' : 'Voice captured clearly. No background noise detected.'}
                </p>
              </div>

              {micStatus === 'idle' && (
                <button 
                  onClick={handleMicTest}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Test Microphone
                </button>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleStart}
                disabled={micStatus !== 'ready'}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${micStatus === 'ready' ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Start Interview Session
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
