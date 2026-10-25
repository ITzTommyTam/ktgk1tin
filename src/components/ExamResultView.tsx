import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  BarChart3,
  Printer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ExamAttempt, Question } from '../types.ts';
import { QuizCard } from './QuizCard.tsx';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  allQuestions: Question[];
  onRetakeExam: () => void;
  onPracticeMistakes: (mistakeIds: string[]) => void;
  onGoToDashboard: () => void;
  onPreviewCode: (code: string, title: string) => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  allQuestions,
  onRetakeExam,
  onPracticeMistakes,
  onGoToDashboard,
  onPreviewCode,
}) => {
  useEffect(() => {
    if (attempt.score >= 8) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.score]);

  const questionMap = new Map<string, Question>(allQuestions.map((q) => [q.id, q]));
  const mistakeIds = attempt.questionDetails
    .filter((d) => !d.isCorrect)
    .map((d) => d.questionId);

  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder} giây`;
    return `${mins} phút ${remainder} giây`;
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 9) return { text: 'Xuất sắc! 🎉', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 8) return { text: 'Giỏi! 🌟', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 6.5) return { text: 'Khá 👍', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (score >= 5.0) return { text: 'Đạt yêu cầu', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: 'Cần ôn tập thêm 📚', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const badge = getPerformanceBadge(attempt.score);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:p-0">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-1 bg-white shadow-2xs">
              <span className={`px-2 py-0.5 rounded-full ${badge.color}`}>
                {badge.text}
              </span>
              <span className="text-slate-500 font-medium">
                {new Date(attempt.timestamp).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kết quả làm bài: {attempt.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Đề thi trắc nghiệm môn Tin học 12 (HTML & Thiết kế Web)
            </p>
          </div>

          {/* Score Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 min-w-[160px]">
            <Trophy className="w-8 h-8 text-amber-300 mb-1" />
            <div className="text-4xl md:text-5xl font-black tracking-tight">
              {attempt.score.toFixed(1)}
              <span className="text-lg font-normal opacity-80">/10</span>
            </div>
            <span className="text-xs font-medium opacity-90 mt-1">Điểm số đạt được</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block mb-1">Thời gian làm bài</span>
            <div className="flex items-center justify-center gap-1 font-bold text-slate-800 text-sm md:text-base">
              <Clock className="w-4 h-4 text-indigo-600" />
              {formatTimeSpent(attempt.timeSpentSeconds)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="text-xs text-emerald-700 block mb-1">Số câu đúng</span>
            <div className="flex items-center justify-center gap-1 font-bold text-emerald-800 text-sm md:text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {attempt.correctCount}/{attempt.questionsCount} câu
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-center">
            <span className="text-xs text-rose-700 block mb-1">Số câu sai</span>
            <div className="flex items-center justify-center gap-1 font-bold text-rose-800 text-sm md:text-base">
              <XCircle className="w-4 h-4 text-rose-600" />
              {mistakeIds.length} câu
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
            <span className="text-xs text-indigo-700 block mb-1">Tỷ lệ chính xác</span>
            <div className="flex items-center justify-center gap-1 font-bold text-indigo-800 text-sm md:text-base">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {Math.round((attempt.correctCount / attempt.questionsCount) * 100)}%
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            In kết quả
          </button>

          <button
            onClick={onRetakeExam}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-indigo-600" />
            Làm lại đề này
          </button>

          {mistakeIds.length > 0 && (
            <button
              onClick={() => onPracticeMistakes(mistakeIds)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Luyện lại {mistakeIds.length} câu sai
            </button>
          )}

          <button
            onClick={onGoToDashboard}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Xem Bảng điều khiển học tập
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết bài thi & Đáp án chuẩn</h2>
          <span className="text-xs text-slate-500 font-medium">
            Kèm giải thích chi tiết & mã HTML minh họa
          </span>
        </div>

        <div className="space-y-4">
          {attempt.questionDetails.map((detail, idx) => {
            const q = questionMap.get(detail.questionId);
            if (!q) return null;

            return (
              <div key={q.id} className="relative">
                <QuizCard
                  question={q}
                  questionNumber={idx + 1}
                  userAnswer={detail.answer}
                  mode="review"
                  showExplanationInitially={true}
                  onPreviewCode={onPreviewCode}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
