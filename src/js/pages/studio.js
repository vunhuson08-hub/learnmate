// Tạo bộ học tập: câu hỏi trắc nghiệm hoặc thẻ ghi nhớ từ chủ đề nhập vào.
import { icon, alertBox, demoBadge, emptyState, toast as toastFn } from "../ui.js";
import { generateStudySet, DIFFICULTIES } from "../services/generator.js";
import { addActivity } from "../store.js";
import { getSubject } from "../data/lessons.js";
import { esc, uid, timeAgo } from "../utils.js";

export const title = () => "Tạo bộ học tập";

const SUGGESTIONS = ["Phân số", "Thì hiện tại đơn", "Hàm JavaScript", "Câu chủ đề", "Lịch sử Việt Nam"];
const form = { topic: "", kind: "mcq", count: 5, difficulty: "mixed" };

export function render(root, { store }) {
  let current = null; // bộ đang mở
  let mode = "view"; // view | edit | practice
  let practice = null;
  let draft = null; // bản sao khi chỉnh sửa
  let loading = false;
  let pendingDelete = null;

  root.innerHTML = `
  <div class="page">
    <div class="page-header">
      <div><h1>Tạo bộ học tập</h1><p>Nhập một chủ đề, chọn dạng nội dung và để LearnMate soạn bộ luyện tập cho bạn.</p></div>
      ${demoBadge("Chế độ demo – nội dung minh họa")}
    </div>
    <div class="studio-layout">
      <div class="stack">
        <form class="card" id="gen-form" novalidate aria-labelledby="gen-title">
          <h2 id="gen-title">Thiết lập</h2>
          <div class="field">
            <label for="topic">Chủ đề muốn học <span class="req" aria-hidden="true">*</span></label>
            <input id="topic" type="text" maxlength="80" value="${esc(form.topic)}" placeholder="Ví dụ: phần trăm, câu điều kiện if…" aria-describedby="topic-help topic-error" required/>
            <p class="help" id="topic-help">Gợi ý: ${SUGGESTIONS.map((s) => `<button type="button" class="chip" data-sugg="${esc(s)}" style="margin:.15rem .1rem;min-height:28px;padding:.1rem .6rem">${esc(s)}</button>`).join("")}</p>
            <p class="field-error" id="topic-error" aria-live="polite"></p>
          </div>
          <fieldset>
            <legend style="font-size:.92rem">Dạng nội dung</legend>
            <div class="segmented">
              <label><input type="radio" name="kind" value="mcq" ${form.kind === "mcq" ? "checked" : ""}/>Trắc nghiệm</label>
              <label><input type="radio" name="kind" value="flashcard" ${form.kind === "flashcard" ? "checked" : ""}/>Thẻ ghi nhớ</label>
            </div>
          </fieldset>
          <div class="grid grid-2" style="gap:.75rem">
            <div class="field">
              <label for="count">Số lượng</label>
              <select id="count">${[3, 5, 8, 10].map((n) => `<option value="${n}" ${form.count === n ? "selected" : ""}>${n} mục</option>`).join("")}</select>
            </div>
            <div class="field">
              <label for="difficulty">Độ khó</label>
              <select id="difficulty">${Object.entries(DIFFICULTIES).map(([k, v]) => `<option value="${k}" ${form.difficulty === k ? "selected" : ""}>${v}</option>`).join("")}</select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="gen-btn">${icon("sparkle")}Tạo bộ học tập</button>
          <p class="small muted" style="margin:.75rem 0 0">Chế độ demo: nội dung lấy từ ngân hàng bài học có sẵn khi chủ đề khớp; nếu không khớp, LearnMate tạo khung câu hỏi mẫu để bạn tự chỉnh sửa. Chưa dùng AI thật.</p>
        </form>
        <section class="card" aria-labelledby="saved-title">
          <h2 id="saved-title">Bộ đã lưu</h2>
          <div id="saved"></div>
        </section>
      </div>
      <section id="result" aria-live="polite" aria-labelledby="result-title"></section>
    </div>
  </div>`;

  const resultEl = root.querySelector("#result");
  const savedEl = root.querySelector("#saved");
  const genForm = root.querySelector("#gen-form");
  const topicInput = root.querySelector("#topic");

  // ── Danh sách đã lưu ──
  function renderSaved() {
    const sets = store.currentProfile().studySets;
    if (!sets.length) {
      savedEl.innerHTML = `<p class="small muted">Chưa có bộ nào. Bộ bạn tạo sẽ tự động được lưu ở đây.</p>`;
      return;
    }
    savedEl.innerHTML = sets
      .map(
        (s) => `<div class="saved-set">
          <span class="subject-icon tone-${s.kind === "mcq" ? "blue" : "violet"}" style="width:34px;height:34px">${icon(s.kind === "mcq" ? "check" : "layers", { size: 16 })}</span>
          <div style="flex:1;min-width:0"><strong>${esc(s.topic)}</strong><div class="small muted">${s.kind === "mcq" ? "Trắc nghiệm" : "Thẻ ghi nhớ"} · ${s.items.length} mục · ${timeAgo(s.createdAt)}</div></div>
          ${
            pendingDelete === s.id
              ? `<button class="btn btn-danger btn-sm" data-del-yes="${s.id}">Xóa</button><button class="btn btn-ghost btn-sm" data-del-no>Hủy</button>`
              : `<button class="btn btn-secondary btn-sm" data-open="${s.id}">Mở</button><button class="icon-btn" data-del="${s.id}" aria-label="Xóa bộ ${esc(s.topic)}">${icon("trash", { size: 16 })}</button>`
          }
        </div>`,
      )
      .join("");
  }

  savedEl.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.open) {
      const set = store.currentProfile().studySets.find((s) => s.id === t.dataset.open);
      if (set) {
        current = structuredClone(set);
        mode = "view";
        renderResult();
        resultEl.querySelector("h2")?.focus();
      }
    } else if (t.dataset.del) {
      pendingDelete = t.dataset.del;
      renderSaved();
      savedEl.querySelector("[data-del-yes]")?.focus();
    } else if (t.dataset.delYes) {
      const id = t.dataset.delYes;
      store.updateProfile((p) => (p.studySets = p.studySets.filter((s) => s.id !== id)));
      if (current?.id === id) {
        current = null;
        renderResult();
      }
      pendingDelete = null;
      renderSaved();
      toastFn("Đã xóa bộ học tập.", "info", 2500);
    } else if ("delNo" in t.dataset) {
      pendingDelete = null;
      renderSaved();
    }
  });

  // ── Kết quả ──
  function sourceBadge(set) {
    if (set.source === "bank") return `<span class="badge badge-demo">${icon("info", { size: 14 })}Nội dung minh họa · từ thư viện ${esc(getSubject(set.subjectId)?.short || "")}</span>`;
    if (set.source === "template") return `<span class="badge badge-warning">${icon("edit", { size: 14 })}Khung mẫu chung – nên chỉnh sửa</span>`;
    return `<span class="badge badge-info">AI</span>`;
  }

  function renderResult() {
    if (loading) {
      resultEl.innerHTML = `<div class="card"><div class="empty" role="status"><span class="spinner" aria-hidden="true"></span><h3>Đang tạo bộ học tập…</h3><p>Đang chọn nội dung phù hợp với “${esc(form.topic)}”.</p></div></div>`;
      return;
    }
    if (!current) {
      resultEl.innerHTML = `<div class="card">${emptyState({ iconName: "sparkle", title: "Chưa có bộ học tập nào được mở", text: "Nhập chủ đề ở bên trái và bấm “Tạo bộ học tập”, hoặc mở một bộ đã lưu." })}</div>`;
      return;
    }
    if (mode === "edit") return renderEdit();
    if (mode === "practice") return renderPractice();

    const s = current;
    resultEl.innerHTML = `<div class="card">
      <div class="card-header"><div><h2 id="result-title" tabindex="-1">${esc(s.topic)}</h2><div class="small muted">${s.kind === "mcq" ? "Trắc nghiệm" : "Thẻ ghi nhớ"} · ${s.items.length} mục · Độ khó: ${DIFFICULTIES[s.difficulty] || "—"}</div></div>${sourceBadge(s)}</div>
      ${s.note ? alertBox(`<span class="alert-text">${esc(s.note)}</span>`, s.source === "template" ? "warning" : "info") : ""}
      <div class="btn-row" style="margin:1rem 0">
        <button class="btn btn-primary" data-act="practice">${icon(s.kind === "mcq" ? "check" : "flip")}Luyện tập ngay</button>
        <button class="btn btn-secondary" data-act="edit">${icon("edit")}Chỉnh sửa</button>
        <button class="btn btn-secondary" data-act="regen">${icon("retry")}Tạo lại</button>
      </div>
      <div>${s.items
        .map((it, i) =>
          s.kind === "mcq"
            ? `<div class="gen-item"><strong>${i + 1}. ${esc(it.prompt)}</strong><ol type="A">${it.options.map((o, j) => `<li class="${j === it.answer ? "ans" : ""}">${esc(o)}${j === it.answer ? " ✓" : ""}</li>`).join("")}</ol>${it.explanation ? `<p class="small muted" style="margin:0">${esc(it.explanation)}</p>` : ""}<div class="from">Nguồn: ${esc(it.from || "Tự soạn")}</div></div>`
            : `<div class="gen-item"><strong>${i + 1}. ${esc(it.front)}</strong><p style="margin:.35rem 0">${esc(it.back)}</p><div class="from">Nguồn: ${esc(it.from || "Tự soạn")}</div></div>`,
        )
        .join("")}</div>
    </div>`;
  }

  function renderEdit() {
    const s = draft;
    resultEl.innerHTML = `<form class="card" id="edit-form" novalidate>
      <div class="card-header"><h2 id="result-title" tabindex="-1">Chỉnh sửa: ${esc(s.topic)}</h2></div>
      <div id="edit-status" aria-live="polite"></div>
      ${s.items
        .map((it, i) =>
          s.kind === "mcq"
            ? `<fieldset class="gen-item" data-i="${i}"><legend>Câu ${i + 1}</legend>
              <div class="field"><label for="p-${i}">Câu hỏi</label><textarea id="p-${i}" data-k="prompt">${esc(it.prompt)}</textarea></div>
              ${it.options
                .map(
                  (o, j) => `<div class="row" style="flex-wrap:nowrap;margin-bottom:.4rem"><label class="check-inline" style="min-height:auto"><input type="radio" name="ans-${i}" value="${j}" ${it.answer === j ? "checked" : ""} aria-label="Đáp án đúng là ${"ABCD"[j]}"/>${"ABCD"[j]}</label><label class="sr-only" for="o-${i}-${j}">Phương án ${"ABCD"[j]}</label><input id="o-${i}-${j}" type="text" data-opt="${j}" value="${esc(o)}"/></div>`,
                )
                .join("")}
              <div class="field"><label for="e-${i}">Giải thích (không bắt buộc)</label><input id="e-${i}" type="text" data-k="explanation" value="${esc(it.explanation || "")}"/></div>
              <button type="button" class="btn btn-ghost btn-sm" data-remove="${i}">${icon("trash", { size: 16 })}Xóa câu này</button></fieldset>`
            : `<fieldset class="gen-item" data-i="${i}"><legend>Thẻ ${i + 1}</legend>
              <div class="field"><label for="f-${i}">Mặt trước</label><textarea id="f-${i}" data-k="front">${esc(it.front)}</textarea></div>
              <div class="field"><label for="b-${i}">Mặt sau</label><textarea id="b-${i}" data-k="back">${esc(it.back)}</textarea></div>
              <button type="button" class="btn btn-ghost btn-sm" data-remove="${i}">${icon("trash", { size: 16 })}Xóa thẻ này</button></fieldset>`,
        )
        .join("")}
      <div class="btn-row" style="margin-top:1rem">
        <button type="button" class="btn btn-secondary" id="add-item">${icon("plus")}Thêm ${s.kind === "mcq" ? "câu hỏi" : "thẻ"}</button>
        <span class="spacer"></span>
        <button type="button" class="btn btn-ghost" id="cancel-edit">Hủy</button>
        <button type="submit" class="btn btn-primary">${icon("save")}Lưu thay đổi</button>
      </div>
    </form>`;
  }

  function readDraftFromForm() {
    const f = resultEl.querySelector("#edit-form");
    f.querySelectorAll("fieldset[data-i]").forEach((fs) => {
      const i = Number(fs.dataset.i);
      const it = draft.items[i];
      fs.querySelectorAll("[data-k]").forEach((el) => (it[el.dataset.k] = el.value));
      if (draft.kind === "mcq") {
        fs.querySelectorAll("[data-opt]").forEach((el) => (it.options[Number(el.dataset.opt)] = el.value));
        const checked = fs.querySelector(`input[name="ans-${i}"]:checked`);
        it.answer = checked ? Number(checked.value) : it.answer;
      }
    });
  }

  function renderPractice() {
    const s = current;
    const P = practice;
    if (P.i >= s.items.length) {
      resultEl.innerHTML = `<div class="card"><h2 id="result-title" tabindex="-1">Hoàn thành luyện tập!</h2>
        <p class="summary-score">${s.kind === "mcq" ? `${P.score}/${s.items.length}` : `${P.known}/${s.items.length}`}</p>
        <p class="muted">${s.kind === "mcq" ? "câu đúng ngay lần chọn đầu tiên" : "thẻ bạn đánh dấu “Đã nhớ”"}</p>
        <div class="btn-row"><button class="btn btn-primary" data-act="practice">${icon("retry")}Luyện lại</button><button class="btn btn-secondary" data-act="back">Về bộ học tập</button></div></div>`;
      return;
    }
    const it = s.items[P.i];
    const head = `<div class="card-header"><h2 id="result-title" tabindex="-1">Luyện tập: ${esc(s.topic)}</h2><span class="small muted">${P.i + 1}/${s.items.length}</span></div>`;
    if (s.kind === "mcq") {
      const answered = P.chosen != null;
      resultEl.innerHTML = `<div class="card">${head}
        <p class="q-prompt">${esc(it.prompt)}</p>
        <div class="options" role="group" aria-label="Các phương án">
          ${it.options.map((o, j) => `<button class="option ${answered && j === it.answer ? "is-correct" : answered && j === P.chosen ? "is-wrong" : ""}" data-choose="${j}" ${answered ? 'aria-disabled="true"' : ""} style="text-align:left;font:inherit;color:inherit"><span class="opt-key">${"ABCD"[j]}</span><span>${esc(o)}</span></button>`).join("")}
        </div>
        <div aria-live="polite">${answered ? alertBox(P.chosen === it.answer ? `<span class="title">Chính xác!</span><span class="alert-text">${esc(it.explanation || "")}</span>` : `<span class="title">Chưa đúng. Đáp án: ${esc(it.options[it.answer])}</span><span class="alert-text">${esc(it.explanation || "")}</span>`, P.chosen === it.answer ? "success" : "error") : ""}</div>
        <div class="step-nav"><button class="btn btn-ghost" data-act="back">${icon("x")}Dừng luyện tập</button><button class="btn btn-primary" data-act="next" ${answered ? "" : 'aria-disabled="true"'}>${P.i + 1 < s.items.length ? "Câu tiếp" : "Xem kết quả"}${icon("arrowRight")}</button></div>
        ${answered ? "" : `<p class="small muted" id="practice-note" style="text-align:right;margin:.5rem 0 0">Chọn một phương án để tiếp tục.</p>`}
      </div>`;
    } else {
      resultEl.innerHTML = `<div class="card">${head}
        <button class="flashcard ${P.flipped ? "back" : ""}" data-act="flip" aria-label="${P.flipped ? "Mặt sau" : "Mặt trước"} – bấm để lật thẻ"><span><small>${P.flipped ? "Mặt sau" : "Mặt trước · bấm để lật"}</small>${esc(P.flipped ? it.back : it.front)}</span></button>
        <div class="step-nav">
          <button class="btn btn-ghost" data-act="back">${icon("x")}Dừng</button>
          <div class="btn-row">${P.flipped ? `<button class="btn btn-secondary" data-act="unknown">Chưa nhớ</button><button class="btn btn-primary" data-act="known">${icon("check")}Đã nhớ</button>` : `<button class="btn btn-primary" data-act="flip">${icon("flip")}Lật thẻ</button>`}</div>
        </div></div>`;
    }
  }

  resultEl.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const act = t.dataset.act;
    if (act === "practice") {
      practice = { i: 0, chosen: null, score: 0, flipped: false, known: 0 };
      mode = "practice";
      renderResult();
      resultEl.querySelector("h2")?.focus();
    } else if (act === "edit") {
      draft = structuredClone(current);
      mode = "edit";
      renderResult();
      resultEl.querySelector("h2")?.focus();
    } else if (act === "regen") {
      Object.assign(form, { topic: current.topic, kind: current.kind, difficulty: current.difficulty || "mixed", count: Math.max(3, current.items.length) });
      generate(current.id);
    } else if (act === "back") {
      mode = "view";
      renderResult();
      resultEl.querySelector("h2")?.focus();
    } else if (act === "flip") {
      practice.flipped = !practice.flipped;
      renderResult();
      resultEl.querySelector(".flashcard")?.focus();
    } else if (act === "known" || act === "unknown") {
      if (act === "known") practice.known++;
      practice.i++;
      practice.flipped = false;
      renderResult();
      resultEl.querySelector(".flashcard, h2")?.focus();
    } else if (act === "next") {
      if (practice.chosen == null) {
        const note = resultEl.querySelector("#practice-note");
        if (note) note.innerHTML = `<strong style="color:var(--warning)">Hãy chọn một phương án trước.</strong>`;
        return;
      }
      practice.i++;
      practice.chosen = null;
      renderResult();
      resultEl.querySelector("h2")?.focus();
    } else if (t.dataset.choose != null && practice && practice.chosen == null) {
      practice.chosen = Number(t.dataset.choose);
      if (practice.chosen === current.items[practice.i].answer) practice.score++;
      renderResult();
      resultEl.querySelector('[data-act="next"]')?.focus();
    } else if (t.dataset.remove != null) {
      readDraftFromForm();
      draft.items.splice(Number(t.dataset.remove), 1);
      renderEdit();
    } else if (t.id === "add-item") {
      readDraftFromForm();
      draft.items.push(draft.kind === "mcq" ? { id: uid("it"), prompt: "", options: ["", "", "", ""], answer: 0, explanation: "", from: "Tự soạn" } : { id: uid("it"), front: "", back: "", from: "Tự soạn" });
      renderEdit();
      const last = resultEl.querySelectorAll("fieldset[data-i]");
      last[last.length - 1]?.querySelector("textarea")?.focus();
    } else if (t.id === "cancel-edit") {
      draft = null;
      mode = "view";
      renderResult();
    }
  });

  resultEl.addEventListener("submit", (e) => {
    if (e.target.id !== "edit-form") return;
    e.preventDefault();
    readDraftFromForm();
    const status = resultEl.querySelector("#edit-status");
    if (!draft.items.length) {
      status.innerHTML = alertBox("Bộ học tập cần ít nhất 1 mục.", "error");
      return;
    }
    const bad = draft.items.findIndex((it) => (draft.kind === "mcq" ? !it.prompt.trim() || it.options.some((o) => !o.trim()) : !it.front.trim() || !it.back.trim()));
    if (bad >= 0) {
      status.innerHTML = alertBox(`Mục ${bad + 1} còn trống. Hãy điền đầy đủ ${draft.kind === "mcq" ? "câu hỏi và 4 phương án" : "mặt trước và mặt sau"}.`, "error");
      resultEl.querySelector(`fieldset[data-i="${bad}"] textarea`)?.focus();
      return;
    }
    current = draft;
    draft = null;
    persist(current);
    mode = "view";
    renderResult();
    toastFn("Đã lưu thay đổi.", "success");
  });

  function persist(set) {
    store.updateProfile((p) => {
      const idx = p.studySets.findIndex((s) => s.id === set.id);
      if (idx >= 0) p.studySets[idx] = structuredClone(set);
      else p.studySets.unshift(structuredClone(set));
      p.studySets = p.studySets.slice(0, 30);
    });
    renderSaved();
  }

  // ── Tạo bộ ──
  async function generate(replaceId = null) {
    if (loading) return;
    loading = true;
    mode = "view";
    const btn = root.querySelector("#gen-btn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Đang tạo…`;
    renderResult();
    let res;
    try {
      res = await generateStudySet(form);
    } catch (err) {
      console.error(err);
      res = { ok: false, error: "Đã có lỗi khi tạo nội dung. Vui lòng thử lại." };
    }
    loading = false;
    if (!root.isConnected) return;
    btn.disabled = false;
    btn.innerHTML = `${icon("sparkle")}Tạo bộ học tập`;
    if (!res.ok) {
      current = null;
      resultEl.innerHTML = `<div class="card">${alertBox(esc(res.error), "error")}</div>`;
      return;
    }
    if (replaceId) res.set.id = replaceId;
    current = res.set;
    persist(current);
    store.updateProfile((p) => addActivity(p, { type: "studyset", text: `Tạo bộ ${current.kind === "mcq" ? "trắc nghiệm" : "thẻ ghi nhớ"} “${current.topic}” (${current.items.length} mục)` }));
    renderResult();
    resultEl.querySelector("h2")?.focus();
    toastFn(`Đã tạo ${current.items.length} ${current.kind === "mcq" ? "câu hỏi" : "thẻ"} cho “${current.topic}”.`, "success");
  }

  genForm.addEventListener("submit", (e) => {
    e.preventDefault();
    form.topic = topicInput.value.trim();
    form.kind = genForm.querySelector('input[name="kind"]:checked')?.value || "mcq";
    form.count = Number(root.querySelector("#count").value);
    form.difficulty = root.querySelector("#difficulty").value;
    const err = root.querySelector("#topic-error");
    if (form.topic.length < 2) {
      err.textContent = "Vui lòng nhập chủ đề (ít nhất 2 ký tự).";
      topicInput.setAttribute("aria-invalid", "true");
      topicInput.focus();
      return;
    }
    err.textContent = "";
    topicInput.setAttribute("aria-invalid", "false");
    generate();
  });
  root.querySelectorAll("[data-sugg]").forEach((b) =>
    b.addEventListener("click", () => {
      topicInput.value = b.dataset.sugg;
      topicInput.focus();
    }),
  );

  renderSaved();
  renderResult();
}
