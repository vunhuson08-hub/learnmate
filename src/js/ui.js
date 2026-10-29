// Component giao diện tái sử dụng: biểu tượng, nút, thẻ, nhãn, thông báo, trạng thái rỗng.
import { esc } from "./utils.js";

// Biểu tượng SVG nét đơn (vẽ riêng cho dự án, không phụ thuộc thư viện ngoài).
const ICONS = {
  logo: '<path d="M4 6.5 12 3l8 3.5-8 3.5L4 6.5Z"/><path d="M7 8.3v5.2c0 1.6 2.2 3 5 3s5-1.4 5-3V8.3"/><path d="M20 6.5v6"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.5 6.5 2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><rect x="17" y="13" width="3" height="4" rx="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  code: '<path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/><path d="m13 6-2 12"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  retry: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5Z"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  flip: '<path d="M4 9h13l-3-3"/><path d="M20 15H7l3 3"/>',
  skip: '<path d="m5 5 8 7-8 7V5Z"/><path d="M17 5v14"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="13.5" r="1"/><circle cx="15" cy="13.5" r="1"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>',
  save: '<path d="M5 4h11l3 3v13H5V4Z"/><path d="M8 4v5h7V4"/><path d="M8 20v-6h8v6"/>',
};

export function icon(name, { size = 20, cls = "", label = "" } = {}) {
  const body = ICONS[name] || ICONS.info;
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${body}</svg>`;
}

export function demoBadge(text = "Dữ liệu minh họa") {
  return `<span class="badge badge-demo" title="Số liệu mẫu để trình diễn, không phải kết quả thật">${icon("info", { size: 14 })}${esc(text)}</span>`;
}

export function statusBadge(status) {
  const map = {
    completed: ["Đã hoàn thành", "badge-success", "check"],
    in_progress: ["Đang học", "badge-info", "clock"],
    not_started: ["Chưa bắt đầu", "badge-muted", "book"],
  };
  const [label, cls, ic] = map[status] || map.not_started;
  return `<span class="badge ${cls}">${icon(ic, { size: 14 })}${label}</span>`;
}

export function progressBar(pct, label) {
  const v = Math.round(Math.max(0, Math.min(100, pct)));
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${esc(label || "Tiến độ")}"><span style="width:${v}%"></span></div>`;
}

export function emptyState({ iconName = "info", title, text = "", action = "" }) {
  return `<div class="empty">${icon(iconName, { size: 32 })}<h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ""}${action}</div>`;
}

// ───────── Thông báo (toast) ─────────
let toastRoot = null;
export function toast(message, type = "info", timeout = 3800) {
  if (!toastRoot) {
    toastRoot = document.getElementById("toasts");
  }
  if (!toastRoot) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  const ic = { success: "check", error: "alert", info: "info", warning: "alert" }[type] || "info";
  el.innerHTML = `${icon(ic, { size: 18 })}<span>${esc(message)}</span><button class="toast-close" aria-label="Đóng thông báo">${icon("x", { size: 16 })}</button>`;
  el.querySelector("button").addEventListener("click", () => el.remove());
  toastRoot.appendChild(el);
  setTimeout(() => el.classList.add("leaving"), timeout);
  setTimeout(() => el.remove(), timeout + 400);
}

/** Thông báo nội tuyến dưới biểu mẫu. */
export function alertBox(message, type = "info") {
  const ic = { success: "check", error: "alert", info: "info", warning: "alert" }[type] || "info";
  return `<div class="alert alert-${type}" role="${type === "error" ? "alert" : "status"}">${icon(ic, { size: 18 })}<div>${message}</div></div>`;
}

/** Trường nhập có nhãn, mô tả và chỗ hiển thị lỗi. */
export function field({ id, label, type = "text", value = "", placeholder = "", help = "", autocomplete = "", required = false, attrs = "" }) {
  const describedBy = [help ? `${id}-help` : "", `${id}-error`].filter(Boolean).join(" ");
  return `<div class="field">
    <label for="${id}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span>' : ""}</label>
    <input id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${required ? "required" : ""} aria-describedby="${describedBy}" ${attrs}/>
    ${help ? `<p class="help" id="${id}-help">${esc(help)}</p>` : ""}
    <p class="field-error" id="${id}-error" aria-live="polite"></p>
  </div>`;
}

export function setFieldError(form, id, message) {
  const input = form.querySelector(`#${id}`);
  const err = form.querySelector(`#${id}-error`);
  if (err) err.textContent = message || "";
  if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
}

export function subjectIcon(subject, size = 20) {
  return `<span class="subject-icon tone-${subject.color}">${icon(subject.icon, { size })}</span>`;
}
