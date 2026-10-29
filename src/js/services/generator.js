// Trình tạo bộ học tập. Chế độ demo: lấy từ ngân hàng nội dung có sẵn nếu chủ đề khớp
// một môn trong thư viện; nếu không khớp, tạo KHUNG MẪU chung để người học tự chỉnh sửa.
import { CONFIG } from "../config.js";
import { SUBJECTS, LESSONS } from "../data/lessons.js";
import { stripAccents, shuffle, uid, sleep } from "../utils.js";

export const DIFFICULTIES = {
  easy: "Dễ",
  medium: "Trung bình",
  mixed: "Hỗn hợp",
};

function matchSubject(topic) {
  const t = stripAccents(topic);
  let best = null;
  let bestScore = 0;
  for (const s of SUBJECTS) {
    let score = s.keywords.filter((k) => t.includes(k)).length * 2;
    for (const l of LESSONS.filter((x) => x.subjectId === s.id)) {
      const words = stripAccents(l.title).split(/\s+/).filter((w) => w.length > 3);
      score += words.filter((w) => t.includes(w)).length;
    }
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

function lessonPool(subjectId, difficulty) {
  const all = LESSONS.filter((l) => l.subjectId === subjectId);
  if (difficulty === "easy") return all.filter((l) => l.level === "beginner");
  if (difficulty === "medium") return all.filter((l) => l.level !== "beginner");
  return all;
}

function bankMcq(lessons) {
  return lessons.flatMap((l) =>
    l.questions
      .filter((q) => q.type === "mcq")
      .map((q) => ({ id: uid("it"), prompt: q.prompt, options: q.options.map((o) => o.text), answer: q.answer, explanation: q.why, from: l.title })),
  );
}

function bankFlashcards(lessons) {
  return lessons.flatMap((l) => [
    ...Object.entries(l.keywords).map(([k, v]) => ({ id: uid("it"), front: k, back: v, from: l.title })),
    ...l.extraQuiz.map((q) => ({ id: uid("it"), front: q.prompt, back: `${q.accept[0]} — ${q.explain}`, from: l.title })),
  ]);
}

function templateMcq(topic) {
  const T = topic;
  return [
    { prompt: `Cách nào giúp bạn nhớ kiến thức về “${T}” lâu nhất?`, options: ["Đọc đi đọc lại tài liệu", "Tự kiểm tra bằng câu hỏi sau khi học", "Tô đậm thật nhiều dòng", "Học dồn một lần trước ngày thi"], answer: 1, explanation: "Tự kiểm tra (retrieval practice) buộc não nhớ lại thông tin, giúp ghi nhớ bền hơn so với đọc lại." },
    { prompt: `Bạn vừa học xong một phần của “${T}”. Bước nào nên làm tiếp?`, options: ["Chuyển ngay sang phần mới", "Tóm tắt lại bằng lời của mình", "Chép nguyên văn tài liệu", "Bỏ qua phần khó"], answer: 1, explanation: "Tóm tắt bằng lời của mình giúp phát hiện chỗ chưa hiểu." },
    { prompt: `Lịch ôn tập “${T}” nào hiệu quả hơn?`, options: ["Ôn 3 giờ liền một buổi", "Ôn ngắn, rải đều trong nhiều ngày", "Chỉ ôn khi sắp kiểm tra", "Không cần ôn nếu đã hiểu"], answer: 1, explanation: "Ôn ngắt quãng (spaced repetition) giúp chống quên tốt hơn học dồn." },
    { prompt: `Khi gặp một khái niệm khó trong “${T}”, bạn nên làm gì trước?`, options: ["Bỏ qua và học tiếp", "Tìm một ví dụ cụ thể cho khái niệm đó", "Học thuộc định nghĩa", "Đổi sang chủ đề khác"], answer: 1, explanation: "Ví dụ cụ thể nối khái niệm trừu tượng với điều đã biết." },
    { prompt: `Cách kiểm tra bạn đã thật sự hiểu “${T}”?`, options: ["Thấy tài liệu quen mắt", "Giải thích lại cho người khác mà không nhìn tài liệu", "Đã đọc hết sách", "Đã ghi chép đầy đủ"], answer: 1, explanation: "Giải thích lại không nhìn tài liệu (kỹ thuật Feynman) cho thấy mức hiểu thật sự." },
    { prompt: `Khi học “${T}”, xen kẽ nhiều dạng bài tập có lợi gì?`, options: ["Làm bài chậm hơn nên kém hiệu quả", "Giúp nhận biết khi nào dùng cách giải nào", "Không có tác dụng gì", "Chỉ hợp với môn toán"], answer: 1, explanation: "Học xen kẽ (interleaving) rèn khả năng chọn chiến lược phù hợp." },
    { prompt: `Mục tiêu học “${T}” nào rõ ràng nhất?`, options: ["Giỏi hơn", "Học nhiều vào", "Làm đúng 8/10 câu luyện tập trong 2 tuần", "Cố gắng hết sức"], answer: 2, explanation: "Mục tiêu tốt cần cụ thể, đo được và có thời hạn." },
    { prompt: `Sau khi làm sai một câu về “${T}”, bạn nên làm gì?`, options: ["Xem đáp án rồi bỏ qua", "Tìm hiểu vì sao sai và thử làm lại", "Làm lại đúng câu đó cho thuộc", "Bỏ phần đó"], answer: 1, explanation: "Phân tích lỗi sai rồi thử lại giúp sửa hiểu lầm tận gốc." },
  ].map((q) => ({ ...q, id: uid("it"), from: "Khung mẫu chung" }));
}

function templateFlashcards(topic) {
  const T = topic;
  return [
    `Khái niệm cốt lõi của “${T}” là gì? (định nghĩa bằng lời của bạn)`,
    `“${T}” dùng để làm gì / vì sao quan trọng?`,
    `Nêu một ví dụ thực tế về “${T}”.`,
    `Các thành phần hoặc bước chính của “${T}” là gì?`,
    `Một hiểu lầm phổ biến về “${T}” là gì?`,
    `“${T}” liên quan đến kiến thức nào bạn đã biết?`,
    `Giải thích “${T}” cho một bạn nhỏ trong 3 câu.`,
    `Câu hỏi nào về “${T}” bạn vẫn chưa trả lời được?`,
    `Thuật ngữ quan trọng nhất trong “${T}” là gì? Nghĩa của nó?`,
    `Nếu phải kiểm tra người khác về “${T}”, bạn sẽ hỏi câu gì?`,
  ].map((front) => ({ id: uid("it"), front, back: "Tự trả lời rồi bấm “Sửa” để ghi lại đáp án của bạn.", from: "Khung mẫu chung" }));
}

/**
 * @returns {Promise<{ok:boolean, error?:string, set?:object}>}
 */
export async function generateStudySet({ topic, kind, count, difficulty }) {
  const cleanTopic = String(topic || "").trim().replace(/\s+/g, " ");
  if (cleanTopic.length < 2) return { ok: false, error: "Vui lòng nhập chủ đề (ít nhất 2 ký tự)." };
  if (cleanTopic.length > 80) return { ok: false, error: "Chủ đề quá dài, tối đa 80 ký tự." };
  if (!["mcq", "flashcard"].includes(kind)) return { ok: false, error: "Vui lòng chọn dạng nội dung." };
  const n = Math.min(10, Math.max(3, Number(count) || 5));

  if (CONFIG.generatorProvider === "remote") {
    // Chỗ nối API thật (qua backend). Không gửi dữ liệu cá nhân.
    const res = await fetch(CONFIG.generatorEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: cleanTopic, kind, count: n, difficulty }) });
    if (!res.ok) return { ok: false, error: "Máy chủ tạo nội dung đang gặp lỗi. Vui lòng thử lại sau." };
    return { ok: true, set: await res.json() };
  }

  await sleep(700 + Math.random() * 500);
  const subject = matchSubject(cleanTopic);
  let items = [];
  let source = "template";
  let note = "";

  if (subject) {
    source = "bank";
    let lessons = lessonPool(subject.id, difficulty);
    let pool = kind === "mcq" ? bankMcq(lessons) : bankFlashcards(lessons);
    if (pool.length < n && difficulty !== "mixed") {
      lessons = lessonPool(subject.id, "mixed");
      pool = kind === "mcq" ? bankMcq(lessons) : bankFlashcards(lessons);
      note = "Không đủ mục ở độ khó đã chọn, nên đã bổ sung từ các độ khó khác. ";
    }
    items = shuffle(pool).slice(0, n);
    if (items.length < n) note += `Ngân hàng demo của môn “${subject.name}” chỉ có ${items.length} mục dạng này.`;
  } else {
    const pool = kind === "mcq" ? templateMcq(cleanTopic) : templateFlashcards(cleanTopic);
    items = shuffle(pool).slice(0, n);
    note = "Chủ đề này chưa có trong ngân hàng nội dung demo, nên LearnMate tạo khung câu hỏi về phương pháp học áp dụng cho chủ đề. Hãy chỉnh sửa để thêm kiến thức chuyên môn.";
  }

  if (!items.length) return { ok: false, error: "Không tạo được nội dung nào cho chủ đề này. Hãy thử chủ đề khác." };

  return {
    ok: true,
    set: {
      id: uid("set"),
      topic: cleanTopic,
      kind,
      difficulty,
      source,
      subjectId: subject?.id || null,
      note: note.trim(),
      createdAt: Date.now(),
      items,
    },
  };
}
