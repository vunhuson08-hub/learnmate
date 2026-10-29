// Hồ sơ và cài đặt.
import { icon, field, setFieldError, alertBox } from "../ui.js";
import { SUBJECTS, LEVELS } from "../data/lessons.js";
import { OBJECTIVES } from "./onboarding.js";
import { addActivity } from "../store.js";
import { esc } from "../utils.js";

export const title = () => "Hồ sơ và cài đặt";

export function render(root, ctx) {
  const { store, navigate, toast, seedDemoProfile, rerender } = ctx;
  const p = store.currentProfile();
  const theme = store.getState().theme;
  let confirming = null; // "reset" | "wipe"

  const opt = (v, cur, label) => `<option value="${v}" ${String(cur) === String(v) ? "selected" : ""}>${label}</option>`;

  function draw() {
    root.innerHTML = `
    <div class="page" style="max-width:820px">
      <div class="page-header"><div><h1>Hồ sơ và cài đặt</h1><p>${p.isDemo ? "Bạn đang ở chế độ dùng thử." : `Tài khoản demo: ${esc(p.email)}`}</p></div></div>

      <form class="card settings-section" id="profile-form" novalidate aria-labelledby="pf-title">
        <h2 id="pf-title">Thông tin và mục tiêu</h2>
        ${field({ id: "displayName", label: "Tên hiển thị", value: p.name, autocomplete: "nickname", required: true })}
        <div class="grid grid-2" style="gap:0 1rem">
          <div class="field"><label for="goalSubject">Môn học mục tiêu</label><select id="goalSubject">${SUBJECTS.map((s) => opt(s.id, p.goal.subjectId, esc(s.name))).join("")}</select></div>
          <div class="field"><label for="goalLevel">Trình độ</label><select id="goalLevel">${Object.entries(LEVELS).map(([k, v]) => opt(k, p.goal.level, v)).join("")}</select></div>
          <div class="field"><label for="goalObjective">Mục tiêu học tập</label><select id="goalObjective">${OBJECTIVES.map((o) => opt(o.id, p.goal.objective, o.label)).join("")}</select></div>
          <div class="field"><label for="sessions">Số buổi mỗi tuần</label><select id="sessions">${[1, 2, 3, 4, 5, 6, 7].map((n) => opt(n, p.goal.sessionsPerWeek, `${n} buổi`)).join("")}</select></div>
          <div class="field"><label for="minutes">Thời lượng mỗi buổi</label><select id="minutes">${[10, 15, 20, 30, 45, 60].map((n) => opt(n, p.goal.minutesPerSession, `${n} phút`)).join("")}</select></div>
          <div class="field"><span class="label">Thời gian học mỗi tuần</span><p style="margin:0;min-height:44px;display:flex;align-items:center" id="weekly-total"><strong>${p.goal.sessionsPerWeek * p.goal.minutesPerSession} phút</strong></p></div>
        </div>
        <div id="pf-status" aria-live="polite"></div>
        <div class="btn-row"><button type="submit" class="btn btn-primary">${icon("save")}Lưu thay đổi</button><a class="btn btn-ghost" href="#onboarding">Thiết lập lại từ đầu</a></div>
      </form>

      <section class="card settings-section" aria-labelledby="ap-title">
        <h2 id="ap-title">Giao diện</h2>
        <div class="segmented" role="radiogroup" aria-label="Chọn giao diện">
          <label><input type="radio" name="theme" value="light" ${theme === "light" ? "checked" : ""}/>${icon("sun", { size: 16 })}&nbsp;Sáng</label>
          <label><input type="radio" name="theme" value="dark" ${theme === "dark" ? "checked" : ""}/>${icon("moon", { size: 16 })}&nbsp;Tối</label>
        </div>
      </section>

      <section class="card settings-section" aria-labelledby="dt-title">
        <h2 id="dt-title">Dữ liệu và quyền riêng tư</h2>
        <p class="muted">LearnMate bản MVP lưu mọi dữ liệu trong trình duyệt này (localStorage). Không có dữ liệu nào được gửi lên máy chủ. Mật khẩu không bao giờ được lưu.</p>
        <div class="btn-row">
          <button class="btn btn-secondary" id="logout">${icon("logout")}${p.isDemo ? "Thoát chế độ demo" : "Đăng xuất"}</button>
        </div>
      </section>

      <section class="card settings-section danger-zone" aria-labelledby="dz-title">
        <h2 id="dz-title">Xóa dữ liệu</h2>
        <div class="stack" style="gap:.75rem">
          <div>
            <p style="margin-bottom:.5rem"><strong>${p.isDemo ? "Xóa dữ liệu demo" : "Xóa tiến độ học tập"}</strong><br><span class="small muted">${p.isDemo ? "Đặt lại tiến độ, hội thoại, bộ học tập và khôi phục bộ dữ liệu minh họa ban đầu." : "Xóa tiến độ, hội thoại và bộ học tập của tài khoản này. Giữ lại tên và email."}</span></p>
            ${confirming === "reset" ? confirmBox("reset") : `<button class="btn btn-danger" id="ask-reset">${icon("trash")}${p.isDemo ? "Xóa dữ liệu demo" : "Xóa tiến độ"}</button>`}
          </div>
          <div>
            <p style="margin-bottom:.5rem"><strong>Xóa toàn bộ dữ liệu LearnMate trong trình duyệt</strong><br><span class="small muted">Xóa mọi tài khoản demo, tiến độ và cài đặt. Bạn sẽ được đưa về trang giới thiệu.</span></p>
            ${confirming === "wipe" ? confirmBox("wipe") : `<button class="btn btn-danger" id="ask-wipe">${icon("trash")}Xóa toàn bộ</button>`}
          </div>
        </div>
      </section>
    </div>`;
    bind();
  }

  function confirmBox(kind) {
    return alertBox(
      `<span class="alert-text">Thao tác này <strong>không thể hoàn tác</strong>. Bạn chắc chắn chứ?</span><div class="btn-row" style="margin-top:.5rem"><button class="btn btn-danger btn-sm" id="confirm-${kind}">Xác nhận xóa</button><button class="btn btn-ghost btn-sm" id="cancel-confirm">Hủy</button></div>`,
      "warning",
    );
  }

  function bind() {
    const form = root.querySelector("#profile-form");
    const updateTotal = () => {
      root.querySelector("#weekly-total").innerHTML = `<strong>${Number(form.querySelector("#sessions").value) * Number(form.querySelector("#minutes").value)} phút</strong>`;
    };
    form.querySelector("#sessions").addEventListener("change", updateTotal);
    form.querySelector("#minutes").addEventListener("change", updateTotal);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#displayName").value.trim();
      if (!name || name.length > 40) {
        setFieldError(form, "displayName", !name ? "Tên hiển thị không được để trống." : "Tên tối đa 40 ký tự.");
        form.querySelector("#displayName").focus();
        return;
      }
      setFieldError(form, "displayName", "");
      const subjectChanged = form.querySelector("#goalSubject").value !== p.goal.subjectId;
      store.updateProfile((pp) => {
        pp.name = name;
        pp.goal = {
          subjectId: form.querySelector("#goalSubject").value,
          level: form.querySelector("#goalLevel").value,
          objective: form.querySelector("#goalObjective").value,
          sessionsPerWeek: Number(form.querySelector("#sessions").value),
          minutesPerSession: Number(form.querySelector("#minutes").value),
        };
        if (subjectChanged) addActivity(pp, { type: "goal", text: `Đổi mục tiêu sang ${SUBJECTS.find((s) => s.id === pp.goal.subjectId).name}` });
      });
      toast("Đã lưu hồ sơ và mục tiêu.", "success");
      rerender(); // cập nhật avatar trên thanh trên cùng
    });

    root.querySelectorAll('input[name="theme"]').forEach((r) =>
      r.addEventListener("change", () => {
        store.setTheme(r.value);
        document.documentElement.dataset.theme = r.value;
        rerender();
      }),
    );

    root.querySelector("#logout").addEventListener("click", () => {
      store.logout();
      toast(p.isDemo ? "Đã thoát chế độ demo. Dữ liệu demo vẫn được giữ trên trình duyệt." : "Đã đăng xuất.", "info");
      navigate("home");
    });

    root.querySelector("#ask-reset")?.addEventListener("click", () => {
      confirming = "reset";
      draw();
      root.querySelector("#confirm-reset").focus();
    });
    root.querySelector("#ask-wipe")?.addEventListener("click", () => {
      confirming = "wipe";
      draw();
      root.querySelector("#confirm-wipe").focus();
    });
    root.querySelector("#cancel-confirm")?.addEventListener("click", () => {
      confirming = null;
      draw();
    });
    root.querySelector("#confirm-reset")?.addEventListener("click", () => {
      store.resetCurrentProfileData(seedDemoProfile);
      toast("Đã xóa dữ liệu. Hãy thiết lập lại mục tiêu học tập.", "success");
      navigate("onboarding");
    });
    root.querySelector("#confirm-wipe")?.addEventListener("click", () => {
      store.wipeAll();
      document.documentElement.dataset.theme = "light";
      toast("Đã xóa toàn bộ dữ liệu LearnMate trong trình duyệt.", "success");
      navigate("home");
    });
  }

  draw();
}
