import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeMultipleChoice,
  gradeTrueFalseQuestion,
  calculateExamScore,
  shuffleArray,
  filterQuestions,
  parseQuestionsFromRawText,
  computeUserAnalytics,
} from './quiz-logic.ts';
import { Question, ExamAttempt } from '../types.ts';

test('gradeMultipleChoice correctly evaluates matching and mismatching choices', () => {
  assert.equal(gradeMultipleChoice('A', 'A'), true);
  assert.equal(gradeMultipleChoice('b', 'B'), true);
  assert.equal(gradeMultipleChoice('A', 'B'), false);
  assert.equal(gradeMultipleChoice('', 'B'), false);
  assert.equal(gradeMultipleChoice(undefined, 'B'), false);
});

test('gradeTrueFalseQuestion adheres to BGD 2025 standard scoring scale', () => {
  const subItems = [
    { id: 'a', statement: 'Statement 1', isCorrect: true },
    { id: 'b', statement: 'Statement 2', isCorrect: false },
    { id: 'c', statement: 'Statement 3', isCorrect: true },
    { id: 'd', statement: 'Statement 4', isCorrect: true },
  ];

  // 4 correct
  const result4 = gradeTrueFalseQuestion({ a: true, b: false, c: true, d: true }, subItems);
  assert.equal(result4.correctCount, 4);
  assert.equal(result4.scoreRatio, 1.0);
  assert.equal(result4.isAllCorrect, true);

  // 3 correct -> 0.5 đ
  const result3 = gradeTrueFalseQuestion({ a: true, b: false, c: true, d: false }, subItems);
  assert.equal(result3.correctCount, 3);
  assert.equal(result3.scoreRatio, 0.5);
  assert.equal(result3.isAllCorrect, false);

  // 2 correct -> 0.25 đ
  const result2 = gradeTrueFalseQuestion({ a: true, b: true, c: true, d: false }, subItems);
  assert.equal(result2.correctCount, 2);
  assert.equal(result2.scoreRatio, 0.25);

  // 1 correct -> 0.1 đ
  const result1 = gradeTrueFalseQuestion({ a: true, b: true, c: false, d: false }, subItems);
  assert.equal(result1.correctCount, 1);
  assert.equal(result1.scoreRatio, 0.1);

  // 0 correct -> 0 đ
  const result0 = gradeTrueFalseQuestion({ a: false, b: true, c: false, d: false }, subItems);
  assert.equal(result0.correctCount, 0);
  assert.equal(result0.scoreRatio, 0);
});

test('calculateExamScore normalizes scores to 10.0 scale', () => {
  // All full points (1.0 each)
  assert.equal(calculateExamScore([1, 1, 1, 1]).score, 10);
  assert.equal(calculateExamScore([1, 1, 1, 1]).percentage, 100);

  // Half correct
  assert.equal(calculateExamScore([1, 0, 1, 0]).score, 5);
  assert.equal(calculateExamScore([1, 0, 1, 0]).percentage, 50);

  // Partial true/false ratios
  const partial = calculateExamScore([1, 0.5, 0.25, 0]);
  // (1.75 / 4) * 10 = 4.38
  assert.equal(partial.score, 4.38);
});

test('shuffleArray returns array with same elements without modifying original', () => {
  const original = ['A', 'B', 'C', 'D', 'E'];
  const shuffled = shuffleArray(original);
  assert.equal(shuffled.length, original.length);
  assert.deepEqual(new Set(shuffled), new Set(original));
  // Original must remain intact
  assert.deepEqual(original, ['A', 'B', 'C', 'D', 'E']);
});

test('filterQuestions filters properly by lesson, level, count, and mistakes', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      lesson: 'Bài 7',
      lessonTitle: 'HTML',
      type: 'multiple_choice',
      level: 'Nhận biết',
      content: 'Question 1',
    },
    {
      id: 'q2',
      lesson: 'Bài 8',
      lessonTitle: 'CSS',
      type: 'multiple_choice',
      level: 'Thông hiểu',
      content: 'Question 2',
    },
    {
      id: 'q3',
      lesson: 'Bài 7',
      lessonTitle: 'HTML',
      type: 'true_false',
      level: 'Vận dụng',
      content: 'Question 3',
    },
  ];

  // Filter by lesson
  const filteredLesson = filterQuestions(mockQuestions, { selectedLessons: ['Bài 7'] });
  assert.equal(filteredLesson.length, 2);
  assert.equal(filteredLesson.every((q) => q.lesson === 'Bài 7'), true);

  // Filter by level
  const filteredLevel = filterQuestions(mockQuestions, { selectedLevels: ['Thông hiểu'] });
  assert.equal(filteredLevel.length, 1);
  assert.equal(filteredLevel[0].id, 'q2');

  // Filter by mistakes only
  const mistakeIds = new Set(['q3']);
  const filteredMistakes = filterQuestions(mockQuestions, { onlyMistakes: true }, mistakeIds);
  assert.equal(filteredMistakes.length, 1);
  assert.equal(filteredMistakes[0].id, 'q3');
});

test('parseQuestionsFromRawText extracts Vietnamese multiple-choice question format', () => {
  const rawSample = `
Câu 1: Thẻ nào dùng để tạo tiêu đề cấp 1 trong HTML?
A. <p>
B. <h1>
C. <title>
D. <head>
Đáp án: B

Câu 2: Đoạn mã nào sau đây tạo đường kẻ ngang?
A. <br>
B. <hr>
C. <div>
D. <span>
Đáp án: B
  `;

  const parsed = parseQuestionsFromRawText(rawSample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].correctOption, 'B');
  assert.equal(parsed[0].options?.length, 4);
  assert.ok(parsed[0].content.includes('Thẻ nào dùng để tạo tiêu đề cấp 1'));
  assert.equal(parsed[1].correctOption, 'B');
});

test('computeUserAnalytics calculates summary stats correctly', () => {
  const mockQuestions: Question[] = [
    { id: 'q1', lesson: 'Bài 7', lessonTitle: 'HTML', type: 'multiple_choice', level: 'Nhận biết', content: 'Q1' },
    { id: 'q2', lesson: 'Bài 8', lessonTitle: 'CSS', type: 'multiple_choice', level: 'Thông hiểu', content: 'Q2' },
  ];

  const attempts: ExamAttempt[] = [
    {
      id: 'att1',
      studentId: 'std1',
      title: 'Đề kiểm tra 1',
      mode: 'timed',
      timestamp: Date.now(),
      timeSpentSeconds: 300,
      questionsCount: 2,
      score: 10,
      correctCount: 2,
      answers: { q1: 'A', q2: 'B' },
      questionDetails: [
        { questionId: 'q1', answer: 'A', isCorrect: true, scoreEarned: 1 },
        { questionId: 'q2', answer: 'B', isCorrect: true, scoreEarned: 1 },
      ],
    },
    {
      id: 'att2',
      studentId: 'std1',
      title: 'Đề kiểm tra 2',
      mode: 'timed',
      timestamp: Date.now(),
      timeSpentSeconds: 240,
      questionsCount: 2,
      score: 5,
      correctCount: 1,
      answers: { q1: 'A', q2: 'A' },
      questionDetails: [
        { questionId: 'q1', answer: 'A', isCorrect: true, scoreEarned: 1 },
        { questionId: 'q2', answer: 'A', isCorrect: false, scoreEarned: 0 },
      ],
    },
  ];

  const analytics = computeUserAnalytics(attempts, mockQuestions);
  assert.equal(analytics.totalAttempts, 2);
  assert.equal(analytics.averageScore, 7.5);
  assert.equal(analytics.highestScore, 10);
  assert.equal(analytics.totalTimeMinutes, 9); // (300 + 240) / 60
  assert.equal(analytics.totalQuestionsAnswered, 4);
  assert.equal(analytics.overallAccuracy, 75); // 3 correct out of 4 = 75%
  assert.deepEqual(analytics.mistakeQuestionIds, ['q2']);
});
