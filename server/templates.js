// Mẫu email HTML của LearnMate.
// Viết theo kiểu "email-safe": bố cục bằng bảng, CSS nội tuyến, không JavaScript, không ảnh ngoài,
// để hiển thị ổn định trên Gmail, Outlook, Apple Mail và ứng dụng điện thoại.
"use strict";

const C = {
  primary: "#4f5bd5",
  primaryDark: "#3a44a8",
  primarySoft: "#eceefd",
  bg: "#f3f4f9",
  surface: "#ffffff",
  text: "#1d2233",
  muted: "#586074",
  border: "#e2e5ee",
  track: "#e9ebf3",
  success: "#17794c",
  successSoft: "#e6f5ed",
  warning: "#9a5b00",
  warningSoft: "#fdf3e1",
  error: "#b42318",
  errorSoft: "#fdecea",
};
const FONT = "'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

// ───────── Làm sạch dữ liệu từ trình duyệt ─────────
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const str = (v, max = 200) => (typeof v === "string" ? v.replace(/[\r\u0000-\u0008]/g, "").slice(0, max) : "");
const num = (v, min = 0, max = 1e9) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : 0);
const numOrNull = (v, min, max) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : null);
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const ID_RE = /^[a-z0-9-]{1,60}$/i;
const STATUSES = ["correct", "revealed", "skipped", "pending"];

function cleanLessonData(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    type: "lesson",
    name: str(raw.name, 60),
    lessonId: ID_RE.test(raw.lessonId || "") ? raw.lessonId : "",
    title: str(raw.title, 120),
    subject: str(raw.subject, 60),
    level: str(raw.level, 30),
    completedAt: str(raw.completedAt, 40),
    correct: num(raw.correct, 0, 100),
    total: num(raw.total, 0, 100),
    questions: arr(raw.questions, 30).map((q) => ({
      prompt: str(q && q.prompt, 160),
      status: STATUSES.includes(q && q.status) ? q.status : "pending",
      label: str(q && q.label, 60),
    })),
    nextTitle: str(raw.nextTitle, 120),
    nextId: ID_RE.test(raw.nextId || "") ? raw.nextId : "",
    action: ["review", "next", "done"].includes(raw.action) ? raw.action : "next",
  };
}

function cleanReportData(raw) {
  if (!raw || typeof raw !== "object") return null;
  const items = (v, n) => arr(v, n).map((r) => ({ title: str(r && r.title, 120), score: str(r && r.score, 20), id: ID_RE.test((r && r.id) || "") ? r.id : "" }));
  return {
    type: "report",
    name: str(raw.name, 60),
    from: str(raw.from, 20),
    to: str(raw.to, 20),
    goal: str(raw.goal, 160),
    seeded: !!raw.seeded,
    pathPct: num(raw.pathPct, 0, 100),
    pathDone: num(raw.pathDone, 0, 999),
    pathTotal: num(raw.pathTotal, 0, 999),
    completed: num(raw.completed, 0, 999),
    inProgress: num(raw.inProgress, 0, 999),
    accuracy: numOrNull(raw.accuracy, 0, 100),
    correct: num(raw.correct, 0, 99999),
    answered: num(raw.answered, 0, 99999),
    firstTry: num(raw.firstTry, 0, 99999),
    weekMinutes: num(raw.weekMinutes, 0, 100000),
    targetMinutes: num(raw.targetMinutes, 0, 100000),
    totalMinutes: num(raw.totalMinutes, 0, 10000000),
    week: arr(raw.week, 7).map((d) => ({ label: str(d && d.label, 12), minutes: num(d && d.minutes, 0, 1440) })),
    bySubject: arr(raw.bySubject, 10).map((b) => ({ name: str(b && b.name, 60), pct: numOrNull(b && b.pct, 0, 100), completed: num(b && b.completed, 0, 999), total: num(b && b.total, 0, 999) })),
    strong: items(raw.strong, 6),
    weak: items(raw.weak, 6),
    activity: arr(raw.activity, 6).map((a) => ({ when: str(a && a.when, 40), text: str(a && a.text, 160) })),
    advice: str(raw.advice, 400),
    adviceId: ID_RE.test(raw.adviceId || "") ? raw.adviceId : "",
    adviceAction: str(raw.adviceAction, 60),
  };
}

function cleanData(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "lesson") return cleanLessonData(raw);
  if (raw.type === "report") return cleanReportData(raw);
  return null;
}

// ───────── Thành phần dùng chung ─────────
const fmtMin = (m) => {
  m = Math.round(m);
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} giờ ${m % 60} phút` : `${h} giờ`;
};
const tone = (pct) => (pct >= 80 ? { fg: C.success, bg: C.successSoft } : pct >= 50 ? { fg: C.warning, bg: C.warningSoft } : { fg: C.error, bg: C.errorSoft });

function bar(pct, color = C.primary, height = 8) {
  const w = Math.max(0, Math.min(100, Math.round(pct)));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr>
    ${w > 0 ? `<td width="${w}%" style="background:${color};height:${height}px;line-height:${height}px;font-size:0;border-radius:${height}px">&nbsp;</td>` : ""}
    ${w < 100 ? `<td style="background:${C.track};height:${height}px;line-height:${height}px;font-size:0;border-radius:${height}px">&nbsp;</td>` : ""}
  </tr></table>`;
}

function button(href, label, { color = C.primary, outline = false } = {}) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0"><tr>
    <td style="border-radius:10px;background:${outline ? "#ffffff" : color};${outline ? `border:1.5px solid ${color};` : ""}">
      <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:15px;font-weight:600;color:${outline ? color : "#ffffff"};text-decoration:none;border-radius:10px">${esc(label)}</a>
    </td></tr></table>`;
}

function sectionTitle(text) {
  return `<p style="margin:26px 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${esc(text)}</p>`;
}

function callout(html, { fg, bg }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background:${bg};border-left:4px solid ${fg};border-radius:10px;padding:14px 16px;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.text}">${html}</td>
  </tr></table>`;
}

function statTile(label, value, sub) {
  return `<td width="50%" valign="top" style="padding:6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:${C.bg};border-radius:12px;padding:14px 16px;font-family:${FONT}">
        <div style="font-size:12px;color:${C.muted};font-weight:600">${esc(label)}</div>
        <div style="font-size:26px;line-height:1.25;font-weight:800;color:${C.text};margin-top:2px">${esc(value)}</div>
        <div style="font-size:12px;color:${C.muted};margin-top:2px">${esc(sub)}</div>
      </td>
    </tr></table>
  </td>`;
}

/** Khung chung: tiêu đề màu thương hiệu, thân thư, chân thư với liên kết ngừng nhận. */
function layout({ preheader, kicker, heading, bodyHtml, appUrl, unsubUrl, reason }) {
  return `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${esc(heading)}</title>
<style>
  @media (max-width:620px){ .container{width:100%!important} .px{padding-left:20px!important;padding-right:20px!important} .stack > td, .stack > tbody > tr > td, .stack > tr > td{display:block!important;width:100%!important;box-sizing:border-box!important;padding-left:0!important;padding-right:0!important} .stack > td + td, .stack > tbody > tr > td + td, .stack > tr > td + td{padding-top:12px!important} }
  a{color:${C.primary}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
    <tr><td style="background:${C.primary};border-radius:16px 16px 0 0;padding:22px 32px" class="px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${FONT};font-size:20px;font-weight:800;color:#ffffff">🎓 LearnMate</td>
        <td align="right" style="font-family:${FONT};font-size:12px;font-weight:600;color:#dfe2ff;letter-spacing:.04em">${esc(kicker)}</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:${C.surface};padding:30px 32px 32px;border:1px solid ${C.border};border-top:none;border-radius:0 0 16px 16px" class="px">
      <h1 style="margin:0 0 6px;font-family:${FONT};font-size:22px;line-height:1.3;color:${C.text}">${esc(heading)}</h1>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:18px 24px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};text-align:center">
      ${esc(reason)}<br>
      <a href="${esc(appUrl)}" style="color:${C.muted};text-decoration:underline">Mở LearnMate</a>${unsubUrl ? ` &nbsp;·&nbsp; <a href="${esc(unsubUrl)}" style="color:${C.muted};text-decoration:underline">Ngừng nhận email</a>` : ""}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const p = (html, extra = "") => `<p style="margin:0 0 12px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.text};${extra}">${html}</p>`;

// ───────── Email kết quả bài học ─────────
function renderLesson(d, { appUrl, unsubUrl }) {
  const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
  const t = tone(pct);
  const verdict = pct >= 80 ? "Nắm chắc bài" : pct >= 50 ? "Khá tốt – nên ôn thêm" : "Cần xem lại";
  const icons = {
    correct: { ch: "✓", fg: C.success, bg: C.successSoft },
    revealed: { ch: "✗", fg: C.error, bg: C.errorSoft },
    skipped: { ch: "–", fg: C.warning, bg: C.warningSoft },
    pending: { ch: "·", fg: C.muted, bg: C.bg },
  };
  const rows = d.questions
    .map((q, i) => {
      const ic = icons[q.status];
      return `<tr>
        <td width="34" valign="top" style="padding:10px 0;border-bottom:1px solid ${C.border}">
          <div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:${ic.bg};color:${ic.fg};text-align:center;font-family:${FONT};font-size:14px;font-weight:800">${ic.ch}</div>
        </td>
        <td valign="top" style="padding:10px 0 10px 8px;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:14px;line-height:1.5;color:${C.text}">
          <strong>Câu ${i + 1}.</strong> ${esc(q.prompt)}
          <div style="font-size:12.5px;color:${ic.fg === C.muted ? C.muted : ic.fg};margin-top:2px">${esc(q.label)}</div>
        </td>
      </tr>`;
    })
    .join("");
  const missed = d.questions.filter((q) => q.status !== "correct");
  const ctaHref = d.action === "review" ? `${appUrl}/#lesson-${d.lessonId}` : d.nextId ? `${appUrl}/#lesson-${d.nextId}` : `${appUrl}/#progress`;
  const ctaLabel = d.action === "review" ? "Ôn lại bài này" : d.nextId ? `Học tiếp: ${d.nextTitle}` : "Xem tiến độ học tập";

  const body = `
    ${p(`Chào <strong>${esc(d.name || "bạn")}</strong>, đây là kết quả bài học vừa hoàn thành.`, `color:${C.muted}`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px"><tr>
      <td style="background:${C.primarySoft};border-radius:14px;padding:20px 22px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="stack"><tr>
          <td valign="middle" width="140" style="font-family:${FONT}">
            <div style="font-size:44px;line-height:1;font-weight:800;color:${C.primaryDark}">${d.correct}<span style="font-size:24px;color:${C.muted}">/${d.total}</span></div>
            <div style="font-size:13px;color:${C.muted};margin-top:4px">câu đúng</div>
          </td>
          <td valign="middle" style="font-family:${FONT};padding-left:6px">
            <div style="font-size:17px;font-weight:700;color:${C.text};line-height:1.35">${esc(d.title)}</div>
            <div style="font-size:13px;color:${C.muted};margin:3px 0 10px">${esc([d.subject, d.level, d.completedAt].filter(Boolean).join(" · "))}</div>
            <span style="display:inline-block;background:${t.bg};color:${t.fg};font-size:13px;font-weight:700;padding:4px 10px;border-radius:999px">${pct}% · ${esc(verdict)}</span>
          </td>
        </tr></table>
        <div style="height:14px;line-height:14px;font-size:0">&nbsp;</div>
        ${bar(pct, t.fg, 10)}
      </td>
    </tr></table>

    ${sectionTitle("Chi tiết từng câu")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>

    <div style="height:18px;line-height:18px;font-size:0">&nbsp;</div>
    ${
      missed.length
        ? callout(`<strong style="color:${C.warning}">Cần xem lại ${missed.length} câu</strong><br>${missed.map((q) => `• ${esc(q.prompt)}`).join("<br>")}`, { fg: C.warning, bg: C.warningSoft })
        : callout(`<strong style="color:${C.success}">Tuyệt vời!</strong> Không có câu nào cần xem lại.`, { fg: C.success, bg: C.successSoft })
    }

    ${sectionTitle("Bước tiếp theo")}
    ${p(d.action === "review" ? `Nên ôn lại bài <strong>“${esc(d.title)}”</strong> trước khi học tiếp.` : d.nextId ? `Bài tiếp theo trong lộ trình: <strong>“${esc(d.nextTitle)}”</strong>.` : "Đây là bài cuối của môn – xem báo cáo tiến độ để chọn hướng ôn tập.")}
    ${button(ctaHref, ctaLabel)}`;

  return layout({
    preheader: `${d.correct}/${d.total} câu đúng (${pct}%) – ${d.title}`,
    kicker: "KẾT QUẢ BÀI HỌC",
    heading: `Hoàn thành bài “${d.title}”`,
    bodyHtml: body,
    appUrl,
    unsubUrl,
    reason: "Bạn nhận email này vì đã bật thông báo kết quả bài học trong LearnMate.",
  });
}

// ───────── Email báo cáo tuần ─────────
function renderReport(d, { appUrl, unsubUrl, staleDays = 0 }) {
  const weekPct = d.targetMinutes ? Math.min(100, Math.round((d.weekMinutes / d.targetMinutes) * 100)) : 0;
  const maxMin = Math.max(1, ...d.week.map((w) => w.minutes));
  const BAR_H = 90;
  const chart = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed"><tr>
    ${d.week
      .map((w) => {
        const h = w.minutes > 0 ? Math.max(4, Math.round((w.minutes / maxMin) * BAR_H)) : 0;
        return `<td align="center" valign="bottom" width="${Math.floor(100 / Math.max(1, d.week.length))}%" style="padding:0 4px;font-family:${FONT}">
          <div style="font-size:11px;color:${C.muted};margin-bottom:4px">${Math.round(w.minutes)}′</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${BAR_H}" valign="bottom" style="height:${BAR_H}px">
            ${h ? `<div style="height:${h}px;line-height:${h}px;font-size:0;background:${C.primary};border-radius:6px 6px 2px 2px">&nbsp;</div>` : `<div style="height:3px;line-height:3px;font-size:0;background:${C.track};border-radius:2px">&nbsp;</div>`}
          </td></tr></table>
          <div style="font-size:11.5px;color:${C.text};margin-top:6px">${esc(w.label === "Hôm nay" ? "Nay" : w.label)}</div>
        </td>`;
      })
      .join("")}
  </tr></table>`;

  const subjects = d.bySubject
    .map(
      (b) => `<tr>
      <td width="38%" style="padding:7px 10px 7px 0;font-family:${FONT};font-size:13.5px;color:${C.text}">${esc(b.name)}<div style="font-size:11.5px;color:${C.muted}">Hoàn thành ${b.completed}/${b.total} bài</div></td>
      <td style="padding:7px 0">${b.pct == null ? `<div style="font-family:${FONT};font-size:12px;color:${C.muted}">Chưa làm bài</div>` : bar(b.pct, tone(b.pct).fg, 8)}</td>
      <td width="44" align="right" style="padding:7px 0 7px 10px;font-family:${FONT};font-size:13.5px;font-weight:700;color:${b.pct == null ? C.muted : tone(b.pct).fg}">${b.pct == null ? "—" : Math.round(b.pct) + "%"}</td>
    </tr>`,
    )
    .join("");

  const list = (items, empty, fg) =>
    items.length
      ? items.map((r) => `<div style="padding:5px 0;font-family:${FONT};font-size:13.5px;color:${C.text}">• ${r.id ? `<a href="${esc(appUrl)}/#lesson-${r.id}" style="color:${C.text};text-decoration:none">${esc(r.title)}</a>` : esc(r.title)} <span style="color:${fg};font-weight:700">${esc(r.score)}</span></div>`).join("")
      : `<div style="font-family:${FONT};font-size:13px;color:${C.muted}">${esc(empty)}</div>`;

  const body = `
    ${p(`Chào <strong>${esc(d.name || "bạn")}</strong>, đây là tổng kết quá trình học tập từ <strong>${esc(d.from)}</strong> đến <strong>${esc(d.to)}</strong>.`, `color:${C.muted}`)}
    ${d.goal ? p(`🎯 Mục tiêu: ${esc(d.goal)}`, `font-size:13.5px;color:${C.muted}`) : ""}
    ${staleDays >= 2 ? callout(`Số liệu cập nhật lần cuối <strong>${staleDays} ngày trước</strong> – lần gần nhất người học mở LearnMate.`, { fg: C.warning, bg: C.warningSoft }) : ""}
    ${d.seeded ? `<div style="height:8px"></div>${callout("Số liệu có bao gồm <strong>dữ liệu minh họa</strong> của chế độ dùng thử.", { fg: C.muted, bg: C.bg })}` : ""}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px">
      <tr class="stack">${statTile("Tiến độ lộ trình", `${Math.round(d.pathPct)}%`, `${d.pathDone}/${d.pathTotal} bài`)}${statTile("Tỷ lệ trả lời đúng", d.accuracy == null ? "—" : `${Math.round(d.accuracy)}%`, `${d.correct}/${d.answered} câu · ${d.firstTry} đúng ngay`)}</tr>
      <tr class="stack">${statTile("Thời gian tuần này", fmtMin(d.weekMinutes), d.targetMinutes ? `Mục tiêu ${fmtMin(d.targetMinutes)}` : "Chưa đặt mục tiêu")}${statTile("Bài học", `${d.completed}`, `hoàn thành · ${d.inProgress} đang học`)}</tr>
    </table>

    ${sectionTitle("Mục tiêu thời gian tuần")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td>${bar(weekPct, weekPct >= 100 ? C.success : C.primary, 12)}</td>
      <td width="56" align="right" style="font-family:${FONT};font-size:14px;font-weight:800;color:${weekPct >= 100 ? C.success : C.primaryDark}">${weekPct}%</td>
    </tr></table>
    <div style="font-family:${FONT};font-size:12.5px;color:${C.muted};margin-top:6px">${weekPct >= 100 ? "Đã đạt mục tiêu tuần – làm tốt lắm! 🎉" : `Đã học ${fmtMin(d.weekMinutes)} / ${fmtMin(d.targetMinutes)}.`} Tổng thời gian từ trước tới nay: ${fmtMin(d.totalMinutes)}.</div>

    ${sectionTitle("Thời gian học 7 ngày qua")}
    ${chart}

    ${sectionTitle("Kết quả theo môn")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${subjects}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px" class="stack"><tr>
      <td width="50%" valign="top" style="padding-right:8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${C.successSoft};border-radius:12px;padding:14px 16px">
          <div style="font-family:${FONT};font-size:13px;font-weight:800;color:${C.success};margin-bottom:6px">💪 Làm tốt (≥ 80%)</div>
          ${list(d.strong, "Chưa có chủ đề nào.", C.success)}
        </td></tr></table>
      </td>
      <td width="50%" valign="top" style="padding-left:8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${C.warningSoft};border-radius:12px;padding:14px 16px">
          <div style="font-family:${FONT};font-size:13px;font-weight:800;color:${C.warning};margin-bottom:6px">📌 Cần ôn (&lt; 70%)</div>
          ${list(d.weak, "Không có chủ đề cần ôn.", C.warning)}
        </td></tr></table>
      </td>
    </tr></table>

    ${sectionTitle("Đề xuất bước tiếp theo")}
    ${callout(esc(d.advice), { fg: C.primary, bg: C.primarySoft })}
    <div style="height:14px"></div>
    ${button(d.adviceId ? `${appUrl}/#lesson-${d.adviceId}` : `${appUrl}/#dashboard`, d.adviceAction || "Mở LearnMate")}

    ${
      d.activity.length
        ? `${sectionTitle("Hoạt động gần đây")}${d.activity
            .map((a) => `<div style="padding:6px 0;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:13px;color:${C.text}"><span style="color:${C.muted};font-size:12px">${esc(a.when)}</span><br>${esc(a.text)}</div>`)
            .join("")}`
        : ""
    }`;

  return layout({
    preheader: `Tiến độ ${Math.round(d.pathPct)}% · Đúng ${d.accuracy == null ? "—" : Math.round(d.accuracy) + "%"} · Học ${fmtMin(d.weekMinutes)} tuần này`,
    kicker: "BÁO CÁO HỌC TẬP",
    heading: `Báo cáo tuần của ${d.name || "bạn"}`,
    bodyHtml: body,
    appUrl,
    unsubUrl,
    reason: "Bạn nhận email này vì đã bật báo cáo học tập hằng tuần trong LearnMate.",
  });
}

// ───────── Email xác nhận ─────────
function renderVerify({ name, onLesson, weekly, link, appUrl }) {
  const item = (on, title, sub) => `<tr>
    <td width="30" valign="top" style="padding:8px 0;font-family:${FONT};font-size:16px">${on ? "✅" : "⬜"}</td>
    <td style="padding:8px 0;font-family:${FONT};font-size:14px;color:${on ? C.text : C.muted}"><strong>${esc(title)}</strong>${on ? "" : " (đang tắt)"}<br><span style="font-size:12.5px;color:${C.muted}">${esc(sub)}</span></td></tr>`;
  const body = `
    ${p(`Chào${name ? ` <strong>${esc(name)}</strong>` : ""}, địa chỉ email này vừa được đăng ký để nhận thông báo học tập từ LearnMate:`, `color:${C.muted}`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px">
      ${item(onLesson, "Kết quả sau mỗi bài học", "Điểm, kết quả từng câu và câu cần xem lại")}
      ${item(weekly, "Báo cáo quá trình học hằng tuần", "Gửi lúc 19:00 Chủ nhật: tiến độ, thời gian học, chủ đề cần ôn")}
    </table>
    ${button(link, "Xác nhận nhận email")}
    ${p(`Hoặc mở liên kết: <a href="${esc(link)}" style="color:${C.primary};word-break:break-all">${esc(link)}</a>`, `font-size:12.5px;color:${C.muted};margin-top:14px`)}
    ${p("Nếu bạn không yêu cầu, hãy bỏ qua email này – bạn sẽ không nhận thêm thư nào.", `font-size:13px;color:${C.muted}`)}`;
  return layout({
    preheader: "Bấm xác nhận để bắt đầu nhận kết quả và báo cáo học tập.",
    kicker: "XÁC NHẬN EMAIL",
    heading: "Xác nhận nhận thông báo học tập",
    bodyHtml: body,
    appUrl,
    unsubUrl: null,
    reason: "Bạn nhận email này vì địa chỉ của bạn được nhập vào phần Thông báo trong LearnMate.",
  });
}

/** Thư văn bản đơn giản (dự phòng khi không có dữ liệu cấu trúc). */
function renderPlain({ subject, text, appUrl, unsubUrl }) {
  const body = `<div style="white-space:pre-wrap;font-family:${FONT};font-size:14.5px;line-height:1.6;color:${C.text}">${esc(text)}</div>`;
  return layout({ preheader: subject, kicker: "LEARNMATE", heading: subject.replace(/^\[LearnMate\]\s*/, ""), bodyHtml: body, appUrl, unsubUrl, reason: "Bạn nhận email này từ LearnMate." });
}

module.exports = { cleanData, renderLesson, renderReport, renderVerify, renderPlain };
