/**
 * Types for Tin học 12 Multiple Choice & True/False Quiz Platform
 */

export type QuestionType = 'multiple_choice' | 'true_false';

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export interface MultipleChoiceOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface TrueFalseSubItem {
  id: string; // 'a' | 'b' | 'c' | 'd'
  statement: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  level?: CognitiveLevel;
}

export interface Question {
  id: string;
  lesson: 'Bài 7' | 'Bài 8' | 'Bài 9' | 'Bài 10' | string;
  lessonTitle: string;
  type: QuestionType;
  level: CognitiveLevel;
  content: string;
  codeSnippet?: string;
  options?: MultipleChoiceOption[]; // For multiple_choice
  correctOption?: string; // 'A' | 'B' | 'C' | 'D'
  subItems?: TrueFalseSubItem[]; // For true_false (4 sub-items: a, b, c, d)
  explanation?: string;
  source?: string;
  tags?: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  className: string;
  avatarColor: string;
  createdAt: string;
}

export interface UserQuestionAnswer {
  questionId: string;
  answer: string | Record<string, boolean>; // e.g. 'A' or { a: true, b: false, c: true, d: false }
  isCorrect: boolean;
  scoreEarned: number; // 0 to 1 scale per question, converted to 10 total
  timeSpent?: number; // seconds
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  title: string;
  mode: 'timed' | 'practice' | 'custom';
  timestamp: number;
  timeSpentSeconds: number;
  durationLimitSeconds?: number;
  questionsCount: number;
  score: number; // Scale 0-10
  correctCount: number;
  answers: Record<string, string | Record<string, boolean>>;
  questionDetails: UserQuestionAnswer[];
}

export interface LessonMastery {
  lesson: string;
  lessonTitle: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number; // percentage 0-100
}

export interface LevelMastery {
  level: CognitiveLevel;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number; // percentage 0-100
}

export interface QuizConfig {
  title: string;
  mode: 'timed' | 'practice';
  selectedLessons: string[];
  selectedLevels: CognitiveLevel[];
  questionTypes: QuestionType[];
  questionCount: number;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  onlyMistakes: boolean;
}
