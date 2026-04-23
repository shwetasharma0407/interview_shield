"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Play } from "lucide-react";

interface BreathingResetProps {
  onComplete: () => void;
}

export default function BreathingReset({ onComplete }: BreathingResetProps) {
  const [phase, setPhase] = useState<"intro" | "inhale" | "hold" | "exhale">("intro");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => {
        setPhase("inhale");
        setTimeLeft(4);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (phase === "inhale" && timeLeft === 0) {
      setPhase("hold");
      setTimeLeft(7);
    } else if (phase === "hold" && timeLeft === 0) {
      setPhase("exhale");
      setTimeLeft(8);
    } else if (phase === "exhale" && timeLeft === 0) {
      onComplete();
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, timeLeft, onComplete]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center /95 backdrop-blur-xl">
      <div className="max-w-md w-full p-8 flex flex-col items-center text-center">
        
        <AnimatePresence mode="wait">
          {phase === "intro" ? (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">High Stress Detected</h2>
              <p className="text-slate-500 text-lg">Your voice indicates elevated tension. Let's do a quick reset before answering.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold mb-12">
                {phase === "inhale" ? "Breathe In..." : phase === "hold" ? "Hold..." : "Exhale slowly..."}
              </h2>

              <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Expanding/contracting circle */}
                <motion.div
                  className="absolute rounded-full bg-indigo-100 border-2 border-indigo-300/50"
                  animate={{
                    width: phase === "inhale" ? "240px" : phase === "hold" ? "240px" : "100px",
                    height: phase === "inhale" ? "240px" : phase === "hold" ? "240px" : "100px",
                    opacity: phase === "hold" ? 0.8 : 1
                  }}
                  transition={{
                    duration: phase === "inhale" ? 4 : phase === "hold" ? 0 : 8,
                    ease: "linear"
                  }}
                />
                <div className="z-10 text-5xl font-black text-slate-800 tabular-nums">
                  {timeLeft}
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${phase === 'inhale' ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} />
                <div className={`h-2 rounded-full transition-all duration-300 ${phase === 'hold' ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} />
                <div className={`h-2 rounded-full transition-all duration-300 ${phase === 'exhale' ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {phase !== "intro" && (
          <button 
            onClick={onComplete}
            className="mt-12 text-sm text-slate-400 hover:text-slate-800 transition-colors"
          >
            Skip reset
          </button>
        )}
      </div>
    </div>
  );
}
