import React, { useState } from 'react';
import { X, UserPlus, Check, User, GraduationCap, Calendar } from 'lucide-react';
import { StudentProfile } from '../types.ts';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: StudentProfile[];
  currentProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, className: string) => void;
  onLogout?: () => void;
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  currentProfileId,
  onSelectProfile,
  onCreateProfile,
  onLogout,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('12A1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProfile(name.trim(), className.trim() || '12A');
    setName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Hồ sơ người dùng</h3>
              <p className="text-xs text-slate-500">Quản lý kết quả học tập cá nhân hóa cho từng học sinh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isCreating ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Chọn học sinh đang học
                </span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Thêm học sinh mới
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isSelected = p.id === currentProfileId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${p.avatarColor || 'bg-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {p.name}
                            {isSelected && (
                              <span className="text-[10px] bg-indigo-600 text-white font-medium px-2 py-0.5 rounded-full">
                                Đang chọn
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" />
                              Lớp {p.className}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {onLogout && (
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Muốn đổi sang học sinh mới?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Đăng xuất / Nhập học sinh khác
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 12A1"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Tạo hồ sơ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
