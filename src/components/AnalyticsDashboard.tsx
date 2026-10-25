import React, { useState } from 'react';
import {
  BarChart3,
  Trophy,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  User,
  GraduationCap,
  History,
  RotateCcw,
} from 'lucide-react';
import { ExamAttempt, Question, StudentProfile } from '../types.ts';
import { computeUserAnalytics } from '../utils/quiz-logic.ts';

interface AnalyticsDashboardProps {
  currentProfile: StudentProfile;
  profiles: StudentProfile[];
  onSelectProfile: (id: string) => void;
  onOpenProfileModal: () => void;
  attempts: ExamAttempt[];
  allQuestions: Question[];
  onStartCustomQuiz: (mistakeIds?: string[]) => void;
  onViewPastExam: (attempt: ExamAttempt) => void;
  onPreviewCode: (code: string, title: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  onOpenProfileModal,
  attempts,
  allQuestions,
  onStartCustomQuiz,
  onViewPastExam,
  onPreviewCode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes' | 'history'>('overview');

  const analytics = computeUserAnalytics(attempts, allQuestions);
  const questionMap = new Map<string, Question>(allQuestions.map((q) => [q.id, q]));

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 6.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 5.0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'bg-emerald-500';
    if (acc >= 65) return 'bg-blue-500';
    if (acc >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Student Profile Header & Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl ${currentProfile.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center font-black text-2xl shadow-sm`}
          >
            {currentProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {currentProfile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                Lớp {currentProfile.className}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              Chương trình Tin học 12 (HTML & Thiết kế Web) • Tham gia:{' '}
              {new Date(currentProfile.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Quick profile select dropdown */}
          <select
            value={currentProfile.id}
            onChange={(e) => onSelectProfile(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                Học sinh: {p.name} ({p.className})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenProfileModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <User className="w-4 h-4 text-indigo-600" />
            Đổi / Thêm học sinh
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Điểm trung bình</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {analytics.totalAttempts > 0 ? analytics.averageScore.toFixed(1) : '---'}
            <span className="text-xs font-normal text-slate-400 ml-1">/10</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Cao nhất: {analytics.totalAttempts > 0 ? analytics.highestScore.toFixed(1) : '0'} điểm
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Tổng đề đã thi</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {analytics.totalAttempts}
            <span className="text-xs font-normal text-slate-400 ml-1">đề</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {analytics.totalQuestionsAnswered} lượt trả lời
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ chính xác</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">
            {analytics.overallAccuracy}%
          </div>
          <span className="text-[11px] text-slate-500">
            Đúng {analytics.totalAttempts > 0 ? Math.round((analytics.overallAccuracy * analytics.totalQuestionsAnswered) / 100) : 0} câu
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Thời gian học</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {analytics.totalTimeMinutes}
            <span className="text-xs font-normal text-slate-400 ml-1">phút</span>
          </div>
          <span className="text-[11px] text-slate-500">Tổng thời gian làm bài</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Phân tích chuyên đề & Mức độ
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'mistakes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Sổ tay câu sai ({analytics.mistakeQuestionIds.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Lịch sử các lần thi ({attempts.length})
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Mastery breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Mức độ thành thạo theo từng Bài học
                  </h3>
                  <p className="text-xs text-slate-500">Tỷ lệ câu làm đúng theo từng chuyên đề</p>
                </div>
                <Layers className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="space-y-4 pt-2">
                {analytics.lessonMastery.map((item) => (
                  <div key={item.lesson} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {item.lesson}: {item.lessonTitle}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {item.correctAnswers}/{item.totalAttempts} câu
                        </span>
                        <span className="font-extrabold text-slate-800 w-10 text-right">
                          {item.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${getAccuracyColor(
                          item.accuracy
                        )}`}
                        style={{ width: `${item.totalAttempts > 0 ? item.accuracy : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Level Mastery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Phân tích theo Mức độ nhận thức
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhận biết - Thông hiểu - Vận dụng (Chuẩn BGD)
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="space-y-4 pt-2">
                {analytics.levelMastery.map((lvl) => (
                  <div key={lvl.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{lvl.level}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {lvl.correctAnswers}/{lvl.totalAttempts} câu
                        </span>
                        <span className="font-extrabold text-slate-800 w-10 text-right">
                          {lvl.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${getAccuracyColor(
                          lvl.accuracy
                        )}`}
                        style={{ width: `${lvl.totalAttempts > 0 ? lvl.accuracy : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Learning Recommendations */}
              <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold block flex items-center gap-1.5 text-indigo-950">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Đánh giá & Khuyến nghị học tập:
                </span>
                {analytics.totalAttempts === 0 ? (
                  <p className="text-slate-600">
                    Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu một bài thi thử để hệ thống phân tích năng lực chi tiết.
                  </p>
                ) : analytics.weakLessons.length > 0 ? (
                  <p className="text-indigo-800">
                    Bạn đang cần cải thiện thêm kiến thức ở{' '}
                    <strong>{analytics.weakLessons.join(', ')}</strong>. Hãy mở chế độ luyện tập chuyên đề hoặc làm lại các câu sai!
                  </p>
                ) : (
                  <p className="text-emerald-800">
                    Phong độ học tập rất đồng đều và vững chắc qua tất cả các bài 7, 8, 9, 10!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA to start custom exam */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold">Sẵn sàng thử sức với một đề thi mới?</h3>
              <p className="text-xs text-indigo-200">
                Linh hoạt tùy biến số lượng câu hỏi, thời gian đếm ngược, và trộn đề ngẫu nhiên.
              </p>
            </div>
            <button
              onClick={() => onStartCustomQuiz()}
              className="px-6 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-current text-indigo-600" />
              Tạo đề thi mới ngay
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Mistakes Notebook */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Sổ tay lưu trữ các câu hỏi từng làm sai
              </h3>
              <p className="text-xs text-slate-500">
                Gồm {analytics.mistakeQuestionIds.length} câu hỏi bạn cần xem lại để khắc phục lỗ hổng kiến thức
              </p>
            </div>

            {analytics.mistakeQuestionIds.length > 0 && (
              <button
                onClick={() => onStartCustomQuiz(analytics.mistakeQuestionIds)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Luyện tập ngay tất cả {analytics.mistakeQuestionIds.length} câu này
              </button>
            )}
          </div>

          {analytics.mistakeQuestionIds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Không có câu sai nào!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tuyệt vời, bạn đã trả lời đúng tất cả các câu hỏi trong những lần thi trước hoặc chưa làm bài thi nào.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.mistakeQuestionIds.map((qId, idx) => {
                const q = questionMap.get(qId);
                if (!q) return null;
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                          {q.lesson}
                        </span>
                        <span className="text-slate-500 font-medium">{q.level}</span>
                      </div>
                      <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full">
                        Từng làm sai
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-line">
                      {q.content}
                    </p>

                    {q.type === 'multiple_choice' && (
                      <div className="text-xs text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                        Đáp án đúng: {q.correctOption}.{' '}
                        {q.options?.find((o) => o.id === q.correctOption)?.text}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: History Log */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Lịch sử làm bài thi
              </h3>
              <p className="text-xs text-slate-500">Xem lại chi tiết từng bài thi và đáp án đã nộp</p>
            </div>
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Chưa có lịch sử làm bài</h4>
              <p className="text-xs text-slate-500">
                Hãy bắt đầu bài thi đầu tiên để theo dõi tiến độ học tập của bạn tại đây!
              </p>
              <button
                onClick={() => onStartCustomQuiz()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                Bắt đầu làm bài thi
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...attempts].reverse().map((att) => (
                <div
                  key={att.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{att.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {att.mode === 'timed' ? 'Thi bấm giờ' : 'Luyện tập'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(att.timestamp).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s
                      </span>
                      <span>•</span>
                      <span>{att.correctCount}/{att.questionsCount} câu đúng</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div
                      className={`px-3 py-1.5 rounded-xl border font-black text-sm md:text-base ${getScoreColor(
                        att.score
                      )}`}
                    >
                      {att.score.toFixed(1)} đ
                    </div>

                    <button
                      onClick={() => onViewPastExam(att)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                    >
                      Xem lại đề
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
