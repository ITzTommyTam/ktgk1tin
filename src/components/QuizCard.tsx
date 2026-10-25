import React, { useState } from 'react';
import {
  Code,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Eye,
  Info,
} from 'lucide-react';
import { CognitiveLevel, Question, TrueFalseSubItem } from '../types.ts';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  userAnswer?: string | Record<string, boolean>;
  onAnswerChange?: (ans: string | Record<string, boolean>) => void;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
  mode: 'exam' | 'practice' | 'review';
  showExplanationInitially?: boolean;
  onPreviewCode?: (code: string, title: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  userAnswer,
  onAnswerChange,
  isFlagged = false,
  onToggleFlag,
  mode,
  showExplanationInitially = false,
  onPreviewCode,
}) => {
  const [showExplanation, setShowExplanation] = useState(showExplanationInitially);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const isMultipleChoice = question.type === 'multiple_choice';
  const selectedOption = typeof userAnswer === 'string' ? userAnswer : undefined;
  const trueFalseAnswers = typeof userAnswer === 'object' && userAnswer !== null ? (userAnswer as Record<string, boolean>) : {};

  const getLevelBadge = (level: CognitiveLevel) => {
    switch (level) {
      case 'Nhận biết':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Nhận biết</span>;
      case 'Thông hiểu':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Thông hiểu</span>;
      case 'Vận dụng':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Vận dụng</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{level}</span>;
    }
  };

  const handleAskAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
        setShowExplanation(true);
      }
    } catch {
      setAiExplanation(question.explanation || 'Giải thích chi tiết cho câu hỏi này đang ở chế độ ngoại tuyến (Offline).');
      setShowExplanation(true);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      id={`question-${question.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
        isFlagged ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header of Card */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            {questionNumber}
          </span>
          <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-md">
            {question.lesson}
          </span>
          {getLevelBadge(question.level)}
          {question.type === 'true_false' && (
            <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
              Đúng / Sai (4 ý)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onPreviewCode && question.codeSnippet && (
            <button
              onClick={() => onPreviewCode(question.codeSnippet || '', `Mã HTML - Câu ${questionNumber}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              title="Chạy thử nghiệm mã HTML trong câu hỏi"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Xem trước HTML
            </button>
          )}

          {onToggleFlag && mode === 'exam' && (
            <button
              onClick={onToggleFlag}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFlagged
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'text-slate-400 hover:text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={isFlagged ? 'Bỏ đánh dấu xem lại' : 'Đánh dấu xem lại sau'}
            >
              {isFlagged ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Question Content Body */}
      <div className="p-5 space-y-4">
        <div className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
          {question.content}
        </div>

        {/* Code Snippet Box if question involves HTML code */}
        {question.codeSnippet && (
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono shadow-inner">
            <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Mã nguồn tham chiếu
              </span>
              {onPreviewCode && (
                <button
                  onClick={() => onPreviewCode(question.codeSnippet || '', `Thử nghiệm Câu ${questionNumber}`)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-sans"
                >
                  Chạy thử trong trình duyệt
                </button>
              )}
            </div>
            <pre className="p-3.5 overflow-x-auto text-emerald-300 whitespace-pre">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Question Options: Multiple Choice */}
        {isMultipleChoice && question.options && (
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = question.correctOption === opt.id;

              // Styling in Review Mode or Practice mode with feedback
              let cardStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

              if (mode === 'exam') {
                if (isSelected) {
                  cardStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-600';
                  badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
                }
              } else if (mode === 'review' || (mode === 'practice' && showExplanation)) {
                if (isCorrectOpt) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected && !isCorrectOpt) {
                  cardStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 line-through ring-1 ring-rose-400';
                  badgeStyle = 'bg-rose-500 text-white border-rose-500';
                }
              } else if (mode === 'practice') {
                if (isSelected) {
                  cardStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-600';
                  badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
                }
              }

              return (
                <button
                  type="button"
                  key={opt.id}
                  disabled={mode === 'review'}
                  onClick={() => onAnswerChange?.(opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-150 ${cardStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${badgeStyle}`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm leading-relaxed flex-1 pt-0.5">{opt.text}</span>
                  {mode !== 'exam' && (showExplanation || mode === 'review') && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {mode !== 'exam' && (showExplanation || mode === 'review') && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Question Options: True / False (4 Sub-items: a, b, c, d) */}
        {!isMultipleChoice && question.subItems && (
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between pb-1">
              <span>Đánh giá tính Đúng / Sai của từng mệnh đề:</span>
              <span className="text-[11px] text-indigo-600 font-normal">Thang điểm Bộ GD 2025</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
              {question.subItems.map((item: TrueFalseSubItem) => {
                const userVal = trueFalseAnswers[item.id];
                const hasAnswered = userVal !== undefined;
                const isItemCorrect = userVal === item.isCorrect;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {item.id})
                      </span>
                      <span className="text-sm text-slate-800 leading-snug">{item.statement}</span>
                    </div>

                    {/* True / False Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Button: ĐÚNG */}
                      <button
                        type="button"
                        disabled={mode === 'review'}
                        onClick={() => {
                          const updated = { ...trueFalseAnswers, [item.id]: true };
                          onAnswerChange?.(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          userVal === true
                            ? mode === 'review' || (mode === 'practice' && showExplanation)
                              ? item.isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        Đúng
                      </button>

                      {/* Button: SAI */}
                      <button
                        type="button"
                        disabled={mode === 'review'}
                        onClick={() => {
                          const updated = { ...trueFalseAnswers, [item.id]: false };
                          onAnswerChange?.(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          userVal === false
                            ? mode === 'review' || (mode === 'practice' && showExplanation)
                              ? !item.isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                        }`}
                      >
                        Sai
                      </button>

                      {/* Answer Feedback Indicator in Review / Practice Mode */}
                      {(mode === 'review' || (mode === 'practice' && showExplanation)) && (
                        <div className="ml-1">
                          {hasAnswered ? (
                            isItemCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                                <XCircle className="w-4 h-4" />
                                Đ/A: {item.isCorrect ? 'Đúng' : 'Sai'}
                              </div>
                            )
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium">
                              Chưa làm (Đ/A: {item.isCorrect ? 'Đúng' : 'Sai'})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Toolbar for Practice Mode */}
        {mode === 'practice' && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Info className="w-4 h-4" />
              {showExplanation ? 'Ẩn lời giải chi tiết' : 'Xem đáp án & giải thích'}
            </button>

            <button
              onClick={handleAskAi}
              disabled={aiLoading}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              {aiLoading ? 'Gia sư AI đang phân tích...' : 'Gia sư AI phân tích sâu'}
            </button>
          </div>
        )}

        {/* Explanation Box */}
        {(showExplanation || mode === 'review') && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-700 space-y-2 animate-in fade-in duration-150">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Giải thích đáp án & Mẹo ghi nhớ:</span>
            </div>
            <p className="leading-relaxed text-slate-600 whitespace-pre-line">
              {aiExplanation || question.explanation}
            </p>
            {question.source && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                Nguồn: {question.source}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
