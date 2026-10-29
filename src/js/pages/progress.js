// Trang tiến độ: tổng quan số liệu, biểu đồ thời gian, chủ đề mạnh/cần ôn, đề xuất bước tiếp theo.
import { icon, demoBadge, progressBar, emptyState, subjectIcon } from "../ui.js";
import { getSubject } from "../data/lessons.js";
import { computeStats, nextStepAdvice, reviewSuggestions } from "../services/progress.js";
import { esc, formatMinutes } from "../utils.js";

export const title = () => "Tiến độ";

export function render(root, { store }) {
  const p = store.currentProfile();
  const s = computeStats(p);
  const advice = nextStepAdvice(p);
  const reviews = reviewSuggestions(p, 5);
  const maxSec = Math.max(...s.week.map((d) => d.seconds), (s.weeklyTargetSeconds || 0) / Math.max(1, p.goal.sessionsPerWeek), 60);
  const dailyTarget = p.goal.minutesPerSession * 60;
  const targetPct = Math.min(100, (dailyTarget / maxSec) * 100);
  const anySeededWeek = s.week.some((d) => d.seeded);

  root.innerHTML = `
  <div class="page">
    <div class="page-header">
      <div><h1>Tiến độ học tập</h1><p>Theo dõi kết quả và biết nên ôn phần nào tiếp theo.</p></div>
      ${s.seeded ? demoBadge("Bao gồm dữ liệu minh họa") : ""}
    </div>
    ${s.seeded ? `<div style="margin-bottom:1rem">${demoBadge()} <span class="small muted">Các số liệu dưới đây gộp cả dữ liệu minh họa của chế độ dùng thử và kết quả bạn tự làm. Phần minh họa không phản ánh kết quả thật.</span></div>` : ""}

    <section class="grid grid-4" aria-label="Số liệu tổng hợp">
      <div class="card stat"><span class="stat-label">${icon("book", { size: 16 })}Bài đã học</span><span class="stat-value">${s.completed + s.inProgress}</span><span class="stat-sub">${s.completed} hoàn thành · ${s.inProgress} đang học</span></div>
      <div class="card stat"><span class="stat-label">${icon("check", { size: 16 })}Tỷ lệ trả lời đúng</span><span class="stat-value">${s.accuracy == null ? "—" : Math.round(s.accuracy * 100) + "%"}</span><span class="stat-sub">${s.correct}/${s.answered} câu đã chốt</span></div>
      <div class="card stat"><span class="stat-label">${icon("flame", { size: 16 })}Đúng ngay lần đầu</span><span class="stat-value">${s.firstTry}</span><span class="stat-sub">câu không cần thử lại</span></div>
      <div class="card stat"><span class="stat-label">${icon("clock", { size: 16 })}Tổng thời gian</span><span class="stat-value">${formatMinutes(s.totalSeconds)}</span><span class="stat-sub">Tuần này: ${formatMinutes(s.weekSeconds)}</span></div>
    </section>

    <div class="grid grid-2" style="margin-top:1rem">
      <section class="card" aria-labelledby="week-title">
        <div class="card-header"><h2 id="week-title">Thời gian học 7 ngày qua</h2>${anySeededWeek ? demoBadge("Có minh họa") : ""}</div>
        ${
          s.week.some((d) => d.seconds > 0)
            ? `<div class="bar-chart" role="img" aria-label="Biểu đồ cột thời gian học theo ngày: ${s.week.map((d) => `${d.label} ${Math.round(d.seconds / 60)} phút`).join(", ")}" style="position:relative">
                <div class="target-line" style="position:absolute;left:0;right:0;bottom:${(24.8 + targetPct * 1.0).toFixed(1)}px" aria-hidden="true"></div>
                ${s.week
                  .map(
                    (d) => `<div class="bar-col"><span class="bar-val">${d.seconds > 0 && d.seconds < 30 ? "&lt;1" : Math.round(d.seconds / 60)}′</span><div class="bar ${d.seeded ? "seeded" : ""}" style="height:${((d.seconds / maxSec) * 100).toFixed(1)}px"></div><span class="bar-label">${d.label}</span></div>`,
                  )
                  .join("")}
              </div>
              <div class="chart-legend"><span><i class="swatch"></i>Bạn tự học</span>${anySeededWeek ? `<span><i class="swatch seeded"></i>Dữ liệu minh họa</span>` : ""}<span><i style="width:16px;border-top:2px dashed var(--warning);display:inline-block"></i>Mục tiêu mỗi buổi (${p.goal.minutesPerSession} phút)</span></div>
              <p class="small muted" style="margin:.5rem 0 0">Đơn vị: phút. Thời gian được tính khi bạn mở trang bài học (tạm dừng khi chuyển tab).</p>`
            : emptyState({ iconName: "clock", title: "Chưa có thời gian học tuần này", text: "Mở một bài học để bắt đầu ghi nhận thời gian." })
        }
      </section>

      <section class="card" aria-labelledby="subj-title">
        <div class="card-header"><h2 id="subj-title">Tỷ lệ đúng theo môn</h2></div>
        ${s.bySubject
          .map((b) => {
            const pct = b.answered ? (b.correct / b.answered) * 100 : 0;
            return `<div class="hbar"><span class="row" style="gap:.4rem;flex-wrap:nowrap">${esc(b.subject.short)}</span>${progressBar(pct, `Tỷ lệ đúng môn ${b.subject.name}`)}<span class="val">${b.answered ? Math.round(pct) + "%" : "—"}</span></div>`;
          })
          .join("")}
        <p class="small muted" style="margin:.5rem 0 0">“—” nghĩa là chưa trả lời câu nào ở môn đó. Hoàn thành: ${s.bySubject.map((b) => `${esc(b.subject.short)} ${b.completed}/${b.total}`).join(" · ")}.</p>
      </section>
    </div>

    <section class="card next-card" style="margin-top:1rem" aria-labelledby="advice-title">
      <div class="card-header"><h2 id="advice-title">${icon("bulb")} Đề xuất bước tiếp theo</h2></div>
      <p>${esc(advice.text)}</p>
      ${advice.lesson ? `<a class="btn btn-primary" href="#lesson-${advice.lesson.id}">${esc(advice.action)}: ${esc(advice.lesson.title)} ${icon("arrowRight")}</a>` : `<a class="btn btn-primary" href="#studio">Tạo bộ học tập ${icon("arrowRight")}</a>`}
    </section>

    <div class="grid grid-2" style="margin-top:1rem">
      <section class="card" aria-labelledby="strong-title">
        <div class="card-header"><h2 id="strong-title">Chủ đề làm tốt</h2><span class="small muted">≥ 80% câu đúng</span></div>
        ${
          s.strong.length
            ? `<ul class="list">${s.strong.map((r) => `<li class="list-item">${subjectIcon(getSubject(r.lesson.subjectId), 18)}<div class="grow"><a class="title" href="#lesson-${r.lesson.id}">${esc(r.lesson.title)}</a><span class="small muted">Đúng ${r.correct}/${r.total}</span></div>${r.seeded ? demoBadge("Minh họa") : ""}</li>`).join("")}</ul>`
            : emptyState({ iconName: "star", title: "Chưa có chủ đề nào đạt 80%", text: "Hoàn thành bài học với ít nhất 80% câu đúng để xuất hiện ở đây." })
        }
      </section>
      <section class="card" aria-labelledby="weak-title">
        <div class="card-header"><h2 id="weak-title">Chủ đề cần ôn lại</h2><span class="small muted">&lt; 70% câu đúng</span></div>
        ${
          reviews.length
            ? `<ul class="list">${reviews
                .map(
                  (r) => `<li class="list-item">${subjectIcon(r.subject, 18)}<div class="grow"><a class="title" href="#lesson-${r.lesson.id}">${esc(r.lesson.title)}</a><span class="small muted">Đúng ${r.correct}/${r.total}${r.missed.length ? ` · Xem lại: ${r.missed.map((q) => esc(q.prompt.length > 40 ? q.prompt.slice(0, 40) + "…" : q.prompt)).join("; ")}` : ""}</span></div>${r.seeded ? demoBadge("Minh họa") : ""}</li>`,
                )
                .join("")}</ul>`
            : emptyState({ iconName: "check", title: "Không có chủ đề cần ôn", text: s.answered ? "Bạn đang giữ phong độ tốt!" : "Làm bài tập để có dữ liệu đánh giá." })
        }
      </section>
    </div>
  </div>`;
}
