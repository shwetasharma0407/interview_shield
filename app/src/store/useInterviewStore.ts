import { create } from 'zustand';

interface Question {
  id: string;
  text: string;
  type: string;
}

const mockQuestions: Question[] = [
  { id: '1', text: 'Tell me about a time you had to handle a difficult situation under pressure.', type: 'Behavioural' },
  { id: '2', text: 'What is your greatest weakness, and how are you working to overcome it?', type: 'HR' },
  { id: '3', text: 'Describe a project where you had to lead a team through significant ambiguity.', type: 'Behavioural' },
  { id: '4', text: 'How do you prioritize tasks when you have multiple tight deadlines?', type: 'HR' },
  { id: '5', text: 'Tell me about yourself and your journey so far.', type: 'Behavioural' },
];

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
  
  setRoleAndLevel: (role: string, level: string) => void;
  startSession: () => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetSession: () => void;
  
  // V2.0 Actions
  updateTranscript: (questionId: string, text: string) => void;
  updateMetrics: (wpm: number, fillers: number) => void;
  logExpression: (expression: string) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  role: "",
  level: "",
  questions: [],
  currentQuestionIndex: 0,
  sessionActive: false,
  
  transcripts: {},
  wpm: 0,
  fillerWordsCount: 0,
  expressionLog: [],

  setRoleAndLevel: (role, level) => {
    set({ role, level });
  },

  startSession: () => {
    // Generate simulated questions based on level
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
      // Keep only last 100 expressions to avoid memory bloat
      const newLog = [...state.expressionLog, expression];
      if (newLog.length > 100) newLog.shift();
      return { expressionLog: newLog };
    });
  }
}));
