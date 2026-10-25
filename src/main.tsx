import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __TIN12_APP_MOUNTED__?: boolean;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Lỗi không xác định khi khởi tạo giao diện.',
    };
  }

  handleResetData = () => {
    try {
      localStorage.removeItem('tin12_student_profiles_v1');
      localStorage.removeItem('tin12_active_user_id_v1');
      localStorage.removeItem('tin12_custom_questions_v1');
      localStorage.removeItem('tin12_session_welcomed_v1');
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <h1 className="text-xl font-bold text-amber-400">Đã xảy ra sự cố hiển thị</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dữ liệu lưu trữ tạm thời trên trình duyệt có thể bị xung đột. Nhấn nút bên dưới để làm mới ứng dụng.
            </p>
            <p className="text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg break-words">
              {this.state.errorMessage}
            </p>
            <button
              onClick={this.handleResetData}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Khôi phục & Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !window.__TIN12_APP_MOUNTED__) {
  window.__TIN12_APP_MOUNTED__ = true;
  createRoot(rootElement).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}
