# LearnMate — Gia sư học tập cá nhân (MVP)

Website học tập tương tác: lộ trình theo mục tiêu, bài học có phản hồi ngay, gia sư ảo hai chiều, tạo bộ học tập và theo dõi tiến độ.

## Dùng ngay

Trang web: https://vunhuson08-hub.github.io/learnmate/

`index.html` ở gốc là bản gộp 1 tệp (mở trực tiếp được). Mã nguồn chia module nằm trong `src/`; tạo lại bản gộp bằng `python3 build-single-file.py src index.html`.

## Chạy thử mã nguồn

Không cần cài đặt hay build. Chỉ cần một máy chủ tĩnh vì trình duyệt không chạy ES modules từ `file://`:

```bash
cd src
python3 -m http.server 8000
# hoặc: npx serve .
```

Mở http://localhost:8000 rồi bấm **“Dùng thử không cần tài khoản”**.

## Cấu trúc

```
index.html
css/styles.css            Hệ thống thiết kế (biến màu, sáng/tối, responsive)
js/app.js                 Định tuyến theo hash, khung ứng dụng, giao diện sáng/tối
js/store.js               Lưu localStorage + kiểm tra/khôi phục dữ liệu lỗi
js/ui.js                  Component dùng chung: icon SVG, nút, nhãn, toast, trường nhập
js/utils.js               Escape HTML, chuẩn hóa câu trả lời, ngày giờ
js/config.js              Chọn provider demo/remote cho gia sư và trình tạo bộ học
js/data/lessons.js        4 môn × 3 bài, câu hỏi, phản hồi theo từng lỗi sai
js/data/demo.js           Dữ liệu minh họa cho chế độ dùng thử (cờ seeded)
js/services/progress.js   Thống kê, lộ trình, đề xuất ôn tập
js/services/tutor.js      Gia sư ảo: DemoTutorProvider + RemoteTutorProvider (chưa bật)
js/services/generator.js  Tạo bộ học tập: ngân hàng nội dung / khung mẫu
js/pages/*.js             Mỗi trang một module
```

## Phần demo và phần cần backend

| Tính năng | Hiện tại | Để chạy thật cần |
|---|---|---|
| Đăng nhập/đăng ký | Lưu tên + email trong trình duyệt, **không lưu mật khẩu** | Backend xác thực (băm mật khẩu, phiên, HTTPS) |
| Gia sư ảo | Phản hồi soạn sẵn theo từ khóa + ngữ cảnh bài/câu hỏi | Endpoint `/api/tutor` gọi mô hình AI (key ở máy chủ) |
| Tạo bộ học tập | Lấy từ ngân hàng bài học hoặc khung mẫu | Endpoint `/api/study-set` |
| Tiến độ | localStorage, một trình duyệt | Cơ sở dữ liệu theo người dùng |

Bật AI: đổi `tutorProvider` / `generatorProvider` trong `js/config.js` thành `"remote"` và dựng backend tương ứng. Không đặt API key trong frontend.
