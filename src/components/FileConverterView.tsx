import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Plus,
  Trash2,
  Edit2,
  FileCheck,
  Save,
  Download,
  RotateCcw,
} from 'lucide-react';
import { CognitiveLevel, Question, QuestionType } from '../types.ts';
import { parseQuestionsFromRawText } from '../utils/quiz-logic.ts';

interface FileConverterViewProps {
  onImportQuestions: (questions: Question[]) => void;
  onStartExamFromQuestions: (questions: Question[], title: string) => void;
  existingQuestionsCount: number;
}

export const FileConverterView: React.FC<FileConverterViewProps> = ({
  onImportQuestions,
  onStartExamFromQuestions,
  existingQuestionsCount,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('Bài Tùy chỉnh');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');

  // Sample quick templates
  const loadSamplePreset = (presetType: 'pdf_sample' | 'mc_sample' | 'tf_sample') => {
    if (presetType === 'pdf_sample') {
      setInputText(`BÀI 7: HTML VÀ CẤU TRÚC TRANG WEB
PHẦN 1: NHẬN BIẾT
Câu 1: Đoạn mã nào sau đây biểu diễn đúng cấu trúc tiêu đề trang trong phần <head> của bài tập baitap1.html?
A. <body><title>Bài tập HTML số 1</title></body>
B. <head><title>Bài tập HTML số 1</title></head>
C. <body title="Bài tập HTML số 1"></body>
D. <title><head>Bài tập HTML số 1</head></title>
Đáp án: B

Câu 2: Thẻ nào dưới đây được sử dụng để hiển thị dòng chữ "Xin chào HTML" dưới dạng tiêu đề cấp 1 trong file baitap1.html?
A. <p>Xin chào HTML</p>
B. <h1>Xin chào HTML</h1>
C. <title>Xin chào HTML</title>
D. <meta>Xin chào HTML</meta>
Đáp án: B

PHẦN 4: ĐÚNG SAI
Câu 3: Về cấu trúc cơ bản và các thành phần của một tệp HTML:
a) HTML là ngôn ngữ đánh dấu siêu văn bản dùng để tạo và thiết kế trang web. (Đúng)
b) Phần tử HTML gồm ba thành phần cơ bản là: thẻ mở, nội dung và thẻ đóng. (Đúng)
c) Phần thân <body> của tệp HTML là nơi chứa các thông tin chung như tiêu đề trang web và bộ mã ký tự. (Sai)
d) Để tạo một tệp HTML có tiêu đề trang là "Trang chu" và hiển thị dòng chữ "Chào mừng", ta đặt tiêu đề bên trong phần <head> thay vì phần <body>. (Đúng)`);
    } else if (presetType === 'mc_sample') {
      setInputText(`Câu 1: Thuộc tính nào của thẻ <a> quy định liên kết đích?
A. src
B. href
C. url
D. link
Đáp án: B

Câu 2: Thẻ nào dùng để tạo danh sách có thứ tự?
A. <ul>
B. <ol>
C. <dl>
D. <list>
Đáp án: B`);
    } else {
      setInputText(`Câu 1: Đánh giá tính đúng sai về thẻ bảng trong HTML:
a) Thẻ <table> dùng để bắt đầu khai báo bảng. (Đúng)
b) Thẻ <tr> dùng để tạo một cột trong bảng. (Sai)
c) Thẻ <td> là ô chứa dữ liệu thông thường. (Đúng)
d) Thẻ <th> dùng để tạo ô tiêu đề được in đậm và căn giữa. (Đúng)`);
    }
  };

  // Handle local file upload (.txt, .json, .pdf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setParsedQuestions(parsed);
            setActiveTab('preview');
            setConversionStatus(`Đã nhập thành công ${parsed.length} câu hỏi từ tệp JSON.`);
          }
        } catch {
          alert('Tệp JSON không hợp lệ.');
        }
      };
      reader.readAsText(file);
    } else {
      // Read as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        setConversionStatus(`Đã tải nội dung từ tệp "${file.name}". Nhấn nút Chuyển đổi để xử lý.`);
      };
      reader.readAsText(file);
    }
  };

  // Convert Text using Server AI route with Regex fallback
  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert('Vui lòng dán văn bản câu hỏi hoặc chọn tệp đề thi!');
      return;
    }

    setIsProcessing(true);
    setConversionStatus('Đang tự động phân tích và bóc tách các câu hỏi trắc nghiệm...');

    try {
      const res = await fetch('/api/convert-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: inputText,
          lesson: selectedLesson,
          lessonTitle: 'Đề thi tự động chuyển đổi từ tệp',
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setParsedQuestions(data.questions);
        setActiveTab('preview');
        const methodText = data.method === 'gemini_ai' ? 'Trí tuệ nhân tạo Gemini' : 'Bộ bóc tách thông minh Regex';
        setConversionStatus(`Đã chuyển đổi thành công ${data.questions.length} câu hỏi bằng ${methodText}!`);
      } else {
        // Fallback directly on client side
        const clientParsed = parseQuestionsFromRawText(inputText, selectedLesson);
        if (clientParsed.length > 0) {
          setParsedQuestions(clientParsed);
          setActiveTab('preview');
          setConversionStatus(`Đã bóc tách thành công ${clientParsed.length} câu hỏi theo chuẩn đề thi.`);
        } else {
          setConversionStatus('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng câu hỏi (Ví dụ: "Câu 1: ... A. ... B. ...").');
        }
      }
    } catch (err) {
      console.warn('Network error, fallback to client regex parser', err);
      const clientParsed = parseQuestionsFromRawText(inputText, selectedLesson);
      if (clientParsed.length > 0) {
        setParsedQuestions(clientParsed);
        setActiveTab('preview');
        setConversionStatus(`Đã bóc tách thành công ${clientParsed.length} câu hỏi.`);
      } else {
        setConversionStatus('Lỗi khi phân tích. Vui lòng kiểm tra lại cú pháp văn bản.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setParsedQuestions(parsedQuestions.filter((q) => q.id !== id));
  };

  const handleUpdateOption = (qId: string, optId: string, newText: string) => {
    setParsedQuestions(
      parsedQuestions.map((q) => {
        if (q.id === qId && q.options) {
          return {
            ...q,
            options: q.options.map((o) => (o.id === optId ? { ...o, text: newText } : o)),
          };
        }
        return q;
      })
    );
  };

  const handleSetCorrectOption = (qId: string, optId: string) => {
    setParsedQuestions(
      parsedQuestions.map((q) => (q.id === qId ? { ...q, correctOption: optId } : q))
    );
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(parsedQuestions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `de_thi_tin_hoc_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              Tự động chuyển đổi văn bản từ tệp & Tạo đề thi
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Tải lên tệp Word, Text, PDF đề cương hoặc dán văn bản để AI tự động trích xuất câu hỏi trắc nghiệm & Đúng/Sai.
            </p>
          </div>
        </div>

        {/* System Asset Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">
                Tệp đính kèm trong hệ thống: T12_TN_B7B8B9B10_4d670fd9.pdf
              </span>
              <span className="text-slate-500">
                Đề cương ôn tập kiểm tra giữa kỳ 1 Tin học 12 (Bài 7 đến Bài 10) gồm 100 câu hỏi chuẩn hóa
              </span>
            </div>
          </div>
          <button
            onClick={() => loadSamplePreset('pdf_sample')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-2xs shrink-0 transition-colors"
          >
            Nạp mẫu trích xuất từ PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'input'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          1. Nhập văn bản hoặc Tải tệp lên
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          2. Xem & Chỉnh sửa câu hỏi ({parsedQuestions.length})
        </button>
      </div>

      {/* TAB 1: Input & Upload */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Textarea */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Dán văn bản câu hỏi vào đây
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Mẫu có sẵn:</span>
                <button
                  onClick={() => loadSamplePreset('mc_sample')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Trắc nghiệm 4 lựa chọn
                </button>
                <span>•</span>
                <button
                  onClick={() => loadSamplePreset('tf_sample')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Đúng/Sai
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán nội dung câu hỏi tại đây...&#10;&#10;Ví dụ:&#10;Câu 1: Thẻ nào dùng để tạo tiêu đề chính lớn nhất trong HTML?&#10;A. <h6>&#10;B. <p>&#10;C. <h1>&#10;D. <title>&#10;Đáp án: C"
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs md:text-sm leading-relaxed text-slate-800 bg-slate-50/50"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Gán chuyên đề:</label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="Bài 7">Bài 7: HTML & Cấu trúc trang web</option>
                  <option value="Bài 8">Bài 8: Định dạng văn bản & Style</option>
                  <option value="Bài 9">Bài 9: Kiểu danh sách & Bảng</option>
                  <option value="Bài 10">Bài 10: Tạo liên kết & Đường dẫn</option>
                  <option value="Bài Tùy chỉnh">Chuyên đề Tổng hợp / Tùy chỉnh</option>
                </select>
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'Đang chuyển đổi...' : 'Tự động chuyển đổi sang câu hỏi'}
              </button>
            </div>

            {conversionStatus && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{conversionStatus}</span>
              </div>
            )}
          </div>

          {/* Right Col: File Dropzone & Instructions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-3 hover:border-indigo-400 transition-colors shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Tải tệp câu hỏi lên</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ tệp .txt, .json, .docx hoặc .pdf</p>
              </div>

              <label className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
                <span>Chọn tệp từ máy tính</span>
                <input
                  type="file"
                  accept=".txt,.json,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Guide Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                Quy chuẩn định dạng hỗ trợ tốt nhất:
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-500 leading-relaxed">
                <li>
                  <strong className="text-slate-700">Câu hỏi 4 lựa chọn:</strong> Bắt đầu bằng{' '}
                  <code>Câu 1: ...</code> và theo sau là các phương án <code>A. ... B. ... C. ... D. ...</code>.
                </li>
                <li>
                  <strong className="text-slate-700">Đáp án:</strong> Có thể ghi chú ở cuối dòng{' '}
                  <code>Đáp án: B</code> hoặc <code>(Đ/A: B)</code>.
                </li>
                <li>
                  <strong className="text-slate-700">Trắc nghiệm Đúng/Sai:</strong> Gồm 4 mệnh đề{' '}
                  <code>a) ... b) ... c) ... d) ...</code> kèm chú thích <code>(Đúng)</code> hoặc <code>(Sai)</code>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Parsed Questions Review & Exam Creation */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Đã nhận diện: {parsedQuestions.length} câu hỏi
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                Sẵn sàng tạo đề thi
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportJson}
                disabled={parsedQuestions.length === 0}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Xuất tệp JSON
              </button>

              <button
                onClick={() => {
                  onImportQuestions(parsedQuestions);
                  alert(`Đã thêm ${parsedQuestions.length} câu hỏi vào ngân hàng chung thành công!`);
                }}
                disabled={parsedQuestions.length === 0}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm vào Ngân hàng ({existingQuestionsCount} + {parsedQuestions.length})
              </button>

              <button
                onClick={() => onStartExamFromQuestions(parsedQuestions, 'Đề thi tự động chuyển đổi')}
                disabled={parsedQuestions.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Tạo đề & Làm bài ngay
              </button>
            </div>
          </div>

          {/* Question List */}
          {parsedQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Chưa có câu hỏi nào</h4>
              <p className="text-xs text-slate-500">
                Hãy quay lại bước 1 để dán văn bản hoặc tải tệp lên.
              </p>
              <button
                onClick={() => setActiveTab('input')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                Quay lại nhập văn bản
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {parsedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded">
                        {q.lesson}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{q.level}</span>
                      <span className="text-xs text-slate-400">
                        {q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : 'Đúng/Sai (4 ý)'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 whitespace-pre-line">
                    {q.content}
                  </p>

                  {/* Options editor */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctOption === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                                : 'bg-slate-50/60 border-slate-200 text-slate-700'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSetCorrectOption(q.id, opt.id)}
                              className={`w-6 h-6 rounded-md font-bold text-[11px] shrink-0 border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                              }`}
                              title="Bấm để chọn đây là đáp án đúng"
                            >
                              {opt.id}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => handleUpdateOption(q.id, opt.id, e.target.value)}
                              className="flex-1 bg-transparent border-0 focus:outline-none text-xs"
                            />
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded shadow-2xs">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True False Sub Items Display */}
                  {q.type === 'true_false' && q.subItems && (
                    <div className="space-y-1.5 pt-1">
                      {q.subItems.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-600">{sub.id})</span>
                            <span className="text-slate-800">{sub.statement}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.isCorrect ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
