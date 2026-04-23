"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import StressRadar from "@/components/StressRadar";
import BreathingReset from "@/components/BreathingReset";
import { Play, Shield, Type, Activity, Terminal } from "lucide-react";
import Link from "next/link";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SessionPage() {
  const router = useRouter();
  const { role, questions, currentQuestionIndex, nextQuestion, sessionActive, endSession, updateTranscript, updateMetrics, logExpression, saveInterviewToHistory } = useInterviewStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [hasStartedQuestion, setHasStartedQuestion] = useState(false);
  const [stressScore, setStressScore] = useState(25);
  const [showBreathingReset, setShowBreathingReset] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  // V2.0 State
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveWpm, setLiveWpm] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentExpression, setCurrentExpression] = useState("neutral");
  const [feedbackToast, setFeedbackToast] = useState("");

  const webcamRef = useRef<Webcam>(null);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const wordCountRef = useRef<number>(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Load Face API Models from CDN
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@master/weights";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Face API Models failed to load", err);
      }
    };
    loadModels();
  }, []);

  // Set up Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          
          const fullText = finalTranscript + currentTranscript;
          setLiveTranscript(fullText);

          // Word Count & WPM Calculation
          const words = fullText.trim().split(/\s+/).filter(w => w.length > 0);
          wordCountRef.current = words.length;
          
          if (startTimeRef.current > 0) {
            const minutesPassed = (Date.now() - startTimeRef.current) / 60000;
            if (minutesPassed > 0) {
              const wpm = Math.round(words.length / minutesPassed);
              setLiveWpm(wpm);
              
              if (wpm > 160) setFeedbackToast("WARN: Pacing Exceeds Target [>160 WPM]");
              else if (wpm < 100 && wpm > 0 && minutesPassed > 0.2) setFeedbackToast("WARN: Pacing Below Target [<100 WPM]");
              else setFeedbackToast("");
            }
          }

          // Filler Word Detection
          const fillerWords = ["um", "uh", "like", "you know", "basically", "actually"];
          let newFillerCount = 0;
          words.forEach(word => {
            if (fillerWords.includes(word.toLowerCase())) {
              newFillerCount++;
              setFeedbackToast(`ALERT: Filler Word [${word}] Detected`);
            }
          });
          setFillerCount(newFillerCount);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            setFeedbackToast("ERROR: Microphone hardware lock detected.");
          }
        };

        recognitionRef.current.onend = () => {
          // Restart recognition automatically if we are still supposed to be recording
          try {
            if (isRecording) {
               recognitionRef.current.start();
            }
          } catch (e) {
            // ignore
          }
        };
      }
    }
  }, [isRecording]);

  const handleStartRecording = () => {
    setHasStartedQuestion(true);
    setIsRecording(true);
    
    // Clear previous states
    setLiveTranscript("");
    setLiveWpm(0);
    setFillerCount(0);
    setFeedbackToast("");
    wordCountRef.current = 0;
    
    // Start STT Immediately in the Click Handler to satisfy Chrome User Gesture constraints
    if (recognitionRef.current) {
      try {
        startTimeRef.current = Date.now();
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start STT:", e);
      }
    }
  };

  // Real ML Backend Stress Detection Engine & Face Tracking Loop
  useEffect(() => {
    if (!isRecording || showBreathingReset) return;

    let stream: MediaStream;
    let mediaRecorder: MediaRecorder;
    let faceInterval: NodeJS.Timeout;

    const startRecording = async () => {
      try {
        // Start Audio Recording for Python Backend
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
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
                  setStressScore((prev) => {
                    const smoothed = prev * 0.7 + result.score * 0.3;
                    if (smoothed > 75 && !showBreathingReset) {
                      setShowBreathingReset(true);
                      setIsRecording(false);
                      if (recognitionRef.current) recognitionRef.current.stop();
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

        mediaRecorder.start(2000); // 2-second chunks

        // Start Face Tracking
        if (modelsLoaded && webcamRef.current?.video) {
          faceInterval = setInterval(async () => {
            if (webcamRef.current && webcamRef.current.video) {
              const detections = await faceapi.detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
              if (detections) {
                const expressions = detections.expressions;
                const dominant = Object.keys(expressions).reduce((a, b) => expressions[a as keyof typeof expressions] > expressions[b as keyof typeof expressions] ? a : b);
                setCurrentExpression(dominant);
                logExpression(dominant);
              }
            }
          }, 1000);
        }

      } catch (err) {
        console.error("Error accessing media", err);
      }
    };

    startRecording();

    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (faceInterval) clearInterval(faceInterval);
    };
  }, [isRecording, showBreathingReset, modelsLoaded, logExpression]);

  // Redirect if accessed directly without setup
  useEffect(() => {
    if (!sessionActive && !sessionCompleted) {
      router.push("/setup");
    }
  }, [sessionActive, sessionCompleted, router]);

  const handleNextQuestion = () => {
    setIsRecording(false);
    setHasStartedQuestion(false);
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
    }
    
    // Save data to store
    if (currentQuestion) {
      updateTranscript(currentQuestion.id, liveTranscript);
      updateMetrics(liveWpm, fillerCount);
    }
    
    setStressScore(25);
    setLiveTranscript("");
    
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      endSession();
      saveInterviewToHistory(85);
      setSessionCompleted(true);
      router.push("/debrief");
    }
  };

  const handleBreathingComplete = () => {
    setShowBreathingReset(false);
    setStressScore(40);
    handleStartRecording(); // auto-restart after breathing
  };

  if (!currentQuestion) return null;

  return (
    <main className="flex flex-col min-h-screen bg-slate-50 text-slate-800 overflow-y-auto relative pb-20">
      {/* Dynamic Background based on stress */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${stressScore > 74 ? '#ef4444' : stressScore > 60 ? '#f97316' : stressScore > 30 ? '#eab308' : '#6366f1'} 0%, transparent 70%)`,
        }}
      />

      {showBreathingReset && <BreathingReset onComplete={handleBreathingComplete} />}

      <header className="p-6 flex justify-between items-center z-10 border-b border-slate-200 bg-white/60 backdrop-blur-md shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-slate-800">InterviewShield V3.0</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Target Role: <span className="text-slate-800 font-medium">{role}</span></span>
          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 z-10 max-w-7xl mx-auto w-full">
        {/* Left Panel: Video/Question */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Question Card */}
          <div className="glass-card bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4 flex items-center gap-2">
              <Type className="w-4 h-4" /> {currentQuestion.type} Question
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed text-slate-800">
              "{currentQuestion.text}"
            </h2>
          </div>

          {/* Webcam & Live Transcript */}
          <div className="flex-1 min-h-[400px] rounded-2xl border border-slate-200 relative overflow-hidden bg-slate-900 shadow-xl flex flex-col">
            <div className="relative flex-1">
              {!modelsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white z-20">
                  <p className="animate-pulse font-mono text-sm tracking-widest text-indigo-400">LOADING_AI_MODELS...</p>
                </div>
              )}
              
              {/* CLICK TO START OVERLAY (Fixes Chrome User Gesture Block) */}
              {!hasStartedQuestion && modelsLoaded && !showBreathingReset && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                  <button 
                    onClick={handleStartRecording}
                    className="group relative flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 border border-indigo-400/50"
                  >
                    <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30 animate-ping" />
                    <Play className="w-6 h-6 fill-current" />
                    <span className="text-lg tracking-wide">START ANSWERING</span>
                  </button>
                  <p className="text-indigo-200/60 font-mono text-xs mt-6 uppercase tracking-widest">Click to initialize microphone & AI</p>
                </div>
              )}

              <Webcam 
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover opacity-90"
                mirrored={true}
              />
              
              {/* Feedback Toast */}
              {feedbackToast && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-indigo-500/50 text-indigo-300 font-mono text-xs tracking-wider flex items-center gap-2 transition-all z-10 shadow-xl">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  {feedbackToast}
                </div>
              )}

              {/* Expression Badge */}
              <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-slate-300 font-mono text-[10px] tracking-widest border border-slate-700 uppercase z-10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${currentExpression === 'neutral' ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
                EXP: {currentExpression}
              </div>
            </div>

            {/* Live Transcript Subtitles */}
            <div className="h-32 bg-slate-950 p-6 border-t border-slate-800 overflow-y-auto flex flex-col justify-end">
              <p className={`font-mono text-sm leading-relaxed ${isRecording ? 'text-indigo-100' : 'text-slate-600'}`}>
                <span className="text-indigo-500 mr-2">{">"}</span>
                {liveTranscript || (isRecording ? "Listening to your answer..." : "System idle.")}
                {isRecording && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />}
              </p>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-rose-500/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/30 z-10">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-rose-400 font-mono text-[10px] tracking-widest uppercase">REC_ACTIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Sleek Dark Mode Telemetry Dashboard */}
        <div className="w-full md:w-[380px] flex flex-col gap-6">
          <StressRadar score={stressScore} isActive={isRecording} />
          
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-slate-200 border border-slate-800 relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-widest uppercase text-white">AI Telemetry</h3>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">LINK</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 z-10">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pacing_WPM</span>
                <span className={`text-4xl font-mono ${liveWpm > 160 ? 'text-rose-400' : liveWpm > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {liveWpm}
                </span>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Filler_Hits</span>
                <span className={`text-4xl font-mono ${fillerCount > 5 ? 'text-rose-500' : fillerCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {fillerCount}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Expression_State</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-white uppercase tracking-wider">{currentExpression}</span>
                <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] ${currentExpression === 'happy' ? 'bg-emerald-400 text-emerald-400' : currentExpression === 'fearful' || currentExpression === 'sad' ? 'bg-rose-400 text-rose-400' : 'bg-indigo-400 text-indigo-400'}`} />
              </div>
            </div>

            <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/50 z-10">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Coach_Terminal</span>
              <p className="text-xs text-indigo-200 font-mono leading-relaxed">
                {!hasStartedQuestion ? "> WAITING FOR START SIGNAL..." : (feedbackToast ? `> ${feedbackToast}` : "> SYSTEM NOMINAL. CONTINUING ANALYSIS...")}
              </p>
            </div>

            <button 
              onClick={handleNextQuestion}
              disabled={!hasStartedQuestion}
              className={`mt-2 w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border z-10 tracking-widest uppercase text-sm ${!hasStartedQuestion ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}`}
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next_Question <Play className="w-4 h-4 fill-current" /></>
              ) : (
                <>End_Session // Generate_Report</>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
