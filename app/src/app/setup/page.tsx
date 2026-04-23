"use client";

import { useState, useEffect } from "react";
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
  const [micStatus, setMicStatus] = useState<"idle" | "testing" | "ready" | "error">("idle");
  const [backendStatus, setBackendStatus] = useState<"idle" | "connecting" | "ready">("idle");

  const roles = ["Software Engineer", "Product Manager", "Data Analyst", "Marketing", "Sales"];
  const levels = ["Entry Level", "Mid-Level", "Senior", "Lead"];

  // Silent backend ping
  const checkBackend = async () => {
    setBackendStatus("connecting");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${backendUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      setBackendStatus("ready");
    } catch (e) {
      setBackendStatus("ready");
    }
  };

  useEffect(() => {
    if (step === 2 && backendStatus === "idle") {
      checkBackend();
    }
  }, [step, backendStatus]);

  const handleMicTest = async () => {
    setMicStatus("testing");
    try {
      // Force real hardware permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the tracks immediately after securing permission so it doesn't lock STT later
      stream.getTracks().forEach(track => track.stop());
      setMicStatus("ready");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicStatus("error");
    }
  };

  const handleStart = () => {
    setRoleAndLevel(role, level);
    startSession();
    router.push("/session");
  };

  return (
    <main className="flex-1 flex flex-col relative min-h-screen text-slate-800 overflow-hidden p-6 bg-slate-50">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px]" />
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

      <div className="flex-1 w-full max-w-4xl mx-auto z-10 flex flex-col justify-center pb-20">
        
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8 max-w-2xl mx-auto w-full"
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
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${role === r ? 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
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
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${level === l ? 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
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
            className="flex flex-col gap-8 w-full max-w-lg mx-auto"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Hardware Check</h2>
              <p className="text-slate-500">Secure microphone permissions before starting.</p>
            </div>

            <div className="glass-card bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 border border-slate-200 shadow-sm">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${micStatus === 'idle' ? 'bg-slate-50' : micStatus === 'testing' ? 'bg-indigo-50 animate-pulse' : micStatus === 'error' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                {micStatus === 'ready' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <Mic className={`w-10 h-10 ${micStatus === 'testing' ? 'text-indigo-500' : micStatus === 'error' ? 'text-rose-500' : 'text-slate-400'}`} />
                )}
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg text-slate-800 mb-1">
                  {micStatus === 'idle' ? 'Microphone Access' : micStatus === 'testing' ? 'Requesting Permission...' : micStatus === 'error' ? 'Permission Denied' : 'Microphone Ready'}
                </h3>
                <p className={`text-sm ${micStatus === 'error' ? 'text-rose-500 font-medium' : 'text-slate-500'}`}>
                  {micStatus === 'idle' ? 'Click to grant browser access.' : micStatus === 'testing' ? 'Please click "Allow" in your browser prompt.' : micStatus === 'error' ? 'You must allow microphone access to use InterviewShield.' : 'Hardware secured. Ready to begin.'}
                </p>
              </div>

              {(micStatus === 'idle' || micStatus === 'error') && (
                <button 
                  onClick={handleMicTest}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg font-bold border border-indigo-200 transition-colors"
                >
                  Test Hardware
                </button>
              )}
            </div>

            <div className="flex justify-between mt-8 w-full">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleStart}
                disabled={micStatus !== 'ready' || backendStatus !== 'ready'}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${micStatus === 'ready' && backendStatus === 'ready' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
