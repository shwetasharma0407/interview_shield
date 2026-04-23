"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import StressRadar from "@/components/StressRadar";
import BreathingReset from "@/components/BreathingReset";
import { Mic, MicOff, Square, Play, Shield, Video, Type } from "lucide-react";
import Link from "next/link";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

// Add SpeechRecognition to Window
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
  const [stressScore, setStressScore] = useState(25);
  const [showBreathingReset, setShowBreathingReset] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
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
              
              if (wpm > 160) setFeedbackToast("Speaking too fast. Slow down.");
              else if (wpm < 100 && wpm > 0 && minutesPassed > 0.2) setFeedbackToast("Speaking a bit slow.");
              else setFeedbackToast("");
            }
          }

          // Filler Word Detection
          const fillerWords = ["um", "uh", "like", "you know", "basically", "actually"];
          let newFillerCount = 0;
          words.forEach(word => {
            if (fillerWords.includes(word.toLowerCase())) {
              newFillerCount++;
              setFeedbackToast(`Try to avoid saying "${word}". Pause instead.`);
            }
          });
          setFillerCount(newFillerCount);
        };
      }
    }
  }, []);

  // Handle 3-2-1 Auto Start Countdown
  useEffect(() => {
    if (!sessionActive || sessionCompleted || showBreathingReset) return;
    
    setCountdown(3);
    setIsRecording(false);
    
    // Clear previous transcript states
    setLiveTranscript("");
    setLiveWpm(0);
    setFillerCount(0);
    setFeedbackToast("");
    wordCountRef.current = 0;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRecording(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentQuestionIndex, sessionActive, sessionCompleted, showBreathingReset]);

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
        
        // Start Speech Recognition
        if (recognitionRef.current) {
          startTimeRef.current = Date.now();
          recognitionRef.current.start();
        }

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
      if (recognitionRef.current) recognitionRef.current.stop();
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
      saveInterviewToHistory(85); // Pass a calculated score or mock score (e.g. 85)
      setSessionCompleted(true);
      router.push("/debrief");
    }
  };

  const handleBreathingComplete = () => {
    setShowBreathingReset(false);
    setStressScore(40);
    // Let the auto-start countdown trigger again automatically
  };

  if (!currentQuestion) return null;

  return (
    <main className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden relative">
      {/* Dynamic Background based on stress */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${stressScore > 74 ? '#ef4444' : stressScore > 60 ? '#f97316' : stressScore > 30 ? '#eab308' : '#6366f1'} 0%, transparent 70%)`,
        }}
      />

      {showBreathingReset && <BreathingReset onComplete={handleBreathingComplete} />}

      <header className="p-6 flex justify-between items-center z-10 border-b border-slate-200 bg-white/60 backdrop-blur-md">
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
          <div className="flex-1 rounded-2xl border border-slate-200 relative overflow-hidden bg-slate-900 shadow-md flex flex-col">
            <div className="relative flex-1">
              {!modelsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white z-20">
                  <p className="animate-pulse font-bold text-lg">Loading AI Models...</p>
                </div>
              )}
              
              {/* 3-2-1 Auto Start Overlay */}
              {countdown > 0 && modelsLoaded && !showBreathingReset && (
                <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                  <span className="text-white text-2xl font-bold mb-4">Auto-Recording Starts In...</span>
                  <span className="text-white text-9xl font-black animate-pulse drop-shadow-2xl">{countdown}</span>
                </div>
              )}

              <Webcam 
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover"
                mirrored={true}
              />
              
              {/* Feedback Toast */}
              {feedbackToast && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-orange-200 text-orange-600 font-bold text-sm flex items-center gap-2 transition-all z-10">
                  ⚠️ {feedbackToast}
                </div>
              )}

              {/* Expression Badge */}
              <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold border border-white/20 capitalize z-10">
                Expression: {currentExpression}
              </div>
            </div>

            {/* Live Transcript Subtitles */}
            <div className="h-28 bg-black/80 p-6 border-t border-white/10 overflow-y-auto flex flex-col justify-end">
              <p className={`text-lg italic font-medium leading-relaxed ${isRecording ? 'text-white' : 'text-slate-400'}`}>
                {liveTranscript || (isRecording ? "Listening to your answer..." : "Recording paused.")}
              </p>
            </div>

            {/* Recording Indicator */}
            {isRecording && countdown === 0 && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full border border-red-400 shadow-2xl z-10">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-white font-bold text-xs tracking-widest uppercase">Recording</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Dashboards & Controls */}
        <div className="w-full md:w-[380px] flex flex-col gap-6">
          <StressRadar score={stressScore} isActive={isRecording} />
          
          {/* Live Coaching Dashboard */}
          <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Live AI Analytics</h3>
              <div className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md">Real-time</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pacing (WPM)</span>
                <span className={`text-3xl font-black ${liveWpm > 160 ? 'text-orange-500' : liveWpm > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                  {liveWpm}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Filler Words</span>
                <span className={`text-3xl font-black ${fillerCount > 5 ? 'text-red-500' : fillerCount > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {fillerCount}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Detected Emotion</span>
                <span className="text-lg font-bold text-indigo-900 capitalize">{currentExpression}</span>
              </div>
              <div className="text-3xl">
                {currentExpression === 'happy' ? '😊' : currentExpression === 'sad' ? '😢' : currentExpression === 'angry' ? '😠' : currentExpression === 'fearful' ? '😨' : currentExpression === 'surprised' ? '😲' : '😐'}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block mb-1">AI Coach Status</span>
              <p className="text-sm text-emerald-800 font-medium">
                {countdown > 0 ? "Preparing to listen..." : isRecording ? (feedbackToast || "You're doing great. Keep a steady pace.") : "Ready to analyze your answer."}
              </p>
            </div>

            <button 
              onClick={handleNextQuestion}
              disabled={countdown > 0}
              className={`mt-2 w-full py-4 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${countdown > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:shadow-lg active:scale-95'}`}
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next Question <Play className="w-4 h-4 fill-current" /></>
              ) : (
                <>End Session & Generate PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
