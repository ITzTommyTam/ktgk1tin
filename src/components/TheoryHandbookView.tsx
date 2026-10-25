import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { THEORY_NOTES } from '../data/theory-notes.ts';

interface TheoryHandbookViewProps {
  onStartLessonPractice: (lessonId: string) => void;
  onPreviewCode: (code: string, title: string) => void;
}

export const TheoryHandbookView: React.FC<TheoryHandbookViewProps> = ({
  onStartLessonPractice,
  onPreviewCode,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('bai-7');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeTitle, setCopiedCodeTitle] = useState<string | null>(null);

  const activeSection = THEORY_NOTES.find((s) => s.id === selectedLessonId) || THEORY_NOTES[0];

  const handleCopyCode = (title: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeTitle(title);
    setTimeout(() => setCopiedCodeTitle(null), 2000);
  };

  const filteredSections = THEORY_NOTES.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.keyPoints.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              Sổ tay Lý thuyết Trọng tâm (Tin học 12)
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Tổng hợp lý thuyết trọng tâm cần nhớ từ đề cương ôn tập giữa kỳ 1 (Bài 7 – Bài 10).
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="pt-3 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm kiến thức (thẻ <p>, <a>, bảng, liên kết...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60"
            />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left side: Lesson navigation tabs */}
        <div className="md:col-span-4 space-y-2">
          {filteredSections.map((sec) => {
            const isSelected = sec.id === selectedLessonId;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedLessonId(sec.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isSelected ? 'text-indigo-200' : 'text-indigo-600'
                    }`}
                  >
                    {sec.lesson}
                  </span>
                  <h3 className="text-sm font-bold mt-0.5 leading-snug">{sec.title}</h3>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    isSelected ? 'bg-indigo-500/80 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sec.keyPoints.length} mục
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Detailed Theory Card */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {activeSection.lesson}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeSection.title}</h2>
            </div>

            <button
              onClick={() => onStartLessonPractice(activeSection.lesson)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Luyện trắc nghiệm {activeSection.lesson}
            </button>
          </div>

          {/* Key Bullet Points */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nội dung cốt lõi cần nhớ
            </h3>
            <div className="space-y-2.5">
              {activeSection.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples with Preview */}
          {activeSection.codeExamples && activeSection.codeExamples.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600" />
                Mã nguồn HTML mẫu minh họa
              </h3>

              {activeSection.codeExamples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 overflow-hidden shadow-sm"
                >
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{ex.title}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(ex.title, ex.code)}
                        className="px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1 text-[11px]"
                      >
                        {copiedCodeTitle === ex.title ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedCodeTitle === ex.title ? 'Đã sao chép' : 'Sao chép'}
                      </button>

                      <button
                        onClick={() => onPreviewCode(ex.code, ex.title)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shadow-2xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Chạy thử trên trình duyệt
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{ex.code}</code>
                  </pre>

                  {ex.note && (
                    <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 italic">
                      Ghi chú: {ex.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
