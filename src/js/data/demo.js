// Bộ dữ liệu minh họa cho chế độ "Dùng thử". Mọi bản ghi đều có cờ `seeded: true`
// để giao diện gắn nhãn "Dữ liệu minh họa" và tách biệt với kết quả thật của người dùng.
import { dayKey, daysAgo } from "../utils.js";

const DAY = 24 * 60 * 60 * 1000;

export function seedDemoProfile(profile) {
  const now = Date.now();
  const q = (status, attempts, firstTry = attempts === 1 && status === "correct") => ({ status, attempts, hints: 0, firstTry });

  profile.lessons = {
    "en-greetings": {
      status: "completed",
      step: 5,
      questions: { q1: q("correct", 1), q2: q("correct", 1), q3: q("correct", 1) },
      completedAt: now - 5 * DAY,
      updatedAt: now - 5 * DAY,
      seeded: true,
    },
    "math-fractions": {
      status: "completed",
      step: 5,
      questions: { q1: q("correct", 1), q2: q("correct", 2), q3: q("revealed", 2) },
      completedAt: now - 3 * DAY,
      updatedAt: now - 3 * DAY,
      seeded: true,
    },
    "math-percent": {
      status: "completed",
      step: 5,
      questions: { q1: q("correct", 2), q2: q("revealed", 2), q3: q("revealed", 3) },
      completedAt: now - 2 * DAY,
      updatedAt: now - 2 * DAY,
      seeded: true,
    },
    "js-variables": {
      status: "in_progress",
      step: 3,
      questions: { q1: q("correct", 1) },
      completedAt: null,
      updatedAt: now - 1 * DAY,
      seeded: true,
    },
  };

  const minutesByDaysAgo = { 6: 15, 5: 20, 4: 0, 3: 25, 2: 18, 1: 12 };
  profile.studyLog = Object.entries(minutesByDaysAgo)
    .filter(([, m]) => m > 0)
    .map(([d, m]) => ({ date: dayKey(daysAgo(Number(d))), seconds: m * 60, seeded: true }));

  profile.activity = [
    { ts: now - 1 * DAY, type: "lesson_start", text: "Bắt đầu bài “Biến và kiểu dữ liệu”", lessonId: "js-variables", seeded: true },
    { ts: now - 2 * DAY, type: "lesson_complete", text: "Hoàn thành “Tỷ lệ phần trăm trong đời sống” – 1/3 câu đúng", lessonId: "math-percent", seeded: true },
    { ts: now - 3 * DAY, type: "lesson_complete", text: "Hoàn thành “Phân số và phép cộng phân số” – 2/3 câu đúng", lessonId: "math-fractions", seeded: true },
    { ts: now - 5 * DAY, type: "lesson_complete", text: "Hoàn thành “Chào hỏi và giới thiệu bản thân” – 3/3 câu đúng", lessonId: "en-greetings", seeded: true },
  ];
  profile.favorites = ["math-fractions"];
  return profile;
}
