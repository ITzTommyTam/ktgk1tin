export interface TheorySection {
  id: string;
  lesson: string;
  title: string;
  keyPoints: string[];
  codeExamples: { title: string; code: string; note?: string }[];
}

export const THEORY_NOTES: TheorySection[] = [
  {
    id: 'bai-7',
    lesson: 'Bài 7',
    title: 'HTML và Cấu trúc trang web',
    keyPoints: [
      'HTML (HyperText Markup Language) là ngôn ngữ đánh dấu siêu văn bản, dùng để xây dựng cấu trúc và hiển thị nội dung các trang web.',
      'Trang web được tạo từ các tệp văn bản có phần mở rộng .html hoặc .htm.',
      'Thẻ HTML: ký hiệu trong cặp < >, thường gồm thẻ mở <tag> và thẻ đóng </tag>. Có các thẻ đơn không cần đóng như <br>, <hr>, <img>.',
      'Phần tử HTML: gồm toàn bộ thẻ mở, nội dung bên trong và thẻ đóng.',
      'Cấu trúc chuẩn: <!DOCTYPE html> khai báo HTML5 ở dòng đầu tiên; <html> là phần tử gốc; <head> chứa tiêu đề <title>, mã hóa <meta charset="UTF-8">; <body> chứa toàn bộ nội dung hiển thị.',
      'Các phần mềm soạn thảo chuyên dụng: VS Code, Sublime Text, Notepad++, Notepad (có sẵn trên Windows).',
    ],
    codeExamples: [
      {
        title: 'Cấu trúc tài liệu HTML5 chuẩn',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Trang web đầu tiên của tôi</title>
</head>
<body>
  <h1>Xin chào HTML!</h1>
  <p>Chào mừng bạn đến với trang web học Tin học 12.</p>
</body>
</html>`,
        note: '<!DOCTYPE html> và <meta charset="UTF-8"> giúp hiển thị chuẩn xác tiếng Việt có dấu.',
      },
    ],
  },
  {
    id: 'bai-8',
    lesson: 'Bài 8',
    title: 'Định dạng văn bản & Thuộc tính CSS',
    keyPoints: [
      'Định dạng tiêu đề: <h1> đến <h6> phân cấp tiêu đề (<h1> lớn nhất, <h6> nhỏ nhất).',
      'Đoạn văn và khối: <p> tạo đoạn văn có khoảng cách trên dưới; <div> là phần tử khối (block, xuống dòng mới và chiếm trọn độ rộng); <span> là phần tử nội tuyến (inline, nằm trên cùng một dòng).',
      'Xuống dòng và kẻ ngang: <br> ngắt dòng trực tiếp không tạo khoảng cách đoạn; <hr> chèn đường kẻ ngang.',
      'Nhấn mạnh và định dạng chữ: <strong> hoặc <b> in đậm; <em> hoặc <i> in nghiêng; <del> gạch xóa chữ; <mark> làm nổi bật nền vàng (highlight); <sup> tạo số mũ trên (x²); <sub> tạo chỉ số dưới (H₂O).',
      'Thuộc tính style: dùng để gán định dạng CSS như color (màu chữ), font-size (cỡ chữ: px, pt, rem), font-family (phông chữ), text-align (căn lề). Nhiều thuộc tính ngăn cách bởi dấu chấm phẩy (;).',
    ],
    codeExamples: [
      {
        title: 'Định dạng đoạn văn với thuộc tính style',
        code: `<p style="color: #2563eb; font-size: 18px; font-family: 'Plus Jakarta Sans', sans-serif;">
  Học tập chăm chỉ mỗi ngày.
</p>
<p>Công thức hóa học của nước: H<sub>2</sub>O</p>
<p>Phương trình toán học: x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup></p>
<p>Giá cũ: <del>500.000đ</del> - Giá mới: <span style="color: red; font-size: 20px;">350.000đ</span></p>`,
      },
    ],
  },
  {
    id: 'bai-9',
    lesson: 'Bài 9',
    title: 'Tạo danh sách & Bảng trong HTML',
    keyPoints: [
      'Danh sách có thứ tự: <ol> ... </ol>, chứa các phần tử <li>. Thuộc tính type: "1", "A", "a", "I", "i". Thuộc tính start: chỉ định số bắt đầu.',
      'Danh sách không thứ tự: <ul> ... </ul>, chứa <li>. Ký hiệu đầu dòng: style="list-style-type: disc | circle | square | none".',
      'Danh sách mô tả (description list): <dl> chứa <dt> (thuật ngữ) và <dd> (nội dung mô tả).',
      'Bảng trong HTML: <table> chứa các hàng <tr>, ô tiêu đề cột <th> (in đậm, căn giữa), ô dữ liệu <td>.',
      'Tiêu đề bảng: đặt thẻ <caption> ngay sau <table> và trước <tr> đầu tiên.',
      'Gộp ô trong bảng: colspan="n" gộp n cột trên cùng 1 hàng; rowspan="n" gộp n hàng trên cùng 1 cột. Khi gộp phải lược bỏ thẻ <td>/<th> tương ứng bị chiếm chỗ.',
      'Kích thước và viền bảng: style="width: 100%; border: 1px solid black;".',
    ],
    codeExamples: [
      {
        title: 'Ví dụ Bảng và Danh sách lồng nhau',
        code: `<table style="width: 100%; border: 1px solid #cbd5e1; border-collapse: collapse;">
  <caption>Lịch kiểm tra Tin học 12</caption>
  <tr style="background: #f1f5f9;">
    <th style="border: 1px solid #cbd5e1; padding: 8px;">Tiết</th>
    <th style="border: 1px solid #cbd5e1; padding: 8px;">Nội dung</th>
  </tr>
  <tr>
    <td style="border: 1px solid #cbd5e1; padding: 8px;">Tiết 1</td>
    <td style="border: 1px solid #cbd5e1; padding: 8px;">Lý thuyết HTML & CSS</td>
  </tr>
</table>`,
      },
    ],
  },
  {
    id: 'bai-10',
    lesson: 'Bài 10',
    title: 'Tạo liên kết (Hyperlinks) & Đường dẫn',
    keyPoints: [
      'Siêu văn bản (hypertext): chứa văn bản, hình ảnh, âm thanh và đặc biệt là siêu liên kết để người đọc nhảy tới các vị trí hoặc tài liệu khác.',
      'Cú pháp liên kết: <a href="đường_dẫn">Văn bản hoặc hình ảnh hiển thị</a>.',
      'Đường dẫn tuyệt đối (Absolute URL): ghi đầy đủ giao thức (http:// hoặc https://), tên miền và đường dẫn đến tài nguyên. Bắt buộc dùng khi liên kết ra website ngoài Internet.',
      'Đường dẫn tương đối (Relative URL): xác định vị trí tương đối so với file HTML hiện tại:',
      '  - Cùng thư mục: href="gioithieu.html"',
      '  - Vào thư mục con: href="info/lienhe.html"',
      '  - Ra thư mục cha: href="../index.html" (dùng dấu ../ để lùi 1 cấp thư mục)',
      'Liên kết nội bộ trong cùng 1 trang (Bookmark): <a href="#id_dich">Nhảy tới</a>; phần tử đích mang thuộc tính id="id_dich" (Lưu ý: trong id không có dấu #).',
      'Liên kết bằng hình ảnh: bọc thẻ <img> bên trong thẻ <a>: <a href="trangchu.html"><img src="logo.png" alt="Trang chủ"></a>.',
    ],
    codeExamples: [
      {
        title: 'Các kiểu liên kết thông dụng',
        code: `<!-- 1. Đường dẫn tuyệt đối ra trang ngoài -->
<a href="https://moet.gov.vn">Cổng thông tin Bộ Giáo dục và Đào tạo</a>

<!-- 2. Đường dẫn tương đối cùng thư mục và thư mục cha -->
<a href="gioithieu.html">Giới thiệu</a>
<a href="../trangchu.html">Về trang chủ</a>

<!-- 3. Liên kết nội bộ bookmark -->
<a href="#muc-luc">Lên đầu trang</a>
<h2 id="muc-luc">Mục lục chi tiết</h2>`,
      },
    ],
  },
];
