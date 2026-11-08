// Máy chủ LearnMate: phục vụ ứng dụng (index.html) và API gửi email thông báo.
//
// Biến môi trường:
//   DATABASE_URL     Chuỗi kết nối Postgres (bắt buộc khi chạy thật)
//   BREVO_API_KEY    API key của Brevo (https://app.brevo.com → SMTP & API → API keys)
//   SENDER_EMAIL     Địa chỉ gửi đã xác minh trong Brevo (Senders)
//   SENDER_NAME      Tên hiển thị người gửi (mặc định "LearnMate")
//   CRON_SECRET      Chuỗi bí mật để gọi /api/cron/weekly
//   PUBLIC_URL       Địa chỉ công khai (mặc định lấy RENDER_EXTERNAL_URL)
//   MAIL_DRY_RUN=1   Không gửi thật, chỉ ghi log (dùng khi thử nghiệm)
"use strict";

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { Pool } = require("pg");
const tpl = require("./templates");

const PORT = Number(process.env.PORT) || 10000;
const ROOT = path.join(__dirname, "..");
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const DRY_RUN = process.env.MAIL_DRY_RUN === "1";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "";
const SENDER_NAME = process.env.SENDER_NAME || "LearnMate";
const DAILY_LIMIT = 30; // số email tối đa / người nhận / ngày
const WEEK_GAP = "6 days 12 hours";

// ───────── Cơ sở dữ liệu ─────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !/localhost|127\.0\.0\.1|@dpg-[^.]+\//.test(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
  max: 5,
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id              SERIAL PRIMARY KEY,
      email           TEXT NOT NULL,
      key_hash        TEXT NOT NULL,
      name            TEXT NOT NULL DEFAULT '',
      on_lesson       BOOLEAN NOT NULL DEFAULT TRUE,
      weekly          BOOLEAN NOT NULL DEFAULT TRUE,
      verified        BOOLEAN NOT NULL DEFAULT FALSE,
      verify_token    TEXT,
      unsub_token     TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      verified_at     TIMESTAMPTZ,
      verify_sent_at  TIMESTAMPTZ,
      report_subject  TEXT,
      report_body     TEXT,
      report_at       TIMESTAMPTZ,
      weekly_sent_at  TIMESTAMPTZ,
      sends_day       DATE,
      sends_count     INTEGER NOT NULL DEFAULT 0,
      UNIQUE (email, key_hash)
    );
    CREATE INDEX IF NOT EXISTS subscribers_weekly_idx ON subscribers (verified, weekly);
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS report_data JSONB;
  `);
}

// ───────── Tiện ích ─────────
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const token = () => crypto.randomBytes(24).toString("base64url");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cleanEmail = (e) => String(e || "").trim().toLowerCase().slice(0, 120);
const cleanText = (t, max) => String(t || "").replace(/\r/g, "").slice(0, max);
const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Giới hạn tần suất đơn giản theo khóa (bộ nhớ trong). */
const buckets = new Map();
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const b = buckets.get(key) || { n: 0, reset: now + windowMs };
  if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
  b.n++;
  buckets.set(key, b);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  return b.n > max;
}

// ───────── Gửi email qua Brevo (HTTPS, không dùng cổng SMTP) ─────────
let dbReady = false;
function mailConfigured() {
  return dbReady && (DRY_RUN || (!!process.env.BREVO_API_KEY && !!SENDER_EMAIL));
}

const outbox = []; // chỉ dùng khi MAIL_DRY_RUN=1 để kiểm thử

/**
 * Gửi một email. `data` (đã làm sạch) chọn mẫu HTML phù hợp; `html` dùng trực tiếp nếu có;
 * nếu không có cả hai thì bọc văn bản trong khung chung.
 */
async function sendMail({ to, name, subject, text, unsubToken, data = null, html = null, staleDays = 0 }) {
  const unsub = unsubToken ? `${PUBLIC_URL}/api/notify/unsubscribe?t=${encodeURIComponent(unsubToken)}` : null;
  const footerText = `\n\n—\nMở LearnMate: ${PUBLIC_URL}${unsub ? `\nNgừng nhận email: ${unsub}` : ""}`;
  const ctx = { appUrl: PUBLIC_URL, unsubUrl: unsub, staleDays };
  let htmlContent = html;
  if (!htmlContent && data && data.type === "lesson") htmlContent = tpl.renderLesson(data, ctx);
  if (!htmlContent && data && data.type === "report") htmlContent = tpl.renderReport(data, ctx);
  if (!htmlContent) htmlContent = tpl.renderPlain({ subject, text, ...ctx });
  const payload = {
    sender: { email: SENDER_EMAIL || "dry-run@learnmate.local", name: SENDER_NAME },
    to: [{ email: to, name: name || undefined }],
    subject,
    textContent: text + footerText,
    htmlContent,
    headers: unsub ? { "List-Unsubscribe": `<${unsub}>` } : undefined,
  };
  if (DRY_RUN) {
    outbox.push({ to, subject, text: payload.textContent, html: htmlContent, at: new Date().toISOString() });
    if (outbox.length > 50) outbox.shift();
    console.log(`[dry-run] mail → ${to}: ${subject}`);
    return { ok: true };
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Brevo lỗi ${res.status}: ${detail.slice(0, 300)}`);
    return { ok: false, status: res.status };
  }
  return { ok: true };
}

/** Tăng bộ đếm gửi trong ngày; trả về false nếu đã vượt giới hạn. */
async function takeQuota(id) {
  const { rows } = await pool.query(
    `UPDATE subscribers SET
       sends_count = CASE WHEN sends_day = CURRENT_DATE THEN sends_count + 1 ELSE 1 END,
       sends_day = CURRENT_DATE
     WHERE id = $1 RETURNING sends_count`,
    [id],
  );
  return rows[0] && rows[0].sends_count <= DAILY_LIMIT;
}

async function findSub(email, key) {
  const { rows } = await pool.query(`SELECT * FROM subscribers WHERE email = $1 AND key_hash = $2`, [email, sha(key)]);
  return rows[0] || null;
}

function publicStatus(sub) {
  if (!sub) return { subscribed: false, verified: false };
  return { subscribed: true, verified: sub.verified, onLesson: sub.on_lesson, weekly: sub.weekly, reportAt: sub.report_at, weeklySentAt: sub.weekly_sent_at };
}

async function sendVerification(sub) {
  const link = `${PUBLIC_URL}/api/notify/verify?t=${encodeURIComponent(sub.verify_token)}`;
  const text = [
    `Chào${sub.name ? " " + sub.name : ""},`,
    ``,
    `Địa chỉ email này vừa được đăng ký để nhận thông báo học tập từ LearnMate:`,
    `• Kết quả sau mỗi bài học${sub.on_lesson ? "" : " (đang tắt)"}`,
    `• Báo cáo quá trình học hằng tuần${sub.weekly ? "" : " (đang tắt)"}`,
    ``,
    `Bấm vào liên kết sau để xác nhận:`,
    link,
    ``,
    `Nếu bạn không yêu cầu, hãy bỏ qua email này – bạn sẽ không nhận thêm thư nào.`,
  ].join("\n");
  await pool.query(`UPDATE subscribers SET verify_sent_at = now() WHERE id = $1`, [sub.id]);
  const html = tpl.renderVerify({ name: sub.name, onLesson: sub.on_lesson, weekly: sub.weekly, link, appUrl: PUBLIC_URL });
  return sendMail({ to: sub.email, name: sub.name, subject: "[LearnMate] Xác nhận nhận thông báo học tập", text, html });
}

// ───────── Báo cáo hằng tuần ─────────
let weeklyRunning = false;
async function runWeekly({ lazy = false } = {}) {
  if (weeklyRunning || !mailConfigured()) return { sent: 0, failed: 0, skipped: true };
  weeklyRunning = true;
  let sent = 0, failed = 0;
  try {
    // Lịch chính (cron): gửi cho ai chưa nhận trong ~1 tuần.
    // Kiểm tra "lười" khi có truy cập: chỉ gửi cho người đã quá hạn, tránh gửi ngay sau khi vừa đăng ký.
    const { rows } = await pool.query(
      `SELECT * FROM subscribers
        WHERE verified AND weekly AND report_body IS NOT NULL
          AND ${lazy ? `COALESCE(weekly_sent_at, verified_at) < now() - interval '${WEEK_GAP}'` : `(weekly_sent_at IS NULL OR weekly_sent_at < now() - interval '${WEEK_GAP}')`}
        ORDER BY id LIMIT 200`,
    );
    for (const sub of rows) {
      if (!(await takeQuota(sub.id))) continue;
      const age = sub.report_at ? Math.floor((Date.now() - new Date(sub.report_at).getTime()) / 86400000) : null;
      const note = age && age >= 2 ? `\n\n(Số liệu cập nhật lần cuối ${age} ngày trước – lần gần nhất người học mở LearnMate.)` : "";
      const data = tpl.cleanData(sub.report_data);
      const r = await sendMail({ to: sub.email, name: sub.name, subject: sub.report_subject || "[LearnMate] Báo cáo học tập hằng tuần", text: sub.report_body + note, unsubToken: sub.unsub_token, data, staleDays: age || 0 });
      if (r.ok) {
        sent++;
        await pool.query(`UPDATE subscribers SET weekly_sent_at = now() WHERE id = $1`, [sub.id]);
      } else failed++;
    }
  } finally {
    weeklyRunning = false;
  }
  if (sent || failed) console.log(`Báo cáo tuần${lazy ? " (lười)" : ""}: gửi ${sent}, lỗi ${failed}`);
  return { sent, failed };
}

let lastLazy = 0;
function maybeLazyWeekly() {
  if (Date.now() - lastLazy < 60 * 60 * 1000) return;
  lastLazy = Date.now();
  runWeekly({ lazy: true }).catch((e) => console.error("weekly lazy", e));
}

// ───────── Ứng dụng web ─────────
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error(e);
  res.status(500).json({ ok: false, error: "Máy chủ gặp lỗi. Vui lòng thử lại sau." });
});

function requireIdentity(req, res) {
  const email = cleanEmail(req.body && req.body.email);
  const key = String((req.body && req.body.key) || "");
  if (!EMAIL_RE.test(email)) { res.status(400).json({ ok: false, error: "Email chưa đúng định dạng." }); return null; }
  if (key.length < 16 || key.length > 100) { res.status(400).json({ ok: false, error: "Thiếu mã thiết bị." }); return null; }
  return { email, key };
}

app.get("/api/health", (req, res) => {
  maybeLazyWeekly();
  res.json({ ok: true, mail: mailConfigured() });
});

// Đăng ký / cập nhật tùy chọn. Gửi email xác nhận nếu địa chỉ chưa được xác nhận.
app.post("/api/notify/subscribe", wrap(async (req, res) => {
  const id = requireIdentity(req, res);
  if (!id) return;
  if (!mailConfigured()) return res.status(503).json({ ok: false, error: "Máy chủ chưa được cấu hình dịch vụ gửi email." });
  const name = cleanText(req.body.name, 60);
  const onLesson = req.body.onLesson !== false;
  const weekly = req.body.weekly !== false;
  let sub = await findSub(id.email, id.key);
  if (!sub) {
    const { rows } = await pool.query(
      `INSERT INTO subscribers (email, key_hash, name, on_lesson, weekly, verify_token, unsub_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id.email, sha(id.key), name, onLesson, weekly, token(), token()],
    );
    sub = rows[0];
  } else {
    const { rows } = await pool.query(`UPDATE subscribers SET name=$2, on_lesson=$3, weekly=$4 WHERE id=$1 RETURNING *`, [sub.id, name, onLesson, weekly]);
    sub = rows[0];
  }
  let verificationSent = false;
  if (!sub.verified && (req.body.resend || !sub.verify_sent_at)) {
    const recent = sub.verify_sent_at && Date.now() - new Date(sub.verify_sent_at).getTime() < 90 * 1000;
    if (recent) return res.status(429).json({ ok: false, error: "Vừa gửi email xác nhận. Vui lòng đợi khoảng 1 phút rồi thử lại.", status: publicStatus(sub) });
    if (rateLimited(`ip:${req.ip}`, 8, 60 * 60 * 1000) || rateLimited(`em:${id.email}`, 4, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: "Đã gửi quá nhiều email xác nhận. Vui lòng thử lại sau.", status: publicStatus(sub) });
    }
    if (!sub.verify_token) {
      const { rows } = await pool.query(`UPDATE subscribers SET verify_token=$2 WHERE id=$1 RETURNING *`, [sub.id, token()]);
      sub = rows[0];
    }
    const r = await sendVerification(sub);
    if (!r.ok) return res.status(502).json({ ok: false, error: "Không gửi được email xác nhận. Vui lòng thử lại sau.", status: publicStatus(sub) });
    verificationSent = true;
  }
  res.json({ ok: true, verificationSent, status: publicStatus(sub) });
}));

// Các API cần cơ sở dữ liệu.
app.use("/api/notify", (req, res, next) => {
  if (dbReady) return next();
  if (req.method === "GET") return res.status(503).type("html").send(page("Tạm thời chưa khả dụng", "Máy chủ email đang được cấu hình. Vui lòng thử lại sau.", false));
  res.status(503).json({ ok: false, error: "Máy chủ chưa được cấu hình cơ sở dữ liệu." });
});

app.post("/api/notify/status", wrap(async (req, res) => {
  const id = requireIdentity(req, res);
  if (!id) return;
  res.json({ ok: true, mail: mailConfigured(), status: publicStatus(await findSub(id.email, id.key)) });
}));

app.post("/api/notify/unsubscribe", wrap(async (req, res) => {
  const id = requireIdentity(req, res);
  if (!id) return;
  await pool.query(`DELETE FROM subscribers WHERE email=$1 AND key_hash=$2`, [id.email, sha(id.key)]);
  res.json({ ok: true, status: publicStatus(null) });
}));

// Gửi kết quả một bài học ngay khi hoàn thành.
app.post("/api/notify/lesson", wrap(async (req, res) => {
  const id = requireIdentity(req, res);
  if (!id) return;
  const sub = await findSub(id.email, id.key);
  if (!sub) return res.status(404).json({ ok: false, error: "Chưa đăng ký nhận thông báo." });
  if (!sub.verified) return res.status(403).json({ ok: false, error: "Email chưa được xác nhận. Hãy mở hộp thư và bấm liên kết xác nhận.", status: publicStatus(sub) });
  if (!sub.on_lesson && !req.body.manual) return res.json({ ok: true, skipped: true });
  const subject = cleanText(req.body.subject, 200).replace(/\n/g, " ");
  const body = cleanText(req.body.body, 12000);
  if (!subject || !body) return res.status(400).json({ ok: false, error: "Thiếu nội dung email." });
  if (!(await takeQuota(sub.id))) return res.status(429).json({ ok: false, error: "Đã đạt giới hạn email trong ngày." });
  const data = tpl.cleanData(req.body.data);
  const r = await sendMail({ to: sub.email, name: sub.name, subject, text: body, unsubToken: sub.unsub_token, data: data && data.type === "lesson" ? data : null });
  if (!r.ok) return res.status(502).json({ ok: false, error: "Dịch vụ email đang lỗi. Vui lòng thử lại sau." });
  res.json({ ok: true, sent: true });
}));

// Lưu báo cáo mới nhất để gửi hằng tuần; send=true thì gửi ngay.
app.post("/api/notify/report", wrap(async (req, res) => {
  const id = requireIdentity(req, res);
  if (!id) return;
  maybeLazyWeekly();
  const sub = await findSub(id.email, id.key);
  if (!sub) return res.status(404).json({ ok: false, error: "Chưa đăng ký nhận thông báo." });
  const subject = cleanText(req.body.subject, 200).replace(/\n/g, " ");
  const body = cleanText(req.body.body, 12000);
  if (!subject || !body) return res.status(400).json({ ok: false, error: "Thiếu nội dung báo cáo." });
  if (rateLimited(`rep:${sub.id}`, 60, 60 * 60 * 1000)) return res.status(429).json({ ok: false, error: "Cập nhật quá thường xuyên." });
  const rdata = tpl.cleanData(req.body.data);
  const reportData = rdata && rdata.type === "report" ? rdata : null;
  await pool.query(`UPDATE subscribers SET report_subject=$2, report_body=$3, report_data=$4, report_at=now() WHERE id=$1`, [sub.id, subject, body, reportData ? JSON.stringify(reportData) : null]);
  if (!req.body.send) return res.json({ ok: true, saved: true, status: publicStatus(sub) });
  if (!sub.verified) return res.status(403).json({ ok: false, error: "Email chưa được xác nhận. Hãy mở hộp thư và bấm liên kết xác nhận.", status: publicStatus(sub) });
  if (!(await takeQuota(sub.id))) return res.status(429).json({ ok: false, error: "Đã đạt giới hạn email trong ngày." });
  const r = await sendMail({ to: sub.email, name: sub.name, subject, text: body, unsubToken: sub.unsub_token, data: reportData });
  if (!r.ok) return res.status(502).json({ ok: false, error: "Dịch vụ email đang lỗi. Vui lòng thử lại sau." });
  res.json({ ok: true, saved: true, sent: true });
}));

// Trang xác nhận / hủy (mở từ liên kết trong email).
function page(title, msg, ok = true) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(title)} · LearnMate</title></head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f5fb;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#1f2433">
  <main style="max-width:460px;margin:24px;background:#fff;border:1px solid #e3e5f0;border-radius:16px;padding:28px;text-align:center">
  <div style="font-size:40px">${ok ? "✅" : "⚠️"}</div><h1 style="font-size:22px">${escHtml(title)}</h1><p style="line-height:1.6;color:#4a4f63">${msg}</p>
  <a href="${PUBLIC_URL}/#profile" style="display:inline-block;margin-top:8px;background:#4b4fd6;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600">Mở LearnMate</a>
  </main></body></html>`;
}

app.get("/api/notify/verify", wrap(async (req, res) => {
  const t = String(req.query.t || "");
  const { rows } = t ? await pool.query(`UPDATE subscribers SET verified=TRUE, verified_at=COALESCE(verified_at, now()), verify_token=NULL WHERE verify_token=$1 RETURNING email`, [t]) : { rows: [] };
  if (!rows[0]) return res.status(400).type("html").send(page("Liên kết không hợp lệ", "Liên kết đã được dùng hoặc đã hết hạn. Hãy mở LearnMate → Hồ sơ để gửi lại email xác nhận.", false));
  res.type("html").send(page("Đã xác nhận email", `<strong>${escHtml(rows[0].email)}</strong> sẽ nhận kết quả bài học và báo cáo học tập hằng tuần từ LearnMate.`));
}));

app.get("/api/notify/unsubscribe", wrap(async (req, res) => {
  const t = String(req.query.t || "");
  const { rows } = t ? await pool.query(`DELETE FROM subscribers WHERE unsub_token=$1 RETURNING email`, [t]) : { rows: [] };
  if (!rows[0]) return res.status(400).type("html").send(page("Không tìm thấy đăng ký", "Có thể địa chỉ này đã ngừng nhận email trước đó.", false));
  res.type("html").send(page("Đã ngừng nhận email", `<strong>${escHtml(rows[0].email)}</strong> sẽ không nhận thêm email nào từ LearnMate.`));
}));

// Gọi hằng tuần (GitHub Actions hoặc Render Cron) với header x-cron-secret.
app.post("/api/cron/weekly", wrap(async (req, res) => {
  // An toàn khi gọi công khai: chỉ gửi cho người đã đến hạn (tối đa 1 báo cáo/tuần/người).
  // Có CRON_SECRET đúng thì bỏ qua giới hạn tần suất.
  const secret = process.env.CRON_SECRET || "";
  const given = String(req.get("x-cron-secret") || "");
  const trusted = secret && given.length === secret.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!trusted && rateLimited("cron-public", 1, 10 * 60 * 1000)) return res.status(429).json({ ok: false, error: "Thử lại sau." });
  if (!dbReady) return res.status(503).json({ ok: false, error: "Chưa cấu hình cơ sở dữ liệu." });
  res.json({ ok: true, ...(await runWeekly()) });
}));

if (DRY_RUN) {
  app.get("/api/dev/outbox", (req, res) => res.json(outbox.map(({ html, ...m }) => m)));
  app.get("/api/dev/outbox/:i", (req, res) => { const m = outbox[Number(req.params.i)]; m ? res.type("html").send(m.html) : res.sendStatus(404); });
}

app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Không tìm thấy." }));

// Ứng dụng: chỉ phục vụ index.html (bản gộp một tệp).
app.get(["/", "/index.html"], (req, res) => {
  maybeLazyWeekly();
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(ROOT, "index.html"));
});
app.use((req, res) => res.redirect("/"));

app.listen(PORT, () => console.log(`LearnMate chạy tại cổng ${PORT} · ${PUBLIC_URL}${DRY_RUN ? " · DRY RUN" : ""}`));

// Kết nối CSDL; nếu chưa cấu hình, ứng dụng vẫn chạy và email ở chế độ thủ công.
(async function connectDb(attempt = 1) {
  if (!process.env.DATABASE_URL) return console.warn("Chưa đặt DATABASE_URL – email tự động đang tắt.");
  try {
    await migrate();
    dbReady = true;
    console.log(`Đã kết nối CSDL.${mailConfigured() ? " Email tự động: BẬT." : " Chưa cấu hình BREVO_API_KEY/SENDER_EMAIL – email tự động đang tắt."}`);
  } catch (e) {
    console.error(`Không kết nối được CSDL (lần ${attempt}):`, e.message);
    if (attempt < 10) setTimeout(() => connectDb(attempt + 1), Math.min(60000, 3000 * attempt));
  }
})();
