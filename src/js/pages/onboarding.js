// Thiết lập mục tiêu học tập lần đầu và tạo lộ trình.
import { icon, alertBox, subjectIcon } from "../ui.js";
import { SUBJECTS, LEVELS, getSubject } from "../data/lessons.js";
import { learningPath } from "../services/progress.js";
import { addActivity } from "../store.js";
import { esc } from "../utils.js";

export const title = () => "Thiết lập mục tiêu";

export const OBJECTIVES = [
  { id: "exam", label: "Chuẩn bị kiểm tra, thi cử" },
  { id: "foundation", label: "Củng cố kiến thức nền tảng" },
  { id: "work", label: "Ứng dụng vào học tập, công việc" },
  { id: "hobby", label: "Học vì sở thích cá nhân" },
];
const SESSIONS = [2, 3, 4, 5, 7];
const MINUTES = [10, 15, 20, 30, 45];
const LEVEL_DESC = {
  beginner: "Mới bắt đầu hoặc đã quên nhiều",
  intermediate: "Đã biết kiến thức cơ bản",
  advanced: "Muốn thử thách, ôn nhanh phần cơ bản",
};

export function objectiveLabel(id) {
  return OBJECTIVES.find((o) => o.id === id)?.label || id || "Chưa chọn";
}

export function render(root, { store, navigate, toast }) {
  const prof = store.currentProfile();

  const radio = (name, value, checked, inner) =>
    `<label class="choice"><input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""}/>${inner}</label>`;

  function renderForm() {
    const g = store.currentProfile().goal;
    root.innerHTML = `
    <div class="onb-wrap">
      <a href="#home" class="brand">${icon("logo", { size: 26 })}<span>LearnMate</span></a>
      <div class="onb-steps" aria-hidden="true"><span class="on"></span><span></span></div>
      <h1>Chào ${esc(prof.name)}! Bạn muốn học gì?</h1>
      <p class="muted">Trả lời 5 câu hỏi ngắn để LearnMate sắp xếp lộ trình phù hợp. Bạn có thể đổi lại bất cứ lúc nào trong Hồ sơ.</p>
      <div class="btn-row" style="margin-bottom:1.25rem">
        <button type="button" class="btn btn-secondary btn-sm" id="use-sample">${icon("sparkle", { size: 16 })}Dùng mục tiêu mẫu</button>
        <span class="small muted">Điền nhanh: Toán cơ bản · Cơ bản · 3 buổi × 20 phút</span>
      </div>
      <form id="onb-form" class="card" novalidate>
        <fieldset>
          <legend>1. Môn học hoặc chủ đề</legend>
          <div class="choice-grid">
            ${SUBJECTS.map((s) => radio("subjectId", s.id, g.subjectId === s.id, `${subjectIcon(s)}<span><span class="choice-title">${esc(s.name)}</span><br><span class="choice-desc">${esc(s.description)}</span></span>`)).join("")}
          </div>
        </fieldset>
        <fieldset>
          <legend>2. Trình độ hiện tại</legend>
          <div class="choice-grid">
            ${Object.entries(LEVELS).map(([id, label]) => radio("level", id, g.level === id, `<span><span class="choice-title">${label}</span><br><span class="choice-desc">${LEVEL_DESC[id]}</span></span>`)).join("")}
          </div>
        </fieldset>
        <fieldset>
          <legend>3. Mục tiêu học tập</legend>
          <div class="choice-grid">
            ${OBJECTIVES.map((o) => radio("objective", o.id, g.objective === o.id, `<span class="choice-title">${o.label}</span>`)).join("")}
          </div>
        </fieldset>
        <fieldset>
          <legend>4. Bạn muốn học bao nhiêu buổi mỗi tuần?</legend>
          <div class="segmented" role="radiogroup" aria-label="Số buổi mỗi tuần">
            ${SESSIONS.map((n) => `<label><input type="radio" name="sessionsPerWeek" value="${n}" ${g.sessionsPerWeek === n ? "checked" : ""}/>${n} buổi</label>`).join("")}
          </div>
        </fieldset>
        <fieldset>
          <legend>5. Mỗi buổi bạn có thể học bao lâu?</legend>
          <div class="segmented" role="radiogroup" aria-label="Thời lượng mỗi buổi">
            ${MINUTES.map((n) => `<label><input type="radio" name="minutesPerSession" value="${n}" ${g.minutesPerSession === n ? "checked" : ""}/>${n} phút</label>`).join("")}
          </div>
        </fieldset>
        <div id="onb-status" aria-live="polite"></div>
        <div class="btn-row" style="justify-content:flex-end;margin-top:.5rem">
          ${prof.onboarded ? `<a class="btn btn-ghost" href="#dashboard">Hủy</a>` : ""}
          <button type="submit" class="btn btn-primary">Tạo lộ trình ${icon("arrowRight")}</button>
        </div>
      </form>
    </div>`;

    const form = root.querySelector("#onb-form");
    root.querySelector("#use-sample").addEventListener("click", () => {
      const set = (name, value) => {
        const el = form.querySelector(`input[name="${name}"][value="${value}"]`);
        if (el) el.checked = true;
      };
      set("subjectId", "math");
      set("level", "beginner");
      set("objective", "foundation");
      set("sessionsPerWeek", "3");
      set("minutesPerSession", "20");
      root.querySelector("#onb-status").innerHTML = alertBox("Đã điền mục tiêu mẫu. Bạn có thể chỉnh lại rồi bấm “Tạo lộ trình”.", "info");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const missing = [];
      if (!data.subjectId) missing.push("môn học");
      if (!data.level) missing.push("trình độ");
      if (!data.objective) missing.push("mục tiêu");
      if (!data.sessionsPerWeek) missing.push("số buổi mỗi tuần");
      if (!data.minutesPerSession) missing.push("thời lượng mỗi buổi");
      if (missing.length) {
        root.querySelector("#onb-status").innerHTML = alertBox(`Vui lòng chọn: ${missing.join(", ")}.`, "error");
        const firstName = { "môn học": "subjectId", "trình độ": "level", "mục tiêu": "objective", "số buổi mỗi tuần": "sessionsPerWeek", "thời lượng mỗi buổi": "minutesPerSession" }[missing[0]];
        form.querySelector(`input[name="${firstName}"]`)?.focus();
        return;
      }
      store.updateProfile((p) => {
        p.goal = {
          subjectId: data.subjectId,
          level: data.level,
          objective: data.objective,
          sessionsPerWeek: Number(data.sessionsPerWeek),
          minutesPerSession: Number(data.minutesPerSession),
        };
        p.onboarded = true;
        addActivity(p, { type: "goal", text: `Đặt mục tiêu: ${getSubject(data.subjectId).name} (${LEVELS[data.level]})` });
      });
      renderResult();
    });
  }

  function renderResult() {
    const p = store.currentProfile();
    const path = learningPath(p);
    const subject = getSubject(p.goal.subjectId);
    root.innerHTML = `
    <div class="onb-wrap">
      <a href="#home" class="brand">${icon("logo", { size: 26 })}<span>LearnMate</span></a>
      <div class="onb-steps" aria-hidden="true"><span class="on"></span><span class="on"></span></div>
      <div class="card">
        ${alertBox("<strong>Đã tạo lộ trình!</strong> <span class=\"alert-text\">Dựa trên lựa chọn của bạn.</span>", "success")}
        <div class="row" style="margin:1rem 0">${subjectIcon(subject, 24)}<div><h1 style="margin:0">${esc(subject.name)}</h1><div class="muted">${LEVELS[p.goal.level]} · ${esc(objectiveLabel(p.goal.objective))} · ${p.goal.sessionsPerWeek} buổi/tuần × ${p.goal.minutesPerSession} phút</div></div></div>
        <h2>Lộ trình gợi ý</h2>
        <ol class="list">
          ${path
            .map(
              ({ lesson, optional }, i) => `<li class="list-item"><span class="path-step">${i + 1}</span><div class="grow"><span class="title">${esc(lesson.title)}</span><span class="small muted">${LEVELS[lesson.level]} · ${lesson.minutes} phút${optional ? " · Ôn nhanh (tùy chọn)" : ""}</span></div></li>`,
            )
            .join("")}
        </ol>
        <p class="small muted" style="margin-top:1rem">Với ${p.goal.minutesPerSession} phút mỗi buổi, bạn có thể hoàn thành khoảng ${Math.max(1, Math.floor(p.goal.minutesPerSession / 15))} bài mỗi buổi.</p>
        <div class="btn-row" style="justify-content:flex-end">
          <button class="btn btn-secondary" id="edit-goal">Chỉnh lại</button>
          <a class="btn btn-primary" href="#dashboard">Vào trang tổng quan ${icon("arrowRight")}</a>
        </div>
      </div>
    </div>`;
    root.querySelector("#edit-goal").addEventListener("click", renderForm);
    root.querySelector("h1").setAttribute("tabindex", "-1");
    root.querySelector("h1").focus();
    toast("Lộ trình học tập đã sẵn sàng.", "success");
  }

  renderForm();
}
