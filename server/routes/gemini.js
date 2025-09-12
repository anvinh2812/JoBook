const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database'); // PostgreSQL pool

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Schema mô tả cho Gemini
const schemaDescription = `
Database JoBook (PostgreSQL):

1. users
- id (PK)
- full_name
- email (unique)
- password_hash
- account_type ('candidate' | 'company' | 'admin')
- bio
- avatar_url
- company_id (FK -> companies.id, nullable)
- created_at, updated_at

2. cvs
- id (PK)
- name
- user_id (FK -> users.id)
- file_url (PDF link)
- is_active
- created_at

3. posts
- id (PK)
- user_id (FK -> users.id)
- company_id (FK -> companies.id, nullable)
- post_type ('find_job' | 'find_candidate')
- title
- description
- attached_cv_id (FK -> cvs.id)
- created_at

4. applications
- id (PK)
- post_id (FK -> posts.id)
- cv_id (FK -> cvs.id)
- applicant_id (FK -> users.id)
- status ('pending','reviewed','accepted','rejected')
- created_at

5. follows
- follower_id (FK -> users.id)
- following_id (FK -> users.id)
- created_at

6. companies
- id (PK)
- name (NOT NULL)
- legal_name (nullable)
- tax_code (unique, NOT NULL)
- address (TEXT, NOT NULL)
- contact_phone (nullable)
- logo_url (nullable)
- status ('pending' | 'accepted' | 'rejected', default 'pending')
- reviewed_by_user_id (FK -> users.id, nullable)
- review_note (TEXT, nullable)
- reviewed_at (timestamp, nullable)
- created_at, updated_at
`;

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // B1. Prompt để sinh SQL an toàn
    const sqlPrompt = `
Bạn là trợ lý SQL cho hệ thống JoBook. 
Schema cơ sở dữ liệu:

${schemaDescription}

QUY TẮC BẢO MẬT:
1. Chỉ được phép sinh câu lệnh SQL SELECT.
2. Chỉ được truy vấn các cột PUBLIC:
   - users: id, full_name, email, account_type, bio, avatar_url, created_at
   - cvs: id, name, file_url, is_active, created_at
   - posts: id, post_type, title, description, created_at
   - applications: id, post_id, cv_id, applicant_id, status, created_at
   - follows: follower_id, following_id, created_at
   - companies: id, name, address, contact_phone, logo_url, created_at
   - companies.status chỉ được dùng để lọc status='accepted'.
3. Tuyệt đối KHÔNG được phép truy vấn các cột nhạy cảm như: 
   password_hash, tax_code, legal_name, company_id, review_note, reviewed_by_user_id, reviewed_at, hay status khác 'accepted'.
4. Nếu người dùng hỏi về dữ liệu thuộc diện private/bảo mật → trả lời đúng một câu: 
   "Bạn không có quyền truy cập thông tin này."

Người dùng hỏi: "${prompt}"

👉 Nếu câu hỏi hợp lệ, chỉ in ra SQL SELECT đúng với PostgreSQL.
👉 Nếu câu hỏi yêu cầu dữ liệu nhạy cảm, trả về đúng câu: "Xin lỗi! Tôi không có quyền truy cập thông tin này."
    `;

    const sqlResult = await model.generateContent(sqlPrompt);
    let sqlQuery = sqlResult.response.candidates[0].content.parts[0].text.trim();

    // Loại bỏ ```sql ... ```
    sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();

    console.log('🔎 Gemini SQL:', sqlQuery);

    // Nếu AI trả lời câu bảo mật thì trả thẳng cho user
    if (sqlQuery.toLowerCase().includes('Xin lỗi! Tôi không có quyền truy cập')) {
      return res.json({ response: 'Xin lỗi! Tôi không có quyền truy cập thông tin này.' });
    }

    // Bảo mật: chỉ cho phép SELECT
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.json({ response: 'Xin lỗi! Tôi không có quyền truy cập thông tin này.' });
    }

    // B2. Thực thi SQL
    const dbResult = await pool.query(sqlQuery);
    const rows = dbResult.rows;

    // B3. Nhờ Gemini trả lời tự nhiên dựa trên dữ liệu DB
    const answerPrompt = `
Người dùng hỏi: "${prompt}"
Dữ liệu từ database:
${JSON.stringify(rows, null, 2)}

👉 Hãy trả lời tự nhiên, ngắn gọn, dễ hiểu bằng tiếng Việt.
Nếu dữ liệu rỗng, hãy trả lời "Không tìm thấy dữ liệu phù hợp."
    `;

    const answerResult = await model.generateContent(answerPrompt);
    const answerText = answerResult.response.candidates[0].content.parts[0].text;

    return res.json({ response: answerText, sql: sqlQuery, data: rows });
  } catch (err) {
    console.error('🚨 Gemini DB Error:', err);
    return res.status(500).json({
      error: 'Gemini DB error',
      detail: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
