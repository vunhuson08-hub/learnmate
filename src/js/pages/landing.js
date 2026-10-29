// Trang giới thiệu.
import { icon } from "../ui.js";
import { SUBJECTS, LESSONS } from "../data/lessons.js";

export const title = () => "Gia sư học tập cá nhân";

export function render(root, { store, navigate, seedDemoProfile, toast }) {
  const prof = store.currentProfile();
  const primaryCta = prof
    ? `<a class="btn btn-primary btn-lg" href="#${prof.onboarded ? "dashboard" : "onboarding"}">${icon("arrowRight")}Tiếp tục học</a>`
    : `<a class="btn btn-primary btn-lg" href="#login">Bắt đầu học ${icon("arrowRight")}</a>`;
  const demoCta = prof ? "" : `<button class="btn btn-secondary btn-lg" data-action="demo">Dùng thử không cần tài khoản</button>`;

  root.innerHTML = `
  <header class="landing-nav">
    <a href="#home" class="brand">${icon("logo", { size: 28 })}<span>LearnMate</span></a>
    <nav aria-label="Điều hướng trang giới thiệu">
      <a class="btn btn-ghost btn-sm hide-sm" href="#benefits">Lợi ích</a>
      <a class="btn btn-ghost btn-sm hide-sm" href="#how">Cách học</a>
      ${prof ? `<a class="btn btn-secondary btn-sm" href="#dashboard">Vào bảng học</a>` : `<a class="btn btn-secondary btn-sm" href="#login">Đăng nhập</a>`}
    </nav>
  </header>

  <section class="hero" aria-labelledby="hero-title">
    <div>
      <span class="eyebrow">${icon("sparkle", { size: 16 })} Gia sư học tập cá nhân</span>
      <h1 id="hero-title">Học đúng trình độ, <span class="accent">hỏi lúc nào cũng được</span>.</h1>
      <p class="lead">LearnMate tạo lộ trình theo mục tiêu của bạn, cho bài tập có phản hồi ngay theo từng câu trả lời, có gia sư ảo giải thích lại khi bạn chưa hiểu, và chỉ ra phần nào cần ôn.</p>
      <div class="btn-row">${primaryCta}${demoCta}</div>
      <p class="hero-note">Bản trình diễn (MVP): dữ liệu lưu trên trình duyệt của bạn, gia sư ảo chạy ở chế độ demo.</p>
    </div>
    <div class="preview" aria-label="Xem trước giao diện bài học">
      <span class="badge badge-muted preview-tag">Xem trước giao diện</span>
      <div class="preview-card">
        <div class="row"><span class="subject-icon tone-green">${icon("calc")}</span><div><strong>Phân số và phép cộng phân số</strong><div class="small muted">Câu 1/3 · Cơ bản</div></div></div>
        <div class="lesson-progress"><div class="progress" aria-hidden="true"><span style="width:55%"></span></div><span class="count">55%</span></div>
        <p class="preview-q">2/7 + 3/7 = ?</p>
        <div class="preview-opt">5/14</div>
        <div class="preview-opt ok">✓ 5/7 – Chính xác!</div>
        <div class="preview-bubble"><strong>Gia sư:</strong> Cùng mẫu thì giữ mẫu 7 và cộng tử: 2 + 3 = 5. Muốn thử câu khó hơn không?</div>
      </div>
    </div>
  </section>

  <section class="section" id="benefits" aria-labelledby="benefits-title">
    <div class="section-title">
      <h2 id="benefits-title">Ba điều LearnMate làm cho bạn</h2>
      <p>Thiết kế cho người tự học, kể cả khi bạn chưa quen học trực tuyến.</p>
    </div>
    <div class="grid grid-3">
      <article class="card benefit">
        <span class="subject-icon tone-blue">${icon("target")}</span>
        <h3>Lộ trình theo mục tiêu</h3>
        <p>Chọn môn, trình độ và thời gian rảnh; LearnMate sắp xếp bài học theo đúng thứ tự cần học.</p>
      </article>
      <article class="card benefit">
        <span class="subject-icon tone-green">${icon("check")}</span>
        <h3>Phản hồi ngay từng câu</h3>
        <p>Trả lời sai sẽ nhận gợi ý phù hợp với chính lỗi đó, rồi được thử lại thay vì chỉ thấy chữ “Sai”.</p>
      </article>
      <article class="card benefit">
        <span class="subject-icon tone-violet">${icon("bot")}</span>
        <h3>Gia sư ảo hiểu ngữ cảnh</h3>
        <p>Hỏi ngay trong bài: xin giải thích đơn giản hơn, ví dụ khác, gợi ý từng bước hoặc câu đố thêm.</p>
      </article>
    </div>
  </section>

  <section class="section" id="how" aria-labelledby="how-title">
    <div class="section-title">
      <h2 id="how-title">Học trong 4 bước</h2>
      <p>Hiện có ${SUBJECTS.length} nhóm chủ đề với ${LESSONS.length} bài học mẫu.</p>
    </div>
    <ol class="steps-list">
      <li><strong>Đặt mục tiêu</strong><p class="small muted">Chọn môn, trình độ, số buổi mỗi tuần.</p></li>
      <li><strong>Học từng phần ngắn</strong><p class="small muted">Nội dung chia nhỏ, kèm ví dụ cụ thể.</p></li>
      <li><strong>Luyện tập và hỏi gia sư</strong><p class="small muted">Gợi ý, thử lại, xem giải thích.</p></li>
      <li><strong>Xem tiến độ và ôn tập</strong><p class="small muted">Biết rõ phần mạnh và phần cần ôn.</p></li>
    </ol>
  </section>

  <section class="cta-band">
    <h2>Sẵn sàng học thử?</h2>
    <p class="muted">Không cần tạo tài khoản. Bạn có thể xóa dữ liệu demo bất cứ lúc nào trong phần Hồ sơ.</p>
    <div class="btn-row" style="justify-content:center">${prof ? primaryCta : `<button class="btn btn-primary btn-lg" data-action="demo">Dùng thử ngay</button><a class="btn btn-secondary btn-lg" href="#register">Tạo tài khoản demo</a>`}</div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div>
        <a href="#home" class="brand">${icon("logo", { size: 24 })}<span>LearnMate</span></a>
        <p class="small muted" style="margin-top:.5rem">Gia sư học tập cá nhân cho học sinh, sinh viên và người tự học từ 15 tuổi. Phiên bản MVP để trình diễn: chưa có máy chủ, dữ liệu chỉ nằm trên trình duyệt của bạn.</p>
      </div>
      <div>
        <h2>Sản phẩm</h2>
        <ul>
          <li><a href="#benefits">Lợi ích</a></li>
          <li><a href="#how">Cách học</a></li>
        </ul>
      </div>
      <div>
        <h2>Tài khoản</h2>
        <ul>
          <li><a href="#login">Đăng nhập</a></li>
          <li><a href="#register">Đăng ký</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-bottom">© ${new Date().getFullYear()} LearnMate · Bản trình diễn MVP.</p>
  </footer>`;

  // Liên kết neo trong trang (#benefits, #how) không phải route → cuộn thủ công.
  root.querySelectorAll('a[href="#benefits"], a[href="#how"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = root.querySelector(a.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.querySelector("h2")?.setAttribute("tabindex", "-1");
      target?.querySelector("h2")?.focus({ preventScroll: true });
    }),
  );

  root.querySelectorAll('[data-action="demo"]').forEach((b) =>
    b.addEventListener("click", () => {
      const p = store.startDemo(seedDemoProfile);
      toast("Đã vào chế độ dùng thử. Dữ liệu chỉ lưu trên trình duyệt này.", "success");
      navigate(p.onboarded ? "dashboard" : "onboarding");
    }),
  );
}
