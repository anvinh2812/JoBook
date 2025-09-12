const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database'); // PostgreSQL pool

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách cột bị cấm truy vấn
const FORBIDDEN_COLUMNS = ['password_hash', 'tax_code'];

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
- email
- code
`;

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // B1. Nhờ Gemini sinh SQL
    const sqlPrompt = `
Bạn là trợ lý SQL. Dựa trên schema sau:
${schemaDescription}

Người dùng hỏi: "${prompt}"

Yêu cầu:
1. Chỉ tạo truy vấn SELECT hợp lệ cho PostgreSQL.
2. Tuyệt đối không truy vấn các cột nhạy cảm: ${FORBIDDEN_COLUMNS.join(', ')}.
3. Trả về duy nhất câu lệnh SQL, không giải thích, không markdown.
    `;

    const sqlResult = await model.generateContent(sqlPrompt);
    let sqlQuery = sqlResult.response.candidates[0].content.parts[0].text.trim();

    // Loại bỏ ```sql ... ```
    sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();

    console.log('🔎 Gemini SQL:', sqlQuery);

    // Check cột cấm
    if (FORBIDDEN_COLUMNS.some(col => sqlQuery.toLowerCase().includes(col))) {
      return res.json({
        response: 'Xin lỗi! Tôi không có quyền truy cập thông tin nhạy cảm.'
      });
    }

    // Chỉ cho phép SELECT
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.json({
        response: 'Tôi chưa hiểu rõ câu hỏi của bạn, bạn có thể diễn đạt lại không?',
        sql: sqlQuery
      });
    }

    // B2. Thực thi SQL
    const dbResult = await pool.query(sqlQuery);
    const rows = dbResult.rows;

    // B3. Nhờ Gemini trả lời tự nhiên dựa trên dữ liệu DB
    const answerPrompt = `
Người dùng hỏi: "${prompt}"
Dữ liệu từ database:
${JSON.stringify(rows, null, 2)}

Hãy trả lời tự nhiên, ngắn gọn, dễ hiểu bằng tiếng Việt.
    `;

    const answerResult = await model.generateContent(answerPrompt);
    const answerText = answerResult.response.candidates[0].content.parts[0].text;

    return res.json({ response: answerText, sql: sqlQuery, data: rows });
  } catch (err) {
    console.error('🚨 Gemini DB Error:', err);

    let userMessage = 'Xin lỗi, hệ thống đang gặp sự cố. Bạn thử lại sau nhé!';

    if (FORBIDDEN_COLUMNS.some(col => err.message?.toLowerCase().includes(col))) {
      userMessage = 'Xin lỗi! Tôi không có quyền truy cập thông tin nhạy cảm.';
    } else if (
      err.message.includes('syntax error') ||
      err.message.includes('invalid input') ||
      err.message.includes('SQL')
    ) {
      userMessage = 'Tôi chưa hiểu rõ câu hỏi của bạn, bạn có thể diễn đạt lại không?';
    }

    return res.status(500).json({
      error: 'Gemini DB error',
      message: userMessage
    });
  }
});

module.exports = router;
