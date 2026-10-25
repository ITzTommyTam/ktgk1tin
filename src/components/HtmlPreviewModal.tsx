import React, { useState } from 'react';
import { X, Play, Code2, RotateCcw, Copy, Check } from 'lucide-react';

interface HtmlPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  title?: string;
}

export const HtmlPreviewModal: React.FC<HtmlPreviewModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  title = 'Trình chạy thử nghiệm mã HTML',
}) => {
  const [code, setCode] = useState<string>(initialCode || '<p>Nhập mã HTML vào đây...</p>');
  const [copied, setCopied] = useState(false);

  // Update code when initialCode changes
  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500">Mô phỏng hiển thị trên trình duyệt theo chuẩn HTML5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace: 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left: Code Editor */}
          <div className="flex flex-col h-full bg-slate-950 text-slate-200">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900">
              <span className="font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Mã nguồn HTML
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-2 py-1 hover:bg-slate-800 rounded flex items-center gap-1 text-slate-400 hover:text-slate-200"
                  title="Đặt lại mã ban đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 hover:bg-slate-800 rounded flex items-center gap-1 text-slate-400 hover:text-slate-200"
                  title="Sao chép mã"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã chép' : 'Chép'}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent font-mono text-sm leading-relaxed resize-none focus:outline-none text-emerald-300 selection:bg-indigo-600"
              placeholder="Nhập mã HTML vào đây..."
              spellCheck={false}
            />
          </div>

          {/* Right: Live Browser Render */}
          <div className="flex flex-col h-full bg-slate-100">
            <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-200/80">
              <span className="font-semibold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                Kết quả hiển thị trên trình duyệt
              </span>
              <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded shadow-xs">
                Sandbox an toàn
              </span>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-white">
              <iframe
                title="HTML Preview"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:8px;margin:0;color:#1e293b;}</style></head><body>${code}</body></html>`}
                className="w-full h-full min-h-[280px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Gợi ý: Bạn có thể chỉnh sửa trực tiếp mã bên trái để xem kết quả cập nhật tức thì.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
