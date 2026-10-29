// Gia sư ảo. Tách lớp "provider" để có thể thay phản hồi demo bằng API AI thật.
//
// Giao diện chung của provider:
//   reply({ message, intent, lesson, question, questionState, session }) -> Promise<{ text, source }>
//   - message: nội dung người học nhập (chuỗi)
//   - intent: "simplify" | "example" | "steps" | "quiz" | null (nút gợi ý nhanh)
//   - session: đối tượng lưu trạng thái hội thoại trong bộ nhớ (ví dụ câu đố đang chờ trả lời)
import { CONFIG } from "../config.js";
import { stripAccents, answersMatch, sleep } from "../utils.js";
import { SUBJECTS, getSubject } from "../data/lessons.js";

const has = (text, words) => words.some((w) => text.includes(w));

class DemoTutorProvider {
  constructor() {
    this.source = "demo";
  }

  async reply(input) {
    const [min, max] = CONFIG.demoLatency;
    await sleep(min + Math.random() * (max - min));
    return { text: this.compose(input), source: "demo" };
  }

  compose({ message = "", intent = null, lesson, question, questionState, session }) {
    const t = stripAccents(message);
    session.exampleIdx ??= 0;
    session.quizIdx ??= 0;

    // 1) Đang có câu đố chờ trả lời → coi tin nhắn là câu trả lời (trừ khi là một yêu cầu khác).
    if (session.pendingQuiz && !intent) {
      const quiz = session.pendingQuiz;
      if (has(t, ["dap an", "chiu", "bo qua", "khong biet"])) {
        session.pendingQuiz = null;
        return `Không sao cả! Đáp án là: ${quiz.accept[0]}.\n${quiz.explain}\n\nBấm “Đố tôi câu khác” nếu bạn muốn luyện tiếp.`;
      }
      if (!has(t, ["don gian", "vi du", "tung buoc", "goi y", "cau khac"])) {
        if (answersMatch(message, quiz.accept)) {
          session.pendingQuiz = null;
          return `Chính xác! 🎉 ${quiz.explain}\n\nMuốn thêm thử thách? Bấm “Đố tôi câu khác”.`;
        }
        session.pendingTries = (session.pendingTries || 0) + 1;
        if (session.pendingTries >= 2) {
          return `Vẫn chưa đúng. Gợi ý: hãy xem lại phần “${lesson.sections[0].title}”. Bạn có thể thử thêm lần nữa hoặc gõ “đáp án” để xem lời giải.`;
        }
        return "Chưa đúng rồi, nhưng đừng lo! Đọc lại câu hỏi thật chậm và thử thêm một lần nữa nhé.";
      }
    }

    // 2) Ý định từ nút gợi ý nhanh hoặc từ khóa.
    const resolved =
      intent ||
      (has(t, ["don gian", "de hieu", "khong hieu", "chua hieu", "kho hieu", "giai thich lai"]) && "simplify") ||
      (has(t, ["vi du", "example", "minh hoa"]) && "example") ||
      (has(t, ["tung buoc", "goi y", "huong dan", "lam sao", "lam the nao", "bat dau tu dau", "hint"]) && "steps") ||
      (has(t, ["do toi", "cau khac", "cau hoi khac", "kiem tra toi", "quiz", "luyen them", "cho toi cau"]) && "quiz") ||
      null;

    if (resolved === "simplify") {
      return `Nói đơn giản về “${lesson.title}”:\n${lesson.simple}`;
    }
    if (resolved === "example") {
      const pool = [...lesson.examples, ...lesson.sections.filter((s) => s.example).map((s) => s.example)];
      const ex = pool[session.exampleIdx % pool.length];
      session.exampleIdx++;
      return `Đây là một ví dụ cho bài “${lesson.title}”:\n\n${ex}\n\nBấm lại “Cho tôi một ví dụ” để xem ví dụ khác.`;
    }
    if (resolved === "steps") return this.steps(lesson, question, questionState);
    if (resolved === "quiz") {
      const quiz = lesson.extraQuiz[session.quizIdx % lesson.extraQuiz.length];
      session.quizIdx++;
      session.pendingQuiz = quiz;
      session.pendingTries = 0;
      return `Câu đố thêm (không tính điểm):\n${quiz.prompt}\n\nHãy gõ câu trả lời của bạn vào ô bên dưới.`;
    }

    // 3) Hỏi đáp án trực tiếp → khuyến khích tự làm.
    if (has(t, ["dap an", "ket qua", "cho dap an", "noi dap an"])) {
      if (question && questionState && ["correct", "revealed"].includes(questionState.status)) {
        return `Với câu “${question.prompt}”:\n${question.explanation}`;
      }
      if (question) {
        return `Mình sẽ chưa nói đáp án ngay để bạn tự rèn luyện 🙂\nGợi ý: ${question.hint}\n\nSau 2 lần thử, nút “Xem giải thích” sẽ mở để bạn xem lời giải đầy đủ.`;
      }
    }

    // 4) Hỏi "tại sao".
    if (has(t, ["tai sao", "vi sao", "why"])) {
      if (question && questionState && ["correct", "revealed"].includes(questionState.status)) {
        return `Lý do: ${question.explanation}`;
      }
      return `Câu hỏi hay! Ý chính của bài là:\n${lesson.simple}\n\nNếu bạn đang hỏi về một câu cụ thể, hãy trả lời thử trước, sau đó mình sẽ giải thích vì sao.`;
    }

    // 5) Thuật ngữ trong bài.
    const terms = Object.entries(lesson.keywords).filter(([k]) => t.includes(stripAccents(k)));
    if (terms.length) {
      return terms.map(([k, v]) => `• ${k}: ${v}`).join("\n") + "\n\nBạn muốn mình cho thêm một ví dụ không?";
    }

    // 6) Mục tiêu bài.
    if (has(t, ["muc tieu", "hoc gi", "bai nay ve", "noi dung"])) {
      return `Bài “${lesson.title}” giúp bạn:\n${lesson.objectives.map((o) => `• ${o}`).join("\n")}`;
    }

    // 7) Chào hỏi / cảm ơn.
    if (/^(xin )?chao|^hello|^hi\b|^hey/.test(t)) {
      return `Chào bạn! Mình là gia sư của bài “${lesson.title}”. Bạn có thể hỏi về thuật ngữ trong bài, xin ví dụ hoặc nhờ gợi ý từng bước cho câu hỏi đang làm.`;
    }
    if (has(t, ["cam on", "thank"])) {
      return "Không có gì! Cứ hỏi tiếp bất cứ lúc nào nhé. 💪";
    }

    // 8) Câu hỏi thuộc môn khác.
    const other = SUBJECTS.find((s) => s.id !== lesson.subjectId && s.keywords.some((k) => t.includes(k)));
    if (other) {
      return `Câu hỏi này có vẻ thuộc môn “${other.name}”, còn bài hiện tại là “${lesson.title}” (${getSubject(lesson.subjectId).name}). Hãy mở một bài của môn đó trong Thư viện để mình hỗ trợ đúng ngữ cảnh.`;
    }

    // 9) Không nhận diện được.
    return `Ở chế độ demo, mình chỉ hiểu một số dạng câu hỏi về bài “${lesson.title}”. Bạn có thể thử:\n• “Giải thích đơn giản hơn”\n• “Cho tôi một ví dụ”\n• “Gợi ý từng bước”\n• hỏi nghĩa của thuật ngữ, ví dụ: “${Object.keys(lesson.keywords)[0]} là gì?”`;
  }

  steps(lesson, question, qs) {
    if (!question) {
      return `Lộ trình từng bước cho bài này:\n${lesson.sections.map((s, i) => `${i + 1}. Đọc phần “${s.title}”.`).join("\n")}\n${lesson.sections.length + 1}. Làm ${lesson.questions.length} câu hỏi luyện tập.\nBạn đang ở phần nội dung, cứ bấm “Tiếp tục” khi đã hiểu nhé.`;
    }
    if (qs && ["correct", "revealed"].includes(qs.status)) {
      return `Bạn đã hoàn thành câu này. Lời giải từng bước:\n${question.explanation}`;
    }
    const lines = [`1. Đọc kỹ đề: “${question.prompt}”`, `2. Gợi ý: ${question.hint}`];
    if (question.type === "mcq") {
      const wrong = question.options.find((o, i) => i !== question.answer && o.feedback);
      if (wrong) lines.push(`3. Loại trừ: phương án “${wrong.text}” chưa đúng. ${wrong.feedback}`);
      lines.push(`${lines.length + 1}. Chọn phương án còn lại hợp lý nhất, rồi bấm “Kiểm tra đáp án”.`);
    } else {
      lines.push("3. Viết câu trả lời ngắn gọn (một từ hoặc một số) vào ô trả lời.");
      lines.push("4. Bấm “Kiểm tra đáp án”. Nếu sai, LearnMate sẽ gợi ý cụ thể theo câu trả lời của bạn.");
    }
    return lines.join("\n");
  }
}

/**
 * Provider thật (chưa bật). Gửi yêu cầu tới backend của bạn – backend giữ API key.
 * Chỉ gửi ngữ cảnh bài học và câu hỏi; KHÔNG gửi tên, email hay dữ liệu cá nhân.
 */
class RemoteTutorProvider {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.source = "remote";
  }
  async reply({ message, intent, lesson, question }) {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, intent, lessonId: lesson.id, lessonTitle: lesson.title, questionId: question?.id || null }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { text: String(data.text || ""), source: "remote" };
  }
}

export function createTutor() {
  return CONFIG.tutorProvider === "remote" ? new RemoteTutorProvider(CONFIG.tutorEndpoint) : new DemoTutorProvider();
}

export const QUICK_PROMPTS = [
  { intent: "simplify", label: "Giải thích đơn giản hơn" },
  { intent: "example", label: "Cho tôi một ví dụ" },
  { intent: "steps", label: "Gợi ý từng bước" },
  { intent: "quiz", label: "Đố tôi câu khác" },
];
