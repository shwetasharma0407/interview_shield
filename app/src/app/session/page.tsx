"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import StressRadar from "@/components/StressRadar";
import BreathingReset from "@/components/BreathingReset";
import { Mic, MicOff, Square, Play, Shield } from "lucide-react";
import Link from "next/link";

export default function SessionPage() {
  const router = useRouter();
  const { role, questions, currentQuestionIndex, nextQuestion, sessionActive, endSession } = useInterviewStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [stressScore, setStressScore] = useState(25);
  const [showBreathingReset, setShowBreathingReset] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];

  // Real ML Backend Stress Detection Engine
  useEffect(() => {
    if (!isRecording || showBreathingReset) return;

    let stream: MediaStream;
    let mediaRecorder: MediaRecorder;
    let interval: NodeJS.Timeout;

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            // Send chunk to backend
            const formData = new FormData();
            formData.append("audio", e.data, "chunk.webm");

            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
              const response = await fetch(`${backendUrl}/api/analyze-audio`, {
                method: "POST",
                body: formData,
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.status === "success") {
                  const newScore = result.score;
                  
                  // Smooth the score
                  setStressScore((prev) => {
                    const smoothed = prev * 0.7 + newScore * 0.3;
                    
                    // Trigger breathing reset if score > 75
                    if (smoothed > 75 && !showBreathingReset) {
                      setShowBreathingReset(true);
                      setIsRecording(false);
                    }
                    return smoothed;
                  });
                }
              }
            } catch (err) {
              console.error("Backend connection failed", err);
            }
          }
        };

        // Record in 2-second chunks
        mediaRecorder.start(2000);
        
      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    };

    startRecording();

    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording, showBreathingReset]);

  // Redirect if accessed directly without setup
  useEffect(() => {
    if (!sessionActive && !sessionCompleted) {
      router.push("/setup");
    }
  }, [sessionActive, sessionCompleted, router]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleNextQuestion = () => {
    setIsRecording(false);
    setStressScore(25); // Reset score for next question
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      endSession();
      setSessionCompleted(true);
      router.push("/debrief");
    }
  };

  const handleBreathingComplete = () => {
    setShowBreathingReset(false);
    setStressScore(40); // Reset score to a calmer level
    setIsRecording(true); // Resume recording
  };

  if (!currentQuestion) return null;

  return (
    <main className="flex flex-col h-screen bg-[#0f1117] text-white overflow-hidden relative">
      {/* Dynamic Background based on stress */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${stressScore > 74 ? '#ef4444' : stressScore > 60 ? '#f97316' : stressScore > 30 ? '#eab308' : '#10b981'} 0%, transparent 70%)`,
        }}
      />

      {showBreathingReset && <BreathingReset onComplete={handleBreathingComplete} />}

      <header className="p-6 flex justify-between items-center z-10 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          <span className="font-bold">InterviewShield</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Target Role: <span className="text-white font-medium">{role}</span></span>
          <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 z-10 max-w-7xl mx-auto w-full">
        {/* Left Panel: Video/Question */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Question Card */}
          <div className="glass-card rounded-2xl p-8 border border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4">
              {currentQuestion.type} Question
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
              "{currentQuestion.text}"
            </h2>
          </div>

          {/* Video Placeholder (Mock Interviewer) */}
          <div className="flex-1 glass-card rounded-2xl border border-white/10 relative overflow-hidden bg-[#161821] flex items-center justify-center min-h-[300px]">
            <div className="text-center opacity-50">
              <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center border border-white/10">
                <Shield className="w-10 h-10" />
              </div>
              <p className="text-sm font-medium">AI Interviewer Placeholder</p>
              <p className="text-xs text-gray-400 mt-1">In v3.0, video avatar will appear here.</p>
            </div>

            {/* Recording Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 glass px-6 py-3 rounded-full border border-white/20 shadow-2xl">
              <button 
                onClick={toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="text-sm font-semibold min-w-[80px]">
                {isRecording ? <span className="text-red-400 animate-pulse">Recording...</span> : <span className="text-gray-400">Paused</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Stress Radar & Controls */}
        <div className="w-full md:w-[380px] flex flex-col gap-6">
          <StressRadar score={stressScore} isActive={isRecording} />
          
          <div className="glass-card rounded-2xl p-6 border border-white/10 flex-1 flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Session Controls</h3>
            <p className="text-sm text-gray-400 mb-6 flex-1">
              Speak clearly into your microphone. Try to maintain a steady pace and minimize filler words. The AI coach is analyzing your vocal patterns.
            </p>
            
            <button 
              onClick={handleNextQuestion}
              className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next Question <Play className="w-4 h-4 fill-current" /></>
              ) : (
                <>End Session & View Debrief</>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
