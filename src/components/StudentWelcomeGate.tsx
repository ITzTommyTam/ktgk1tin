import React, { useState } from 'react';
import {
  Code2,
  GraduationCap,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface StudentWelcomeGateProps {
  onEnter: (name: string, className: string) => void;
  existingProfiles: StudentProfile[];
  onSelectExisting: (id: string) => void;
}

export const StudentWelcomeGate: React.FC<StudentWelcomeGateProps> = ({
  onEnter,
  existingProfiles,
  onSelectExisting,
}) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!className.trim()) {
      setError('Vui lòng nhập tên lớp của bạn (ví dụ: 12A1).');
      return;
    }
    setError(null);
    onEnter(name.trim(), className.trim());
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Code2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            TinHoc12<span className="text-indigo-400">.Quiz</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto">
            Nền tảng ôn thi & kiểm tra trắc nghiệm Tin học 12 (HTML & Thiết kế Web)
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Thông tin học sinh
            </h2>
            <p className="text-xs text-slate-500">
              Vui lòng nhập tên và lớp của bạn trước khi vào ôn luyện để hệ thống lưu trữ bảng phân tích kết quả học tập.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lớp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 12A1"
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] mt-2"
            >
              <span>Bắt đầu vào ôn luyện</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Existing Profiles on this Device */}
          {existingProfiles.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Hoặc chọn hồ sơ đã lưu trên thiết bị này:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {existingProfiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectExisting(p.id)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${p.avatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500">Lớp {p.className}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600">Tiếp tục →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature summary bullets */}
        <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Tự động chuyển đổi đề từ PDF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Phân tích kết quả học tập</span>
          </div>
        </div>
      </div>
    </div>
  );
};
