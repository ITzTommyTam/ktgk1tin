import React, { useState, useMemo } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { CognitiveLevel, Question, QuestionType, QuizConfig, StudentProfile } from '../types.ts';
import { QuizCard } from './QuizCard.tsx';

interface QuizHomeViewProps {
  questions: Question[];
  currentProfile: StudentProfile;
  mistakeQuestionIds: string[];
  onStartConfiguredExam: (config: QuizConfig) => void;
  onPreviewCode: (code: string, title: string) => void;
}

export const QuizHomeView: React.FC<QuizHomeViewProps> = ({
  questions,
  currentProfile,
  mistakeQuestionIds,
  onStartConfiguredExam,
  onPreviewCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string | Record<string, boolean>>>({});

  // Lessons definition
  const LESSON_SUMMARIES = [
    {
      id: 'Bài 7',
      title: 'HTML & Cấu trúc trang web',
      desc: 'Cấu trúc tài liệu <!DOCTYPE html>, phần tử <head>, <body>, thẻ và phần tử, phần mềm soạn thảo.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'Bài 8',
      title: 'Định dạng văn bản & Style',
      desc: 'Tiêu đề <h1>-<h6>, đoạn văn <p>, <br>, <hr>, in đậm/nghiêng, sup, sub, del, mark, thuộc tính style CSS.',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'Bài 9',
      title: 'Tạo danh sách & Bảng',
      desc: 'Danh sách có thứ tự <ol>, không thứ tự <ul>, danh sách mô tả <dl>, cấu trúc <table>, <tr>, <th>, <td>, colspan, rowspan.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'Bài 10',
      title: 'Tạo liên kết & Đường dẫn',
      desc: 'Thẻ <a>, href, đường dẫn tuyệt đối (Absolute URL) vs tương đối (Relative URL), liên kết nội bộ id bookmark, liên kết hình ảnh.',
      color: 'from-pink-600 to-rose-600',
    },
  ];

  // Quick Action presets
  const handleQuickStandardExam = () => {
    onStartConfiguredExam({
      title: 'Đề Thi Thử Giữa Kỳ 1 Chuẩn (28 câu - 45 phút)',
      mode: 'timed',
      selectedLessons: ['Bài 7', 'Bài 8', 'Bài 9', 'Bài 10'],
      selectedLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      questionTypes: ['multiple_choice', 'true_false'],
      questionCount: 28,
      durationMinutes: 45,
      shuffleQuestions: true,
      shuffleOptions: true,
      onlyMistakes: false,
    });
  };

  const handleStartLessonExam = (lessonId: string, mode: 'timed' | 'practice') => {
    onStartConfiguredExam({
      title: `${mode === 'timed' ? 'Kiểm tra' : 'Luyện tập'} ${lessonId}`,
      mode,
      selectedLessons: [lessonId],
      selectedLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      questionTypes: ['multiple_choice', 'true_false'],
      questionCount: 25,
      durationMinutes: 25,
      shuffleQuestions: true,
      shuffleOptions: false,
      onlyMistakes: false,
    });
  };

  const handleRetakeMistakes = () => {
    if (mistakeQuestionIds.length === 0) return;
    onStartConfiguredExam({
      title: 'Luyện tập Sổ tay câu sai',
      mode: 'practice',
      selectedLessons: ['Bài 7', 'Bài 8', 'Bài 9', 'Bài 10'],
      selectedLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      questionTypes: ['multiple_choice', 'true_false'],
      questionCount: mistakeQuestionIds.length,
      durationMinutes: 30,
      shuffleQuestions: false,
      shuffleOptions: false,
      onlyMistakes: true,
    });
  };

  // Filtered Question list for browsing/practicing inline
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedLessonFilter !== 'all' && q.lesson !== selectedLessonFilter) return false;
      if (selectedLevelFilter !== 'all' && q.level !== selectedLevelFilter) return false;
      if (selectedTypeFilter !== 'all' && q.type !== selectedTypeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchContent = q.content.toLowerCase().includes(query);
        const matchCode = q.codeSnippet?.toLowerCase().includes(query);
        const matchOptions = q.options?.some((o) => o.text.toLowerCase().includes(query));
        const matchSub = q.subItems?.some((s) => s.statement.toLowerCase().includes(query));
        if (!matchContent && !matchCode && !matchOptions && !matchSub) return false;
      }
      return true;
    });
  }, [questions, selectedLessonFilter, selectedLevelFilter, selectedTypeFilter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">

          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Ôn Luyện Trắc Nghiệm Tin Học 12
          </h1>

          <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed">
            Hệ thống ngân hàng câu hỏi chuẩn hóa bám sát đề cương thi giữa kỳ 1. Hỗ trợ tự động chuyển đổi đề từ tệp PDF/Word, thi thử bấm giờ, xem trước mã HTML trực tiếp và theo dõi năng lực học sinh.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleQuickStandardExam}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs md:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
            >
              <Clock className="w-4 h-4" />
              Thi thử chuẩn đề (28 câu - 45 phút)
            </button>

            {mistakeQuestionIds.length > 0 && (
              <button
                onClick={handleRetakeMistakes}
                className="px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs md:text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Luyện {mistakeQuestionIds.length} câu đã làm sai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Lessons Grid Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
              Chuyên đề kiến thức trọng tâm
            </h2>
            <p className="text-xs text-slate-500">
              Lựa chọn bài học để luyện tập hoặc làm bài kiểm tra riêng biệt
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LESSON_SUMMARIES.map((lesson) => {
            const lessonQuestions = questions.filter((q) => q.lesson === lesson.id);
            const mcCount = lessonQuestions.filter((q) => q.type === 'multiple_choice').length;
            const tfCount = lessonQuestions.filter((q) => q.type === 'true_false').length;

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100">
                      {lesson.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {lessonQuestions.length} câu ({mcCount} TN + {tfCount} Đúng/Sai)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{lesson.desc}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleStartLessonExam(lesson.id, 'practice')}
                    className="flex-1 py-2 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Luyện tập tự do
                  </button>

                  <button
                    onClick={() => handleStartLessonExam(lesson.id, 'timed')}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Thi thử bấm giờ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Bank Explorer & Inline Practice */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
              Khám phá & Luyện tập từng câu hỏi
            </h2>
            <p className="text-xs text-slate-500">
              Có thể thử trả lời trực tiếp và xem ngay đáp án & lời giải thích chi tiết
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo nội dung câu hỏi, thẻ HTML..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-bold px-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>

          {/* Lesson Filter */}
          <select
            value={selectedLessonFilter}
            onChange={(e) => setSelectedLessonFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả bài học</option>
            <option value="Bài 7">Bài 7: HTML</option>
            <option value="Bài 8">Bài 8: Định dạng</option>
            <option value="Bài 9">Bài 9: Danh sách & Bảng</option>
            <option value="Bài 10">Bài 10: Liên kết</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả dạng câu hỏi</option>
            <option value="multiple_choice">4 Lựa chọn (A, B, C, D)</option>
            <option value="true_false">Đúng / Sai (4 ý)</option>
          </select>

          <span className="ml-auto text-slate-400 text-[11px] font-medium pr-1">
            Tìm thấy {filteredQuestions.length} câu hỏi
          </span>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredQuestions.slice(0, 15).map((q, idx) => (
              <QuizCard
                key={q.id}
                question={q}
                questionNumber={idx + 1}
                userAnswer={practiceAnswers[q.id]}
                onAnswerChange={(val) =>
                  setPracticeAnswers((prev) => ({ ...prev, [q.id]: val }))
                }
                mode="practice"
                onPreviewCode={onPreviewCode}
              />
            ))
          )}

          {filteredQuestions.length > 15 && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <span className="text-xs text-slate-500 block">
                Đang hiển thị 15/{filteredQuestions.length} câu hỏi lọc được.
              </span>
              <button
                onClick={handleQuickStandardExam}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                Mở chế độ làm bài toàn màn hình
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
