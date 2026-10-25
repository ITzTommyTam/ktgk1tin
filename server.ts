import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { parseQuestionsFromRawText } from './src/utils/quiz-logic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Endpoint: AI / Regex Question Extractor from raw text
app.post('/api/convert-text', async (req, res) => {
  try {
    const { rawText, lesson, lessonTitle } = req.body;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: 'Nội dung văn bản không được để trống.' });
    }

    const targetLesson = lesson || 'Bài Tùy chọn';
    const targetTitle = lessonTitle || 'Đề thi tự động chuyển đổi';

    // If Gemini API Key is available, ask Gemini to parse and structure questions
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `Bạn là chuyên gia khảo thí môn Tin học 12 (chương trình GDPT mới).
Hãy phân tích đoạn văn bản thô sau đây (được trích từ đề cương hoặc file PDF) và trích xuất thành danh sách các câu hỏi trắc nghiệm chuẩn cấu trúc JSON.

Yêu cầu phân loại:
1. "multiple_choice": Câu hỏi 4 lựa chọn A, B, C, D. Có correctOption ('A', 'B', 'C', hoặc 'D').
2. "true_false": Câu hỏi trắc nghiệm Đúng/Sai (dạng đề thi TN THPT mới: gồm 4 ý a, b, c, d với isCorrect: true hoặc false).

Định dạng trả về duy nhất là một mảng JSON thuần túy (không bọc trong \`\`\`json):
[
  {
    "id": "q_1",
    "lesson": "${targetLesson}",
    "lessonTitle": "${targetTitle}",
    "type": "multiple_choice",
    "level": "Nhận biết" | "Thông hiểu" | "Vận dụng",
    "content": "Nội dung câu hỏi",
    "codeSnippet": "đoạn mã HTML nếu có (không bắt buộc)",
    "options": [
      { "id": "A", "text": "Lựa chọn A" },
      { "id": "B", "text": "Lựa chọn B" },
      { "id": "C", "text": "Lựa chọn C" },
      { "id": "D", "text": "Lựa chọn D" }
    ],
    "correctOption": "B",
    "explanation": "Giải thích chi tiết kiến thức và lý do chọn đáp án"
  },
  {
    "id": "q_2",
    "lesson": "${targetLesson}",
    "lessonTitle": "${targetTitle}",
    "type": "true_false",
    "level": "Thông hiểu",
    "content": "Lời dẫn câu hỏi Đúng/Sai",
    "subItems": [
      { "id": "a", "statement": "Mệnh đề a", "isCorrect": true, "level": "Nhận biết" },
      { "id": "b", "statement": "Mệnh đề b", "isCorrect": false, "level": "Thông hiểu" },
      { "id": "c", "statement": "Mệnh đề c", "isCorrect": true, "level": "Thông hiểu" },
      { "id": "d", "statement": "Mệnh đề d", "isCorrect": false, "level": "Vận dụng" }
    ],
    "explanation": "Giải thích chi tiết cho từng ý a, b, c, d"
  }
]

Văn bản đầu vào:
${rawText.slice(0, 30000)}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const textResponse = response.text?.trim() || '';
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({
              success: true,
              method: 'gemini_ai',
              questions: parsed,
              count: parsed.length,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini extraction failed, falling back to deterministic regex parser:', geminiError);
      }
    }

    // Fallback to deterministic regex parser
    const fallbackQuestions = parseQuestionsFromRawText(rawText, targetLesson, targetTitle);
    return res.json({
      success: true,
      method: 'regex_parser',
      questions: fallbackQuestions,
      count: fallbackQuestions.length,
    });
  } catch (err: any) {
    console.error('Error converting text:', err);
    return res.status(500).json({ error: err.message || 'Lỗi xử lý văn bản' });
  }
});

// Endpoint: AI Tutor Deep Explanation
app.post('/api/explain-question', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.content) {
      return res.status(400).json({ error: 'Thiếu thông tin câu hỏi' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `Bạn là giáo viên dạy Tin học 12 chuyên nghiệp, ân cần và dễ hiểu.
Hãy giải thích thật dễ hiểu cho học sinh câu hỏi trắc nghiệm sau đây:
Câu hỏi: ${question.content}
${question.codeSnippet ? `Mã HTML minh họa:\n${question.codeSnippet}` : ''}
${
  question.type === 'multiple_choice'
    ? `Các lựa chọn:
${(question.options || []).map((o: any) => `${o.id}. ${o.text}`).join('\n')}
Đáp án đúng: ${question.correctOption}`
    : `Các mệnh đề Đúng/Sai:
${(question.subItems || []).map((s: any) => `${s.id}) ${s.statement} -> ${s.isCorrect ? 'Đúng' : 'Sai'}`).join('\n')}`
}

Hãy đưa ra:
1. Tóm tắt kiến thức trọng tâm liên quan (thẻ HTML, thuộc tính, hoặc quy tắc).
2. Phân tích chi tiết tại sao đáp án đúng lại đúng, và vì sao các phương án khác sai.
3. Mẹo ghi nhớ nhanh để không bị bẫy khi thi trắc nghiệm tốt nghiệp.
Trình bày bằng tiếng Việt rõ ràng với Markdown đẹp mắt.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({
          success: true,
          explanation: response.text || question.explanation || 'Không có giải thích chi tiết.',
        });
      } catch (geminiErr) {
        console.warn('Gemini explain error:', geminiErr);
      }
    }

    return res.json({
      success: true,
      explanation: question.explanation || 'Đáp án theo đúng chuẩn kiến thức trong SGK Tin học 12.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi tạo lời giải thích' });
  }
});

// Dev vs Prod Vite setup
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
