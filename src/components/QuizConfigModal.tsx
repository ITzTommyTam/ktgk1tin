import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  Shuffle,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CognitiveLevel, QuestionType, QuizConfig } from '../types.ts';

interface QuizConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
  totalAvailableCount: number;
  mistakesCount: number;
}

export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({
  isOpen,
  onClose,
  onStartQuiz,
  totalAvailableCount,
  mistakesCount,
}) => {
  const [title, setTitle] = useState('Đề Ôn Tập Tin Học 12 - Giữa Kỳ 1');
  const [mode, setMode] = useState<'timed' | 'practice'>('timed');
  const [selectedLessons, setSelectedLessons] = useState<string[]>([
    'Bài 7',
    'Bài 8',
    'Bài 9',
    'Bài 10',
  ]);
  const [selectedLevels, setSelectedLevels] = useState<CognitiveLevel[]>([
    'Nhận biết',
    'Thông hiểu',
    'Vận dụng',
  ]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'true_false',
  ]);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [onlyMistakes, setOnlyMistakes] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleLesson = (lesson: string) => {
    if (selectedLessons.includes(lesson)) {
      if (selectedLessons.length === 1) return; // Keep at least one
      setSelectedLessons(selectedLessons.filter((l) => l !== lesson));
    } else {
      setSelectedLessons([...selectedLessons, lesson]);
    }
  };

  const toggleLevel = (lvl: CognitiveLevel) => {
    if (selectedLevels.includes(lvl)) {
      if (selectedLevels.length === 1) return;
      setSelectedLevels(selectedLevels.filter((l) => l !== lvl));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const toggleType = (t: QuestionType) => {
    if (questionTypes.includes(t)) {
      if (questionTypes.length === 1) return;
      setQuestionTypes(questionTypes.filter((type) => type !== t));
    } else {
      setQuestionTypes([...questionTypes, t]);
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({
      title: title.trim() || 'Đề Thi Tin Học 12',
      mode,
      selectedLessons,
      selectedLevels,
      questionTypes,
      questionCount,
      durationMinutes,
      shuffleQuestions,
      shuffleOptions,
      onlyMistakes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Tạo đề thi tùy chỉnh</h3>
              <p className="text-xs text-slate-500">
                Linh hoạt chọn bài học, mức độ, số lượng câu và thời gian thi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStart} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Preset: Mistakes Only Toggle if any exist */}
          {mistakesCount > 0 && (
            <div
              onClick={() => setOnlyMistakes(!onlyMistakes)}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                onlyMistakes
                  ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Chế độ luyện lại các câu từng làm sai ({mistakesCount} câu)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tập trung cải thiện các phần kiến thức còn chưa vững
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={onlyMistakes}
                onChange={() => {}}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Hình thức làm bài
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('timed')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  mode === 'timed'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className={`w-5 h-5 ${mode === 'timed' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {mode === 'timed' && (
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      Đã chọn
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Thi thử bấm giờ</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đồng hồ đếm ngược, mô phỏng kỳ thi thật, nộp bài tính điểm
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  mode === 'practice'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className={`w-5 h-5 ${mode === 'practice' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {mode === 'practice' && (
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      Đã chọn
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Luyện tập tự do</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Không giới hạn thời gian, xem đáp án & giải thích AI ngay sau mỗi câu
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Lessons Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chọn nội dung bài học
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedLessons(['Bài 7', 'Bài 8', 'Bài 9', 'Bài 10'])}
                  className="text-indigo-600 hover:underline"
                >
                  Chọn tất cả
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'Bài 7', title: 'Bài 7: HTML & Cấu trúc trang web' },
                { id: 'Bài 8', title: 'Bài 8: Định dạng văn bản & Style' },
                { id: 'Bài 9', title: 'Bài 9: Kiểu danh sách & Bảng' },
                { id: 'Bài 10', title: 'Bài 10: Tạo liên kết & Đường dẫn' },
              ].map((item) => {
                const checked = selectedLessons.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleLesson(item.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                      checked
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.title}</span>
                    <input type="checkbox" checked={checked} onChange={() => {}} className="w-4 h-4 text-indigo-600 rounded" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cognitive Levels and Question Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mức độ nhận thức
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Nhận biết', 'Thông hiểu', 'Vận dụng'] as CognitiveLevel[]).map((lvl) => {
                  const active = selectedLevels.includes(lvl);
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dạng câu hỏi
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleType('multiple_choice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    questionTypes.includes('multiple_choice')
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  4 Lựa chọn (A, B, C, D)
                </button>
                <button
                  type="button"
                  onClick={() => toggleType('true_false')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    questionTypes.includes('true_false')
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Đúng / Sai (4 ý)
                </button>
              </div>
            </div>
          </div>

          {/* Numbers: Question Count & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số lượng câu hỏi
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value={10}>10 câu (Ôn tập nhanh)</option>
                <option value={20}>20 câu (Chuẩn đề 15-30p)</option>
                <option value={28}>28 câu (Đề thi thử chuẩn BGD)</option>
                <option value={40}>40 câu (Đề thi đầy đủ 45p)</option>
                <option value={totalAvailableCount}>Toàn bộ ngân hàng ({totalAvailableCount} câu)</option>
              </select>
            </div>

            {mode === 'timed' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Thời gian làm bài
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value={15}>15 phút</option>
                  <option value={20}>20 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút (Đề thi học kỳ)</option>
                  <option value={60}>60 phút</option>
                </select>
              </div>
            )}
          </div>

          {/* Shuffle Options */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Tùy chọn xáo trộn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                Đảo ngẫu nhiên thứ tự câu hỏi
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Đảo vị trí các phương án A, B, C, D
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            {mode === 'timed' ? 'Bắt đầu làm bài thi' : 'Bắt đầu luyện tập ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};
