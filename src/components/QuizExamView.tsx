import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ListOrdered,
} from 'lucide-react';
import { ExamAttempt, Question, UserQuestionAnswer } from '../types.ts';
import { QuizCard } from './QuizCard.tsx';
import { gradeMultipleChoice, gradeTrueFalseQuestion, calculateExamScore } from '../utils/quiz-logic.ts';

interface QuizExamViewProps {
  questions: Question[];
  title: string;
  mode: 'timed' | 'practice';
  durationMinutes: number;
  studentId: string;
  onFinishExam: (attempt: ExamAttempt) => void;
  onExit: () => void;
  onPreviewCode: (code: string, title: string) => void;
}

export const QuizExamView: React.FC<QuizExamViewProps> = ({
  questions,
  title,
  mode,
  durationMinutes,
  studentId,
  onFinishExam,
  onExit,
  onPreviewCode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | Record<string, boolean>>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Timer countdown
  useEffect(() => {
    if (mode !== 'timed') return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const handleToggleFlag = (id: string) => {
    const next = new Set(flaggedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFlaggedIds(next);
  };

  const handleAnswerChange = (qId: string, val: string | Record<string, boolean>) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const isQuestionAnswered = (q: Question): boolean => {
    const val = answers[q.id];
    if (val === undefined || val === null) return false;
    if (q.type === 'multiple_choice') {
      return typeof val === 'string' && val.length > 0;
    }
    if (q.type === 'true_false') {
      if (typeof val !== 'object') return false;
      const dict = val as Record<string, boolean>;
      // All 4 sub-items should be answered
      return (q.subItems || []).every((sub) => dict[sub.id] !== undefined);
    }
    return false;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSubmit = (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const totalSecondsSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Grade each question
    const questionDetails: UserQuestionAnswer[] = [];
    const questionScores: number[] = [];
    let correctCount = 0;

    for (const q of questions) {
      const userAns = answers[q.id];
      if (q.type === 'multiple_choice') {
        const isRight = gradeMultipleChoice(userAns as string, q.correctOption);
        const score = isRight ? 1.0 : 0;
        if (isRight) correctCount++;
        questionScores.push(score);
        questionDetails.push({
          questionId: q.id,
          answer: (userAns as string) || '',
          isCorrect: isRight,
          scoreEarned: score,
        });
      } else if (q.type === 'true_false') {
        const tfGrading = gradeTrueFalseQuestion(
          userAns as Record<string, boolean>,
          q.subItems || []
        );
        if (tfGrading.isAllCorrect) correctCount++;
        questionScores.push(tfGrading.scoreRatio);
        questionDetails.push({
          questionId: q.id,
          answer: (userAns as Record<string, boolean>) || {},
          isCorrect: tfGrading.isAllCorrect,
          scoreEarned: tfGrading.scoreRatio,
        });
      }
    }

    const { score } = calculateExamScore(questionScores);

    const attempt: ExamAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      title,
      mode,
      timestamp: Date.now(),
      timeSpentSeconds: totalSecondsSpent,
      durationLimitSeconds: mode === 'timed' ? durationMinutes * 60 : undefined,
      questionsCount: questions.length,
      score,
      correctCount,
      answers,
      questionDetails,
    };

    onFinishExam(attempt);
  };

  // Format timer HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Rời khỏi bài thi"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-indigo-600">
                  Câu {currentIndex + 1}/{questions.length}
                </span>
                <span>•</span>
                <span>Đã làm: {answeredCount}/{questions.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Clock */}
            {mode === 'timed' ? (
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs md:text-sm shadow-2xs ${
                  secondsRemaining < 120
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : secondsRemaining < 300
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            ) : (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl">
                Chế độ tự do
              </span>
            )}

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all hover:shadow-indigo-500/25"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Linear Progress bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Examination View Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question */}
        <div className="lg:col-span-8 space-y-4">
          {currentQ && (
            <QuizCard
              key={currentQ.id}
              question={currentQ}
              questionNumber={currentIndex + 1}
              userAnswer={answers[currentQ.id]}
              onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
              isFlagged={flaggedIds.has(currentQ.id)}
              onToggleFlag={() => handleToggleFlag(currentQ.id)}
              mode={mode === 'practice' ? 'practice' : 'exam'}
              onPreviewCode={onPreviewCode}
            />
          )}

          {/* Previous / Next navigation toolbar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </button>

            <button
              onClick={() => handleToggleFlag(currentQ.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                flaggedIds.has(currentQ.id)
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {flaggedIds.has(currentQ.id) ? 'Đã lưu đánh dấu' : 'Đánh dấu câu này'}
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                Câu tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Hoàn thành & Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                Bảng điều hướng câu hỏi
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pb-4 text-[11px] text-slate-600 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0"></span>
                <span>Đã làm ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400 shrink-0"></span>
                <span>Đánh dấu ({flaggedIds.size})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0"></span>
                <span>Chưa làm ({unansweredCount})</span>
              </div>
            </div>

            {/* Grid of numbers */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = isQuestionAnswered(q);
                const isFlagged = flaggedIds.has(q.id);
                const isCurrent = currentIndex === idx;

                let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-indigo-600 ring-offset-1 font-extrabold';
                }
                if (isAnswered) {
                  btnStyle += ' bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500';
                } else if (isFlagged) {
                  btnStyle += ' bg-amber-400 text-amber-950 hover:bg-amber-500 border-amber-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center relative ${btnStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
              >
                Kiểm tra & Nộp bài thi
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bài thi?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Hệ thống sẽ chấm điểm tự động và lưu kết quả vào bảng phân tích học tập.
            </p>

            {unansweredCount > 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Bạn vẫn còn <strong>{unansweredCount}</strong> câu chưa hoàn thành.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Tuyệt vời! Bạn đã trả lời đầy đủ tất cả {questions.length} câu hỏi.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
