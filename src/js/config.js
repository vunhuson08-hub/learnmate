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
  // Thời gian mô phỏng "đang trả lời" (ms) để trải nghiệm tự nhiên hơn.
  demoLatency: [600, 1100],
};
