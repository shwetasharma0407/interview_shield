"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface StressRadarProps {
  score: number; // 0 to 100
  isActive: boolean;
}

export default function StressRadar({ score, isActive }: StressRadarProps) {
  // Determine zone based on score
  let color = "bg-emerald-500";
  let textColor = "text-emerald-400";
  let status = "Calm & Fluent";
  
  if (score > 30) {
    color = "bg-yellow-500";
    textColor = "text-yellow-400";
    status = "Moderate Stress";
  }
  if (score > 60) {
    color = "bg-orange-500";
    textColor = "text-orange-400";
    status = "Elevated Stress";
  }
  if (score > 74) {
    color = "bg-red-500";
    textColor = "text-red-400";
    status = "High Stress (Alert)";
  }

  return (
    <div className="w-full glass-card rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${textColor}`} />
          <h3 className="font-semibold text-lg">Stress Radar</h3>
        </div>
        <div className="flex items-center gap-2">
          {isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Live Analysis</span>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="flex items-end gap-4 mb-8">
        <div className="text-5xl font-black tabular-nums tracking-tighter">
          {Math.round(score)}
        </div>
        <div className="pb-1">
          <div className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>
            {status}
          </div>
          <div className="text-xs text-slate-400">Composite Score / 100</div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        {/* Markers */}
        <div className="absolute top-0 bottom-0 left-[30%] w-px bg-white/20 z-10" />
        <div className="absolute top-0 bottom-0 left-[60%] w-px bg-white/20 z-10" />
        <div className="absolute top-0 bottom-0 left-[75%] w-px bg-red-500/50 z-10" />
        
        <motion.div 
          className={`absolute top-0 bottom-0 left-0 ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        />
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
        <span>0</span>
        <span>Low</span>
        <span>Mod</span>
        <span>High</span>
        <span>100</span>
      </div>
    </div>
  );
}
