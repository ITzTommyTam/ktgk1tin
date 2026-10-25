import React, { useState, useEffect } from 'react';
import { DEFAULT_QUESTIONS } from './data/default-questions.ts';
import { ExamAttempt, Question, QuizConfig, StudentProfile } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { QuizHomeView } from './components/QuizHomeView.tsx';
import { QuizExamView } from './components/QuizExamView.tsx';
import { ExamResultView } from './components/ExamResultView.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { FileConverterView } from './components/FileConverterView.tsx';
import { TheoryHandbookView } from './components/TheoryHandbookView.tsx';
import { QuizConfigModal } from './components/QuizConfigModal.tsx';
import { StudentProfileModal } from './components/StudentProfileModal.tsx';
import { HtmlPreviewModal } from './components/HtmlPreviewModal.tsx';
import { StudentWelcomeGate } from './components/StudentWelcomeGate.tsx';
import { filterQuestions, computeUserAnalytics } from './utils/quiz-logic.ts';

const STORAGE_KEY_QUESTIONS = 'tinhoc12_questions_v1';
const STORAGE_KEY_PROFILES = 'tinhoc12_profiles_v1';
const STORAGE_KEY_ATTEMPTS = 'tinhoc12_attempts_v1';
const STORAGE_KEY_ACTIVE_PROFILE = 'tinhoc12_active_profile_v1';

export default function App() {
  // 1. Questions Bank State
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved questions', e);
    }
    return DEFAULT_QUESTIONS;
  });

  // 2. Student Profiles State
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved profiles', e);
    }
    return [];
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    try {
      const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';
      if (isAutostart) return 'student_autostart';
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
      if (saved) return saved;
    } catch {}
    return '';
  });

  // 3. Exam Attempts State
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved attempts', e);
    }
    return [];
  });

  // 4. Navigation & Active Sessions
  const [activeTab, setActiveTab] = useState<'quiz' | 'analytics' | 'converter' | 'theory'>('quiz');
  const [activeExam, setActiveExam] = useState<{
    questions: Question[];
    title: string;
    mode: 'timed' | 'practice';
    durationMinutes: number;
  } | null>(null);
  const [viewingResultAttempt, setViewingResultAttempt] = useState<ExamAttempt | null>(null);

  // 5. Modals State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    code: string;
    title: string;
  }>({
    isOpen: false,
    code: '',
    title: '',
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('Could not save questions to localStorage', e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Could not save profiles to localStorage', e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, currentProfileId);
    } catch (e) {
      console.warn('Could not save active profile to localStorage', e);
    }
  }, [currentProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Could not save attempts to localStorage', e);
    }
  }, [attempts]);

  // Autostart fallback for test runners
  useEffect(() => {
    const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';
    if (isAutostart && profiles.length === 0) {
      const demo: StudentProfile = {
        id: 'student_autostart',
        name: 'Học sinh Demo',
        className: '12A1',
        avatarColor: 'bg-indigo-600',
        createdAt: new Date().toISOString(),
      };
      setProfiles([demo]);
      setCurrentProfileId(demo.id);
    }
  }, [profiles.length]);

  const currentProfile = profiles.find((p) => p.id === currentProfileId);
  const studentAttempts = currentProfile ? attempts.filter((a) => a.studentId === currentProfile.id) : [];
  const currentAnalytics = computeUserAnalytics(studentAttempts, questions);

  // Handlers
  const handleCreateProfile = (name: string, className: string) => {
    const avatarColors = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-purple-600',
      'bg-teal-600',
    ];
    const newProfile: StudentProfile = {
      id: `student_${Date.now()}`,
      name,
      className,
      avatarColor: avatarColors[profiles.length % avatarColors.length],
      createdAt: new Date().toISOString(),
    };
    setProfiles([...profiles, newProfile]);
    setCurrentProfileId(newProfile.id);
  };

  const handleStartConfiguredExam = (config: QuizConfig) => {
    const mistakeSet = new Set(currentAnalytics.mistakeQuestionIds);
    const selectedPool = filterQuestions(questions, config, mistakeSet);

    if (selectedPool.length === 0) {
      alert('Không có câu hỏi nào thỏa mãn tiêu chí lựa chọn.');
      return;
    }

    setActiveExam({
      questions: selectedPool,
      title: config.title,
      mode: config.mode,
      durationMinutes: config.durationMinutes,
    });
    setViewingResultAttempt(null);
  };

  const handleFinishExam = (attempt: ExamAttempt) => {
    setAttempts((prev) => [...prev, attempt]);
    setActiveExam(null);
    setViewingResultAttempt(attempt);
  };

  const handleImportQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const filtered = newQuestions.filter((q) => !existingIds.has(q.id));
      return [...prev, ...filtered];
    });
  };

  const handleStartExamFromQuestions = (customQuestions: Question[], title: string) => {
    handleImportQuestions(customQuestions);
    setActiveExam({
      questions: customQuestions,
      title: title || 'Đề thi trắc nghiệm tùy chọn',
      mode: 'timed',
      durationMinutes: Math.max(15, Math.round(customQuestions.length * 1.5)),
    });
    setViewingResultAttempt(null);
  };

  const handleOpenPreviewCode = (code: string, title: string) => {
    setPreviewModal({
      isOpen: true,
      code,
      title: title || 'Mô phỏng mã HTML',
    });
  };

  // If no student profile selected or entered, display the StudentWelcomeGate
  if (!currentProfile) {
    return (
      <StudentWelcomeGate
        onEnter={handleCreateProfile}
        existingProfiles={profiles}
        onSelectExisting={(id) => setCurrentProfileId(id)}
      />
    );
  }

  // If in an active exam session, show the Exam Interface
  if (activeExam) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <QuizExamView
          questions={activeExam.questions}
          title={activeExam.title}
          mode={activeExam.mode}
          durationMinutes={activeExam.durationMinutes}
          studentId={currentProfile.id}
          onFinishExam={handleFinishExam}
          onExit={() => {
            if (confirm('Bạn có chắc chắn muốn thoát khỏi bài thi? Tiến trình hiện tại sẽ không được lưu.')) {
              setActiveExam(null);
            }
          }}
          onPreviewCode={handleOpenPreviewCode}
        />

        <HtmlPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
          initialCode={previewModal.code}
          title={previewModal.title}
        />
      </div>
    );
  }

  // If viewing exam result
  if (viewingResultAttempt) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setViewingResultAttempt(null);
            setActiveTab(tab);
          }}
          currentProfile={currentProfile}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          totalQuestionsCount={questions.length}
        />

        <main className="flex-1 pb-16">
          <ExamResultView
            attempt={viewingResultAttempt}
            allQuestions={questions}
            onRetakeExam={() => {
              const prevQuestions = viewingResultAttempt.questionDetails
                .map((d) => questions.find((q) => q.id === d.questionId))
                .filter(Boolean) as Question[];

              setActiveExam({
                questions: prevQuestions.length > 0 ? prevQuestions : questions.slice(0, 20),
                title: viewingResultAttempt.title,
                mode: viewingResultAttempt.mode === 'practice' ? 'practice' : 'timed',
                durationMinutes: 30,
              });
              setViewingResultAttempt(null);
            }}
            onPracticeMistakes={(mistakeIds) => {
              const mistakeQuestions = mistakeIds
                .map((id) => questions.find((q) => q.id === id))
                .filter(Boolean) as Question[];

              if (mistakeQuestions.length > 0) {
                setActiveExam({
                  questions: mistakeQuestions,
                  title: 'Luyện lại các câu làm sai',
                  mode: 'practice',
                  durationMinutes: 30,
                });
                setViewingResultAttempt(null);
              }
            }}
            onGoToDashboard={() => {
              setViewingResultAttempt(null);
              setActiveTab('analytics');
            }}
            onPreviewCode={handleOpenPreviewCode}
          />
        </main>

        <HtmlPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
          initialCode={previewModal.code}
          title={previewModal.title}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentProfile={currentProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        totalQuestionsCount={questions.length}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'quiz' && (
          <QuizHomeView
            questions={questions}
            currentProfile={currentProfile}
            mistakeQuestionIds={currentAnalytics.mistakeQuestionIds}
            onStartConfiguredExam={handleStartConfiguredExam}
            onPreviewCode={handleOpenPreviewCode}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            currentProfile={currentProfile}
            profiles={profiles}
            onSelectProfile={setCurrentProfileId}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            attempts={studentAttempts}
            allQuestions={questions}
            onStartCustomQuiz={(mistakeIds) => {
              if (mistakeIds && mistakeIds.length > 0) {
                const mistakeQuestions = mistakeIds
                  .map((id) => questions.find((q) => q.id === id))
                  .filter(Boolean) as Question[];

                setActiveExam({
                  questions: mistakeQuestions,
                  title: 'Luyện tập Sổ tay câu sai',
                  mode: 'practice',
                  durationMinutes: 30,
                });
              } else {
                setIsConfigModalOpen(true);
              }
            }}
            onViewPastExam={(att) => setViewingResultAttempt(att)}
            onPreviewCode={handleOpenPreviewCode}
          />
        )}

        {activeTab === 'converter' && (
          <FileConverterView
            onImportQuestions={handleImportQuestions}
            onStartExamFromQuestions={handleStartExamFromQuestions}
            existingQuestionsCount={questions.length}
          />
        )}

        {activeTab === 'theory' && (
          <TheoryHandbookView
            onStartLessonPractice={(lessonId) => {
              handleStartConfiguredExam({
                title: `Luyện tập chuyên đề ${lessonId}`,
                mode: 'practice',
                selectedLessons: [lessonId],
                selectedLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
                questionTypes: ['multiple_choice', 'true_false'],
                questionCount: 25,
                durationMinutes: 30,
                shuffleQuestions: true,
                shuffleOptions: false,
                onlyMistakes: false,
              });
            }}
            onPreviewCode={handleOpenPreviewCode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Nền tảng Ôn tập & Thi thử Trắc nghiệm Tin học 12 (Chương trình GDPT mới) • Dựa trên đề cương giữa kỳ 1
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('theory')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Sổ tay lý thuyết
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('converter')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Chuyển đổi tệp & Tạo đề
            </button>
          </div>
        </div>
      </footer>

      {/* Custom Exam Configuration Modal */}
      <QuizConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onStartQuiz={handleStartConfiguredExam}
        totalAvailableCount={questions.length}
        mistakesCount={currentAnalytics.mistakeQuestionIds.length}
      />

      {/* Student Profile Switcher Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        currentProfileId={currentProfileId}
        onSelectProfile={setCurrentProfileId}
        onCreateProfile={handleCreateProfile}
        onLogout={() => setCurrentProfileId('')}
      />

      {/* Live HTML Preview Sandbox Modal */}
      <HtmlPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        initialCode={previewModal.code}
        title={previewModal.title}
      />
    </div>
  );
}
