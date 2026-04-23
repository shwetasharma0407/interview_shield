import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Question {
  id: string;
  text: string;
  type: string;
}

interface InterviewRecord {
  id: string;
  date: string;
  role: string;
  level: string;
  overallScore: number;
  averageWpm: number;
  totalFillerWords: number;
  dominantExpression: string;
}

interface InterviewState {
  role: string;
  level: string;
  questions: Question[];
  currentQuestionIndex: number;
  sessionActive: boolean;
  
  // V2.0 State
  transcripts: { [questionId: string]: string };
  wpm: number;
  fillerWordsCount: number;
  expressionLog: string[];
  
  // V3.0 Persistent History
  history: InterviewRecord[];
  
  setRoleAndLevel: (role: string, level: string) => void;
  startSession: () => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetSession: () => void;
  
  // Actions
  updateTranscript: (questionId: string, text: string) => void;
  updateMetrics: (wpm: number, fillers: number) => void;
  logExpression: (expression: string) => void;
  saveInterviewToHistory: (score: number) => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      role: "",
      level: "",
      questions: [],
      currentQuestionIndex: 0,
      sessionActive: false,
      
      transcripts: {},
      wpm: 0,
      fillerWordsCount: 0,
      expressionLog: [],
      
      history: [],

      setRoleAndLevel: (role, level) => {
        set({ role, level });
      },

      startSession: () => {
        const { role, level } = get();
        const mockQuestions: Question[] = [
          {
            id: "q1",
            text: `Can you walk me through your background and why you are a good fit for this ${role} role?`,
            type: "Behavioral"
          },
          {
            id: "q2",
            text: `Describe a time when you had to overcome a significant challenge on a project.`,
            type: "Behavioral"
          },
          {
            id: "q3",
            text: `As a ${level} candidate, how do you handle disagreements with stakeholders or team members?`,
            type: "Situational"
          }
        ];

        set({ 
          questions: mockQuestions, 
          currentQuestionIndex: 0, 
          sessionActive: true,
          transcripts: {},
          wpm: 0,
          fillerWordsCount: 0,
          expressionLog: []
        });
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1
        }));
      },

      endSession: () => {
        set({ sessionActive: false });
      },

      resetSession: () => {
        set({ 
          role: "", 
          level: "", 
          questions: [], 
          currentQuestionIndex: 0, 
          sessionActive: false,
          transcripts: {},
          wpm: 0,
          fillerWordsCount: 0,
          expressionLog: []
        });
      },
      
      updateTranscript: (questionId, text) => {
        set((state) => ({
          transcripts: { ...state.transcripts, [questionId]: text }
        }));
      },
      
      updateMetrics: (wpm, fillers) => {
        set({ wpm, fillerWordsCount: fillers });
      },
      
      logExpression: (expression) => {
        set((state) => {
          const newLog = [...state.expressionLog, expression];
          if (newLog.length > 100) newLog.shift();
          return { expressionLog: newLog };
        });
      },
      
      saveInterviewToHistory: (score) => {
        const state = get();
        
        // Calculate dominant expression
        let dominant = "neutral";
        if (state.expressionLog.length > 0) {
          const counts = state.expressionLog.reduce((acc: any, val: string) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});
          dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }

        const newRecord: InterviewRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          role: state.role || "General Practice",
          level: state.level || "Any",
          overallScore: score,
          averageWpm: state.wpm,
          totalFillerWords: state.fillerWordsCount,
          dominantExpression: dominant
        };
        
        set((s) => ({ history: [newRecord, ...s.history] }));
      }
    }),
    {
      name: 'interview-shield-storage',
      partialize: (state) => ({ history: state.history }), // Only persist history
    }
  )
);
