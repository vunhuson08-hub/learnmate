// Điểm khởi động: định tuyến theo hash, khung ứng dụng (thanh điều hướng), giao diện sáng/tối.
import * as store from "./store.js";
import { icon, toast } from "./ui.js";
import { esc } from "./utils.js";
import { seedDemoProfile } from "./data/demo.js";

import * as landing from "./pages/landing.js";
import * as auth from "./pages/auth.js";
import * as onboarding from "./pages/onboarding.js";
import * as dashboard from "./pages/dashboard.js";
import * as library from "./pages/library.js";
import * as lesson from "./pages/lesson.js";
import * as studio from "./pages/studio.js";
import * as progress from "./pages/progress.js";
import * as profile from "./pages/profile.js";

const ROUTES = {
  home: { page: landing, access: "public" },
  login: { page: auth, access: "guest" },
  register: { page: auth, access: "guest" },
  onboarding: { page: onboarding, access: "user" },
  dashboard: { page: dashboard, access: "app", nav: "dashboard" },
  library: { page: library, access: "app", nav: "library" },
  lesson: { page: lesson, access: "app", nav: "library" },
  studio: { page: studio, access: "app", nav: "studio" },
  progress: { page: progress, access: "app", nav: "progress" },
  profile: { page: profile, access: "app", nav: "profile" },
};

const NAV = [
  { id: "dashboard", label: "Tổng quan", icon: "home" },
  { id: "library", label: "Thư viện", icon: "book" },
  { id: "studio", label: "Tạo bộ học", icon: "sparkle" },
  { id: "progress", label: "Tiến độ", icon: "chart" },
  { id: "profile", label: "Hồ sơ", icon: "user" },
];

const appEl = document.getElementById("app");
let cleanup = null;

function parseHash() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!h) return { name: "home", param: null };
  if (h.startsWith("lesson-")) return { name: "lesson", param: h.slice("lesson-".length) };
  return { name: h, param: null };
}

export function navigate(target) {
  if (location.hash === `#${target}`) render();
  else location.hash = target;
}

function applyTheme() {
  document.documentElement.dataset.theme = store.getState().theme;
}

function shell(routeNav, prof) {
  const navLinks = (cls) =>
    NAV.map(
      (n) =>
        `<a href="#${n.id}" class="${cls}${routeNav === n.id ? " active" : ""}" ${routeNav === n.id ? 'aria-current="page"' : ""}>${icon(n.icon)}<span>${n.label}</span></a>`,
    ).join("");
  const dark = store.getState().theme === "dark";
  return `
  <div class="app-shell">
    <header class="topbar">
      <a href="#dashboard" class="brand" aria-label="LearnMate – về trang tổng quan">${icon("logo", { size: 26 })}<span>LearnMate</span></a>
      ${prof.isDemo ? '<span class="badge badge-demo topbar-demo" title="Bạn đang dùng thử không cần tài khoản">Chế độ demo</span>' : '<span class="badge badge-muted topbar-demo" title="Tài khoản chỉ lưu trên trình duyệt này">Tài khoản demo cục bộ</span>'}
      <div class="topbar-actions">
        <button class="icon-btn" id="theme-toggle" aria-label="${dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}" title="${dark ? "Giao diện sáng" : "Giao diện tối"}">${icon(dark ? "sun" : "moon")}</button>
        <a href="#profile" class="avatar" aria-label="Hồ sơ của ${esc(prof.name)}">${esc((prof.name || "B").trim().charAt(0).toUpperCase())}</a>
      </div>
    </header>
    <nav class="sidebar" aria-label="Điều hướng chính">${navLinks("nav-link")}</nav>
    <main id="main" tabindex="-1" class="main"></main>
    <nav class="bottom-nav" aria-label="Điều hướng chính (di động)">${navLinks("bnav-link")}</nav>
  </div>`;
}

function render() {
  if (cleanup) {
    try {
      cleanup();
    } catch (e) {
      console.error(e);
    }
    cleanup = null;
  }
  const { name, param } = parseHash();
  const route = ROUTES[name];
  const prof = store.currentProfile();

  if (!route) return navigate(prof ? "dashboard" : "home");
  if (route.access === "guest" && prof) return navigate(prof.onboarded ? "dashboard" : "onboarding");
  if ((route.access === "user" || route.access === "app") && !prof) {
    toast("Vui lòng đăng nhập hoặc dùng thử để tiếp tục.", "info");
    return navigate("login");
  }
  if (route.access === "app" && !prof.onboarded) return navigate("onboarding");

  const ctx = { store, navigate, toast, param, route: name, seedDemoProfile, rerender: render };
  let mount;
  if (route.access === "app") {
    appEl.innerHTML = shell(route.nav, prof);
    mount = appEl.querySelector("#main");
    appEl.querySelector("#theme-toggle").addEventListener("click", () => {
      store.setTheme(store.getState().theme === "dark" ? "light" : "dark");
      applyTheme();
      render();
    });
  } else {
    appEl.innerHTML = `<main id="main" tabindex="-1" class="main-public"></main>`;
    mount = appEl.querySelector("#main");
  }

  try {
    cleanup = route.page.render(mount, ctx) || null;
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="page"><div class="card">${icon("alert", { size: 28 })}<h1>Đã xảy ra lỗi khi hiển thị trang</h1><p>Hãy tải lại trang. Nếu lỗi lặp lại, vào Hồ sơ và chọn “Xóa dữ liệu demo”.</p><a class="btn btn-primary" href="#dashboard">Về trang tổng quan</a></div></div>`;
  }
  document.title = `${route.page.title?.(ctx) || "LearnMate"} · LearnMate`;
  window.scrollTo(0, 0);
  // Đưa tiêu điểm vào nội dung chính để người dùng bàn phím/đọc màn hình biết trang đã đổi.
  if (document.activeElement && document.activeElement !== document.body && !mount.contains(document.activeElement)) {
    mount.focus({ preventScroll: true });
  }
}

// Trong khung sandbox (ví dụ khi nhúng trang), trình duyệt có thể chặn việc gửi biểu mẫu gốc
// nên sự kiện submit không bao giờ xảy ra. Ta tự phát sự kiện submit bằng script.
function fireSubmit(form) {
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}
function installFormShim() {
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest('button[type="submit"], button:not([type]), input[type="submit"]');
      const form = btn?.form;
      if (!form || btn.disabled) return;
      e.preventDefault();
      fireSubmit(form);
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter" || e.isComposing) return;
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || !el.form) return;
      if (["checkbox", "radio", "button", "submit"].includes(el.type)) return;
      e.preventDefault();
      fireSubmit(el.form);
    },
    true,
  );
}

function boot() {
  installFormShim();
  store.load();
  applyTheme();
  const warning = store.consumeLoadWarning();
  window.addEventListener("hashchange", render);
  document.getElementById("skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("main")?.focus();
  });
  render();
  if (warning) toast(warning, "warning", 7000);
  if (!store.isPersistent()) toast("Trình duyệt đang chặn lưu trữ cục bộ: dữ liệu sẽ mất khi tải lại trang.", "warning", 7000);
}

window.addEventListener("error", (e) => {
  console.error(e.error || e.message);
});

boot();
