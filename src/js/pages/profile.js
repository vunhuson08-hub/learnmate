// Hồ sơ và cài đặt.
import { icon, field, setFieldError, alertBox } from "../ui.js";
import { SUBJECTS, LEVELS } from "../data/lessons.js";
import { OBJECTIVES } from "./onboarding.js";
import { addActivity } from "../store.js";
import { esc, isValidEmail } from "../utils.js";
import * as mailer from "../services/mailer.js";

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

      <form class="card settings-section" id="notify-form" novalidate aria-labelledby="nt-title">
        <h2 id="nt-title">${icon("mail")} Thông báo qua email</h2>
        <p class="muted" id="nt-intro">Nhận kết quả bài học và báo cáo quá trình học tập qua email – cho bạn, phụ huynh hoặc giáo viên.</p>
        <div id="nt-server" aria-live="polite"></div>
        ${field({ id: "notifyEmail", label: "Email nhận thông báo", type: "email", autocomplete: "email", value: p.notify?.email || p.email || "", placeholder: "ban@vidu.com", help: "Có thể là email của bạn, phụ huynh hoặc giáo viên." })}
        <div class="notify-opts" role="group" aria-label="Loại thông báo">
          <label><input type="checkbox" id="nt-lesson" ${p.notify?.onLesson !== false ? "checked" : ""}/><span><strong>Kết quả sau mỗi bài học</strong><br><span class="small muted">Điểm, kết quả từng câu, câu cần xem lại – gửi ngay khi hoàn thành bài.</span></span></label>
          <label><input type="checkbox" id="nt-weekly" ${p.notify?.weekly !== false ? "checked" : ""}/><span><strong>Báo cáo quá trình học hằng tuần</strong><br><span class="small muted">Tổng hợp tiến độ, thời gian học, chủ đề mạnh/cần ôn – gửi vào tối Chủ nhật.</span></span></label>
        </div>
        <p class="small muted" style="margin-top:0">${p.notify?.lastSentAt ? `Lần gửi gần nhất: ${new Date(p.notify.lastSentAt).toLocaleString("vi-VN")}` : "Chưa gửi email nào."}</p>
        <div class="btn-row"><button type="submit" class="btn btn-primary">${icon("save")}Lưu cài đặt thông báo</button><a class="btn btn-secondary" href="#progress" data-report-focus>${icon("mail")}Gửi báo cáo ngay</a></div>
      </form>

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

    const nform = root.querySelector("#notify-form");
    const ntServer = root.querySelector("#nt-server");
    const showServer = (info, st, note = "") => {
      if (!info) {
        ntServer.innerHTML = `<p class="small muted notify-status" style="background:color-mix(in srgb, currentColor 5%, transparent)">${icon("info", { size: 16 })} Chế độ thủ công: phiên bản này không kết nối máy chủ gửi email, nên LearnMate soạn sẵn email để bạn bấm Gửi trong Gmail.</p>`;
        return;
      }
      if (!info.mail) {
        ntServer.innerHTML = `<p class="small notify-status alert-warning">${icon("alert", { size: 16 })} Máy chủ chưa được cấu hình dịch vụ gửi email. Tạm thời dùng cách gửi thủ công.</p>`;
        return;
      }
      const s = st?.status || {};
      const to = esc(mailer.recipient(store.currentProfile()));
      if (s.verified) {
        ntServer.innerHTML = `<p class="small notify-status alert-success">${icon("check", { size: 16 })} <strong>Tự động gửi đang bật</strong> tới <strong>${to}</strong>.${note} <button type="button" class="btn btn-ghost btn-sm" id="nt-off" style="min-height:28px">Ngừng nhận</button></p>`;
      } else if (s.subscribed) {
        ntServer.innerHTML = `<p class="small notify-status alert-info">${icon("mail", { size: 16 })} Đã gửi email xác nhận tới <strong>${to}</strong>. Mở hộp thư (kiểm tra cả mục Spam) và bấm liên kết để bật tự động gửi.${note} <button type="button" class="btn btn-ghost btn-sm" id="nt-resend" style="min-height:28px">Gửi lại email xác nhận</button> <button type="button" class="btn btn-ghost btn-sm" id="nt-check" style="min-height:28px">Tôi đã xác nhận</button></p>`;
      } else {
        ntServer.innerHTML = `<p class="small notify-status alert-info">${icon("info", { size: 16 })} Nhập email rồi bấm <strong>Lưu</strong>: LearnMate sẽ gửi một email xác nhận, sau đó tự động gửi kết quả và báo cáo.${note}</p>`;
      }
      ntServer.querySelector("#nt-resend")?.addEventListener("click", async (e) => {
        e.target.disabled = true;
        const r = await mailer.syncSubscription(store, { resend: true });
        if (r && r.ok) toast("Đã gửi lại email xác nhận.", "success");
        else toast((r && r.error) || "Không gửi được email xác nhận.", "error");
        showServer(info, r && r.status ? r : st);
      });
      ntServer.querySelector("#nt-check")?.addEventListener("click", async () => {
        const r = await mailer.fetchStatus(store);
        showServer(info, r);
        toast(r?.status?.verified ? "Đã xác nhận – email sẽ được gửi tự động." : "Chưa thấy xác nhận. Hãy bấm liên kết trong email.", r?.status?.verified ? "success" : "info");
      });
      ntServer.querySelector("#nt-off")?.addEventListener("click", async () => {
        await mailer.unsubscribe(store);
        toast("Đã ngừng gửi email tự động.", "info");
        showServer(info, { status: { subscribed: false, verified: false } });
      });
    };
    mailer.serverInfo().then(async (info) => {
      if (!nform.isConnected) return;
      showServer(info, info && info.mail ? await mailer.fetchStatus(store) : null);
    });

    nform.addEventListener("submit", async (e) => {
      e.preventDefault();
      const em = nform.querySelector("#notifyEmail").value.trim().toLowerCase();
      if (em && !isValidEmail(em)) {
        setFieldError(nform, "notifyEmail", "Email chưa đúng định dạng, ví dụ: ban@vidu.com");
        nform.querySelector("#notifyEmail").focus();
        return;
      }
      setFieldError(nform, "notifyEmail", "");
      const oldEmail = mailer.recipient(store.currentProfile());
      const wasSubscribed = !!store.currentProfile().notify?.subscribed;
      store.updateProfile((pp) => {
        pp.notify = { ...(pp.notify || {}), email: em, onLesson: nform.querySelector("#nt-lesson").checked, weekly: nform.querySelector("#nt-weekly").checked };
        if (em !== oldEmail) { pp.notify.verified = false; pp.notify.subscribed = false; }
      });
      const info = await mailer.serverInfo();
      if (!info || !info.mail) {
        toast(em ? `Đã lưu. Email sẽ được soạn sẵn gửi tới ${em}.` : "Đã lưu. Hãy nhập email để nhận thông báo.", "success");
        return;
      }
      if (wasSubscribed && oldEmail && em !== oldEmail) await mailer.unsubscribe(store, oldEmail);
      if (!em) { toast("Đã lưu. Hãy nhập email để nhận thông báo.", "info"); showServer(info, null); return; }
      const r = await mailer.syncSubscription(store);
      if (!r || !r.ok) {
        toast((r && r.error) || "Không kết nối được máy chủ email.", "error");
        if (r && r.status) showServer(info, r);
        return;
      }
      toast(r.status?.verified ? "Đã lưu cài đặt thông báo." : r.verificationSent ? `Đã gửi email xác nhận tới ${em}.` : "Đã lưu. Đang chờ bạn xác nhận email.", "success");
      showServer(info, r);
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
