// Cấu hình tích hợp. Mặc định mọi thứ chạy ở CHẾ ĐỘ DEMO, không gọi dịch vụ ngoài.
//
// Để nối AI thật sau này:
//   1. Dựng một backend (ví dụ /api/tutor, /api/study-set) giữ API key ở phía máy chủ.
//   2. Đổi `tutorProvider` / `generatorProvider` thành "remote".
//   3. KHÔNG bao giờ đặt API key trong mã frontend này.
export const CONFIG = {
  tutorProvider: "demo", // "demo" | "remote"
  tutorEndpoint: "/api/tutor",
  generatorProvider: "demo", // "demo" | "remote"
  generatorEndpoint: "/api/study-set",
  // Thông báo email: "auto" = tự gửi qua máy chủ LearnMate nếu có (server/server.js),
  // nếu không có máy chủ thì tự chuyển sang soạn thủ công (Gmail / ứng dụng email). "manual" = luôn thủ công.
  notifyProvider: "auto",
  notifyEndpoint: "/api/notify",
  healthEndpoint: "/api/health",
  // Thời gian mô phỏng "đang trả lời" (ms) để trải nghiệm tự nhiên hơn.
  demoLatency: [600, 1100],
};
