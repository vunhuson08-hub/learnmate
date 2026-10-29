// Kho dữ liệu cục bộ (localStorage) có kiểm tra định dạng và phương án dự phòng.
// Đây là lưu trữ DEMO trong trình duyệt: không có máy chủ, không lưu mật khẩu.
import { uid, dayKey } from "./utils.js";
import { getLesson } from "./data/lessons.js";

const KEY = "learnmate:v1";
const BACKUP_KEY = "learnmate:corrupt-backup";
export const SCHEMA_VERSION = 1;
const LESSON_STATUSES = ["not_started", "in_progress", "completed"];
const Q_STATUSES = ["correct", "wrong", "revealed", "skipped"];

// ───────── Lớp lưu trữ an toàn ─────────
let memoryFallback = {};
let persistent = true;
const storage = {
  get(k) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      persistent = false;
      return memoryFallback[k] ?? null;
    }
  },
  set(k, v) {
    try {
      window.localStorage.setItem(k, v);
      return true;
    } catch {
      persistent = false;
      memoryFallback[k] = v;
      return false;
    }
  },
  remove(k) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      delete memoryFallback[k];
    }
  },
};

// ───────── Mặc định & kiểm tra định dạng ─────────
function defaultState() {
  return { version: SCHEMA_VERSION, theme: "light", session: null, accounts: {}, profiles: {} };
}

export function defaultGoal() {
  return { subjectId: null, level: "beginner", objective: "", sessionsPerWeek: 3, minutesPerSession: 20 };
}

function defaultProfile({ id, name, email = null, isDemo = false }) {
  return {
    id,
    name,
    email,
    isDemo,
    createdAt: Date.now(),
    onboarded: false,
    goal: defaultGoal(),
    favorites: [],
    lessons: {},
    studyLog: [],
    activity: [],
    studySets: [],
    chats: {},
  };
}

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v, d = "") => (typeof v === "string" ? v : d);
const num = (v, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);

function sanitizeLessonState(raw) {
  if (!isObj(raw)) return null;
  const questions = {};
  if (isObj(raw.questions)) {
    for (const [qid, q] of Object.entries(raw.questions)) {
      if (!isObj(q) || !Q_STATUSES.includes(q.status)) continue;
      questions[qid] = {
        status: q.status,
        attempts: num(q.attempts),
        hints: num(q.hints),
        firstTry: !!q.firstTry,
      };
    }
  }
  return {
    status: LESSON_STATUSES.includes(raw.status) ? raw.status : "not_started",
    step: Math.max(0, Math.floor(num(raw.step))),
    questions,
    completedAt: raw.completedAt ? num(raw.completedAt) : null,
    updatedAt: num(raw.updatedAt, Date.now()),
    seeded: !!raw.seeded,
  };
}

function sanitizeProfile(raw, id) {
  if (!isObj(raw)) return null;
  const p = defaultProfile({ id, name: str(raw.name, "Bạn học").slice(0, 60), email: raw.email ? str(raw.email) : null, isDemo: !!raw.isDemo });
  p.createdAt = num(raw.createdAt, Date.now());
  p.onboarded = !!raw.onboarded;
  if (isObj(raw.goal)) {
    const g = raw.goal;
    p.goal = {
      subjectId: typeof g.subjectId === "string" ? g.subjectId : null,
      level: ["beginner", "intermediate", "advanced"].includes(g.level) ? g.level : "beginner",
      objective: str(g.objective).slice(0, 200),
      sessionsPerWeek: Math.min(7, Math.max(1, Math.round(num(g.sessionsPerWeek, 3)))),
      minutesPerSession: Math.min(180, Math.max(5, Math.round(num(g.minutesPerSession, 20)))),
    };
  }
  if (Array.isArray(raw.favorites)) p.favorites = raw.favorites.filter((f) => typeof f === "string" && getLesson(f));
  if (isObj(raw.lessons)) {
    for (const [lid, ls] of Object.entries(raw.lessons)) {
      if (!getLesson(lid)) continue; // bỏ bài học không còn tồn tại
      const clean = sanitizeLessonState(ls);
      if (clean) p.lessons[lid] = clean;
    }
  }
  if (Array.isArray(raw.studyLog)) {
    p.studyLog = raw.studyLog
      .filter((e) => isObj(e) && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
      .map((e) => ({ date: e.date, seconds: Math.max(0, num(e.seconds)), seeded: !!e.seeded }))
      .slice(-400);
  }
  if (Array.isArray(raw.activity)) {
    p.activity = raw.activity
      .filter((a) => isObj(a) && typeof a.text === "string")
      .map((a) => ({ ts: num(a.ts, Date.now()), type: str(a.type, "info"), text: a.text.slice(0, 200), lessonId: a.lessonId ? str(a.lessonId) : null, seeded: !!a.seeded }))
      .slice(0, 60);
  }
  if (Array.isArray(raw.studySets)) {
    p.studySets = raw.studySets
      .filter((s) => isObj(s) && typeof s.id === "string" && Array.isArray(s.items) && ["mcq", "flashcard"].includes(s.kind))
      .slice(0, 30);
  }
  if (isObj(raw.chats)) {
    for (const [lid, msgs] of Object.entries(raw.chats)) {
      if (!Array.isArray(msgs)) continue;
      p.chats[lid] = msgs
        .filter((m) => isObj(m) && ["user", "tutor"].includes(m.role) && typeof m.text === "string")
        .map((m) => ({ role: m.role, text: m.text.slice(0, 2000), ts: num(m.ts, Date.now()) }))
        .slice(-40);
    }
  }
  return p;
}

function sanitizeState(raw) {
  if (!isObj(raw)) throw new Error("not an object");
  if (raw.version !== SCHEMA_VERSION) throw new Error("version mismatch");
  const s = defaultState();
  s.theme = ["light", "dark"].includes(raw.theme) ? raw.theme : "light";
  if (isObj(raw.accounts)) {
    for (const [email, acc] of Object.entries(raw.accounts)) {
      if (isObj(acc) && typeof acc.id === "string" && typeof acc.name === "string") {
        s.accounts[email] = { id: acc.id, name: acc.name.slice(0, 60), email, createdAt: num(acc.createdAt, Date.now()) };
      }
    }
  }
  if (isObj(raw.profiles)) {
    for (const [id, prof] of Object.entries(raw.profiles)) {
      const clean = sanitizeProfile(prof, id);
      if (clean) s.profiles[id] = clean;
    }
  }
  if (isObj(raw.session) && typeof raw.session.userId === "string" && s.profiles[raw.session.userId]) {
    s.session = { userId: raw.session.userId };
  }
  return s;
}

// ───────── Trạng thái & đăng ký lắng nghe ─────────
let state = defaultState();
let loadWarning = null;
const listeners = new Set();

export function load() {
  const raw = storage.get(KEY);
  if (raw == null) {
    state = defaultState();
    return state;
  }
  try {
    state = sanitizeState(JSON.parse(raw));
  } catch (err) {
    // Dữ liệu cũ hoặc lỗi định dạng: sao lưu bản gốc rồi khởi tạo lại.
    storage.set(BACKUP_KEY, raw);
    state = defaultState();
    loadWarning = "Dữ liệu cũ trong trình duyệt bị lỗi định dạng hoặc thuộc phiên bản trước, nên đã được đặt lại. Bản gốc được sao lưu riêng.";
    save();
  }
  return state;
}

export function consumeLoadWarning() {
  const w = loadWarning;
  loadWarning = null;
  return w;
}

export function isPersistent() {
  return persistent;
}

export function save() {
  const ok = storage.set(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
  return ok;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function currentProfile() {
  const id = state.session?.userId;
  return id ? state.profiles[id] || null : null;
}

/** Cập nhật hồ sơ hiện tại một cách an toàn rồi lưu lại. */
export function updateProfile(mutator) {
  const p = currentProfile();
  if (!p) throw new Error("Chưa đăng nhập");
  mutator(p);
  save();
  return p;
}

// ───────── Phiên đăng nhập (demo) ─────────
export function startDemo(seedFn) {
  const id = "demo";
  if (!state.profiles[id]) {
    const profile = defaultProfile({ id, name: "Bạn học", isDemo: true });
    if (seedFn) seedFn(profile);
    state.profiles[id] = profile;
  }
  state.session = { userId: id };
  save();
  return state.profiles[id];
}

/** Đăng ký demo: chỉ lưu tên + email. KHÔNG lưu mật khẩu. */
export function register({ name, email }) {
  const key = email.trim().toLowerCase();
  if (state.accounts[key]) {
    return { ok: false, error: "Email này đã được đăng ký trên trình duyệt này. Hãy chuyển sang Đăng nhập." };
  }
  const id = uid("user");
  state.accounts[key] = { id, name: name.trim(), email: key, createdAt: Date.now() };
  state.profiles[id] = defaultProfile({ id, name: name.trim(), email: key });
  state.session = { userId: id };
  save();
  return { ok: true, profile: state.profiles[id] };
}

export function login({ email }) {
  const key = email.trim().toLowerCase();
  const acc = state.accounts[key];
  if (!acc || !state.profiles[acc.id]) {
    return { ok: false, error: "Chưa có tài khoản demo với email này trên trình duyệt này. Hãy đăng ký trước." };
  }
  state.session = { userId: acc.id };
  save();
  return { ok: true, profile: state.profiles[acc.id] };
}

export function logout() {
  state.session = null;
  save();
}

export function setTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  save();
}

/** Xóa dữ liệu học tập của hồ sơ hiện tại (giữ tài khoản). */
export function resetCurrentProfileData(seedFn) {
  const p = currentProfile();
  if (!p) return;
  const fresh = defaultProfile({ id: p.id, name: p.name, email: p.email, isDemo: p.isDemo });
  if (seedFn && p.isDemo) seedFn(fresh);
  state.profiles[p.id] = fresh;
  save();
}

/** Xóa toàn bộ dữ liệu LearnMate trong trình duyệt. */
export function wipeAll() {
  storage.remove(KEY);
  storage.remove(BACKUP_KEY);
  memoryFallback = {};
  state = defaultState();
  save();
}

// ───────── Ghi nhận học tập ─────────
export function getLessonState(profile, lessonId) {
  return (
    profile.lessons[lessonId] || {
      status: "not_started",
      step: 0,
      questions: {},
      completedAt: null,
      updatedAt: 0,
      seeded: false,
    }
  );
}

export function ensureLessonState(profile, lessonId) {
  if (!profile.lessons[lessonId]) {
    profile.lessons[lessonId] = { status: "in_progress", step: 0, questions: {}, completedAt: null, updatedAt: Date.now(), seeded: false };
  }
  return profile.lessons[lessonId];
}

export function addActivity(profile, { type, text, lessonId = null }) {
  profile.activity.unshift({ ts: Date.now(), type, text, lessonId, seeded: false });
  profile.activity = profile.activity.slice(0, 60);
}

export function addStudySeconds(profile, seconds) {
  if (!(seconds > 0)) return;
  const today = dayKey();
  const entry = profile.studyLog.find((e) => e.date === today && !e.seeded);
  if (entry) entry.seconds += seconds;
  else profile.studyLog.push({ date: today, seconds, seeded: false });
}
