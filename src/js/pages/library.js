// Thư viện bài học: tìm kiếm, lọc, yêu thích.
import { icon, statusBadge, emptyState, subjectIcon } from "../ui.js";
import { SUBJECTS, LESSONS, LEVELS } from "../data/lessons.js";
import { lessonStatus, lessonScore } from "../services/progress.js";
import { esc, stripAccents } from "../utils.js";

export const title = () => "Thư viện bài học";

// Giữ bộ lọc trong phiên làm việc để quay lại thư viện không bị mất.
const filters = { q: "", subject: "", level: "", status: "", favOnly: false };

export function render(root, { store, toast }) {
  const p = () => store.currentProfile();

  root.innerHTML = `
  <div class="page">
    <div class="page-header">
      <div><h1>Thư viện bài học</h1><p>${SUBJECTS.length} môn · ${LESSONS.length} bài học. Chọn một bài để bắt đầu.</p></div>
    </div>
    <form class="filters card" id="filters" role="search" aria-label="Tìm và lọc bài học">
      <div class="field search-field">
        <label for="f-q">Tìm theo tên bài</label>
        <input id="f-q" type="search" placeholder="Ví dụ: phân số, hàm, chào hỏi…" value="${esc(filters.q)}" autocomplete="off"/>
      </div>
      <div class="field">
        <label for="f-subject">Môn học</label>
        <select id="f-subject"><option value="">Tất cả môn</option>${SUBJECTS.map((s) => `<option value="${s.id}" ${filters.subject === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label for="f-level">Trình độ</label>
        <select id="f-level"><option value="">Mọi trình độ</option>${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${filters.level === k ? "selected" : ""}>${v}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label for="f-status">Trạng thái</label>
        <select id="f-status">
          <option value="">Mọi trạng thái</option>
          <option value="not_started" ${filters.status === "not_started" ? "selected" : ""}>Chưa bắt đầu</option>
          <option value="in_progress" ${filters.status === "in_progress" ? "selected" : ""}>Đang học</option>
          <option value="completed" ${filters.status === "completed" ? "selected" : ""}>Đã hoàn thành</option>
        </select>
      </div>
      <label class="check-inline"><input type="checkbox" id="f-fav" ${filters.favOnly ? "checked" : ""}/>${icon("star", { size: 16 })}Chỉ yêu thích</label>
    </form>
    <p class="result-count" id="result-count" aria-live="polite"></p>
    <div id="results"></div>
  </div>`;

  const results = root.querySelector("#results");
  const count = root.querySelector("#result-count");

  function matches(l) {
    const prof = p();
    if (filters.subject && l.subjectId !== filters.subject) return false;
    if (filters.level && l.level !== filters.level) return false;
    if (filters.status && lessonStatus(prof, l.id) !== filters.status) return false;
    if (filters.favOnly && !prof.favorites.includes(l.id)) return false;
    if (filters.q) {
      const hay = stripAccents(`${l.title} ${l.description}`);
      if (!stripAccents(filters.q).trim().split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  function card(l) {
    const prof = p();
    const st = lessonStatus(prof, l.id);
    const sc = lessonScore(prof, l);
    const fav = prof.favorites.includes(l.id);
    return `<article class="card lesson-card">
      <div class="row" style="justify-content:space-between">
        ${statusBadge(st)}
        <button class="icon-btn fav" data-fav="${l.id}" aria-pressed="${fav}" aria-label="${fav ? "Bỏ yêu thích" : "Đánh dấu yêu thích"}: ${esc(l.title)}">${icon("star", { size: 18 })}</button>
      </div>
      <h3><a href="#lesson-${l.id}">${esc(l.title)}</a></h3>
      <p>${esc(l.description)}</p>
      <div class="meta"><span class="badge badge-level">${LEVELS[l.level]}</span><span>${icon("clock", { size: 14 })} ${l.minutes} phút</span><span>· ${l.questions.length} câu hỏi</span>${sc.answered ? `<span>· Đúng ${sc.correct}/${sc.total}</span>` : ""}</div>
    </article>`;
  }

  function update() {
    const list = LESSONS.filter(matches);
    count.textContent = `Tìm thấy ${list.length} bài học`;
    if (!list.length) {
      results.innerHTML = `<div class="card">${emptyState({ iconName: "search", title: "Không có bài học phù hợp", text: "Hãy thử từ khóa khác hoặc xóa bộ lọc.", action: `<button class="btn btn-secondary" id="clear-filters">Xóa bộ lọc</button>` })}</div>`;
      results.querySelector("#clear-filters").addEventListener("click", () => {
        Object.assign(filters, { q: "", subject: "", level: "", status: "", favOnly: false });
        render(root, { store, toast });
      });
      return;
    }
    results.innerHTML = SUBJECTS.filter((s) => list.some((l) => l.subjectId === s.id))
      .map(
        (s) => `<section class="subject-group" aria-labelledby="sg-${s.id}">
          <header>${subjectIcon(s)}<div><h2 id="sg-${s.id}">${esc(s.name)}</h2><span class="small muted">${esc(s.description)}</span></div></header>
          <div class="grid grid-3">${list.filter((l) => l.subjectId === s.id).map(card).join("")}</div>
        </section>`,
      )
      .join("");
  }

  const form = root.querySelector("#filters");
  form.addEventListener("submit", (e) => e.preventDefault());
  root.querySelector("#f-q").addEventListener("input", (e) => {
    filters.q = e.target.value;
    update();
  });
  for (const [id, key] of [["#f-subject", "subject"], ["#f-level", "level"], ["#f-status", "status"]]) {
    root.querySelector(id).addEventListener("change", (e) => {
      filters[key] = e.target.value;
      update();
    });
  }
  root.querySelector("#f-fav").addEventListener("change", (e) => {
    filters.favOnly = e.target.checked;
    update();
  });

  results.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    const id = btn.dataset.fav;
    let nowFav = false;
    store.updateProfile((prof) => {
      if (prof.favorites.includes(id)) prof.favorites = prof.favorites.filter((f) => f !== id);
      else {
        prof.favorites.push(id);
        nowFav = true;
      }
    });
    const lesson = LESSONS.find((l) => l.id === id);
    toast(nowFav ? `Đã thêm “${lesson.title}” vào yêu thích.` : `Đã bỏ “${lesson.title}” khỏi yêu thích.`, "success", 2500);
    // Cập nhật nút tại chỗ để không mất vị trí tiêu điểm.
    if (filters.favOnly && !nowFav) update();
    else {
      btn.setAttribute("aria-pressed", String(nowFav));
      btn.setAttribute("aria-label", `${nowFav ? "Bỏ yêu thích" : "Đánh dấu yêu thích"}: ${lesson.title}`);
    }
  });

  update();
}
