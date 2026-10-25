import React from 'react';
import {
  Code2,
  BookOpen,
  BarChart3,
  FileUp,
  User,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface NavbarProps {
  activeTab: 'quiz' | 'analytics' | 'converter' | 'theory';
  onSelectTab: (tab: 'quiz' | 'analytics' | 'converter' | 'theory') => void;
  currentProfile: StudentProfile;
  onOpenProfileModal: () => void;
  onOpenConfigModal: () => void;
  totalQuestionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentProfile,
  onOpenProfileModal,
  onOpenConfigModal,
  totalQuestionsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('quiz')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                TinHoc12<span className="text-indigo-600">.Quiz</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                Đề Cương Giữa Kỳ 1
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('quiz')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'quiz'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Ôn Luyện & Thi Thử
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Bảng Điều Khiển
            </button>

            <button
              onClick={() => onSelectTab('converter')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'converter'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileUp className="w-4 h-4" />
              Chuyển Đổi Tệp & Tạo Đề
            </button>

            <button
              onClick={() => onSelectTab('theory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'theory'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Sổ Tay Lý Thuyết
            </button>
          </nav>
        </div>

        {/* Right side Profile & Quick Action */}
        <div className="flex items-center gap-3">
          {/* Question bank counter badge */}
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
            {totalQuestionsCount} câu hỏi
          </span>

          {/* Create custom test button */}
          <button
            onClick={onOpenConfigModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo Đề Thi</span>
          </button>

          {/* Student Profile avatar and switcher */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Đổi hoặc thêm học sinh"
          >
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {currentProfile.name}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold block leading-none">
                Lớp {currentProfile.className}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-xl ${currentProfile.avatarColor || 'bg-indigo-600'} text-white font-black text-xs flex items-center justify-center shadow-xs`}
            >
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50">
        <button
          onClick={() => onSelectTab('quiz')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
            activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Ôn Luyện
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Báo Cáo
        </button>

        <button
          onClick={() => onSelectTab('converter')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
            activeTab === 'converter' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          <FileUp className="w-3.5 h-3.5" />
          Tạo Đề
        </button>

        <button
          onClick={() => onSelectTab('theory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
            activeTab === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Lý Thuyết
        </button>
      </div>
    </header>
  );
};
