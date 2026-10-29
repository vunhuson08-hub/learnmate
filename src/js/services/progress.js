// Tính toán tiến độ, thống kê và đề xuất ôn tập từ dữ liệu hồ sơ.
import { LESSONS, SUBJECTS, lessonsOf, getLesson, getSubject } from "../data/lessons.js";
import { getLessonState } from "../store.js";
import { dayKey, daysAgo, weekdayLabel } from "../utils.js";

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

export function lessonStatus(profile, lessonId) {
  return getLessonState(profile, lessonId).status;
}

/** Điểm của một bài: số câu đúng / tổng số câu; `answered` = số câu đã chốt. */
export function lessonScore(profile, lesson) {
  const ls = getLessonState(profile, lesson.id);
  let correct = 0;
  let answered = 0;
  for (const q of lesson.questions) {
    const st = ls.questions[q.id]?.status;
    if (st === "correct") correct++;
    if (st === "correct" || st === "revealed" || st === "skipped") answered++;
  }
  return { correct, answered, total: lesson.questions.length };
}

/** Lộ trình theo môn và trình độ: ưu tiên bài phù hợp trình độ, bài dễ hơn xếp sau để ôn nhanh. */
export function learningPath(profile) {
  const subjectId = profile.goal?.subjectId;
  if (!subjectId) return [];
  const lvl = LEVEL_ORDER[profile.goal.level] ?? 0;
  const list = lessonsOf(subjectId);
  const main = list.filter((l) => LEVEL_ORDER[l.level] >= lvl);
  const review = list.filter((l) => LEVEL_ORDER[l.level] < lvl);
  return [...main.map((l) => ({ lesson: l, optional: false })), ...review.map((l) => ({ lesson: l, optional: true }))];
}

export function nextLesson(profile) {
  const path = learningPath(profile);
  const inProgress = path.find((p) => lessonStatus(profile, p.lesson.id) === "in_progress");
  if (inProgress) return inProgress.lesson;
  const notDone = path.find((p) => lessonStatus(profile, p.lesson.id) !== "completed");
  if (notDone) return notDone.lesson;
  // Đã xong lộ trình: gợi ý bài đang học dở ở môn khác hoặc bài chưa học bất kỳ.
  const anyInProgress = LESSONS.find((l) => lessonStatus(profile, l.id) === "in_progress");
  return anyInProgress || LESSONS.find((l) => lessonStatus(profile, l.id) === "not_started") || null;
}

export function weeklySeconds(profile) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const key = dayKey(d);
    const entries = profile.studyLog.filter((e) => e.date === key);
    days.push({
      key,
      label: i === 0 ? "Hôm nay" : weekdayLabel(d),
      seconds: entries.reduce((s, e) => s + e.seconds, 0),
      seeded: entries.some((e) => e.seeded),
    });
  }
  return days;
}

export function hasSeededData(profile) {
  return (
    Object.values(profile.lessons).some((l) => l.seeded) ||
    profile.studyLog.some((e) => e.seeded) ||
    profile.activity.some((a) => a.seeded)
  );
}

export function computeStats(profile) {
  let completed = 0;
  let inProgress = 0;
  let correct = 0;
  let answered = 0;
  let firstTry = 0;
  const bySubject = SUBJECTS.map((s) => ({ subject: s, correct: 0, answered: 0, completed: 0, total: lessonsOf(s.id).length }));
  const lessonResults = [];

  for (const lesson of LESSONS) {
    const ls = getLessonState(profile, lesson.id);
    const sc = lessonScore(profile, lesson);
    const subj = bySubject.find((b) => b.subject.id === lesson.subjectId);
    if (ls.status === "completed") {
      completed++;
      subj.completed++;
    } else if (ls.status === "in_progress") inProgress++;
    correct += sc.correct;
    answered += sc.answered;
    subj.correct += sc.correct;
    subj.answered += sc.answered;
    firstTry += Object.values(ls.questions).filter((q) => q.firstTry).length;
    if (sc.answered > 0) lessonResults.push({ lesson, ...sc, ratio: sc.correct / sc.total, status: ls.status, seeded: ls.seeded });
  }

  const week = weeklySeconds(profile);
  const weekSeconds = week.reduce((s, d) => s + d.seconds, 0);
  const totalSeconds = profile.studyLog.reduce((s, e) => s + e.seconds, 0);
  const strong = lessonResults.filter((r) => r.status === "completed" && r.ratio >= 0.8);
  const weak = lessonResults.filter((r) => r.ratio < 0.7 && (r.status === "completed" || r.answered >= 2));

  const path = learningPath(profile);
  const pathDone = path.filter((p) => lessonStatus(profile, p.lesson.id) === "completed").length;

  return {
    completed,
    inProgress,
    correct,
    answered,
    firstTry,
    accuracy: answered ? correct / answered : null,
    bySubject,
    lessonResults,
    strong,
    weak,
    week,
    weekSeconds,
    totalSeconds,
    weeklyTargetSeconds: (profile.goal.sessionsPerWeek || 0) * (profile.goal.minutesPerSession || 0) * 60,
    path,
    pathDone,
    pathPct: path.length ? (pathDone / path.length) * 100 : 0,
    seeded: hasSeededData(profile),
  };
}

/** Danh sách đề xuất ôn tập: bài có tỷ lệ đúng thấp, kèm câu đã sai/xem đáp án. */
export function reviewSuggestions(profile, limit = 3) {
  const stats = computeStats(profile);
  return stats.weak
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, limit)
    .map((r) => {
      const ls = getLessonState(profile, r.lesson.id);
      const missed = r.lesson.questions.filter((q) => ["revealed", "skipped"].includes(ls.questions[q.id]?.status));
      return { ...r, missed, subject: getSubject(r.lesson.subjectId) };
    });
}

export function recentLessons(profile, limit = 4) {
  return Object.entries(profile.lessons)
    .filter(([id]) => getLesson(id))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, limit)
    .map(([id, ls]) => ({ lesson: getLesson(id), state: ls }));
}

/** Đề xuất bước tiếp theo bằng lời. */
export function nextStepAdvice(profile) {
  const stats = computeStats(profile);
  const next = nextLesson(profile);
  const review = reviewSuggestions(profile, 1)[0];
  if (stats.answered === 0) {
    return { text: "Bạn chưa làm câu hỏi nào. Hãy bắt đầu bài học đầu tiên trong lộ trình để LearnMate có dữ liệu gợi ý.", lesson: next, action: "Bắt đầu học" };
  }
  if (review) {
    return { text: `Bạn trả lời đúng ${review.correct}/${review.total} câu ở bài “${review.lesson.title}”. Hãy ôn lại bài này trước khi học tiếp.`, lesson: review.lesson, action: "Ôn lại bài" };
  }
  if (stats.weeklyTargetSeconds && stats.weekSeconds < stats.weeklyTargetSeconds / 2) {
    return { text: "Bạn đang học ít hơn một nửa thời lượng mục tiêu tuần này. Một buổi ngắn hôm nay sẽ giúp giữ nhịp.", lesson: next, action: "Học 1 buổi ngắn" };
  }
  if (next) {
    return { text: `Kết quả của bạn đang tốt. Bước tiếp theo: bài “${next.title}”.`, lesson: next, action: "Học bài tiếp theo" };
  }
  return { text: "Bạn đã hoàn thành tất cả bài học hiện có. Hãy thử tạo bộ học tập mới để luyện thêm!", lesson: null, action: null };
}
