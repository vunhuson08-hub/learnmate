// Đăng nhập / Đăng ký (DEMO – không có máy chủ, không lưu mật khẩu).
import { icon, field, setFieldError, alertBox } from "../ui.js";
import { isValidEmail, esc } from "../utils.js";

export const title = (ctx) => (ctx.route === "register" ? "Đăng ký" : "Đăng nhập");

export function render(root, { store, navigate, route, seedDemoProfile, toast }) {
  const isRegister = route === "register";

  root.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <a href="#home" class="brand" style="margin-bottom:1rem">${icon("logo", { size: 28 })}<span>LearnMate</span></a>
      <div class="card">
        <nav class="tabs" aria-label="Chọn đăng nhập hoặc đăng ký">
          <a class="tab" href="#login" ${!isRegister ? 'aria-current="page"' : ""}>Đăng nhập</a>
          <a class="tab" href="#register" ${isRegister ? 'aria-current="page"' : ""}>Đăng ký</a>
        </nav>
        <h1 style="font-size:1.35rem">${isRegister ? "Tạo tài khoản demo" : "Chào mừng bạn quay lại"}</h1>
        <div style="margin-bottom:1rem">${alertBox(
          `<strong>Đăng nhập demo.</strong> <span class="alert-text">Chưa có máy chủ xác thực: tài khoản chỉ lưu tên và email trên trình duyệt này, <strong>mật khẩu không được lưu hay kiểm tra</strong>. Vui lòng không dùng mật khẩu thật.</span>`,
          "demo",
        )}</div>
        <form id="auth-form" novalidate>
          ${isRegister ? field({ id: "name", label: "Tên hiển thị", autocomplete: "name", placeholder: "Ví dụ: Minh Anh", required: true }) : ""}
          ${field({ id: "email", label: "Email", type: "email", autocomplete: "email", placeholder: "ban@vidu.com", required: true })}
          ${field({ id: "password", label: "Mật khẩu", type: "password", autocomplete: isRegister ? "new-password" : "current-password", help: "Tối thiểu 8 ký tự.", required: true })}
          <div id="form-status" aria-live="polite"></div>
          <button type="submit" class="btn btn-primary btn-block">${isRegister ? "Tạo tài khoản" : "Đăng nhập"}</button>
        </form>
        <div class="divider">hoặc</div>
        <button class="btn btn-secondary btn-block" id="try-demo">${icon("sparkle")}Dùng thử không cần tài khoản</button>
        <p class="small muted" style="margin:.75rem 0 0;text-align:center">Chế độ dùng thử có sẵn dữ liệu minh họa để bạn xem nhanh mọi tính năng.</p>
      </div>
      <p class="small" style="text-align:center;margin-top:1rem"><a href="#home">← Về trang giới thiệu</a></p>
    </div>
  </div>`;

  const form = root.querySelector("#auth-form");
  const status = root.querySelector("#form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.innerHTML = "";
    const data = Object.fromEntries(new FormData(form));
    let firstInvalid = null;
    const fail = (id, msg) => {
      setFieldError(form, id, msg);
      if (msg && !firstInvalid) firstInvalid = id;
    };

    if (isRegister) {
      const name = (data.name || "").trim();
      fail("name", !name ? "Vui lòng nhập tên hiển thị." : name.length > 40 ? "Tên tối đa 40 ký tự." : "");
    }
    const email = (data.email || "").trim();
    fail("email", !email ? "Vui lòng nhập email." : !isValidEmail(email) ? "Email chưa đúng định dạng, ví dụ: ban@vidu.com" : "");
    const pw = data.password || "";
    fail("password", !pw ? "Vui lòng nhập mật khẩu." : pw.length < 8 ? `Mật khẩu cần tối thiểu 8 ký tự (hiện có ${pw.length}).` : "");

    if (firstInvalid) {
      status.innerHTML = alertBox("Vui lòng kiểm tra lại các trường được đánh dấu.", "error");
      form.querySelector(`#${firstInvalid}`).focus();
      return;
    }

    const result = isRegister ? store.register({ name: data.name, email }) : store.login({ email });
    if (!result.ok) {
      status.innerHTML = alertBox(esc(result.error), "error");
      return;
    }
    toast(isRegister ? `Tạo tài khoản thành công. Chào ${result.profile.name}!` : `Đăng nhập thành công. Chào mừng ${result.profile.name} quay lại!`, "success");
    navigate(result.profile.onboarded ? "dashboard" : "onboarding");
  });

  root.querySelector("#try-demo").addEventListener("click", () => {
    const p = store.startDemo(seedDemoProfile);
    toast("Đã vào chế độ dùng thử. Dữ liệu chỉ lưu trên trình duyệt này.", "success");
    navigate(p.onboarded ? "dashboard" : "onboarding");
  });
}
