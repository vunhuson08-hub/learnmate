// Tiện ích dùng chung: escape HTML, chuẩn hóa câu trả lời, ngày giờ, định dạng.

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape mọi chuỗi do người dùng nhập trước khi chèn vào HTML. */
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c]);
}

/** Bỏ dấu tiếng Việt, chuyển chữ thường. */
export function stripAccents(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Chuẩn hóa câu trả lời ngắn để so sánh: bỏ dấu, chữ thường, bỏ nháy,
 * giữ lại chữ, số và các ký hiệu toán/lập trình cần thiết.
 */
export function normalizeAnswer(text) {
  return stripAccents(text)
    .replace(/[‘’`'"“”]/g, "")
    .replace(/[^a-z0-9\s&|!=<>+\-*/.,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,]+$/, "")
    .trim();
}

export function answersMatch(input, candidates) {
  const a = normalizeAnswer(input);
  if (!a) return false;
  const aCompact = a.replace(/\s/g, "");
  return candidates.some((c) => {
    const b = normalizeAnswer(c);
    return a === b || aCompact === b.replace(/\s/g, "");
  });
}

/** Ngày dạng YYYY-MM-DD theo giờ địa phương. */
export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export function weekdayLabel(date) {
  return WEEKDAYS[new Date(date).getDay()];
}

export function formatMinutes(totalSeconds) {
  const mins = Math.round((totalSeconds || 0) / 60);
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hôm qua";
  return `${days} ngày trước`;
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
