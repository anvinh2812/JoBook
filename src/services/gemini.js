import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

export const suggestCVSummary = async (data) => {
  const fullName = data.fullName || "ứng viên";
  const appliedPosition = data.appliedPosition || "vị trí phù hợp";
  const skills = data.skillsList?.map(s => s.name).filter(Boolean).join(", ") || "các kỹ năng phù hợp";
  const experience = data.experienceList?.map(e => e.details).filter(Boolean).join(", ") || "một số kinh nghiệm liên quan";

  const prompt = `
    Viết một đoạn tóm tắt mục tiêu nghề nghiệp ấn tượng dành cho ứng viên.
    Họ tên: ${fullName}
    Vị trí ứng tuyển: ${appliedPosition}
    Kỹ năng: ${skills}
    Kinh nghiệm: ${experience}

    Tóm tắt dưới 100 từ, ngắn gọn, thu hút nhà tuyển dụng.
  `;

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );

  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

