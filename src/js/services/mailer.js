// Thông báo qua email.
// - Chế độ TỰ GỬI: khi LearnMate chạy cùng máy chủ (server/server.js), email kết quả bài học được
//   gửi ngay khi hoàn thành bài, và báo cáo tiến độ được lưu lên máy chủ để gửi tự động hằng tuần.
// - Chế độ THỦ CÔNG: khi không có máy chủ (mở file trực tiếp, artifact…), soạn sẵn email và mở
//   Gmail / ứng dụng email để người dùng tự bấm Gửi.
import { getSubject, nextLessonAfter, LEVELS } from "../data/lessons.js";
import { getLessonState, addActivity } from "../store.js";
import { lessonScore, computeStats, nextStepAdvice, reviewSuggestions } from "./progress.js";
import { esc, formatMinutes, isValidEmail, daysAgo, uid } from "../utils.js";
import { icon, alertBox } from "../ui.js";
import { CONFIG } from "../config.js";

const WEEK_MS = 7 * 86400000;
const MAILTO_MAX = 1900;
let pendingReportFocus = false;

const fmtDate = (d) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
const short = (t, n = 70) => (t.length > n ? t.slice(0, n - 1) + "…" : t);
const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export function recipient(profile) {
  return (profile.notify && profile.notify.email) || profile.email || "";
}

function signature() {
  return `\n—\nEmail này được soạn tự động bởi LearnMate – Gia sư học tập cá nhân.\nDữ liệu được tính từ trình duyệt của người học tại thời điểm gửi.`;
}

// ───────── Nội dung email ─────────
/** Email thông báo kết quả một bài học. */
export function lessonResultEmail(profile, lesson) {
  const sc = lessonScore(profile, lesson);
  const st = getLessonState(profile, lesson.id);
  const subject = getSubject(lesson.subjectId);
  const pct = pctOf(sc.correct, sc.total);
  const verdict = pct >= 80 ? "Nắm chắc bài – có thể học tiếp." : pct >= 50 ? "Khá tốt – nên ôn lại các câu chưa đúng." : "Cần xem lại nội dung và làm lại bài.";
  const lines = lesson.questions.map((q, i) => {
    const qs = st.questions[q.id] || {};
    const mark = qs.status === "correct" ? "✔" : qs.status === "revealed" ? "✘" : qs.status === "skipped" ? "–" : "·";
    const label = qs.status === "correct" ? (qs.firstTry ? "Đúng ngay lần đầu" : `Đúng sau ${qs.attempts || 1} lần thử`) : qs.status === "revealed" ? "Đã xem lời giải" : qs.status === "skipped" ? "Bỏ qua" : "Chưa làm";
    return `${mark} Câu ${i + 1}: ${short(q.prompt)} — ${label}${qs.hints ? `, dùng ${qs.hints} gợi ý` : ""}`;
  });
  const missed = lesson.questions.filter((q) => (st.questions[q.id] || {}).status !== "correct");
  const next = nextLessonAfter(lesson.id);
  const when = st.completedAt || Date.now();
  const body = [
    `Chào ${profile.name},`,
    ``,
    `LearnMate thông báo kết quả bài học vừa hoàn thành:`,
    ``,
    `• Bài: ${lesson.title}`,
    `• Môn: ${subject ? subject.name : ""}${lesson.level && LEVELS[lesson.level] ? ` (${LEVELS[lesson.level]})` : ""}`,
    `• Thời gian hoàn thành: ${fmtDateTime(when)}`,
    `• Kết quả: ${sc.correct}/${sc.total} câu đúng (${pct}%)`,
    `• Nhận xét: ${verdict}`,
    ``,
    `CHI TIẾT TỪNG CÂU`,
    ...lines,
    ``,
    missed.length ? `CẦN XEM LẠI\n${missed.map((q) => `- ${short(q.prompt, 90)}`).join("\n")}\n` : `Tuyệt vời – không có câu nào cần xem lại!\n`,
    `BƯỚC TIẾP THEO`,
    missed.length && pct < 80 ? `Ôn lại bài “${lesson.title}” trước khi học tiếp.` : next ? `Học bài tiếp theo: “${next.title}”.` : `Đây là bài cuối của môn – hãy xem báo cáo tiến độ để chọn hướng ôn tập.`,
    signature(),
  ].join("\n");
  const data = {
    type: "lesson",
    name: profile.name,
    lessonId: lesson.id,
    title: lesson.title,
    subject: subject ? subject.name : "",
    level: lesson.level && LEVELS[lesson.level] ? LEVELS[lesson.level] : "",
    completedAt: fmtDateTime(when),
    correct: sc.correct,
    total: sc.total,
    questions: lesson.questions.map((q) => {
      const qs = st.questions[q.id] || {};
      const status = ["correct", "revealed", "skipped"].includes(qs.status) ? qs.status : "pending";
      const label = status === "correct" ? (qs.firstTry ? "Đúng ngay lần đầu" : `Đúng sau ${qs.attempts || 1} lần thử`) : status === "revealed" ? "Đã xem lời giải" : status === "skipped" ? "Bỏ qua" : "Chưa làm";
      return { prompt: short(q.prompt, 150), status, label: label + (qs.hints ? ` · ${qs.hints} gợi ý` : "") };
    }),
    nextTitle: next ? next.title : "",
    nextId: next ? next.id : "",
    action: missed.length && pct < 80 ? "review" : next ? "next" : "done",
  };
  return { subject: `[LearnMate] Kết quả bài “${short(lesson.title, 50)}”: ${sc.correct}/${sc.total} câu đúng (${pct}%)`, body, data };
}

/** Email báo cáo quá trình học tập (7 ngày gần nhất + tổng hợp). */
export function progressReportEmail(profile) {
  const s = computeStats(profile);
  const advice = nextStepAdvice(profile);
  const reviews = reviewSuggestions(profile, 5);
  const goalSubject = getSubject(profile.goal.subjectId);
  const from = fmtDate(daysAgo(6));
  const to = fmtDate(new Date());
  const targetPct = s.weeklyTargetSeconds ? pctOf(s.weekSeconds, s.weeklyTargetSeconds) : null;
  const recentActs = profile.activity.filter((a) => a.type !== "email").slice(0, 6).map((a) => `- ${fmtDateTime(a.ts)}: ${a.text}`);
  const body = [
    `Chào ${profile.name},`,
    ``,
    `Đây là báo cáo quá trình học tập trên LearnMate từ ${from} đến ${to}.`,
    s.seeded ? `(Lưu ý: số liệu có bao gồm dữ liệu minh họa của chế độ dùng thử.)` : ``,
    ``,
    `TỔNG QUAN`,
    `• Mục tiêu: ${goalSubject ? goalSubject.name : "—"} · ${LEVELS[profile.goal.level] || ""} · ${profile.goal.sessionsPerWeek} buổi/tuần × ${profile.goal.minutesPerSession} phút`,
    `• Tiến độ lộ trình: ${Math.round(s.pathPct)}% (${s.pathDone}/${s.path.length} bài)`,
    `• Bài học: ${s.completed} hoàn thành · ${s.inProgress} đang học`,
    `• Tỷ lệ trả lời đúng: ${s.accuracy == null ? "chưa có dữ liệu" : Math.round(s.accuracy * 100) + "%"} (${s.correct}/${s.answered} câu) · ${s.firstTry} câu đúng ngay lần đầu`,
    `• Thời gian học tuần này: ${formatMinutes(s.weekSeconds)}${targetPct != null ? ` / mục tiêu ${formatMinutes(s.weeklyTargetSeconds)} (${targetPct}%)` : ""}`,
    `• Tổng thời gian đã học: ${formatMinutes(s.totalSeconds)}`,
    ``,
    `THỜI GIAN HỌC 7 NGÀY QUA`,
    ...s.week.map((d) => `- ${d.label}: ${Math.round(d.seconds / 60)} phút`),
    ``,
    `KẾT QUẢ THEO MÔN`,
    ...s.bySubject.map((b) => `- ${b.subject.name}: ${b.answered ? pctOf(b.correct, b.answered) + "% đúng" : "chưa làm"} · hoàn thành ${b.completed}/${b.total} bài`),
    ``,
    `CHỦ ĐỀ LÀM TỐT (≥ 80%)`,
    ...(s.strong.length ? s.strong.slice(0, 6).map((r) => `- ${r.lesson.title}: ${r.correct}/${r.total}`) : ["- Chưa có"]),
    ``,
    `CHỦ ĐỀ CẦN ÔN (< 70%)`,
    ...(reviews.length ? reviews.map((r) => `- ${r.lesson.title}: ${r.correct}/${r.total}`) : ["- Không có"]),
    ``,
    recentActs.length ? `HOẠT ĐỘNG GẦN ĐÂY\n${recentActs.join("\n")}\n` : ``,
    `ĐỀ XUẤT BƯỚC TIẾP THEO`,
    advice.text,
    signature(),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");
  const data = {
    type: "report",
    name: profile.name,
    from,
    to,
    goal: `${goalSubject ? goalSubject.name : "—"} · ${LEVELS[profile.goal.level] || ""} · ${profile.goal.sessionsPerWeek} buổi/tuần × ${profile.goal.minutesPerSession} phút`,
    seeded: !!s.seeded,
    pathPct: Math.round(s.pathPct),
    pathDone: s.pathDone,
    pathTotal: s.path.length,
    completed: s.completed,
    inProgress: s.inProgress,
    accuracy: s.accuracy == null ? null : Math.round(s.accuracy * 100),
    correct: s.correct,
    answered: s.answered,
    firstTry: s.firstTry,
    weekMinutes: Math.round(s.weekSeconds / 60),
    targetMinutes: Math.round(s.weeklyTargetSeconds / 60),
    totalMinutes: Math.round(s.totalSeconds / 60),
    week: s.week.map((d) => ({ label: d.label, minutes: Math.round(d.seconds / 60) })),
    bySubject: s.bySubject.map((b) => ({ name: b.subject.name, pct: b.answered ? pctOf(b.correct, b.answered) : null, completed: b.completed, total: b.total })),
    strong: s.strong.slice(0, 6).map((r) => ({ title: r.lesson.title, score: `${r.correct}/${r.total}`, id: r.lesson.id })),
    weak: reviews.map((r) => ({ title: r.lesson.title, score: `${r.correct}/${r.total}`, id: r.lesson.id })),
    activity: profile.activity.filter((a) => a.type !== "email").slice(0, 5).map((a) => ({ when: fmtDateTime(a.ts), text: a.text })),
    advice: advice.text,
    adviceId: advice.lesson ? advice.lesson.id : "",
    adviceAction: advice.lesson && advice.action ? `${advice.action}: ${advice.lesson.title}` : "Mở LearnMate",
  };
  return { subject: `[LearnMate] Báo cáo học tập của ${profile.name} (${from} – ${to})`, body, data };
}

export function gmailUrl(to, msg) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
}

export function mailtoUrl(to, msg) {
  const head = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(msg.subject)}&body=`;
  let body = msg.body;
  let url = head + encodeURIComponent(body);
  if (url.length > MAILTO_MAX) {
    const note = "\n…\n(Nội dung đã rút gọn. Bấm “Sao chép nội dung” trong LearnMate để có bản đầy đủ.)";
    while (url.length > MAILTO_MAX && body.length > 200) {
      body = body.slice(0, Math.floor(body.length * 0.9));
      url = head + encodeURIComponent(body + note);
    }
  }
  return url;
}

// ───────── Máy chủ gửi email (chế độ tự gửi) ─────────
let serverPromise = null;
/** { ok, mail } nếu có máy chủ LearnMate cùng địa chỉ; null nếu không. */
export function serverInfo() {
  if (!serverPromise) {
    serverPromise = (async () => {
      if (!CONFIG.notifyProvider || CONFIG.notifyProvider === "manual") return null;
      if (!/^https?:$/.test(location.protocol)) return null;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(CONFIG.healthEndpoint, { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(timer);
        if (!res.ok) return null;
        const data = await res.json();
        return data && data.ok ? { ok: true, mail: !!data.mail } : null;
      } catch {
        return null;
      }
    })();
  }
  return serverPromise;
}

async function api(path, body) {
  try {
    const res = await fetch(`${CONFIG.notifyEndpoint}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, status: res.status, ...data };
  } catch {
    return { ok: false, status: 0, error: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại." };
  }
}

/** Mã thiết bị bí mật: chỉ trình duyệt này cập nhật được đăng ký của mình. */
function ensureKey(store) {
  let key = store.currentProfile()?.notify?.key;
  if (!key) {
    key = uid("k") + uid("") + Math.random().toString(36).slice(2);
    store.updateProfile((p) => { p.notify = { ...(p.notify || {}), key }; });
  }
  return key;
}

function cacheStatus(store, status) {
  if (!status) return;
  store.updateProfile((p) => {
    p.notify = { ...(p.notify || {}), verified: !!status.verified, subscribed: !!status.subscribed };
  });
}

/** Đăng ký / cập nhật tùy chọn trên máy chủ. Trả về kết quả API hoặc null nếu không có máy chủ. */
export async function syncSubscription(store, { resend = false } = {}) {
  const info = await serverInfo();
  if (!info) return null;
  const p = store.currentProfile();
  const email = recipient(p);
  if (!email || !isValidEmail(email)) return { ok: false, error: "Chưa có email nhận thông báo." };
  const key = ensureKey(store);
  const r = await api("subscribe", { email, key, name: p.name, onLesson: p.notify?.onLesson !== false, weekly: p.notify?.weekly !== false, resend });
  cacheStatus(store, r.status);
  if (r.ok && r.status?.verified) syncReport(store, { force: true });
  return r;
}

export async function fetchStatus(store) {
  const info = await serverInfo();
  if (!info) return null;
  const p = store.currentProfile();
  const email = recipient(p);
  if (!email || !p.notify?.key) return { ok: true, mail: info.mail, status: { subscribed: false, verified: false } };
  const r = await api("status", { email, key: p.notify.key });
  if (r.ok) cacheStatus(store, r.status);
  return r;
}

export async function unsubscribe(store, email = null) {
  const info = await serverInfo();
  const p = store.currentProfile();
  const target = email || recipient(p);
  if (!info || !p.notify?.key || !target) return null;
  const r = await api("unsubscribe", { email: target, key: p.notify.key });
  cacheStatus(store, { subscribed: false, verified: false });
  return r;
}

const lessonSends = new Map(); // lessonId → Promise<kết quả>

/** Gọi khi hoàn thành bài học: tự gửi kết quả nếu đã bật và email đã xác nhận. */
export function autoSendLesson(store, lesson) {
  const job = (async () => {
    const info = await serverInfo();
    if (!info) return null;
    const p = store.currentProfile();
    if (p.notify?.onLesson === false || !p.notify?.key || !recipient(p)) return null;
    if (!p.notify?.verified) return { ok: false, needsVerify: true };
    const msg = lessonResultEmail(p, lesson);
    const r = await api("lesson", { email: recipient(p), key: p.notify.key, ...msg });
    if (r.status === 403) cacheStatus(store, { subscribed: true, verified: false });
    if (r.ok && r.sent) {
      store.updateProfile((pp) => {
        pp.notify = { ...(pp.notify || {}), lastSentAt: Date.now() };
        addActivity(pp, { type: "email", text: `Đã tự động gửi kết quả “${lesson.title}” tới ${recipient(pp)}`, lessonId: lesson.id });
      });
    }
    return { ...r, at: Date.now() };
  })();
  lessonSends.set(lesson.id, job);
  syncReport(store, { force: true });
  return job;
}

export function lessonSendResult(lessonId) {
  return lessonSends.get(lessonId) || null;
}

let lastReportSync = 0;
let lastReportBody = "";
/** Lưu báo cáo mới nhất lên máy chủ để gửi tự động hằng tuần (send=true: gửi ngay). */
export async function syncReport(store, { force = false, send = false } = {}) {
  const info = await serverInfo();
  if (!info) return null;
  const p = store.currentProfile();
  if (!p || !p.notify?.key || !p.notify?.subscribed || !recipient(p)) return null;
  if (!send && p.notify?.weekly === false) return null;
  const msg = progressReportEmail(p);
  if (!send && !force && (Date.now() - lastReportSync < 10 * 60 * 1000 || msg.body === lastReportBody)) return null;
  lastReportSync = Date.now();
  lastReportBody = msg.body;
  const r = await api("report", { email: recipient(p), key: p.notify.key, ...msg, send });
  if (r.status === 403) cacheStatus(store, { subscribed: true, verified: false });
  if (send && r.ok && r.sent) {
    store.updateProfile((pp) => {
      pp.notify = { ...(pp.notify || {}), lastSentAt: Date.now(), lastWeeklyAt: Date.now() };
      addActivity(pp, { type: "email", text: `Đã gửi báo cáo học tập tới ${recipient(pp)}` });
    });
  }
  return r;
}

// ───────── Giao diện ─────────
export function weeklyDue(profile) {
  const n = profile.notify;
  if (!n || n.weekly === false) return false;
  if (n.verified) return false; // máy chủ tự gửi hằng tuần
  const hasData = profile.activity.length > 0 || profile.studyLog.length > 0;
  if (!hasData) return false;
  const ref = n.lastWeeklyAt || profile.createdAt || 0;
  return Date.now() - ref >= WEEK_MS;
}

export function weeklyBanner(profile) {
  return `<div id="weekly-banner" style="margin-bottom:1.75rem">${alertBox(
    `<span class="alert-text"><strong>Báo cáo học tập tuần đã sẵn sàng.</strong> Gửi bản tổng hợp tiến độ ${recipient(profile) ? `tới <strong>${esc(recipient(profile))}</strong>` : "về email của bạn"}.</span>
     <div class="btn-row" style="margin-top:.5rem"><a class="btn btn-primary btn-sm" href="#progress" data-report-focus>${icon("mail", { size: 16 })}Xem và gửi báo cáo</a><button class="btn btn-ghost btn-sm" id="weekly-later">Để sau</button></div>`,
    "info",
  )}</div>`;
}

function mailBox(profile, { title, text, autoLabel }) {
  const to = recipient(profile);
  return `
  <div class="mail-box" data-mailbox>
    <h3>${icon("mail", { size: 18 })}${esc(title)}</h3>
    <div class="mail-auto" hidden>
      <p class="small" id="mail-auto-status" aria-live="polite" style="margin:0 0 .6rem"></p>
      <div class="btn-row"><button type="button" class="btn btn-primary btn-sm" id="mail-auto-send">${icon("send", { size: 16 })}${esc(autoLabel)}</button></div>
      <p class="small muted" style="margin:.75rem 0 .25rem">Hoặc tự soạn gửi tới địa chỉ khác:</p>
    </div>
    <div class="mail-manual">
      <p class="small muted mail-manual-text" style="margin:0 0 .6rem">${esc(text)}</p>
      <div class="field" style="margin-bottom:.5rem">
        <label for="mail-to">Gửi tới</label>
        <input id="mail-to" type="email" autocomplete="email" value="${esc(to)}" placeholder="ban@vidu.com" aria-describedby="mail-to-error"/>
        <p class="field-error" id="mail-to-error" aria-live="polite"></p>
      </div>
      <div class="btn-row">
        <a class="btn btn-secondary btn-sm" id="mail-gmail" href="#" target="_blank" rel="noopener">${icon("send", { size: 16 })}Gửi bằng Gmail</a>
        <a class="btn btn-secondary btn-sm" id="mail-app" href="#" target="_blank" rel="noopener">${icon("mail", { size: 16 })}Ứng dụng email khác</a>
        <button type="button" class="btn btn-ghost btn-sm" id="mail-copy">Sao chép nội dung</button>
      </div>
    </div>
    <details><summary>Xem trước nội dung email</summary><pre class="mail-preview" id="mail-preview"></pre></details>
  </div>`;
}

export function lessonMailBox(profile, lesson) {
  if (profile.notify && profile.notify.onLesson === false) return "";
  return mailBox(profile, { title: "Gửi kết quả bài học qua email", text: "Email gồm điểm, kết quả từng câu, câu cần xem lại và bước tiếp theo. Bạn kiểm tra rồi bấm Gửi trong Gmail.", autoLabel: "Gửi lại kết quả" });
}

export function reportMailBox(profile) {
  return mailBox(profile, { title: "Gửi báo cáo tiến độ", text: "Gửi cho chính bạn, phụ huynh hoặc giáo viên. Email mở sẵn trong Gmail để bạn bấm Gửi.", autoLabel: "Gửi báo cáo ngay" });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/** Gắn sự kiện cho khung email. kind: "lesson" | "report"; lessonId cho kind="lesson". */
export function bindMailBox(root, { store, toast, build, kind, lessonId = null }) {
  const box = root.querySelector("[data-mailbox]");
  if (!box) return;
  const input = box.querySelector("#mail-to");
  const err = box.querySelector("#mail-to-error");
  const gmail = box.querySelector("#mail-gmail");
  const app = box.querySelector("#mail-app");
  const preview = box.querySelector("#mail-preview");

  const refresh = () => {
    const msg = build();
    const to = input.value.trim();
    gmail.href = gmailUrl(to, msg);
    app.href = mailtoUrl(to, msg);
    preview.textContent = `Tới: ${to || "(chưa nhập)"}\nTiêu đề: ${msg.subject}\n\n${msg.body}`;
    return msg;
  };
  refresh();
  input.addEventListener("input", () => { err.textContent = ""; input.setAttribute("aria-invalid", "false"); refresh(); });

  const validate = () => {
    const to = input.value.trim();
    if (!to || !isValidEmail(to)) {
      err.textContent = !to ? "Vui lòng nhập email nhận thông báo." : "Email chưa đúng định dạng, ví dụ: ban@vidu.com";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return null;
    }
    return to;
  };

  const markSent = (to, via) => {
    store.updateProfile((p) => {
      p.notify = { ...(p.notify || {}), lastSentAt: Date.now() };
      if (!p.notify.email) p.notify.email = to;
      if (kind === "report") p.notify.lastWeeklyAt = Date.now();
      addActivity(p, { type: "email", text: kind === "report" ? `Đã soạn báo cáo học tập gửi tới ${to}` : `Đã soạn email kết quả gửi tới ${to}` });
    });
    toast(via === "copy" ? "Đã sao chép nội dung email. Dán vào thư mới để gửi." : `Đã mở email soạn sẵn tới ${to}. Hãy bấm Gửi để hoàn tất.`, "success");
  };

  for (const [el, via] of [[gmail, "gmail"], [app, "app"]]) {
    el.addEventListener("click", (e) => {
      const to = validate();
      if (!to) { e.preventDefault(); return; }
      refresh();
      markSent(to, via);
    });
  }
  box.querySelector("#mail-copy").addEventListener("click", async () => {
    const msg = refresh();
    const to = input.value.trim();
    const ok = await copyText(`Tiêu đề: ${msg.subject}\n\n${msg.body}`);
    if (!ok) { toast("Trình duyệt chặn sao chép. Hãy mở “Xem trước” và sao chép thủ công.", "error"); return; }
    if (to && isValidEmail(to)) markSent(to, "copy");
    else toast("Đã sao chép nội dung email.", "success");
  });

  // Chế độ tự gửi: hiện trạng thái và nút gửi qua máy chủ khi email đã xác nhận.
  (async () => {
    const info = await serverInfo();
    if (!info || !box.isConnected) return;
    const st = await fetchStatus(store);
    if (!box.isConnected) return;
    const p = store.currentProfile();
    const to = recipient(p);
    const auto = box.querySelector(".mail-auto");
    const status = box.querySelector("#mail-auto-status");
    const sendBtn = box.querySelector("#mail-auto-send");
    const verified = !!st?.status?.verified;
    auto.hidden = false;
    box.querySelector(".mail-manual-text").hidden = true;
    if (!to || !st?.status?.subscribed) {
      status.innerHTML = `Bật <strong>tự động gửi email</strong>: nhập email trong <a href="#profile">Hồ sơ → Thông báo qua email</a> rồi xác nhận qua hộp thư.`;
      sendBtn.hidden = true;
      return;
    }
    if (!verified) {
      status.innerHTML = `Email <strong>${esc(to)}</strong> đang chờ xác nhận. Mở hộp thư và bấm liên kết xác nhận để LearnMate tự gửi email. <a href="#profile">Gửi lại email xác nhận</a>`;
      sendBtn.hidden = true;
      return;
    }
    if (kind === "lesson") {
      const pending = lessonId ? lessonSendResult(lessonId) : null;
      if (pending) {
        status.innerHTML = `${icon("clock", { size: 16 })} Đang gửi kết quả tới <strong>${esc(to)}</strong>…`;
        const r = await pending;
        if (!box.isConnected) return;
        status.innerHTML = r && r.ok && r.sent
          ? `${icon("check", { size: 16 })} Đã tự động gửi kết quả tới <strong>${esc(to)}</strong>.`
          : `${icon("alert", { size: 16 })} Chưa gửi được: ${esc((r && r.error) || "lỗi không xác định")}`;
      } else {
        status.innerHTML = `Kết quả bài học được tự động gửi tới <strong>${esc(to)}</strong> mỗi khi bạn hoàn thành bài.`;
      }
    } else {
      status.innerHTML = `${icon("check", { size: 16 })} Báo cáo được <strong>tự động gửi hằng tuần</strong> tới <strong>${esc(to)}</strong>${p.notify?.weekly === false ? " (đang tắt – bật trong Hồ sơ)" : ""}. Bạn cũng có thể gửi ngay.`;
    }
    sendBtn.addEventListener("click", async () => {
      sendBtn.disabled = true;
      const msg = build();
      let r;
      if (kind === "report") r = await syncReport(store, { send: true });
      else {
        const pp = store.currentProfile();
        r = await api("lesson", { email: recipient(pp), key: pp.notify.key, ...msg, manual: true });
        if (r.ok && r.sent) store.updateProfile((x) => { x.notify = { ...(x.notify || {}), lastSentAt: Date.now() }; });
      }
      sendBtn.disabled = false;
      if (r && r.ok && r.sent) {
        status.innerHTML = `${icon("check", { size: 16 })} Đã gửi tới <strong>${esc(to)}</strong> lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`;
        toast(`Đã gửi email tới ${to}.`, "success");
      } else toast((r && r.error) || "Không gửi được email. Vui lòng thử lại.", "error");
    });
  })();
}

export function requestReportFocus() { pendingReportFocus = true; }
export function consumeReportFocus() { const v = pendingReportFocus; pendingReportFocus = false; return v; }

// Liên kết có data-report-focus: đến trang Tiến độ và cuộn tới khung gửi báo cáo.
document.addEventListener("click", (e) => { if (e.target.closest?.("[data-report-focus]")) requestReportFocus(); }, true);
