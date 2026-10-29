// Trang bài học tương tác + gia sư ảo hai chiều.
import { icon, progressBar, alertBox, emptyState, subjectIcon, toast as toastFn } from "../ui.js";
import { getLesson, getSubject, nextLessonAfter, LEVELS } from "../data/lessons.js";
import { ensureLessonState, getLessonState, addActivity, addStudySeconds } from "../store.js";
import { lessonScore } from "../services/progress.js";
import { createTutor, QUICK_PROMPTS } from "../services/tutor.js";
import { esc, answersMatch, normalizeAnswer } from "../utils.js";

export const title = (ctx) => getLesson(ctx.param)?.title || "Bài học";

const ATTEMPTS_BEFORE_REVEAL = 2;
const MAX_SESSION_SECONDS = 45 * 60;
const tutor = createTutor();
const tutorSessions = new Map(); // trạng thái hội thoại trong bộ nhớ (câu đố đang chờ…)

export function render(root, { store, param, navigate }) {
  const lesson = getLesson(param);
  if (!lesson) {
    root.innerHTML = `<div class="page"><div class="card">${emptyState({ iconName: "search", title: "Không tìm thấy bài học", text: "Bài học này không tồn tại hoặc đã bị gỡ.", action: `<a class="btn btn-primary" href="#library">Về thư viện</a>` })}</div></div>`;
    return;
  }
  const subject = getSubject(lesson.subjectId);
  const nSections = lesson.sections.length;
  const nQuestions = lesson.questions.length;
  const summaryStep = nSections + nQuestions;

  // ── Khởi tạo trạng thái bài ──
  let initial = getLessonState(store.currentProfile(), lesson.id);
  store.updateProfile((p) => {
    const ls = ensureLessonState(p, lesson.id);
    if (initial.status === "not_started") {
      ls.status = "in_progress";
      addActivity(p, { type: "lesson_start", text: `Bắt đầu bài “${lesson.title}”`, lessonId: lesson.id });
    }
    ls.updatedAt = Date.now();
  });
  initial = getLessonState(store.currentProfile(), lesson.id);
  let step = initial.status === "completed" ? summaryStep : Math.min(initial.step, summaryStep);

  // Trạng thái giao diện tạm thời cho câu hỏi hiện tại (không lưu).
  let ui = freshUi();
  function freshUi() {
    return { selected: null, text: "", feedback: null, showHint: false, showExplain: false, confirmSkip: false, locked: false, error: "" };
  }

  // ── Theo dõi thời gian học thực tế ──
  let activeSince = document.visibilityState === "visible" ? Date.now() : null;
  let accumulated = 0;
  function flushTime() {
    if (activeSince) accumulated += (Date.now() - activeSince) / 1000;
    activeSince = document.visibilityState === "visible" ? Date.now() : null;
    const secs = Math.min(MAX_SESSION_SECONDS, Math.round(accumulated));
    accumulated = 0;
    if (secs >= 5 && store.currentProfile()) store.updateProfile((p) => addStudySeconds(p, secs));
  }
  const onVis = () => {
    if (document.visibilityState === "hidden") flushTime();
    else activeSince = Date.now();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", flushTime);

  // ── Bố cục ──
  root.innerHTML = `
  <div class="page">
    <div class="lesson-top">
      <nav class="crumbs" aria-label="Đường dẫn"><a href="#library">Thư viện</a> / <span class="muted">${esc(subject.name)}</span></nav>
      <div class="row" style="align-items:flex-start">
        ${subjectIcon(subject, 24)}
        <div style="flex:1;min-width:0">
          <h1 id="lesson-title" style="margin:0">${esc(lesson.title)}</h1>
          <div class="meta" style="margin-top:.3rem"><span class="badge badge-level">${LEVELS[lesson.level]}</span><span>${icon("clock", { size: 14 })} ${lesson.minutes} phút</span><span id="score-label"></span></div>
        </div>
        <a class="btn btn-secondary btn-sm" href="#tutor-panel" id="jump-tutor">${icon("bot", { size: 16 })}Hỏi gia sư</a>
      </div>
      <div class="lesson-progress"><div id="lesson-progress" style="flex:1"></div><span class="count" id="progress-count"></span></div>
    </div>
    <div class="lesson-layout">
      <div id="lesson-main"></div>
      <aside class="card tutor" id="tutor-panel" aria-labelledby="tutor-title"></aside>
    </div>
  </div>`;

  const main = root.querySelector("#lesson-main");
  const tutorEl = root.querySelector("#tutor-panel");
  root.querySelector("#jump-tutor").addEventListener("click", (e) => {
    e.preventDefault();
    tutorEl.scrollIntoView({ behavior: "smooth", block: "start" });
    tutorEl.querySelector("#tutor-input")?.focus({ preventScroll: true });
  });

  const ls = () => getLessonState(store.currentProfile(), lesson.id);
  const qState = (q) => ls().questions[q.id] || null;
  const isFinal = (st) => st && ["correct", "revealed", "skipped"].includes(st.status);

  function saveStep() {
    store.updateProfile((p) => {
      const s = ensureLessonState(p, lesson.id);
      s.step = step;
      s.updatedAt = Date.now();
    });
  }

  function updateHeader() {
    const s = ls();
    const finalized = lesson.questions.filter((q) => isFinal(s.questions[q.id])).length;
    const sectionsRead = finalized > 0 || step >= nSections ? nSections : step;
    const pct = s.status === "completed" ? 100 : ((sectionsRead + finalized) / (nSections + nQuestions)) * 100;
    root.querySelector("#lesson-progress").innerHTML = progressBar(pct, "Tiến độ bài học");
    root.querySelector("#progress-count").textContent = `${Math.round(pct)}%`;
    const sc = lessonScore(store.currentProfile(), lesson);
    root.querySelector("#score-label").textContent = `· Điểm: ${sc.correct}/${sc.total}`;
  }

  // ── Hiển thị phần nội dung ──
  function renderSection(i) {
    const sec = lesson.sections[i];
    main.innerHTML = `
    <article class="card" aria-labelledby="sec-title">
      ${i === 0 ? `<div class="objectives"><h2>${icon("target", { size: 16 })}Mục tiêu bài học</h2><ul>${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>` : ""}
      <p class="q-kind">Phần ${i + 1}/${nSections}</p>
      <h2 id="sec-title" tabindex="-1">${esc(sec.title)}</h2>
      <div class="content-body">${sec.body}</div>
      ${sec.example ? `<div class="example card" style="box-shadow:none;margin-top:1rem"><span class="example-label">Ví dụ</span><pre>${esc(sec.example)}</pre></div>` : ""}
      <div class="step-nav">
        ${i > 0 ? `<button class="btn btn-secondary" data-go="${i - 1}">${icon("arrowLeft")}Phần trước</button>` : "<span></span>"}
        <button class="btn btn-primary" data-go="${i + 1}">${i + 1 < nSections ? "Tiếp tục" : "Bắt đầu luyện tập"}${icon("arrowRight")}</button>
      </div>
    </article>`;
  }

  // ── Hiển thị câu hỏi ──
  function renderQuestion(qi) {
    const q = lesson.questions[qi];
    const st = qState(q);
    const final = isFinal(st);
    const attempts = st?.attempts || 0;
    const canReveal = final || attempts >= ATTEMPTS_BEFORE_REVEAL;
    const locked = final || ui.locked;
    const isLast = qi === nQuestions - 1;

    let inputHtml;
    if (q.type === "mcq") {
      inputHtml = `<fieldset class="options" aria-describedby="q-prompt"><legend class="sr-only">Chọn một đáp án</legend>
        ${q.options
          .map((o, i) => {
            let cls = "";
            if (final && (st.status === "correct" || st.status === "revealed") && i === q.answer) cls = "is-correct";
            else if (ui.feedback?.type === "wrong" && ui.selected === i) cls = "is-wrong";
            else if (final && st.status === "correct" && i !== q.answer) cls = "";
            return `<label class="option ${cls} ${locked ? "is-disabled" : ""}"><input type="radio" name="opt" value="${i}" ${ui.selected === i || (final && st.status === "correct" && i === q.answer) ? "checked" : ""} ${locked ? "disabled" : ""}/><span class="opt-key" aria-hidden="true">${"ABCD"[i]}</span><span>${esc(o.text)}</span></label>`;
          })
          .join("")}
      </fieldset>`;
    } else {
      const val = final && st.status !== "skipped" ? (st.status === "correct" ? ui.text || q.accept[0] : ui.text) : ui.text;
      inputHtml = `<div class="field">
        <label for="short-answer">Câu trả lời của bạn</label>
        <input id="short-answer" type="text" autocomplete="off" placeholder="${esc(q.placeholder || "Nhập câu trả lời")}" value="${esc(val)}" ${locked ? "disabled" : ""} aria-describedby="short-help"/>
        <p class="help" id="short-help">Nhấn Enter hoặc bấm “Kiểm tra đáp án”. Không phân biệt chữ hoa/thường và dấu.</p>
      </div>`;
    }

    let feedbackHtml = "";
    if (ui.error) feedbackHtml += alertBox(esc(ui.error), "warning");
    if (final && st.status === "correct") {
      feedbackHtml += alertBox(`<span class="title">Chính xác! ${st.firstTry ? "Đúng ngay lần đầu 🎉" : ""}</span><span class="alert-text">${esc(q.why)}</span>`, "success");
    } else if (final && st.status === "revealed") {
      const ans = q.type === "mcq" ? q.options[q.answer].text : q.accept[0];
      feedbackHtml += alertBox(`<span class="title">Đáp án: ${esc(ans)}</span><span class="alert-text">${esc(q.why)}</span>`, "info");
    } else if (final && st.status === "skipped") {
      feedbackHtml += alertBox(`<span class="title">Bạn đã bỏ qua câu này.</span><span class="alert-text">Câu này được tính là chưa đúng. Bạn có thể quay lại ôn trong phần Tiến độ.</span>`, "warning");
    } else if (ui.feedback?.type === "wrong") {
      feedbackHtml += alertBox(`<span class="title">Chưa đúng.</span><span class="alert-text">${esc(ui.feedback.text)}</span>`, "error");
    }
    if (ui.showHint && !final) feedbackHtml += alertBox(`<span class="title">Gợi ý</span><span class="alert-text">${esc(q.hint)}</span>`, "info");
    if (ui.showExplain && canReveal) feedbackHtml += alertBox(`<span class="title">Giải thích</span><span class="alert-text">${esc(q.explanation)}</span>`, "info");

    const remain = Math.max(0, ATTEMPTS_BEFORE_REVEAL - attempts);
    main.innerHTML = `
    <article class="card" aria-labelledby="q-prompt">
      <p class="q-kind">Câu ${qi + 1}/${nQuestions} · ${q.type === "mcq" ? "Trắc nghiệm" : "Trả lời ngắn"}</p>
      <h2 class="q-prompt" id="q-prompt" tabindex="-1">${esc(q.prompt)}</h2>
      <form id="q-form" novalidate>
        ${inputHtml}
        <p class="attempts">${final ? `Số lần thử: ${attempts}` : attempts ? `Đã thử ${attempts} lần.${remain ? ` Xem lời giải được mở sau ${remain} lần thử nữa.` : " Bạn có thể xem lời giải."}` : "Bạn có thể dùng Gợi ý bất cứ lúc nào."}</p>
        <div class="feedback" aria-live="polite" id="feedback">${feedbackHtml}</div>
        <div class="q-actions">
          ${!final && !ui.locked ? `<button type="submit" class="btn btn-primary">${icon("check")}Kiểm tra đáp án</button>` : ""}
          ${!final && ui.locked ? `<button type="button" class="btn btn-primary" id="btn-retry">${icon("retry")}Thử lại</button>` : ""}
          ${!final ? `<button type="button" class="btn btn-secondary" id="btn-hint" ${ui.showHint ? 'aria-pressed="true"' : ""}>${icon("bulb")}Gợi ý</button>` : ""}
          <button type="button" class="btn btn-secondary" id="btn-explain" ${canReveal ? "" : 'aria-disabled="true"'} title="${canReveal ? "" : `Mở sau ${ATTEMPTS_BEFORE_REVEAL} lần thử`}">${icon("eye")}Xem giải thích</button>
        </div>
      </form>
      ${
        ui.confirmSkip && !final
          ? `<div class="confirm-skip">${alertBox(`<span class="alert-text">Bỏ qua câu này? Câu sẽ được tính là <strong>chưa đúng</strong>.</span><div class="btn-row" style="margin-top:.5rem"><button class="btn btn-danger btn-sm" id="btn-skip-yes">Xác nhận bỏ qua</button><button class="btn btn-ghost btn-sm" id="btn-skip-no">Tiếp tục làm</button></div>`, "warning")}</div>`
          : ""
      }
      <div class="step-nav">
        <button class="btn btn-secondary" data-go="${nSections + qi - 1}">${icon("arrowLeft")}${qi === 0 ? "Xem lại nội dung" : "Câu trước"}</button>
        <div class="btn-row">
          ${!final && !ui.confirmSkip ? `<button class="btn btn-ghost" id="btn-skip">${icon("skip", { size: 16 })}Bỏ qua câu này</button>` : ""}
          <button class="btn btn-primary" id="btn-next" ${final ? "" : 'aria-disabled="true"'} data-go="${nSections + qi + 1}">${isLast ? "Xem kết quả" : "Câu tiếp theo"}${icon("arrowRight")}</button>
        </div>
      </div>
      ${!final ? `<p class="small muted" style="margin:.5rem 0 0;text-align:right" id="next-note">Hoàn thành câu này hoặc xác nhận bỏ qua để tiếp tục.</p>` : ""}
    </article>`;

    // Sự kiện
    const form = main.querySelector("#q-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      check(q);
    });
    form.addEventListener("change", (e) => {
      if (e.target.name === "opt") {
        ui.selected = Number(e.target.value);
        ui.error = "";
      }
    });
    main.querySelector("#short-answer")?.addEventListener("input", (e) => {
      ui.text = e.target.value;
    });
    main.querySelector("#btn-retry")?.addEventListener("click", () => {
      ui = { ...freshUi(), showHint: ui.showHint };
      renderStep({ focus: "input" });
    });
    main.querySelector("#btn-hint")?.addEventListener("click", () => {
      ui.showHint = !ui.showHint;
      if (ui.showHint) {
        store.updateProfile((p) => {
          const s = ensureLessonState(p, lesson.id);
          const cur = s.questions[q.id];
          if (cur) cur.hints = (cur.hints || 0) + 1;
        });
      }
      renderStep({ focus: "#btn-hint" });
    });
    main.querySelector("#btn-explain").addEventListener("click", () => {
      if (!canReveal) {
        ui.error = `Hãy thử thêm ${remain} lần nữa trước khi xem lời giải. Bấm “Gợi ý” nếu bạn cần trợ giúp.`;
        renderStep({ focus: "#btn-explain" });
        return;
      }
      if (!final) {
        finalize(q, "revealed");
        addAct(`Xem lời giải câu ${qi + 1} – “${lesson.title}”`);
      }
      ui.showExplain = true;
      ui.error = "";
      renderStep({ focus: "#feedback" });
    });
    main.querySelector("#btn-skip")?.addEventListener("click", () => {
      ui.confirmSkip = true;
      renderStep({ focus: "#btn-skip-yes" });
    });
    main.querySelector("#btn-skip-yes")?.addEventListener("click", () => {
      finalize(q, "skipped");
      ui.confirmSkip = false;
      renderStep({ focus: "#btn-next" });
    });
    main.querySelector("#btn-skip-no")?.addEventListener("click", () => {
      ui.confirmSkip = false;
      renderStep({ focus: "input" });
    });
  }

  function addAct(text) {
    store.updateProfile((p) => addActivity(p, { type: "answer", text, lessonId: lesson.id }));
  }

  function finalize(q, status) {
    store.updateProfile((p) => {
      const s = ensureLessonState(p, lesson.id);
      const cur = s.questions[q.id] || { attempts: 0, hints: 0, firstTry: false };
      s.questions[q.id] = { ...cur, status };
      s.updatedAt = Date.now();
      s.seeded = false; // người dùng đã tự làm → không còn là dữ liệu minh họa
    });
    updateHeader();
  }

  function check(q) {
    ui.error = "";
    let correct = false;
    let feedback = "";
    if (q.type === "mcq") {
      if (ui.selected == null) {
        ui.error = "Hãy chọn một phương án trước khi kiểm tra.";
        return renderStep({ focus: "input" });
      }
      correct = ui.selected === q.answer;
      feedback = q.options[ui.selected].feedback || `Gợi ý: ${q.hint}`;
    } else {
      const val = (ui.text || "").trim();
      if (!val) {
        ui.error = "Hãy nhập câu trả lời trước khi kiểm tra.";
        return renderStep({ focus: "input" });
      }
      correct = answersMatch(val, q.accept);
      if (!correct) {
        const m = (q.mistakes || []).find((mm) => answersMatch(val, mm.match));
        feedback = m ? m.feedback : `Câu trả lời “${val}” chưa khớp. Gợi ý: ${q.hint}`;
        if (!normalizeAnswer(val)) feedback = "Câu trả lời chỉ gồm ký tự không hợp lệ. Hãy nhập chữ hoặc số.";
      }
    }

    let firstTry = false;
    store.updateProfile((p) => {
      const s = ensureLessonState(p, lesson.id);
      const cur = s.questions[q.id] || { status: "wrong", attempts: 0, hints: 0, firstTry: false };
      cur.attempts += 1;
      if (correct) {
        cur.status = "correct";
        cur.firstTry = cur.attempts === 1;
        firstTry = cur.firstTry;
      } else cur.status = "wrong";
      s.questions[q.id] = cur;
      s.updatedAt = Date.now();
      s.seeded = false;
    });
    const qi = lesson.questions.indexOf(q);
    if (correct) {
      ui.feedback = { type: "correct" };
      ui.showHint = false;
      addAct(`Trả lời đúng câu ${qi + 1} – “${lesson.title}”${firstTry ? " ngay lần đầu" : ""}`);
    } else {
      ui.feedback = { type: "wrong", text: feedback };
      ui.locked = true;
    }
    updateHeader();
    renderStep({ focus: correct ? "#btn-next" : "#btn-retry" });
  }

  // ── Tổng kết ──
  function renderSummary() {
    const sc = lessonScore(store.currentProfile(), lesson);
    const s = ls();
    const next = nextLessonAfter(lesson.id);
    const pct = Math.round((sc.correct / sc.total) * 100);
    const msg = pct >= 80 ? "Tuyệt vời! Bạn đã nắm chắc bài này." : pct >= 50 ? "Khá tốt! Ôn lại các câu chưa đúng để chắc hơn." : "Đừng nản! Hãy xem lại nội dung và làm lại bài nhé.";
    main.innerHTML = `
    <article class="card" aria-labelledby="sum-title">
      <p class="q-kind">Kết quả bài học</p>
      <h2 id="sum-title" tabindex="-1">Bạn đã hoàn thành bài học!</h2>
      <div class="row" style="gap:1.5rem;margin:1rem 0">
        <div><div class="summary-score">${sc.correct}/${sc.total}</div><div class="small muted">câu đúng (${pct}%)</div></div>
        <p style="flex:1;min-width:200px;margin:0">${msg}</p>
      </div>
      <ul class="q-review">
        ${lesson.questions
          .map((q, i) => {
            const st = s.questions[q.id]?.status;
            const [ic, cls, label] = st === "correct" ? ["check", "dot-ok", "Đúng"] : st === "revealed" ? ["eye", "dot-bad", "Đã xem lời giải"] : st === "skipped" ? ["skip", "dot-skip", "Bỏ qua"] : ["x", "dot-skip", "Chưa làm"];
            return `<li><span class="${cls}">${icon(ic, { size: 18 })}</span><div style="flex:1"><strong>Câu ${i + 1}:</strong> ${esc(q.prompt)}<div class="small muted">${label}${s.questions[q.id]?.attempts ? ` · ${s.questions[q.id].attempts} lần thử` : ""}</div></div><button class="btn btn-ghost btn-sm" data-go="${nSections + i}">Xem lại</button></li>`;
          })
          .join("")}
      </ul>
      <div class="btn-row">
        ${next ? `<a class="btn btn-primary" href="#lesson-${next.id}">Bài tiếp theo: ${esc(next.title)} ${icon("arrowRight")}</a>` : `<a class="btn btn-primary" href="#progress">Xem tiến độ ${icon("arrowRight")}</a>`}
        <button class="btn btn-secondary" id="btn-redo">${icon("retry")}Làm lại bài</button>
        <a class="btn btn-ghost" href="#library">Về thư viện</a>
      </div>
      ${!next ? `<p class="small muted" style="margin-top:.75rem">Đây là bài cuối của môn ${esc(subject.name)}.</p>` : ""}
    </article>`;
    main.querySelector("#btn-redo").addEventListener("click", () => {
      store.updateProfile((p) => {
        p.lessons[lesson.id] = { status: "in_progress", step: 0, questions: {}, completedAt: null, updatedAt: Date.now(), seeded: false };
        addActivity(p, { type: "lesson_start", text: `Làm lại bài “${lesson.title}”`, lessonId: lesson.id });
      });
      step = 0;
      ui = freshUi();
      renderStep({ focus: "heading" });
      toastFn("Đã đặt lại bài học. Chúc bạn làm tốt!", "info");
    });
  }

  function completeLessonIfDone() {
    const s = ls();
    const allDone = lesson.questions.every((q) => isFinal(s.questions[q.id]));
    if (allDone && s.status !== "completed") {
      const sc = lessonScore(store.currentProfile(), lesson);
      store.updateProfile((p) => {
        const st = ensureLessonState(p, lesson.id);
        st.status = "completed";
        st.completedAt = Date.now();
        addActivity(p, { type: "lesson_complete", text: `Hoàn thành “${lesson.title}” – ${sc.correct}/${sc.total} câu đúng`, lessonId: lesson.id });
      });
      toastFn(`Hoàn thành bài “${lesson.title}”: ${sc.correct}/${sc.total} câu đúng.`, "success");
    }
    return allDone;
  }

  // ── Điều hướng giữa các bước ──
  function go(target) {
    target = Math.max(0, Math.min(summaryStep, target));
    // Chặn chuyển tiếp nếu câu hiện tại chưa xong.
    if (target > step && step >= nSections && step < summaryStep) {
      const q = lesson.questions[step - nSections];
      if (!isFinal(qState(q))) {
        const note = main.querySelector("#next-note");
        if (note) {
          note.innerHTML = `<strong style="color:var(--warning)">Bạn chưa hoàn thành câu này.</strong> Hãy trả lời đúng, xem giải thích hoặc chọn “Bỏ qua câu này”.`;
          note.setAttribute("role", "alert");
        }
        return;
      }
    }
    if (target === summaryStep && !completeLessonIfDone()) {
      // Còn câu chưa làm → đưa tới câu đầu tiên chưa xong.
      const firstOpen = lesson.questions.findIndex((q) => !isFinal(qState(q)));
      target = nSections + firstOpen;
      toastFn("Còn câu hỏi chưa hoàn thành, hãy làm tiếp nhé.", "info");
    }
    step = target;
    ui = freshUi();
    saveStep();
    renderStep({ focus: "heading" });
  }

  main.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-go]");
    if (!btn) return;
    e.preventDefault();
    go(Number(btn.dataset.go));
  });

  function currentQuestion() {
    if (step >= nSections && step < summaryStep) return lesson.questions[step - nSections];
    return null;
  }

  function renderStep({ focus } = {}) {
    if (step < nSections) renderSection(step);
    else if (step < summaryStep) renderQuestion(step - nSections);
    else renderSummary();
    updateHeader();
    updateTutorContext();
    if (focus === "heading") main.querySelector("h2")?.focus({ preventScroll: false });
    else if (focus === "input") main.querySelector("#short-answer:not([disabled]), input[name=opt]:not([disabled])")?.focus();
    else if (focus) main.querySelector(focus)?.focus();
  }

  // ───────────── Gia sư ảo ─────────────
  if (!tutorSessions.has(lesson.id)) tutorSessions.set(lesson.id, {});
  const session = tutorSessions.get(lesson.id);
  let waiting = false;

  tutorEl.innerHTML = `
    <div class="tutor-head">
      <span class="subject-icon tone-violet">${icon("bot")}</span>
      <div style="flex:1;min-width:0">
        <h2 id="tutor-title">Gia sư ảo</h2>
        <div class="ctx" id="tutor-ctx"></div>
      </div>
      <span class="badge badge-demo" title="Phản hồi soạn sẵn theo từ khóa và ngữ cảnh bài học, không phải mô hình AI">Chế độ demo</span>
    </div>
    <div class="tutor-log" id="tutor-log" role="log" aria-live="polite" aria-label="Hội thoại với gia sư" tabindex="0"></div>
    <div class="quick" role="group" aria-label="Câu hỏi gợi ý nhanh">
      ${QUICK_PROMPTS.map((qp) => `<button class="chip" data-intent="${qp.intent}">${qp.label}</button>`).join("")}
    </div>
    <form class="tutor-form" id="tutor-form" novalidate>
      <label for="tutor-input" class="sr-only">Nhập câu hỏi cho gia sư</label>
      <input id="tutor-input" type="text" maxlength="500" placeholder="Hỏi về bài này…" autocomplete="off"/>
      <button class="btn btn-primary" type="submit" aria-label="Gửi câu hỏi">${icon("send")}</button>
    </form>
    <p class="tutor-note">Chế độ demo: phản hồi được soạn sẵn theo từ khóa và ngữ cảnh bài học, không do AI tạo ra. Không có dữ liệu nào được gửi ra ngoài. <button class="btn btn-ghost btn-sm" id="tutor-clear" style="min-height:28px;padding:0 .4rem">Xóa hội thoại</button></p>`;

  const log = tutorEl.querySelector("#tutor-log");
  const input = tutorEl.querySelector("#tutor-input");

  const history = () => store.currentProfile().chats[lesson.id] || [];
  function msgHtml(m) {
    return `<div class="msg msg-${m.role}"><span class="sr-only">${m.role === "user" ? "Bạn" : "Gia sư"}: </span>${esc(m.text)}</div>`;
  }
  function renderLog() {
    const msgs = history();
    const welcome = {
      role: "tutor",
      text: `Chào bạn! Mình là gia sư của bài “${lesson.title}”. Bạn có thể hỏi về thuật ngữ trong bài, nhờ giải thích đơn giản hơn, xin ví dụ, hoặc xin gợi ý từng bước cho câu đang làm.`,
    };
    log.innerHTML = [welcome, ...msgs].map(msgHtml).join("") + (waiting ? `<div class="msg msg-tutor" id="typing"><span class="typing" aria-label="Gia sư đang trả lời"><i></i><i></i><i></i></span></div>` : "");
    log.scrollTop = log.scrollHeight;
  }

  function updateTutorContext() {
    const q = currentQuestion();
    const ctxEl = tutorEl.querySelector("#tutor-ctx");
    if (ctxEl) ctxEl.textContent = q ? `Đang xem: Câu ${lesson.questions.indexOf(q) + 1} – ${q.type === "mcq" ? "trắc nghiệm" : "trả lời ngắn"}` : step >= summaryStep ? "Đang xem: Kết quả bài học" : `Đang xem: Phần ${step + 1} – ${lesson.sections[step].title}`;
  }

  function setWaiting(v) {
    waiting = v;
    tutorEl.querySelectorAll(".chip, .tutor-form button").forEach((b) => (b.disabled = v));
    input.disabled = v;
    renderLog();
  }

  async function ask(text, intent = null) {
    if (waiting) return;
    const clean = text.trim();
    if (!clean) {
      input.setAttribute("aria-invalid", "true");
      input.placeholder = "Hãy nhập câu hỏi trước khi gửi…";
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    store.updateProfile((p) => {
      p.chats[lesson.id] = [...(p.chats[lesson.id] || []), { role: "user", text: clean.slice(0, 500), ts: Date.now() }].slice(-40);
    });
    input.value = "";
    setWaiting(true);
    const q = currentQuestion();
    try {
      const res = await tutor.reply({ message: clean, intent, lesson, question: q, questionState: q ? qState(q) : null, session });
      if (!store.currentProfile()) return; // đã đăng xuất trong lúc chờ
      store.updateProfile((p) => {
        p.chats[lesson.id] = [...(p.chats[lesson.id] || []), { role: "tutor", text: res.text, ts: Date.now() }].slice(-40);
      });
    } catch (err) {
      console.error(err);
      store.updateProfile((p) => {
        p.chats[lesson.id] = [...(p.chats[lesson.id] || []), { role: "tutor", text: "Xin lỗi, gia sư đang gặp sự cố và chưa trả lời được. Bạn thử gửi lại sau ít phút nhé.", ts: Date.now() }];
      });
    } finally {
      if (root.isConnected) {
        setWaiting(false);
        input.focus();
      }
    }
  }

  tutorEl.querySelector("#tutor-form").addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
  });
  tutorEl.querySelectorAll("[data-intent]").forEach((b) => b.addEventListener("click", () => ask(b.textContent, b.dataset.intent)));
  tutorEl.querySelector("#tutor-clear").addEventListener("click", () => {
    store.updateProfile((p) => {
      p.chats[lesson.id] = [];
    });
    tutorSessions.set(lesson.id, {});
    Object.keys(session).forEach((k) => delete session[k]);
    renderLog();
    toastFn("Đã xóa hội thoại của bài này.", "info", 2500);
  });

  renderLog();
  renderStep();

  // Dọn dẹp khi rời trang.
  return () => {
    flushTime();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", flushTime);
    void navigate;
  };
}
