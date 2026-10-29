// Trang tổng quan.
import { icon, demoBadge, progressBar, statusBadge, emptyState, subjectIcon } from "../ui.js";
import { LEVELS, getSubject } from "../data/lessons.js";
import { computeStats, nextLesson, reviewSuggestions, recentLessons, lessonScore, lessonStatus } from "../services/progress.js";
import { objectiveLabel } from "./onboarding.js";
import { esc, formatMinutes, timeAgo } from "../utils.js";

export const title = () => "Tổng quan";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function render(root, { store }) {
  const p = store.currentProfile();
  const stats = computeStats(p);
  const subject = getSubject(p.goal.subjectId);
  const next = nextLesson(p);
  const reviews = reviewSuggestions(p);
  const recents = recentLessons(p);
  const weekPct = stats.weeklyTargetSeconds ? Math.min(100, (stats.weekSeconds / stats.weeklyTargetSeconds) * 100) : 0;

  const nextScore = next ? lessonScore(p, next) : null;
  const nextStatus = next ? lessonStatus(p, next.id) : null;

  root.innerHTML = `
  <div class="page">
    <div class="page-header">
      <div>
        <h1>${greeting()}, ${esc(p.name)}!</h1>
        <p>Hôm nay bạn muốn học gì? Mỗi bước nhỏ đều được tính.</p>
      </div>
      ${stats.seeded ? `<div>${demoBadge("Có dữ liệu minh họa")}</div>` : ""}
    </div>
    ${stats.seeded ? `<p class="small muted" style="margin-top:-1rem;margin-bottom:1rem">Một phần số liệu bên dưới là <strong>dữ liệu minh họa</strong> được tạo sẵn cho chế độ dùng thử. Kết quả bạn tự làm sẽ được cộng thêm vào. Có thể xóa trong Hồ sơ.</p>` : ""}

    <section class="grid grid-4" aria-label="Chỉ số chính">
      <div class="card stat">
        <span class="stat-label">${icon("target", { size: 16 })}Tiến độ lộ trình</span>
        <span class="stat-value">${Math.round(stats.pathPct)}%</span>
        ${progressBar(stats.pathPct, "Tiến độ lộ trình")}
        <span class="stat-sub">${stats.pathDone}/${stats.path.length} bài trong lộ trình</span>
      </div>
      <div class="card stat">
        <span class="stat-label">${icon("check", { size: 16 })}Bài đã hoàn thành</span>
        <span class="stat-value">${stats.completed}</span>
        <span class="stat-sub">${stats.inProgress} bài đang học dở</span>
      </div>
      <div class="card stat">
        <span class="stat-label">${icon("clock", { size: 16 })}Thời gian tuần này</span>
        <span class="stat-value">${formatMinutes(stats.weekSeconds)}</span>
        ${progressBar(weekPct, "Thời gian học so với mục tiêu tuần")}
        <span class="stat-sub">Mục tiêu: ${formatMinutes(stats.weeklyTargetSeconds)}/tuần</span>
      </div>
      <div class="card stat">
        <span class="stat-label">${icon("chart", { size: 16 })}Tỷ lệ trả lời đúng</span>
        <span class="stat-value">${stats.accuracy == null ? "—" : Math.round(stats.accuracy * 100) + "%"}</span>
        <span class="stat-sub">${stats.answered ? `${stats.correct}/${stats.answered} câu đã chốt` : "Chưa có câu trả lời"}</span>
      </div>
    </section>

    <div class="dash-layout" style="margin-top:1rem">
      <div class="stack">
        <section class="card next-card" aria-labelledby="next-title">
          ${
            next
              ? `<div class="card-header"><h2 id="next-title">Bài học tiếp theo</h2>${statusBadge(nextStatus)}</div>
                 <div class="row" style="align-items:flex-start">${subjectIcon(getSubject(next.subjectId), 24)}<div class="grow" style="flex:1;min-width:0">
                   <h3 style="font-size:1.2rem">${esc(next.title)}</h3>
                   <p class="muted">${esc(next.description)}</p>
                   <div class="meta"><span class="badge badge-level">${LEVELS[next.level]}</span><span>${icon("clock", { size: 14 })} ${next.minutes} phút</span>${nextStatus === "in_progress" ? `<span>· Đã làm ${nextScore.answered}/${nextScore.total} câu</span>` : ""}</div>
                 </div></div>
                 <div class="btn-row" style="margin-top:1rem"><a class="btn btn-primary" href="#lesson-${next.id}">${icon("arrowRight")}${nextStatus === "in_progress" ? "Tiếp tục học" : "Bắt đầu bài"}</a><a class="btn btn-ghost" href="#library">Xem thư viện</a></div>`
              : emptyState({ iconName: "check", title: "Bạn đã hoàn thành mọi bài học!", text: "Hãy tạo bộ học tập mới để luyện thêm.", action: `<a class="btn btn-primary" href="#studio">Tạo bộ học tập</a>` })
          }
        </section>

        <section class="card" aria-labelledby="path-title">
          <div class="card-header"><h2 id="path-title">Lộ trình: ${esc(subject?.name || "")}</h2><span class="small muted">${stats.pathDone}/${stats.path.length} hoàn thành</span></div>
          <ol class="list">
            ${stats.path
              .map(({ lesson, optional }, i) => {
                const st = lessonStatus(p, lesson.id);
                const sc = lessonScore(p, lesson);
                return `<li class="list-item">
                  <span class="path-step ${st === "completed" ? "done" : st === "in_progress" ? "doing" : ""}" aria-hidden="true">${st === "completed" ? icon("check", { size: 14 }) : i + 1}</span>
                  <div class="grow"><a class="title" href="#lesson-${lesson.id}">${esc(lesson.title)}</a>
                  <span class="small muted">${LEVELS[lesson.level]} · ${lesson.minutes} phút${optional ? " · Ôn nhanh" : ""}${sc.answered ? ` · Đúng ${sc.correct}/${sc.total}` : ""}</span></div>
                  ${statusBadge(st)}
                </li>`;
              })
              .join("")}
          </ol>
        </section>

        <section class="card" aria-labelledby="act-title">
          <div class="card-header"><h2 id="act-title">Hoạt động gần đây</h2></div>
          ${
            p.activity.length
              ? `<ul class="list">${p.activity
                  .slice(0, 6)
                  .map(
                    (a) => `<li class="list-item"><span class="subject-icon tone-blue" style="width:32px;height:32px">${icon(a.type === "lesson_complete" ? "check" : a.type === "studyset" ? "layers" : a.type === "goal" ? "target" : "book", { size: 16 })}</span>
                    <div class="grow"><span>${esc(a.text)}</span> <span class="small muted">· ${timeAgo(a.ts)}</span></div>${a.seeded ? demoBadge("Minh họa") : ""}</li>`,
                  )
                  .join("")}</ul>`
              : emptyState({ iconName: "clock", title: "Chưa có hoạt động", text: "Hoạt động học tập của bạn sẽ hiện ở đây." })
          }
        </section>
      </div>

      <div class="stack">
        <section class="card" aria-labelledby="goal-title">
          <div class="card-header"><h2 id="goal-title">Mục tiêu của bạn</h2><a class="btn btn-ghost btn-sm" href="#profile">${icon("edit", { size: 16 })}Sửa</a></div>
          <ul class="list small">
            <li class="list-item"><span class="muted grow">Môn học</span><strong>${esc(subject?.name || "—")}</strong></li>
            <li class="list-item"><span class="muted grow">Trình độ</span><strong>${LEVELS[p.goal.level]}</strong></li>
            <li class="list-item"><span class="muted grow">Mục tiêu</span><strong style="text-align:right">${esc(objectiveLabel(p.goal.objective))}</strong></li>
            <li class="list-item"><span class="muted grow">Lịch học</span><strong>${p.goal.sessionsPerWeek} buổi × ${p.goal.minutesPerSession} phút</strong></li>
          </ul>
        </section>

        <section class="card" aria-labelledby="review-title">
          <div class="card-header"><h2 id="review-title">Đề xuất ôn tập</h2>${reviews.some((r) => r.seeded) ? demoBadge("Minh họa") : ""}</div>
          ${
            reviews.length
              ? `<ul class="list">${reviews
                  .map(
                    (r) => `<li class="list-item"><div class="grow"><a class="title" href="#lesson-${r.lesson.id}">${esc(r.lesson.title)}</a>
                    <span class="small muted">Đúng ${r.correct}/${r.total} câu${r.missed.length ? ` · Cần xem lại: ${r.missed.map((q) => `câu ${r.lesson.questions.indexOf(q) + 1}`).join(", ")}` : ""}</span></div>
                    <a class="btn btn-secondary btn-sm" href="#lesson-${r.lesson.id}" aria-label="Ôn lại bài ${esc(r.lesson.title)}">Ôn lại</a></li>`,
                  )
                  .join("")}</ul>`
              : emptyState({ iconName: "check", title: "Chưa có gì cần ôn", text: stats.answered ? "Bạn đang làm rất tốt!" : "Làm bài tập để LearnMate gợi ý phần cần ôn." })
          }
        </section>

        <section class="card" aria-labelledby="recent-title">
          <div class="card-header"><h2 id="recent-title">Chủ đề gần đây</h2></div>
          ${
            recents.length
              ? `<ul class="list">${recents
                  .map(({ lesson, state }) => `<li class="list-item">${subjectIcon(getSubject(lesson.subjectId), 18)}<div class="grow"><a class="title" href="#lesson-${lesson.id}">${esc(lesson.title)}</a><span class="small muted">${timeAgo(state.updatedAt)}</span></div></li>`)
                  .join("")}</ul>`
              : emptyState({ iconName: "book", title: "Chưa học bài nào", action: `<a class="btn btn-secondary btn-sm" href="#library">Mở thư viện</a>` })
          }
        </section>
      </div>
    </div>
  </div>`;
}
