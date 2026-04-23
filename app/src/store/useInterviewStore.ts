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
  setRoleAndLevel: (role: string, level: string) => void;
  startSession: () => void;
  nextQuestion: () => void;
  endSession: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  role: '',
  level: '',
  questions: mockQuestions,
  currentQuestionIndex: 0,
  sessionActive: false,
  setRoleAndLevel: (role, level) => set({ role, level }),
  startSession: () => set({ sessionActive: true, currentQuestionIndex: 0 }),
  nextQuestion: () => set((state) => ({ 
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1) 
  })),
  endSession: () => set({ sessionActive: false }),
  reset: () => set({ role: '', level: '', currentQuestionIndex: 0, sessionActive: false }),
}));
