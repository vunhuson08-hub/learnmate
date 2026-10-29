// Nội dung học tập mẫu của LearnMate.
// Mỗi bài: mục tiêu, các phần giải thích, ví dụ, câu hỏi (trắc nghiệm + trả lời ngắn),
// cùng dữ liệu ngữ cảnh cho gia sư ảo (simple, examples, keywords, extraQuiz).
// Nội dung trong `body` do nhóm sản phẩm soạn sẵn (tin cậy) nên được phép chứa HTML đơn giản.

export const LEVELS = {
  beginner: "Cơ bản",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

export const SUBJECTS = [
  {
    id: "en",
    name: "Tiếng Anh giao tiếp",
    short: "Tiếng Anh",
    icon: "chat",
    color: "blue",
    description: "Chào hỏi, thì hiện tại đơn và gọi món – những tình huống dùng hằng ngày.",
    keywords: ["tieng anh", "english", "giao tiep", "anh van", "ngu phap", "grammar", "present simple", "hien tai don"],
  },
  {
    id: "math",
    name: "Toán cơ bản",
    short: "Toán",
    icon: "calc",
    color: "green",
    description: "Phân số, phần trăm và phương trình bậc nhất qua ví dụ đời thường.",
    keywords: ["toan", "math", "phan so", "phan tram", "phuong trinh", "dai so", "so hoc"],
  },
  {
    id: "js",
    name: "Lập trình JavaScript",
    short: "JavaScript",
    icon: "code",
    color: "amber",
    description: "Biến, điều kiện và hàm – nền tảng để viết chương trình đầu tiên.",
    keywords: ["javascript", "js", "lap trinh", "code", "programming", "ham", "bien", "web"],
  },
  {
    id: "write",
    name: "Kỹ năng viết",
    short: "Viết",
    icon: "pen",
    color: "violet",
    description: "Câu chủ đề, cấu trúc đoạn văn và cách tự sửa bài viết.",
    keywords: ["viet", "van", "writing", "doan van", "bai luan", "essay", "cau chu de"],
  },
];

export const LESSONS = [
  // ───────────── TIẾNG ANH ─────────────
  {
    id: "en-greetings",
    subjectId: "en",
    title: "Chào hỏi và giới thiệu bản thân",
    level: "beginner",
    minutes: 10,
    description: "Chọn câu chào đúng thời điểm và tự giới thiệu ngắn gọn, tự nhiên.",
    objectives: [
      "Chọn câu chào phù hợp với thời gian và người đối diện.",
      "Giới thiệu tên, quê quán và công việc bằng câu đơn giản.",
      "Đáp lại “Nice to meet you” đúng cách.",
    ],
    sections: [
      {
        title: "Chào theo ngữ cảnh",
        body: `<p><strong>Hello / Hi</strong> dùng được hầu hết mọi lúc; <em>Hi</em> thân mật hơn.</p>
<p>Lịch sự hơn, chào theo buổi: <strong>Good morning</strong> (sáng), <strong>Good afternoon</strong> (chiều), <strong>Good evening</strong> (tối).</p>
<p>Lưu ý: <strong>Good night</strong> là câu <em>chào tạm biệt</em> buổi tối hoặc trước khi đi ngủ, không dùng khi vừa gặp nhau.</p>`,
      },
      {
        title: "Giới thiệu bản thân",
        body: `<p>Ba mẫu câu cốt lõi:</p>
<ul><li><strong>I'm</strong> / <strong>My name is</strong> + tên</li><li><strong>I'm from</strong> + nơi chốn</li><li><strong>I'm a</strong> + nghề nghiệp (ví dụ: <em>I'm a student</em>)</li></ul>
<p>Khi người kia nói <strong>Nice to meet you</strong>, hãy đáp <strong>Nice to meet you too</strong>.</p>`,
        example: `A: Good morning! I'm Lan. I'm from Da Nang.
B: Hi Lan, I'm Minh. I'm a student. Nice to meet you.
A: Nice to meet you too!`,
      },
    ],
    simple:
      "Gặp ai thì nói Hello. Muốn lịch sự hơn thì chào theo buổi: sáng là Good morning, chiều Good afternoon, tối Good evening. Nói tên mình bằng “I'm + tên”. Ai nói “Nice to meet you” thì mình đáp “Nice to meet you too”.",
    examples: [
      "Gặp thầy cô lúc 8 giờ sáng: “Good morning, teacher!”",
      "Làm quen trong lớp tiếng Anh: “Hi, I'm Huy. I'm from Hue. I'm a first-year student.”",
    ],
    keywords: {
      "good night": "Câu chào tạm biệt buổi tối hoặc trước khi đi ngủ, không dùng để chào khi gặp.",
      "nice to meet you": "“Rất vui được gặp bạn” – dùng ở lần gặp đầu tiên. Đáp lại: Nice to meet you too.",
      "i'm": "Viết tắt của I am, nghĩa là “tôi là / tôi đang”.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Bạn gặp giáo viên lúc 9 giờ sáng. Câu chào nào phù hợp nhất?",
        options: [
          { text: "Good night!", feedback: "Good night chỉ dùng khi chào tạm biệt buổi tối. Thử nghĩ xem 9 giờ sáng thuộc buổi nào?" },
          { text: "Good morning!" },
          { text: "Good evening!", feedback: "Evening là buổi tối (thường sau khoảng 6 giờ chiều). 9 giờ sáng còn sớm hơn nhiều." },
          { text: "What's up?", feedback: "What's up rất thân mật, hợp với bạn bè hơn là giáo viên. Hãy chọn câu lịch sự theo buổi." },
        ],
        answer: 1,
        hint: "Chào lịch sự theo buổi trong ngày: morning – afternoon – evening.",
        why: "9 giờ sáng là buổi sáng, và Good morning vừa đúng buổi vừa lịch sự với giáo viên.",
        explanation: "Morning: từ sáng đến khoảng 12 giờ trưa. Afternoon: khoảng 12 giờ đến 6 giờ chiều. Evening: buổi tối. Good night chỉ dùng khi chia tay buổi tối, còn What's up quá thân mật trong tình huống này.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Một người bạn mới nói: “Nice to meet you.” Bạn đáp thế nào?",
        options: [
          { text: "Nice to meet you too." },
          { text: "Yes, I meet you.", feedback: "Câu này sai ngữ pháp và nghe không tự nhiên. Hãy lặp lại lời chào của họ và thêm một từ nhỏ ở cuối." },
          { text: "Goodbye.", feedback: "Goodbye dùng để kết thúc cuộc trò chuyện, trong khi hai bạn vừa mới làm quen." },
          { text: "I'm fine, thank you.", feedback: "Đây là câu đáp cho “How are you?”, không phải cho “Nice to meet you”." },
        ],
        answer: 0,
        hint: "Câu đáp gần như lặp lại y nguyên lời người kia, chỉ thêm một từ nghĩa là “cũng vậy”.",
        why: "“Nice to meet you too” nghĩa là “Mình cũng rất vui được gặp bạn”, đúng phép lịch sự.",
        explanation: "Mẫu đối đáp: A: Nice to meet you. → B: Nice to meet you too. Có thể dùng “Pleased to meet you” trong tình huống trang trọng hơn.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Điền từ còn thiếu: “I ___ from Vietnam.”",
        placeholder: "Nhập một từ",
        accept: ["am", "'m"],
        mistakes: [
          { match: ["is", "are", "be"], feedback: "Gần đúng rồi! Đây là động từ to be, nhưng chủ ngữ “I” chỉ đi với một dạng duy nhất." },
        ],
        hint: "Đây là động từ to be. Chủ ngữ là “I”.",
        why: "Chủ ngữ I luôn đi với am: I am from Vietnam (viết tắt: I'm from Vietnam).",
        explanation: "To be ở hiện tại: I am; he/she/it is; you/we/they are. Vì vậy câu đúng là “I am from Vietnam”.",
      },
    ],
    extraQuiz: [
      { prompt: "Dịch sang tiếng Anh: “Rất vui được gặp bạn.”", accept: ["nice to meet you", "pleased to meet you", "glad to meet you"], explain: "Nice to meet you (hoặc Pleased to meet you – trang trọng hơn)." },
      { prompt: "Lúc 3 giờ chiều, bạn chào lịch sự bằng câu gì? (Good ...)", accept: ["good afternoon", "afternoon"], explain: "3 giờ chiều là afternoon → Good afternoon." },
    ],
  },
  {
    id: "en-present-simple",
    subjectId: "en",
    title: "Thì hiện tại đơn cho thói quen",
    level: "beginner",
    minutes: 15,
    description: "Diễn tả thói quen hằng ngày và chia động từ đúng với he/she/it.",
    objectives: [
      "Nhận biết khi nào dùng thì hiện tại đơn (Present Simple).",
      "Thêm -s/-es đúng với chủ ngữ ngôi thứ ba số ít.",
      "Viết câu phủ định với don't / doesn't.",
    ],
    sections: [
      {
        title: "Khi nào dùng?",
        body: `<p><strong>Present Simple</strong> (thì hiện tại đơn) dùng cho <strong>thói quen</strong> và <strong>sự thật</strong>.</p>
<p>Dấu hiệu thường gặp: <em>every day, usually, often, always, sometimes, never</em>.</p>`,
        example: `I usually drink tea in the morning.
The sun rises in the east.`,
      },
      {
        title: "Cấu trúc và cách chia",
        body: `<ul><li>I / You / We / They + <strong>động từ nguyên mẫu</strong>: <em>They play</em></li>
<li>He / She / It + <strong>động từ thêm -s/-es</strong>: <em>She plays, he watches</em></li>
<li>Phủ định: <strong>don't / doesn't + động từ nguyên mẫu</strong>: <em>He doesn't play</em></li></ul>
<p>Thêm <strong>-es</strong> khi động từ tận cùng bằng -ch, -sh, -s, -x, -o (watch → watches, go → goes). Phụ âm + y → <strong>-ies</strong> (study → studies).</p>`,
      },
    ],
    simple:
      "Việc gì bạn làm đều đặn thì dùng hiện tại đơn. Nếu người làm là he, she hoặc it thì thêm s (hoặc es) vào động từ. Câu phủ định thì dùng don't hoặc doesn't, và lúc đó động từ quay về dạng gốc, không thêm s nữa.",
    examples: [
      "My mom cooks dinner every evening. (mom = she → cooks)",
      "We don't go to school on Sundays. (we → don't + go)",
    ],
    keywords: {
      "present simple": "Thì hiện tại đơn – diễn tả thói quen, sự thật, lịch trình cố định.",
      "doesn't": "Viết tắt của does not, dùng cho he/she/it trong câu phủ định; theo sau là động từ nguyên mẫu.",
      "-es": "Thêm vào động từ tận cùng -ch, -sh, -s, -x, -o khi chủ ngữ là he/she/it.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Chọn từ đúng: “She ___ to school every day.”",
        options: [
          { text: "go", feedback: "Chủ ngữ là She (ngôi thứ ba số ít), nên động từ cần thay đổi một chút." },
          { text: "goes" },
          { text: "going", feedback: "Dạng -ing thuộc thì tiếp diễn và cần “is” đi kèm. Câu này nói về thói quen (every day)." },
          { text: "is go", feedback: "Không dùng “is” cùng một động từ thường ở thì hiện tại đơn." },
        ],
        answer: 1,
        hint: "“every day” cho thấy đây là thói quen. Chủ ngữ là She.",
        why: "She là ngôi thứ ba số ít, và go tận cùng bằng -o nên thêm -es thành goes.",
        explanation: "Thì hiện tại đơn với he/she/it: động từ thêm -s/-es. Động từ tận cùng -o (go, do) thêm -es → goes, does.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Câu phủ định nào đúng?",
        options: [
          { text: "He doesn't like coffee." },
          { text: "He don't like coffee.", feedback: "He là ngôi thứ ba số ít nên đi với doesn't, không phải don't." },
          { text: "He doesn't likes coffee.", feedback: "Sau doesn't, động từ phải trở về dạng nguyên mẫu (bỏ -s)." },
          { text: "He not like coffee.", feedback: "Câu phủ định ở hiện tại đơn cần trợ động từ do/does + not." },
        ],
        answer: 0,
        hint: "Kiểm tra hai thứ: trợ động từ hợp với “He”, và động từ phía sau có còn -s không.",
        why: "He + doesn't + động từ nguyên mẫu (like) là cấu trúc đúng.",
        explanation: "Khi đã có doesn't (đã “mang” s), động từ chính không thêm -s nữa: He doesn't like, She doesn't go.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Chia động từ trong ngoặc: “My father ___ (watch) TV every evening.”",
        placeholder: "Nhập dạng đúng của watch",
        accept: ["watches"],
        mistakes: [
          { match: ["watchs"], feedback: "Gần đúng! Động từ tận cùng bằng -ch cần thêm hai chữ cái, không chỉ -s." },
          { match: ["watch"], feedback: "“My father” tương đương với “he”, vậy động từ cần thay đổi thế nào?" },
          { match: ["watching", "is watching"], feedback: "Câu có “every evening” nên đây là thói quen, cần dùng thì hiện tại đơn chứ không phải tiếp diễn." },
        ],
        hint: "My father = he. Động từ tận cùng -ch thì thêm gì?",
        why: "My father là ngôi thứ ba số ít, và watch tận cùng -ch nên thêm -es thành watches.",
        explanation: "Quy tắc thêm -es: -ch, -sh, -s, -x, -o → watches, washes, misses, fixes, goes.",
      },
    ],
    extraQuiz: [
      { prompt: "Chia động từ: “She ___ (study) English every night.”", accept: ["studies"], explain: "Phụ âm + y → bỏ y thêm -ies: studies." },
      { prompt: "Chia động từ: “They ___ (play) football on Sundays.”", accept: ["play"], explain: "They đi với động từ nguyên mẫu: play." },
    ],
  },
  {
    id: "en-ordering-food",
    subjectId: "en",
    title: "Gọi món ở nhà hàng",
    level: "intermediate",
    minutes: 12,
    description: "Gọi món, hỏi gợi ý và xin thanh toán một cách lịch sự.",
    objectives: [
      "Dùng I'd like / Could I have để yêu cầu lịch sự.",
      "Hỏi nhân viên gợi ý món.",
      "Xin hóa đơn khi kết thúc bữa ăn.",
    ],
    sections: [
      {
        title: "Yêu cầu lịch sự",
        body: `<p><strong>I'd like ...</strong> (= I would like) là cách gọi món phổ biến và lịch sự.</p>
<p><strong>Could I have ...?</strong> còn nhẹ nhàng hơn. <em>Can I get ...?</em> thân mật, thường nghe ở Mỹ.</p>
<p>Nên thêm <strong>please</strong> ở cuối câu.</p>`,
        example: `Waiter: Are you ready to order?
You: Yes, I'd like a bowl of pho, please.
Waiter: Anything to drink?
You: Could I have an iced tea?`,
      },
      {
        title: "Hỏi gợi ý và thanh toán",
        body: `<p>Hỏi gợi ý: <strong>What do you recommend?</strong></p>
<p>Xin hóa đơn: <strong>Could we have the bill, please?</strong> (Anh) hoặc <strong>the check</strong> (Mỹ).</p>`,
      },
    ],
    simple:
      "Muốn gọi món thì nói “I'd like” rồi tên món, cuối câu thêm “please”. Không biết ăn gì thì hỏi “What do you recommend?”. Ăn xong muốn trả tiền thì nói “Could we have the bill, please?”.",
    examples: [
      "I'd like the grilled chicken and a glass of orange juice, please.",
      "Excuse me, could we have the bill, please?",
    ],
    keywords: {
      "i'd like": "Viết tắt của I would like – “tôi muốn”, cách yêu cầu lịch sự.",
      "bill": "Hóa đơn (Anh). Ở Mỹ thường nói check.",
      "recommend": "Gợi ý, giới thiệu. What do you recommend? = Bạn gợi ý món nào?",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Cách gọi món nào lịch sự nhất?",
        options: [
          { text: "I'd like a bowl of pho, please." },
          { text: "Give me pho.", feedback: "Đây là câu mệnh lệnh, nghe khá cộc. Hãy tìm câu có cấu trúc yêu cầu nhẹ nhàng." },
          { text: "I want pho now.", feedback: "“I want … now” nghe gấp gáp và thiếu lịch sự. Có cách nói mềm mại hơn “want”." },
          { text: "Pho, you bring.", feedback: "Câu này sai ngữ pháp. Hãy tìm câu bắt đầu bằng “I”." },
        ],
        answer: 0,
        hint: "Tìm câu có dạng rút gọn của “I would …” và có “please”.",
        why: "“I'd like … please” vừa lịch sự vừa tự nhiên khi gọi món.",
        explanation: "Mức độ lịch sự tăng dần: I want < Can I get < I'd like < Could I have. Thêm please để câu mềm mại hơn.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Bạn đã ăn xong và muốn thanh toán. Bạn nói gì?",
        options: [
          { text: "Where is my money?", feedback: "Câu này nghĩa là “Tiền của tôi đâu?”, không phải xin thanh toán." },
          { text: "Could we have the bill, please?" },
          { text: "Can I pay the menu?", feedback: "Menu là thực đơn, không phải hóa đơn." },
          { text: "I'd like the kitchen.", feedback: "Kitchen là nhà bếp, không liên quan đến việc thanh toán." },
        ],
        answer: 1,
        hint: "Từ chỉ “hóa đơn” trong tiếng Anh-Anh có 4 chữ cái.",
        why: "“Could we have the bill, please?” là cách xin hóa đơn lịch sự và phổ biến.",
        explanation: "Bill (Anh) = check (Mỹ). Cũng có thể nói: “Can I pay by card?” nếu muốn trả bằng thẻ.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Hoàn thành câu: “I'd ___ a glass of water, please.”",
        placeholder: "Nhập một từ",
        accept: ["like"],
        mistakes: [
          { match: ["want"], feedback: "“I'd want” không phải cách nói tự nhiên khi gọi món. Hãy dùng động từ hay đi sau “I would”." },
          { match: ["love"], feedback: "“I'd love” vẫn dùng được trong giao tiếp, nhưng mẫu chuẩn khi gọi món là một động từ khác. Thử lại nhé!" },
        ],
        hint: "I'd = I would. Cụm “I would ___” nghĩa là “tôi muốn”.",
        why: "I'd like = I would like, cách nói lịch sự cho “tôi muốn”.",
        explanation: "Mẫu gọi món chuẩn: I'd like + món + please. Ví dụ: I'd like a coffee, please.",
      },
    ],
    extraQuiz: [
      { prompt: "“I'd like” là viết tắt của cụm từ nào?", accept: ["i would like"], explain: "I'd like = I would like." },
      { prompt: "Hỏi nhân viên gợi ý món: “What do you ___?”", accept: ["recommend", "suggest"], explain: "What do you recommend?" },
    ],
  },

  // ───────────── TOÁN ─────────────
  {
    id: "math-fractions",
    subjectId: "math",
    title: "Phân số và phép cộng phân số",
    level: "beginner",
    minutes: 15,
    description: "Hiểu tử số, mẫu số và cộng hai phân số cùng mẫu hoặc khác mẫu.",
    objectives: [
      "Gọi đúng tên tử số và mẫu số.",
      "Cộng phân số cùng mẫu và khác mẫu.",
      "Rút gọn phân số về dạng tối giản.",
    ],
    sections: [
      {
        title: "Phân số là gì?",
        body: `<p>Phân số <strong>a/b</strong> biểu diễn a phần bằng nhau trong tổng số b phần.</p>
<ul><li><strong>a</strong> là <strong>tử số</strong> (số phần lấy ra)</li><li><strong>b</strong> là <strong>mẫu số</strong> (tổng số phần), luôn khác 0</li></ul>
<p>Ví dụ: cắt bánh thành 4 miếng, ăn 3 miếng → đã ăn 3/4 cái bánh.</p>`,
      },
      {
        title: "Cộng phân số",
        body: `<p><strong>Cùng mẫu:</strong> cộng các tử số, giữ nguyên mẫu số. 2/7 + 3/7 = 5/7.</p>
<p><strong>Khác mẫu:</strong> quy đồng mẫu số (thường dùng bội chung nhỏ nhất), rồi cộng như cùng mẫu.</p>
<p>Cuối cùng <strong>rút gọn</strong>: chia cả tử và mẫu cho ước chung lớn nhất.</p>`,
        example: `1/2 + 1/3
= 3/6 + 2/6   (quy đồng về mẫu 6)
= 5/6`,
      },
    ],
    simple:
      "Phân số giống như chia bánh: số dưới là bánh được cắt thành mấy miếng, số trên là bạn lấy mấy miếng. Muốn cộng hai phân số thì các miếng phải cùng cỡ, tức là cùng số dưới. Nếu chưa cùng thì đổi cho cùng rồi mới cộng số trên.",
    examples: [
      "Uống 1/4 chai nước buổi sáng và 2/4 chai buổi chiều: tổng 3/4 chai.",
      "1/2 giờ + 1/4 giờ = 2/4 + 1/4 = 3/4 giờ (45 phút).",
    ],
    keywords: {
      "tu so": "Số nằm trên dấu gạch phân số, chỉ số phần được lấy.",
      "mau so": "Số nằm dưới dấu gạch phân số, chỉ tổng số phần bằng nhau; luôn khác 0.",
      "quy dong": "Biến đổi các phân số để chúng có cùng mẫu số, bằng cách nhân cả tử và mẫu với cùng một số.",
      "rut gon": "Chia cả tử và mẫu cho cùng một số (ước chung) để phân số gọn hơn mà giá trị không đổi.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Tính: 2/7 + 3/7 = ?",
        options: [
          { text: "5/14", feedback: "Bạn đã cộng cả mẫu số. Với hai phân số cùng mẫu, mẫu số được giữ nguyên." },
          { text: "5/7" },
          { text: "6/49", feedback: "Đây là kết quả của phép nhân (2×3)/(7×7), không phải phép cộng." },
          { text: "1/7", feedback: "Đây là kết quả của phép trừ 3/7 − 2/7. Hãy kiểm tra lại dấu phép tính." },
        ],
        answer: 1,
        hint: "Hai phân số đã cùng mẫu. Giữ mẫu số và chỉ làm việc với tử số.",
        why: "Cùng mẫu thì giữ mẫu 7 và cộng tử: 2 + 3 = 5, được 5/7.",
        explanation: "Quy tắc: a/c + b/c = (a + b)/c. Không bao giờ cộng mẫu số với nhau.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Phân số 6/8 rút gọn về dạng tối giản là?",
        options: [
          { text: "3/4" },
          { text: "6/8", feedback: "6 và 8 còn có ước chung là 2, nên phân số này vẫn rút gọn được." },
          { text: "2/3", feedback: "Bạn cần chia cả tử và mẫu cho cùng một số. 6 ÷ 3 = 2 nhưng 8 không chia hết cho 3." },
          { text: "1/2", feedback: "1/2 = 4/8, nhỏ hơn 6/8. Hãy chia cả tử và mẫu cho cùng một số." },
        ],
        answer: 0,
        hint: "Tìm số lớn nhất mà cả 6 và 8 cùng chia hết.",
        why: "ƯCLN(6, 8) = 2, nên 6 ÷ 2 = 3 và 8 ÷ 2 = 4, được 3/4.",
        explanation: "Rút gọn = chia cả tử và mẫu cho ước chung lớn nhất. 3/4 là tối giản vì 3 và 4 không còn ước chung nào khác 1.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Tính 1/4 + 1/2 (viết kết quả dạng a/b tối giản).",
        placeholder: "Ví dụ: 2/5",
        accept: ["3/4", "0.75", "0,75"],
        mistakes: [
          { match: ["2/6", "1/3"], feedback: "Bạn đang cộng tử với tử và mẫu với mẫu. Hãy quy đồng trước: 1/2 bằng bao nhiêu phần tư?" },
          { match: ["6/8"], feedback: "Đúng giá trị rồi, nhưng chưa tối giản. Hãy rút gọn thêm một bước!" },
          { match: ["2/4", "1/2"], feedback: "Hình như bạn mới tính một phần. 1/2 = 2/4, sau đó cộng thêm 1/4 nữa." },
        ],
        hint: "Đổi 1/2 sang mẫu số 4 trước.",
        why: "1/2 = 2/4, nên 1/4 + 2/4 = 3/4.",
        explanation: "Mẫu chung nhỏ nhất của 4 và 2 là 4. 1/2 = 2/4. Tổng: (1 + 2)/4 = 3/4, đã tối giản.",
      },
    ],
    extraQuiz: [
      { prompt: "Tính 2/3 + 1/6 (dạng tối giản).", accept: ["5/6"], explain: "2/3 = 4/6, nên 4/6 + 1/6 = 5/6." },
      { prompt: "Rút gọn 10/15.", accept: ["2/3"], explain: "Chia cả tử và mẫu cho 5: 2/3." },
    ],
  },
  {
    id: "math-percent",
    subjectId: "math",
    title: "Tỷ lệ phần trăm trong đời sống",
    level: "beginner",
    minutes: 12,
    description: "Tính phần trăm của một số, giá sau khi giảm và tỷ lệ phần trăm giữa hai số.",
    objectives: [
      "Tính x% của một số.",
      "Tính giá sau khi giảm giá.",
      "Tìm một số chiếm bao nhiêu phần trăm số khác.",
    ],
    sections: [
      {
        title: "Phần trăm là gì?",
        body: `<p><strong>x%</strong> nghĩa là x phần trên 100 phần. 25% = 25/100 = 0,25.</p>
<p><strong>x% của A</strong> = A × x ÷ 100.</p>`,
        example: `20% của 150 = 150 × 20 ÷ 100 = 30`,
      },
      {
        title: "Giảm giá và tỷ lệ",
        body: `<p>Giá sau khi giảm x%: <strong>A × (100 − x) ÷ 100</strong>.</p>
<p>A chiếm bao nhiêu phần trăm của B: <strong>A ÷ B × 100</strong>.</p>`,
        example: `Áo 300.000đ giảm 10%:
300.000 × 90 ÷ 100 = 270.000đ`,
      },
    ],
    simple:
      "Phần trăm là chia một thứ thành 100 phần bằng nhau. 10% là 10 phần trong 100 phần, tức là một phần mười. Muốn biết 10% của 200 thì lấy 200 chia 10, được 20.",
    examples: [
      "Bài kiểm tra 40 câu, làm đúng 30 câu: 30 ÷ 40 × 100 = 75%.",
      "Tiền ăn 120.000đ, để lại tiền tip 10%: 12.000đ.",
    ],
    keywords: {
      "phan tram": "Tỷ lệ trên 100. Ký hiệu %. 1% = 1/100.",
      "giam gia": "Giá mới = giá cũ × (100 − % giảm) ÷ 100.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "20% của 150 là bao nhiêu?",
        options: [
          { text: "20", feedback: "Đây chỉ là con số phần trăm, chưa nhân với 150. Hãy dùng công thức A × x ÷ 100." },
          { text: "30" },
          { text: "7,5", feedback: "Bạn đã chia 150 cho 20. Phần trăm cần nhân với x rồi mới chia cho 100." },
          { text: "300", feedback: "Kết quả phải nhỏ hơn 150 vì 20% là một phần nhỏ của tổng. Bạn quên chia cho 100 chăng?" },
        ],
        answer: 1,
        hint: "Dùng công thức A × x ÷ 100, hoặc nhớ rằng 20% = 1/5.",
        why: "150 × 20 ÷ 100 = 30 (hoặc 150 ÷ 5 = 30).",
        explanation: "20% = 20/100 = 1/5. Vậy 20% của 150 bằng 150 ÷ 5 = 30.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Một chiếc áo giá 200.000đ được giảm 25%. Giá sau khi giảm là?",
        options: [
          { text: "175.000đ", feedback: "175.000đ tương ứng với giảm 12,5%. Hãy tính lại 25% của 200.000đ." },
          { text: "50.000đ", feedback: "50.000đ là số tiền được giảm. Bạn cần lấy giá gốc trừ đi số này." },
          { text: "150.000đ" },
          { text: "225.000đ", feedback: "Giảm giá thì giá mới phải nhỏ hơn giá gốc. Hình như bạn đã cộng vào." },
        ],
        answer: 2,
        hint: "Tính số tiền được giảm (25% của 200.000đ) rồi lấy giá gốc trừ đi.",
        why: "25% của 200.000đ là 50.000đ, nên 200.000 − 50.000 = 150.000đ.",
        explanation: "Cách nhanh: giá mới = 200.000 × (100 − 25) ÷ 100 = 200.000 × 0,75 = 150.000đ.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "15 là bao nhiêu phần trăm của 60? (chỉ nhập số)",
        placeholder: "Ví dụ: 40",
        accept: ["25", "25%"],
        mistakes: [
          { match: ["4", "400", "400%"], feedback: "Bạn đã lấy 60 ÷ 15, tức là tính ngược. Hãy lấy số nhỏ chia cho số tổng." },
          { match: ["0.25", "0,25"], feedback: "Gần xong rồi! 0,25 là tỷ lệ. Hãy nhân thêm 100 để đổi sang phần trăm." },
        ],
        hint: "Lấy 15 ÷ 60, sau đó nhân với 100.",
        why: "15 ÷ 60 = 0,25, và 0,25 × 100 = 25%.",
        explanation: "A chiếm bao nhiêu % của B: A ÷ B × 100. Ở đây 15 ÷ 60 × 100 = 25%.",
      },
    ],
    extraQuiz: [
      { prompt: "10% của 450 là bao nhiêu?", accept: ["45"], explain: "450 ÷ 10 = 45." },
      { prompt: "Giá 80.000đ giảm 10% còn bao nhiêu nghìn đồng? (chỉ nhập số nghìn)", accept: ["72", "72000", "72.000"], explain: "80 × 0,9 = 72 nghìn đồng." },
    ],
  },
  {
    id: "math-linear-eq",
    subjectId: "math",
    title: "Phương trình bậc nhất một ẩn",
    level: "intermediate",
    minutes: 20,
    description: "Giải phương trình dạng ax + b = c bằng chuyển vế và chia hai vế.",
    objectives: [
      "Nhận dạng phương trình bậc nhất một ẩn.",
      "Áp dụng quy tắc chuyển vế đổi dấu.",
      "Kiểm tra lại nghiệm bằng cách thay vào phương trình.",
    ],
    sections: [
      {
        title: "Dạng phương trình",
        body: `<p>Phương trình bậc nhất một ẩn có dạng <strong>ax + b = 0</strong> với a ≠ 0.</p>
<p>Mục tiêu: đưa <strong>x</strong> về một vế, các số về vế còn lại.</p>`,
      },
      {
        title: "Hai quy tắc chính",
        body: `<ol><li><strong>Chuyển vế đổi dấu:</strong> một số hạng chuyển từ vế này sang vế kia phải đổi dấu (+ thành −, − thành +).</li>
<li><strong>Chia hai vế</strong> cho cùng một số khác 0 để tìm x.</li></ol>
<p>Luôn <strong>kiểm tra</strong> bằng cách thay x vào phương trình ban đầu.</p>`,
        example: `3x − 6 = 9
3x = 9 + 6      (chuyển −6 sang phải thành +6)
3x = 15
x = 5           (chia hai vế cho 3)
Kiểm tra: 3·5 − 6 = 9 ✓`,
      },
    ],
    simple:
      "Hãy coi phương trình như một cái cân thăng bằng. Bạn muốn x đứng một mình ở một bên. Cái gì cộng thêm vào x thì bỏ đi bằng cách trừ ở cả hai bên. Cái gì nhân với x thì chia cả hai bên cho nó.",
    examples: [
      "x + 5 = 12 → x = 12 − 5 = 7.",
      "Mua 3 cuốn vở giống nhau hết 45.000đ: 3x = 45.000, nên x = 15.000đ một cuốn.",
    ],
    keywords: {
      "chuyen ve": "Đưa một số hạng sang vế bên kia của dấu bằng và đổi dấu của nó.",
      "nghiem": "Giá trị của x làm cho hai vế của phương trình bằng nhau.",
      "an": "Đại lượng chưa biết cần tìm, thường ký hiệu là x.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Giải phương trình: 2x + 4 = 10",
        options: [
          { text: "x = 7", feedback: "Khi chuyển +4 sang vế phải, nó phải đổi thành −4. Bạn đã cộng thay vì trừ." },
          { text: "x = 3" },
          { text: "x = 12", feedback: "Sau khi có 2x = 6, bước tiếp theo là chia hai vế cho 2, không phải nhân." },
          { text: "x = 5", feedback: "Bạn đã chia 10 cho 2 nhưng quên xử lý số 4 trước." },
        ],
        answer: 1,
        hint: "Bước 1: chuyển 4 sang vế phải (nhớ đổi dấu). Bước 2: chia cho 2.",
        why: "2x = 10 − 4 = 6, rồi x = 6 ÷ 2 = 3. Kiểm tra: 2·3 + 4 = 10.",
        explanation: "Thứ tự: xử lý số hạng tự do (+4) trước bằng chuyển vế, sau đó mới chia cho hệ số của x.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Với phương trình 5x − 3 = 12, bước đầu tiên hợp lý là gì?",
        options: [
          { text: "Chia hai vế cho 3", feedback: "3 là số hạng tự do chứ không phải hệ số của x. Hãy đưa nó sang vế kia trước." },
          { text: "Trừ hai vế cho 5", feedback: "5 đang nhân với x, nên trừ 5 không giúp x đứng riêng." },
          { text: "Nhân hai vế với 5", feedback: "Nhân thêm làm phương trình phức tạp hơn. Hãy loại bỏ −3 trước." },
          { text: "Cộng 3 vào hai vế" },
        ],
        answer: 3,
        hint: "Đâu là số đang “cản” 5x đứng một mình ở vế trái?",
        why: "Cộng 3 vào hai vế loại bỏ −3, được 5x = 15 rồi x = 3.",
        explanation: "Cộng 3 vào hai vế tương đương chuyển −3 sang phải thành +3. Sau đó chia cho 5.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Giải phương trình 4x − 8 = 0. x = ?",
        placeholder: "Nhập giá trị của x",
        accept: ["2", "x=2"],
        mistakes: [
          { match: ["-2", "x=-2"], feedback: "Kiểm tra dấu: khi chuyển −8 sang vế phải, nó trở thành +8." },
          { match: ["32", "x=32"], feedback: "Sau khi có 4x = 8, bạn cần chia cho 4 chứ không nhân." },
          { match: ["8", "x=8"], feedback: "Đó mới là giá trị của 4x. Còn một bước nữa để tìm x." },
        ],
        hint: "Chuyển −8 sang phải, rồi chia hai vế cho 4.",
        why: "4x = 8, nên x = 2. Kiểm tra: 4·2 − 8 = 0.",
        explanation: "4x − 8 = 0 → 4x = 8 → x = 8 ÷ 4 = 2.",
      },
    ],
    extraQuiz: [
      { prompt: "Giải x + 7 = 12. x = ?", accept: ["5", "x=5"], explain: "x = 12 − 7 = 5." },
      { prompt: "Giải 3x = 21. x = ?", accept: ["7", "x=7"], explain: "x = 21 ÷ 3 = 7." },
    ],
  },

  // ───────────── JAVASCRIPT ─────────────
  {
    id: "js-variables",
    subjectId: "js",
    title: "Biến và kiểu dữ liệu",
    level: "beginner",
    minutes: 15,
    description: "Khai báo biến bằng let/const và nhận biết các kiểu dữ liệu cơ bản.",
    objectives: [
      "Phân biệt let và const.",
      "Nhận biết string, number, boolean, null, undefined.",
      "Dùng typeof để kiểm tra kiểu dữ liệu.",
    ],
    sections: [
      {
        title: "Biến là gì?",
        body: `<p><strong>Biến</strong> (variable) giống một chiếc hộp có dán nhãn để chứa dữ liệu.</p>
<ul><li><code>let</code>: có thể gán lại giá trị sau này.</li><li><code>const</code>: hằng (constant), không gán lại được.</li></ul>
<p><code>var</code> là cách khai báo cũ; mã hiện đại nên dùng <code>let</code>/<code>const</code>.</p>`,
        example: `const name = "An";
let age = 16;
age = 17;        // hợp lệ
// name = "Bình"; // lỗi: không gán lại const`,
      },
      {
        title: "Kiểu dữ liệu cơ bản",
        body: `<ul><li><strong>string</strong> (chuỗi): <code>"Xin chào"</code></li><li><strong>number</strong> (số): <code>42</code>, <code>3.14</code></li><li><strong>boolean</strong> (đúng/sai): <code>true</code>, <code>false</code></li><li><strong>null</strong>: cố ý “không có giá trị”</li><li><strong>undefined</strong>: chưa được gán giá trị</li></ul>
<p>Toán tử <code>typeof</code> cho biết kiểu: <code>typeof 42</code> → <code>"number"</code>.</p>`,
      },
    ],
    simple:
      "Biến giống cái hộp có tên để cất dữ liệu. Hộp dùng let thì sau này bạn đổi được đồ bên trong. Hộp dùng const thì đã cất là cố định. Cái gì nằm trong dấu nháy là chữ (string), dù nhìn giống số.",
    examples: [
      "let score = 0; score = score + 10; // score bây giờ là 10",
      "const PI = 3.14; typeof PI; // \"number\"",
    ],
    keywords: {
      "let": "Từ khóa khai báo biến có thể gán lại giá trị.",
      "const": "Từ khóa khai báo hằng: không gán lại được sau khi khai báo.",
      "typeof": "Toán tử trả về tên kiểu dữ liệu dưới dạng chuỗi, ví dụ \"string\".",
      "string": "Chuỗi ký tự, đặt trong dấu nháy đơn, nháy kép hoặc backtick.",
      "undefined": "Giá trị mặc định của biến đã khai báo nhưng chưa gán.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Muốn khai báo một giá trị không bao giờ thay đổi, bạn dùng từ khóa nào?",
        options: [
          { text: "let", feedback: "let cho phép gán lại giá trị, nên không phù hợp với giá trị cố định." },
          { text: "var", feedback: "var là cách khai báo cũ và cũng cho phép gán lại." },
          { text: "const" },
          { text: "variable", feedback: "“variable” không phải từ khóa trong JavaScript." },
        ],
        answer: 2,
        hint: "Từ khóa này là viết tắt của “constant” (hằng số).",
        why: "const khai báo một hằng, và gán lại sẽ gây lỗi TypeError.",
        explanation: "Quy tắc thực hành: mặc định dùng const; chỉ dùng let khi biết chắc giá trị sẽ đổi.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Biểu thức typeof \"42\" trả về gì?",
        options: [
          { text: "\"number\"", feedback: "Hãy để ý dấu nháy quanh 42. Dấu nháy làm thay đổi kiểu dữ liệu." },
          { text: "\"string\"" },
          { text: "\"boolean\"", feedback: "boolean chỉ có hai giá trị true và false." },
          { text: "\"undefined\"", feedback: "Giá trị \"42\" đã tồn tại, không phải undefined." },
        ],
        answer: 1,
        hint: "Mọi thứ nằm trong dấu nháy đều là ...?",
        why: "\"42\" nằm trong dấu nháy nên là chuỗi (string), dù trông giống số.",
        explanation: "typeof 42 → \"number\", nhưng typeof \"42\" → \"string\". Muốn đổi chuỗi sang số: Number(\"42\").",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Điền từ khóa hiện đại phù hợp: “___ score = 0; score = 10;”",
        placeholder: "Nhập một từ khóa",
        accept: ["let"],
        mistakes: [
          { match: ["const"], feedback: "Dòng thứ hai gán lại score = 10. const sẽ báo lỗi trong trường hợp này." },
          { match: ["var"], feedback: "var vẫn chạy được, nhưng mã hiện đại khuyến nghị một từ khóa khác có phạm vi khối (block scope)." },
        ],
        hint: "Biến này bị gán lại ở dòng thứ hai.",
        why: "Biến cần gán lại thì dùng let.",
        explanation: "let có phạm vi khối và cho phép gán lại, phù hợp với điểm số thay đổi trong chương trình.",
      },
    ],
    extraQuiz: [
      { prompt: "typeof true trả về chuỗi gì?", accept: ["boolean", "\"boolean\""], explain: "true là kiểu boolean." },
      { prompt: "Biến đã khai báo nhưng chưa gán có giá trị gì?", accept: ["undefined"], explain: "let x; → x là undefined." },
    ],
  },
  {
    id: "js-conditions",
    subjectId: "js",
    title: "Câu lệnh điều kiện if/else",
    level: "beginner",
    minutes: 15,
    description: "Cho chương trình ra quyết định với if, else if, else và toán tử so sánh.",
    objectives: [
      "Viết câu lệnh if / else if / else.",
      "Phân biệt === và ==.",
      "Kết hợp điều kiện bằng && và ||.",
    ],
    sections: [
      {
        title: "Cấu trúc if/else",
        body: `<p>Chương trình kiểm tra điều kiện từ trên xuống và chạy <strong>nhánh đầu tiên đúng</strong>.</p>`,
        example: `const t = 30;
if (t > 35) {
  console.log("Nóng");
} else if (t > 25) {
  console.log("Ấm");
} else {
  console.log("Mát");
}`,
      },
      {
        title: "So sánh và kết hợp điều kiện",
        body: `<ul><li><code>===</code>: bằng nghiêm ngặt (so cả giá trị và kiểu). Nên dùng.</li><li><code>==</code>: bằng lỏng (tự đổi kiểu), dễ gây nhầm lẫn.</li><li><code>&amp;&amp;</code> (và): cả hai đều đúng.</li><li><code>||</code> (hoặc): ít nhất một vế đúng.</li><li><code>!</code> (phủ định): đảo đúng thành sai.</li></ul>`,
      },
    ],
    simple:
      "if giống câu “nếu… thì…”. Máy tính đọc từng điều kiện từ trên xuống, gặp điều kiện nào đúng trước thì làm việc đó rồi bỏ qua phần còn lại. Dùng === để so sánh cho chắc, vì nó kiểm tra cả kiểu dữ liệu.",
    examples: [
      "if (age >= 18) { console.log(\"Đủ tuổi\"); } else { console.log(\"Chưa đủ tuổi\"); }",
      "if (isWeekend && isSunny) { console.log(\"Đi dã ngoại!\"); }",
    ],
    keywords: {
      "===": "So sánh bằng nghiêm ngặt: đúng khi cùng giá trị VÀ cùng kiểu.",
      "&&": "Toán tử VÀ: chỉ đúng khi cả hai vế đều đúng.",
      "||": "Toán tử HOẶC: đúng khi ít nhất một vế đúng.",
      "else if": "Nhánh điều kiện bổ sung, chỉ được kiểm tra khi các điều kiện trước đều sai.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Biểu thức 5 === \"5\" cho kết quả gì?",
        options: [
          { text: "true", feedback: "=== so sánh cả kiểu dữ liệu. Một bên là number, một bên là string. (Với == thì mới ra true.)" },
          { text: "false" },
          { text: "Báo lỗi", feedback: "JavaScript không báo lỗi khi so sánh hai kiểu khác nhau, nó chỉ trả về một giá trị boolean." },
          { text: "undefined", feedback: "Phép so sánh luôn trả về true hoặc false." },
        ],
        answer: 1,
        hint: "Kiểu của 5 là gì? Kiểu của \"5\" là gì?",
        why: "Một bên là number, một bên là string, và === yêu cầu cùng kiểu nên kết quả là false.",
        explanation: "5 == \"5\" → true (vì == tự đổi kiểu), nhưng 5 === \"5\" → false. Đó là lý do nên dùng === để tránh bất ngờ.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Với t = 30, đoạn mã ví dụ ở phần 1 in ra gì?",
        options: [
          { text: "Nóng", feedback: "Điều kiện đầu là t > 35. Với t = 30 thì điều kiện này đúng hay sai?" },
          { text: "Ấm" },
          { text: "Mát", feedback: "Nhánh else chỉ chạy khi mọi điều kiện phía trên đều sai. Hãy kiểm tra t > 25." },
          { text: "Ấm và Mát", feedback: "if/else if/else chỉ chạy đúng một nhánh, là nhánh đầu tiên có điều kiện đúng." },
        ],
        answer: 1,
        hint: "Kiểm tra lần lượt: 30 > 35? Rồi 30 > 25?",
        why: "30 > 35 sai, 30 > 25 đúng, nên chương trình in “Ấm” và dừng.",
        explanation: "Chuỗi if/else if/else chỉ thực hiện nhánh đúng đầu tiên rồi bỏ qua phần còn lại.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Toán tử logic “VÀ” trong JavaScript được viết như thế nào?",
        placeholder: "Nhập ký hiệu",
        accept: ["&&"],
        mistakes: [
          { match: ["and"], feedback: "JavaScript không dùng từ “and” mà dùng ký hiệu." },
          { match: ["&"], feedback: "Gần đúng! Một ký hiệu & là toán tử bit. Toán tử logic cần nhiều hơn." },
          { match: ["||"], feedback: "|| là toán tử HOẶC. Toán tử VÀ dùng ký hiệu khác." },
        ],
        hint: "Gồm hai ký tự giống nhau, ký tự này còn gọi là “ampersand”.",
        why: "&& là toán tử VÀ logic.",
        explanation: "a && b chỉ đúng khi cả a và b đều đúng. Ví dụ: age >= 18 && hasTicket.",
      },
    ],
    extraQuiz: [
      { prompt: "Toán tử logic “HOẶC” viết thế nào?", accept: ["||"], explain: "|| – đúng khi ít nhất một vế đúng." },
      { prompt: "!true bằng gì?", accept: ["false"], explain: "! đảo giá trị: !true → false." },
    ],
  },
  {
    id: "js-functions",
    subjectId: "js",
    title: "Hàm (function) và giá trị trả về",
    level: "intermediate",
    minutes: 20,
    description: "Đóng gói đoạn mã để tái sử dụng với tham số và return.",
    objectives: [
      "Khai báo và gọi hàm.",
      "Phân biệt tham số (parameter) và đối số (argument).",
      "Hiểu vai trò của return và arrow function.",
    ],
    sections: [
      {
        title: "Khai báo và gọi hàm",
        body: `<p><strong>Hàm</strong> gom một đoạn mã có tên để dùng lại nhiều lần.</p>
<ul><li><strong>Tham số</strong> (parameter): tên biến trong khai báo hàm.</li><li><strong>Đối số</strong> (argument): giá trị thật truyền vào khi gọi.</li><li><code>return</code>: trả kết quả về nơi gọi hàm.</li></ul>`,
        example: `function double(n) {
  return n * 2;
}
double(4); // 8`,
      },
      {
        title: "Arrow function",
        body: `<p>Cách viết ngắn gọn: <code>const add = (a, b) =&gt; a + b;</code></p>
<p>Hàm <strong>không có return</strong> sẽ trả về <code>undefined</code>.</p>`,
      },
    ],
    simple:
      "Hàm giống một chiếc máy xay sinh tố: bạn bỏ nguyên liệu vào (đối số), máy làm việc, rồi đưa ra ly sinh tố (giá trị return). Không có return thì giống máy chạy xong mà không rót ra ly nào, và kết quả bạn nhận được là undefined.",
    examples: [
      "function greet(name) { return \"Xin chào, \" + name; } greet(\"Mai\"); // \"Xin chào, Mai\"",
      "const square = x => x * x; square(5); // 25",
    ],
    keywords: {
      "return": "Trả giá trị về nơi gọi hàm và kết thúc hàm ngay lập tức.",
      "tham so": "Parameter – tên biến đặt trong dấu ngoặc khi khai báo hàm.",
      "doi so": "Argument – giá trị cụ thể truyền vào khi gọi hàm.",
      "arrow function": "Cú pháp hàm ngắn gọn dùng =>, ví dụ (a, b) => a + b.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Với hàm double ở phần 1, double(4) trả về gì?",
        options: [
          { text: "4", feedback: "Hàm không trả lại nguyên giá trị đầu vào. Hãy xem dòng return làm gì với n." },
          { text: "\"n * 2\"", feedback: "return trả về kết quả của phép tính, không phải đoạn chữ." },
          { text: "8" },
          { text: "undefined", feedback: "Hàm này có return, nên nó trả về một giá trị cụ thể." },
        ],
        answer: 2,
        hint: "Thay n = 4 vào dòng return.",
        why: "n = 4, và return n * 2 cho kết quả 8.",
        explanation: "Khi gọi double(4), tham số n nhận giá trị 4, rồi return 4 * 2 = 8 trả về nơi gọi.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Một hàm không có câu lệnh return thì trả về gì khi được gọi?",
        options: [
          { text: "null", feedback: "null phải được gán chủ động. JavaScript dùng một giá trị mặc định khác." },
          { text: "0", feedback: "JavaScript không tự trả về số 0." },
          { text: "Báo lỗi", feedback: "Hàm không có return vẫn chạy bình thường, không báo lỗi." },
          { text: "undefined" },
        ],
        answer: 3,
        hint: "Đây cũng là giá trị của một biến khai báo mà chưa gán.",
        why: "Hàm không có return thì mặc định trả về undefined.",
        explanation: "Ví dụ: function hi() { console.log(\"hi\"); } – gọi hi() sẽ in “hi” nhưng giá trị trả về là undefined.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Điền từ khóa còn thiếu: “function sum(a, b) { ___ a + b; }”",
        placeholder: "Nhập một từ khóa",
        accept: ["return"],
        mistakes: [
          { match: ["console.log", "print", "log"], feedback: "console.log chỉ in ra màn hình, không trả giá trị về cho nơi gọi hàm." },
        ],
        hint: "Từ khóa này “gửi” kết quả trở lại nơi gọi hàm.",
        why: "return trả về tổng a + b.",
        explanation: "Không có return, sum(2, 3) sẽ trả về undefined dù phép cộng vẫn được tính.",
      },
    ],
    extraQuiz: [
      { prompt: "const sq = x => x * x; Vậy sq(3) bằng bao nhiêu?", accept: ["9"], explain: "3 * 3 = 9." },
      { prompt: "Từ khóa dùng để khai báo hàm theo cách truyền thống là gì?", accept: ["function"], explain: "function tenHam() { ... }" },
    ],
  },

  // ───────────── KỸ NĂNG VIẾT ─────────────
  {
    id: "write-topic-sentence",
    subjectId: "write",
    title: "Viết câu chủ đề rõ ràng",
    level: "beginner",
    minutes: 10,
    description: "Viết câu chủ đề nêu đúng ý chính, không quá rộng cũng không quá hẹp.",
    objectives: [
      "Hiểu vai trò của câu chủ đề trong đoạn văn.",
      "Xác định chủ đề và ý kiểm soát.",
      "Nhận biết câu chủ đề quá rộng hoặc quá hẹp.",
    ],
    sections: [
      {
        title: "Câu chủ đề là gì?",
        body: `<p><strong>Câu chủ đề</strong> (topic sentence) nêu ý chính của cả đoạn và thường đứng <strong>đầu đoạn</strong>.</p>
<p>Gồm hai phần: <strong>chủ đề</strong> (nói về cái gì) + <strong>ý kiểm soát</strong> (controlling idea: nói gì về nó).</p>`,
        example: `Đi xe đạp đến trường | giúp tiết kiệm chi phí và tốt cho sức khỏe.
   (chủ đề)            |          (ý kiểm soát)`,
      },
      {
        title: "Không quá rộng, không quá hẹp",
        body: `<ul><li><strong>Quá rộng:</strong> “Thể thao rất hay.” (không biết đoạn văn sẽ bàn gì)</li><li><strong>Quá hẹp:</strong> “Tôi chạy 3 km hôm qua.” (chỉ là một chi tiết, khó phát triển)</li><li><strong>Vừa đủ:</strong> “Chạy bộ buổi sáng giúp tôi tỉnh táo hơn khi học.”</li></ul>`,
      },
    ],
    simple:
      "Câu chủ đề là câu “tóm tắt trước” cho cả đoạn. Người đọc chỉ cần đọc câu đó là biết đoạn văn nói về gì và theo hướng nào. Câu này nên cụ thể, đừng chung chung như “Thể thao rất hay”.",
    examples: [
      "Học nhóm giúp học sinh hiểu bài sâu hơn nhờ được giải thích cho nhau.",
      "Điện thoại thông minh có thể làm giảm sự tập trung nếu dùng trong giờ học.",
    ],
    keywords: {
      "cau chu de": "Topic sentence – câu nêu ý chính của đoạn văn.",
      "y kiem soat": "Controlling idea – phần cho biết người viết sẽ nói gì về chủ đề.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Câu nào là câu chủ đề tốt nhất cho đoạn văn về lợi ích của việc đọc sách?",
        options: [
          { text: "Sách có rất nhiều loại khác nhau.", feedback: "Câu này quá chung và không nêu lợi ích nào. Đoạn văn sẽ thiếu hướng." },
          { text: "Tôi đã đọc 3 cuốn sách vào tháng trước.", feedback: "Đây là một chi tiết cá nhân, quá hẹp để làm câu chủ đề." },
          { text: "Đọc sách mỗi ngày giúp học sinh mở rộng vốn từ và rèn khả năng tập trung." },
          { text: "Bạn có thích đọc sách không?", feedback: "Câu hỏi có thể mở bài, nhưng không nêu được ý chính của đoạn." },
        ],
        answer: 2,
        hint: "Tìm câu có cả chủ đề (đọc sách) và nêu rõ lợi ích cụ thể.",
        why: "Câu này có chủ đề (đọc sách mỗi ngày) và ý kiểm soát rõ ràng (mở rộng vốn từ, rèn tập trung).",
        explanation: "Câu chủ đề tốt định hướng cho cả đoạn: các câu sau sẽ lần lượt chứng minh “mở rộng vốn từ” và “rèn tập trung”.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Trong câu “Đi xe đạp đến trường giúp tiết kiệm chi phí và tốt cho sức khỏe.”, đâu là ý kiểm soát?",
        options: [
          { text: "Đi xe đạp", feedback: "“Đi xe đạp đến trường” là chủ đề, tức là cái được nói đến." },
          { text: "tiết kiệm chi phí và tốt cho sức khỏe" },
          { text: "đến trường", feedback: "Đây là một phần của chủ đề, chưa phải điều người viết khẳng định." },
          { text: "giúp", feedback: "“giúp” chỉ là từ nối. Ý kiểm soát là nội dung đi sau nó." },
        ],
        answer: 1,
        hint: "Ý kiểm soát trả lời câu hỏi: người viết nói gì về việc đi xe đạp?",
        why: "“Tiết kiệm chi phí và tốt cho sức khỏe” là điều người viết sẽ chứng minh.",
        explanation: "Chủ đề = đi xe đạp đến trường. Ý kiểm soát = tiết kiệm chi phí và tốt cho sức khỏe. Đoạn văn sẽ có ít nhất hai ý phát triển tương ứng.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Câu chủ đề phổ biến nhất đứng ở vị trí nào trong đoạn văn? (đầu / giữa / cuối)",
        placeholder: "Nhập một từ",
        accept: ["dau", "dau doan", "o dau", "dau doan van", "o dau doan"],
        mistakes: [
          { match: ["cuoi", "cuoi doan", "o cuoi"], feedback: "Câu chủ đề có thể đứng cuối (đoạn quy nạp), nhưng đó không phải vị trí phổ biến nhất." },
          { match: ["giua", "o giua"], feedback: "Hiếm khi câu chủ đề đứng giữa đoạn. Hãy nghĩ: người đọc cần biết ý chính khi nào?" },
        ],
        hint: "Người đọc cần biết ý chính càng sớm càng tốt.",
        why: "Đặt câu chủ đề ở đầu đoạn (đoạn diễn dịch) giúp người đọc nắm ý ngay.",
        explanation: "Đoạn diễn dịch có câu chủ đề ở đầu và là dạng phổ biến nhất. Đoạn quy nạp đặt câu chủ đề ở cuối.",
      },
    ],
    extraQuiz: [
      { prompt: "Câu “Thể thao rất hay.” quá rộng hay quá hẹp?", accept: ["rong", "qua rong"], explain: "Quá rộng: không cho biết đoạn văn sẽ bàn khía cạnh nào." },
      { prompt: "Câu chủ đề gồm chủ đề và “ý ___” (điền 2 từ).", accept: ["kiem soat", "y kiem soat"], explain: "Ý kiểm soát (controlling idea)." },
    ],
  },
  {
    id: "write-paragraph",
    subjectId: "write",
    title: "Cấu trúc đoạn văn PEEL",
    level: "intermediate",
    minutes: 15,
    description: "Xây dựng đoạn văn chặt chẽ theo mô hình Point – Evidence – Explain – Link.",
    objectives: [
      "Nhận biết 3 phần của đoạn văn: mở, thân, kết.",
      "Áp dụng mô hình PEEL.",
      "Chọn câu phát triển phù hợp với câu chủ đề.",
    ],
    sections: [
      {
        title: "Ba phần của đoạn văn",
        body: `<ol><li><strong>Câu chủ đề</strong>: nêu ý chính.</li><li><strong>Câu phát triển</strong>: lý lẽ, ví dụ, số liệu chứng minh.</li><li><strong>Câu kết</strong>: tóm lại hoặc nối sang đoạn sau.</li></ol>`,
      },
      {
        title: "Mô hình PEEL",
        body: `<ul><li><strong>P – Point</strong>: luận điểm (câu chủ đề)</li><li><strong>E – Evidence</strong>: bằng chứng, ví dụ</li><li><strong>E – Explain</strong>: giải thích bằng chứng ủng hộ luận điểm như thế nào</li><li><strong>L – Link</strong>: liên kết về luận điểm hoặc sang đoạn kế tiếp</li></ul>`,
        example: `P: Học nhóm giúp ghi nhớ lâu hơn.
E: Khi giảng lại bài cho bạn, em phải tự sắp xếp kiến thức.
E: Việc sắp xếp này buộc não xử lý sâu hơn so với chỉ đọc.
L: Vì vậy, mỗi tuần nên có ít nhất một buổi học nhóm.`,
      },
    ],
    simple:
      "Một đoạn văn tốt giống một cái bánh kẹp. Lớp trên là ý chính, phần nhân ở giữa là bằng chứng kèm lời giải thích, và lớp dưới là câu kết để khép lại. PEEL là mẹo nhớ thứ tự: Ý chính, Bằng chứng, Giải thích, Liên kết.",
    examples: [
      "P: Ăn sáng đầy đủ giúp học tốt hơn. E: Nhiều học sinh bỏ bữa sáng hay mất tập trung vào tiết hai. E: Não cần năng lượng để duy trì chú ý. L: Do đó, bữa sáng là một phần của việc học hiệu quả.",
    ],
    keywords: {
      "peel": "Point – Evidence – Explain – Link: mô hình xây dựng đoạn văn lập luận.",
      "cau phat trien": "Các câu ở thân đoạn, đưa lý lẽ và bằng chứng cho câu chủ đề.",
      "cau ket": "Câu cuối đoạn, tóm lại ý chính hoặc chuyển tiếp.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Trong PEEL, chữ “E” thứ nhất là viết tắt của gì?",
        options: [
          { text: "Ending – kết thúc", feedback: "Phần kết là chữ L (Link). Chữ E đầu tiên đứng ngay sau luận điểm." },
          { text: "Evidence – bằng chứng" },
          { text: "Emotion – cảm xúc", feedback: "PEEL tập trung vào lập luận, không phải cảm xúc." },
          { text: "Explain – giải thích", feedback: "Explain là chữ E thứ hai. Trước khi giải thích, ta cần có thứ gì để giải thích?" },
        ],
        answer: 1,
        hint: "Sau khi nêu luận điểm, bạn cần đưa ra gì để chứng minh?",
        why: "E đầu tiên là Evidence, tức bằng chứng hoặc ví dụ ủng hộ luận điểm.",
        explanation: "Thứ tự PEEL: Point (luận điểm) → Evidence (bằng chứng) → Explain (giải thích) → Link (liên kết).",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Câu nào phù hợp làm câu phát triển cho câu chủ đề “Tập thể dục buổi sáng giúp tinh thần tỉnh táo.”?",
        options: [
          { text: "Tôi thích ăn phở vào buổi sáng.", feedback: "Câu này lạc đề, không liên quan đến tập thể dục hay sự tỉnh táo." },
          { text: "Thể dục có rất nhiều môn khác nhau.", feedback: "Câu này chung chung và không chứng minh được sự tỉnh táo." },
          { text: "Tóm lại, ai cũng nên tập thể dục.", feedback: "Đây là kiểu câu kết, không phải câu phát triển." },
          { text: "Sau 20 phút chạy bộ, cơ thể tiết ra endorphin khiến ta thấy sảng khoái." },
        ],
        answer: 3,
        hint: "Câu phát triển phải giải thích hoặc chứng minh vì sao thể dục giúp tỉnh táo.",
        why: "Câu này đưa ra cơ chế cụ thể (endorphin) giải thích vì sao tinh thần tỉnh táo hơn.",
        explanation: "Câu phát triển tốt: liên quan trực tiếp đến ý kiểm soát và có chi tiết cụ thể như số liệu, cơ chế hoặc ví dụ.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Chữ “L” trong PEEL là viết tắt của từ tiếng Anh nào?",
        placeholder: "Nhập một từ tiếng Anh",
        accept: ["link"],
        mistakes: [
          { match: ["last", "lead"], feedback: "Không phải từ này. Phần cuối PEEL có nhiệm vụ “nối” đoạn văn lại." },
        ],
        hint: "Nghĩa tiếng Việt là “liên kết”.",
        why: "L = Link, nghĩa là liên kết về luận điểm hoặc sang đoạn kế tiếp.",
        explanation: "Link giúp bài viết mạch lạc: nhắc lại luận điểm theo cách mới hoặc dẫn sang ý sau.",
      },
    ],
    extraQuiz: [
      { prompt: "Chữ “P” trong PEEL là viết tắt của từ tiếng Anh nào?", accept: ["point"], explain: "P = Point, tức luận điểm." },
      { prompt: "Câu cuối đoạn có vai trò tóm lại ý chính gọi là “câu ___”?", accept: ["ket", "cau ket"], explain: "Câu kết." },
    ],
  },
  {
    id: "write-editing",
    subjectId: "write",
    title: "Tự sửa bài viết hiệu quả",
    level: "intermediate",
    minutes: 12,
    description: "Sửa bài theo hai vòng: ý và cấu trúc trước, câu chữ sau.",
    objectives: [
      "Sắp xếp thứ tự sửa bài hợp lý.",
      "Phát hiện lỗi lặp từ và câu dài rườm rà.",
      "Dùng kỹ thuật đọc to để kiểm tra.",
    ],
    sections: [
      {
        title: "Sửa theo hai vòng",
        body: `<ol><li><strong>Vòng lớn</strong>: ý chính có rõ không? Thứ tự đoạn có hợp lý không? Có ý nào thừa/thiếu?</li><li><strong>Vòng nhỏ</strong>: chính tả, dấu câu, lặp từ, câu quá dài.</li></ol>
<p>Sửa vòng lớn trước, vì có thể bạn sẽ xóa hoặc viết lại cả đoạn.</p>`,
      },
      {
        title: "Mẹo sửa câu",
        body: `<ul><li><strong>Đọc to</strong> để nghe chỗ vấp, chỗ dài hơi.</li><li>Thay từ lặp bằng từ đồng nghĩa hoặc đại từ.</li><li>Tách câu dài trên 30 chữ thành hai câu.</li><li>Kiểm tra từ nối: <em>vì, nên, tuy nhiên, do đó</em>.</li></ul>`,
        example: `Trước: Em rất rất thích môn văn vì môn văn giúp em thích viết.
Sau:  Em rất thích môn Văn vì nó giúp em yêu việc viết.`,
      },
    ],
    simple:
      "Sửa bài giống dọn phòng: kê lại đồ lớn như giường, tủ trước (ý và bố cục), rồi mới lau bụi (chính tả, dấu câu). Đọc to bài viết lên để nghe chỗ nào vấp thì sửa chỗ đó.",
    examples: [
      "Câu lặp “bạn ấy… bạn ấy… bạn ấy” → thay bằng tên riêng hoặc “cô ấy” xen kẽ.",
      "Câu 40 chữ có ba ý → tách thành hai câu, mỗi câu một ý chính.",
    ],
    keywords: {
      "vong lon": "Lần sửa tập trung vào ý, bố cục, lập luận.",
      "vong nho": "Lần sửa tập trung vào chính tả, dấu câu, từ ngữ.",
      "doc to": "Đọc thành tiếng để phát hiện câu trúc trúc, lặp từ, thiếu nhịp.",
    },
    questions: [
      {
        id: "q1",
        type: "mcq",
        prompt: "Khi tự sửa bài, bạn nên ưu tiên sửa gì trước?",
        options: [
          { text: "Chính tả", feedback: "Sửa chính tả trước có thể phí công nếu sau đó bạn xóa cả đoạn vì sai ý." },
          { text: "Phông chữ và trình bày", feedback: "Trình bày quan trọng nhưng nên làm sau cùng." },
          { text: "Ý chính và cấu trúc" },
          { text: "Dấu câu", feedback: "Dấu câu thuộc vòng sửa nhỏ. Hãy nghĩ đến thứ ảnh hưởng toàn bài trước." },
        ],
        answer: 2,
        hint: "Sửa những thứ lớn, ảnh hưởng cả bài trước.",
        why: "Ý và cấu trúc quyết định toàn bài, nên sửa trước để tránh phí công sửa câu chữ ở đoạn sẽ bị bỏ.",
        explanation: "Quy trình: Vòng lớn (ý, bố cục, lập luận) → Vòng nhỏ (từ ngữ, chính tả, dấu câu) → Trình bày.",
      },
      {
        id: "q2",
        type: "mcq",
        prompt: "Câu “Em rất rất thích môn văn vì môn văn giúp em thích viết.” mắc lỗi chính nào?",
        options: [
          { text: "Lặp từ" },
          { text: "Sai chính tả", feedback: "Các từ trong câu đều viết đúng chính tả. Hãy đếm xem từ nào xuất hiện nhiều lần." },
          { text: "Thiếu chủ ngữ", feedback: "Câu có chủ ngữ là “Em”." },
          { text: "Thiếu dấu chấm câu", feedback: "Câu đã có dấu chấm. Lỗi nằm ở cách dùng từ." },
        ],
        answer: 0,
        hint: "Đếm số lần xuất hiện của “rất”, “môn văn” và “thích”.",
        why: "Câu lặp “rất rất”, “môn văn” và “thích” nhiều lần nên nghe nặng nề.",
        explanation: "Sửa: “Em rất thích môn Văn vì nó giúp em yêu việc viết.” – dùng đại từ “nó” và từ đồng nghĩa “yêu”.",
      },
      {
        id: "q3",
        type: "short",
        prompt: "Kỹ thuật đọc thành tiếng để phát hiện câu trúc trúc gọi là “đọc ___” (một từ).",
        placeholder: "Nhập một từ",
        accept: ["to", "doc to", "thanh tieng"],
        mistakes: [
          { match: ["lai", "doc lai"], feedback: "Đọc lại thôi là chưa đủ. Kỹ thuật này cần phát ra âm thanh." },
          { match: ["tham", "nham"], feedback: "Đọc thầm khó phát hiện chỗ vấp. Thử nghĩ ngược lại nhé." },
        ],
        hint: "Ngược với “đọc thầm”.",
        why: "Đọc to giúp tai phát hiện những chỗ mắt dễ bỏ qua.",
        explanation: "Khi đọc to, bạn sẽ vấp ở câu quá dài, thiếu dấu phẩy hoặc từ lặp, và đó là những chỗ cần sửa.",
      },
    ],
    extraQuiz: [
      { prompt: "Nên sửa “vòng lớn” hay “vòng nhỏ” trước?", accept: ["lon", "vong lon"], explain: "Vòng lớn: ý và bố cục." },
      { prompt: "Câu dài bao nhiêu chữ trở lên thì nên cân nhắc tách? (nhập số)", accept: ["30"], explain: "Gợi ý thực hành: câu trên khoảng 30 chữ nên tách." },
    ],
  },
];

export function getLesson(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id) || null;
}

export function lessonsOf(subjectId) {
  return LESSONS.filter((l) => l.subjectId === subjectId);
}

export function nextLessonAfter(id) {
  const lesson = getLesson(id);
  if (!lesson) return null;
  const list = lessonsOf(lesson.subjectId);
  const idx = list.findIndex((l) => l.id === id);
  return list[idx + 1] || null;
}
