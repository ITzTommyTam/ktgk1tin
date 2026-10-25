import {
  CognitiveLevel,
  ExamAttempt,
  LessonMastery,
  LevelMastery,
  Question,
  QuestionType,
  QuizConfig,
  TrueFalseSubItem,
} from '../types.ts';

/**
 * Grades a single multiple-choice question.
 */
export function gradeMultipleChoice(userAns?: string, correctAns?: string): boolean {
  if (!userAns || !correctAns) return false;
  return userAns.trim().toUpperCase() === correctAns.trim().toUpperCase();
}

/**
 * Standard Ministry of Education (BGD) True/False question scoring system:
 * 1 ý đúng = 0.1 đ (10%)
 * 2 ý đúng = 0.25 đ (25%)
 * 3 ý đúng = 0.50 đ (50%)
 * 4 ý đúng = 1.00 đ (100%)
 */
export function gradeTrueFalseQuestion(
  userAns: Record<string, boolean> | undefined,
  subItems: TrueFalseSubItem[]
): {
  scoreRatio: number; // 0, 0.1, 0.25, 0.5, 1.0
  correctCount: number;
  totalSubItems: number;
  isAllCorrect: boolean;
} {
  if (!userAns || !subItems || subItems.length === 0) {
    return { scoreRatio: 0, correctCount: 0, totalSubItems: subItems ? subItems.length : 0, isAllCorrect: false };
  }

  let correctCount = 0;
  for (const item of subItems) {
    const userVal = userAns[item.id];
    if (userVal !== undefined && userVal === item.isCorrect) {
      correctCount++;
    }
  }

  let scoreRatio = 0;
  if (correctCount === 1) scoreRatio = 0.1;
  else if (correctCount === 2) scoreRatio = 0.25;
  else if (correctCount === 3) scoreRatio = 0.5;
  else if (correctCount === 4) scoreRatio = 1.0;
  else if (correctCount > 4) scoreRatio = 1.0;

  return {
    scoreRatio,
    correctCount,
    totalSubItems: subItems.length,
    isAllCorrect: correctCount === subItems.length && subItems.length > 0,
  };
}

/**
 * Calculates overall exam score on a 10-point scale.
 */
export function calculateExamScore(questionScores: number[]): {
  score: number;
  maxScore: number;
  percentage: number;
} {
  if (!questionScores || questionScores.length === 0) {
    return { score: 0, maxScore: 10, percentage: 0 };
  }

  const totalRaw = questionScores.reduce((acc, curr) => acc + curr, 0);
  const normalized = (totalRaw / questionScores.length) * 10;
  const rounded = Math.round(normalized * 100) / 100;
  const percentage = Math.round((totalRaw / questionScores.length) * 100);

  return {
    score: Math.min(10, Math.max(0, rounded)),
    maxScore: 10,
    percentage,
  };
}

/**
 * Fisher-Yates pure shuffle without mutating original array.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

/**
 * Filter questions based on custom configuration.
 */
export function filterQuestions(
  allQuestions: Question[],
  config: Partial<QuizConfig>,
  mistakeQuestionIds?: Set<string>
): Question[] {
  let pool = [...allQuestions];

  // Filter mistakes only if requested
  if (config.onlyMistakes && mistakeQuestionIds && mistakeQuestionIds.size > 0) {
    pool = pool.filter((q) => mistakeQuestionIds.has(q.id));
  }

  // Filter by lessons
  if (config.selectedLessons && config.selectedLessons.length > 0) {
    const lessonSet = new Set(config.selectedLessons);
    pool = pool.filter((q) => lessonSet.has(q.lesson));
  }

  // Filter by cognitive levels
  if (config.selectedLevels && config.selectedLevels.length > 0) {
    const levelSet = new Set(config.selectedLevels);
    pool = pool.filter((q) => levelSet.has(q.level));
  }

  // Filter by question type
  if (config.questionTypes && config.questionTypes.length > 0) {
    const typeSet = new Set(config.questionTypes);
    pool = pool.filter((q) => typeSet.has(q.type));
  }

  if (config.shuffleQuestions) {
    pool = shuffleArray(pool);
  }

  if (config.questionCount && config.questionCount > 0) {
    pool = pool.slice(0, config.questionCount);
  }

  if (config.shuffleOptions) {
    pool = pool.map((q) => {
      if (q.type === 'multiple_choice' && q.options) {
        return {
          ...q,
          options: shuffleArray(q.options),
        };
      }
      return q;
    });
  }

  return pool;
}

/**
 * Smart Text Parser to convert raw Vietnamese text / copied PDF exam questions into structured Question objects.
 * Handles:
 * - "Câu 1: ... A. ... B. ... C. ... D. ..."
 * - Code snippets inside questions
 * - True/False sections ("Phần 4: Đúng sai", "a)", "b)", "c)", "d)")
 */
export function parseQuestionsFromRawText(
  rawText: string,
  defaultLesson = 'Bài Tùy chỉnh',
  defaultLessonTitle = 'Đề thi tự động chuyển đổi'
): Question[] {
  if (!rawText || !rawText.trim()) return [];

  const questions: Question[] = [];
  const lines = rawText.split('\n');

  let currentLesson = defaultLesson;
  let currentLessonTitle = defaultLessonTitle;
  let currentLevel: CognitiveLevel = 'Thông hiểu';
  let isTrueFalseSection = false;

  let buffer: string[] = [];
  let currentQuestionNum = 0;

  function flushBuffer() {
    if (buffer.length === 0) return;
    const block = buffer.join('\n').trim();
    buffer = [];
    if (!block) return;

    if (isTrueFalseSection) {
      const parsedTF = parseTrueFalseBlock(block, currentLesson, currentLessonTitle, currentLevel);
      if (parsedTF) questions.push(parsedTF);
    } else {
      const parsedMC = parseMultipleChoiceBlock(block, currentLesson, currentLessonTitle, currentLevel);
      if (parsedMC) questions.push(parsedMC);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check lesson heading
    const lessonMatch = line.match(/BÀI\s+(\d+|[IVXLCDM]+)[\s:]*(.*)/i);
    if (lessonMatch) {
      flushBuffer();
      currentLesson = `Bài ${lessonMatch[1]}`;
      currentLessonTitle = lessonMatch[2].trim() || 'Nội dung Tin học';
      isTrueFalseSection = false;
      continue;
    }

    // Check True/False section
    if (/ĐÚNG\s*SAI/i.test(line)) {
      flushBuffer();
      isTrueFalseSection = true;
      continue;
    }

    // Check level headers
    if (/NHẬN\s*BIẾT/i.test(line)) {
      currentLevel = 'Nhận biết';
      continue;
    } else if (/THÔNG\s*HIỂU/i.test(line)) {
      currentLevel = 'Thông hiểu';
      continue;
    } else if (/VẬN\s*DỤNG/i.test(line)) {
      currentLevel = 'Vận dụng';
      continue;
    }

    // Check Question Start: "Câu 1:", "Câu 1.", "Câu 1 -"
    const questionMatch = line.match(/^Câu\s+(\d+)[\s.:-]/i);
    if (questionMatch) {
      flushBuffer();
      currentQuestionNum = parseInt(questionMatch[1], 10);
      buffer.push(line);
      continue;
    }

    if (buffer.length > 0) {
      buffer.push(lines[i]);
    }
  }

  flushBuffer();
  return questions;
}

function parseMultipleChoiceBlock(
  block: string,
  lesson: string,
  lessonTitle: string,
  defaultLevel: CognitiveLevel
): Question | null {
  // Regex to extract question content and options A, B, C, D
  const qMatch = block.match(/^Câu\s+\d+[\s.:-]([\s\S]*?)(?=(?:^|\s)[A-D][.:\)])/i);
  let content = '';
  let rest = block;

  if (qMatch) {
    content = qMatch[1].trim();
    rest = block.slice(qMatch[0].length);
  } else {
    const firstLineEnd = block.indexOf('\n');
    if (firstLineEnd !== -1) {
      content = block.slice(0, firstLineEnd).replace(/^Câu\s+\d+[\s.:-]/i, '').trim();
      rest = block.slice(firstLineEnd);
    } else {
      content = block.replace(/^Câu\s+\d+[\s.:-]/i, '').trim();
      rest = '';
    }
  }

  // Extract options A, B, C, D
  const options: { id: string; text: string }[] = [];
  const optRegex = /(?:^|\s)([A-D])[.:\)]\s*([^\n\r]*?(?=(?:[A-D][.:\)]|$)))/gi;
  let match;
  while ((match = optRegex.exec(rest)) !== null) {
    const label = match[1].toUpperCase();
    const optText = match[2].trim();
    if (optText) {
      options.push({ id: label, text: optText });
    }
  }

  // Detect level if mentioned in content
  let level = defaultLevel;
  if (/nhận biết/i.test(content)) level = 'Nhận biết';
  else if (/thông hiểu/i.test(content)) level = 'Thông hiểu';
  else if (/vận dụng/i.test(content)) level = 'Vận dụng';

  // Extract code snippet if present (marked with ``` or tags like <html>)
  let codeSnippet: string | undefined = undefined;
  const codeBlockMatch = block.match(/```(?:html)?([\s\S]*?)```/);
  if (codeBlockMatch) {
    codeSnippet = codeBlockMatch[1].trim();
    content = content.replace(/```(?:html)?[\s\S]*?```/, '').trim();
  }

  // Look for answer hint if any (e.g. "Đáp án: B" or "(Đ/A: B)")
  let correctOption = 'A';
  const ansMatch = block.match(/(?:Đáp án|Đ\/A|Answer)[\s:]*([A-D])/i);
  if (ansMatch) {
    correctOption = ansMatch[1].toUpperCase();
  } else if (options.length > 0) {
    correctOption = options[0].id;
  }

  if (!content && options.length === 0) return null;

  return {
    id: `parsed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    lesson,
    lessonTitle,
    type: 'multiple_choice',
    level,
    content: content || 'Câu hỏi trắc nghiệm',
    codeSnippet,
    options: options.length > 0 ? options : [
      { id: 'A', text: 'Lựa chọn A' },
      { id: 'B', text: 'Lựa chọn B' },
      { id: 'C', text: 'Lựa chọn C' },
      { id: 'D', text: 'Lựa chọn D' },
    ],
    correctOption,
    explanation: 'Đáp án được rút ra từ tài liệu kiến thức chuẩn môn Tin học 12.',
    source: 'Văn bản chuyển đổi tự động',
  };
}

function parseTrueFalseBlock(
  block: string,
  lesson: string,
  lessonTitle: string,
  defaultLevel: CognitiveLevel
): Question | null {
  const lines = block.split('\n');
  let header = '';
  const subItems: TrueFalseSubItem[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const itemMatch = line.match(/^([a-d])\)\s*(.*)/i);
    if (itemMatch) {
      const itemId = itemMatch[1].toLowerCase();
      let statement = itemMatch[2].trim();
      let isCorrect = true;

      // Check if statement ends with [Đúng], [Sai] or contains answer mark
      if (/[-–(]\s*(Sai|S)\s*[)\]]?$/i.test(statement)) {
        isCorrect = false;
        statement = statement.replace(/[-–(]\s*(Sai|S)\s*[)\]]?$/i, '').trim();
      } else if (/[-–(]\s*(Đúng|D|Đ)\s*[)\]]?$/i.test(statement)) {
        isCorrect = true;
        statement = statement.replace(/[-–(]\s*(Đúng|D|Đ)\s*[)\]]?$/i, '').trim();
      }

      subItems.push({
        id: itemId,
        statement,
        isCorrect,
      });
    } else {
      if (subItems.length === 0) {
        header += (header ? '\n' : '') + line;
      }
    }
  }

  if (subItems.length === 0) return null;

  return {
    id: `parsed_tf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    lesson,
    lessonTitle,
    type: 'true_false',
    level: defaultLevel,
    content: header.replace(/^Câu\s+\d+[\s.:-]/i, '').trim() || 'Xét tính Đúng/Sai của các mệnh đề sau:',
    subItems,
    explanation: 'Mỗi ý đúng được chấm theo thang điểm chuẩn Bộ GD&ĐT 2025: 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ.',
    source: 'Văn bản chuyển đổi tự động',
  };
}

/**
 * Computes analytics and mastery stats for a student.
 */
export function computeUserAnalytics(
  attempts: ExamAttempt[],
  allQuestions: Question[]
): {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  totalTimeMinutes: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  lessonMastery: LessonMastery[];
  levelMastery: LevelMastery[];
  weakLessons: string[];
  mistakeQuestionIds: string[];
  recentScores: { date: string; score: number; title: string }[];
} {
  if (!attempts || attempts.length === 0) {
    const defaultLessons: LessonMastery[] = [
      { lesson: 'Bài 7', lessonTitle: 'HTML và cấu trúc trang web', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
      { lesson: 'Bài 8', lessonTitle: 'Định dạng văn bản', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
      { lesson: 'Bài 9', lessonTitle: 'Tạo danh sách, bảng', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
      { lesson: 'Bài 10', lessonTitle: 'Tạo liên kết', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
    ];
    const defaultLevels: LevelMastery[] = [
      { level: 'Nhận biết', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
      { level: 'Thông hiểu', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
      { level: 'Vận dụng', totalAttempts: 0, correctAnswers: 0, accuracy: 0 },
    ];
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      totalTimeMinutes: 0,
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      lessonMastery: defaultLessons,
      levelMastery: defaultLevels,
      weakLessons: [],
      mistakeQuestionIds: [],
      recentScores: [],
    };
  }

  const questionMap = new Map<string, Question>(allQuestions.map((q) => [q.id, q]));
  let totalScoreSum = 0;
  let highestScore = 0;
  let totalTimeSeconds = 0;
  let totalQuestionsCount = 0;
  let totalCorrectCount = 0;

  const lessonStats: Record<string, { total: number; correct: number; title: string }> = {
    'Bài 7': { total: 0, correct: 0, title: 'HTML và cấu trúc trang web' },
    'Bài 8': { total: 0, correct: 0, title: 'Định dạng văn bản' },
    'Bài 9': { total: 0, correct: 0, title: 'Tạo danh sách, bảng' },
    'Bài 10': { total: 0, correct: 0, title: 'Tạo liên kết' },
  };

  const levelStats: Record<CognitiveLevel, { total: number; correct: number }> = {
    'Nhận biết': { total: 0, correct: 0 },
    'Thông hiểu': { total: 0, correct: 0 },
    'Vận dụng': { total: 0, correct: 0 },
  };

  const mistakeIdsSet = new Set<string>();

  for (const attempt of attempts) {
    totalScoreSum += attempt.score;
    if (attempt.score > highestScore) highestScore = attempt.score;
    totalTimeSeconds += attempt.timeSpentSeconds || 0;

    for (const detail of attempt.questionDetails) {
      totalQuestionsCount++;
      if (detail.isCorrect) {
        totalCorrectCount++;
      } else {
        mistakeIdsSet.add(detail.questionId);
      }

      const q = questionMap.get(detail.questionId);
      if (q) {
        const lessonKey = q.lesson || 'Khác';
        if (!lessonStats[lessonKey]) {
          lessonStats[lessonKey] = { total: 0, correct: 0, title: q.lessonTitle || lessonKey };
        }
        lessonStats[lessonKey].total++;
        if (detail.isCorrect) lessonStats[lessonKey].correct++;

        if (q.level && levelStats[q.level]) {
          levelStats[q.level].total++;
          if (detail.isCorrect) levelStats[q.level].correct++;
        }
      }
    }
  }

  const averageScore = Math.round((totalScoreSum / attempts.length) * 100) / 100;
  const overallAccuracy =
    totalQuestionsCount > 0 ? Math.round((totalCorrectCount / totalQuestionsCount) * 100) : 0;

  const lessonMastery: LessonMastery[] = Object.entries(lessonStats).map(([lesson, stat]) => ({
    lesson,
    lessonTitle: stat.title,
    totalAttempts: stat.total,
    correctAnswers: stat.correct,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
  }));

  const levelMastery: LevelMastery[] = (['Nhận biết', 'Thông hiểu', 'Vận dụng'] as CognitiveLevel[]).map(
    (lvl) => ({
      level: lvl,
      totalAttempts: levelStats[lvl].total,
      correctAnswers: levelStats[lvl].correct,
      accuracy: levelStats[lvl].total > 0 ? Math.round((levelStats[lvl].correct / levelStats[lvl].total) * 100) : 0,
    })
  );

  const weakLessons = lessonMastery
    .filter((l) => l.totalAttempts >= 3 && l.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((l) => l.lesson);

  const recentScores = attempts.slice(-10).map((a) => ({
    date: new Date(a.timestamp).toLocaleDateString('vi-VN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    score: a.score,
    title: a.title,
  }));

  return {
    totalAttempts: attempts.length,
    averageScore,
    highestScore: Math.round(highestScore * 100) / 100,
    totalTimeMinutes: Math.round(totalTimeSeconds / 60),
    totalQuestionsAnswered: totalQuestionsCount,
    overallAccuracy,
    lessonMastery,
    levelMastery,
    weakLessons,
    mistakeQuestionIds: Array.from(mistakeIdsSet),
    recentScores,
  };
}
