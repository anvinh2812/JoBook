const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database'); // PostgreSQL pool

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { authenticateToken } = require('../middleware/auth'); 

// Schema mô tả cho Gemini
const schemaDescription = `
Database JoBook (PostgreSQL):
1. users
- id (PK)
- full_name
- email (unique)
- password_hash
- account_type ('candidate' | 'company')
- bio
- avatar_url
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

👉 Trả về duy nhất một câu lệnh SQL SELECT hợp lệ cho PostgreSQL.
Chỉ in SQL, không thêm giải thích, không markdown.
    `;

    const sqlResult = await model.generateContent(sqlPrompt);
    let sqlQuery = sqlResult.response.candidates[0].content.parts[0].text.trim();

    // Loại bỏ ```sql ... ```
    sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();

    console.log('🔎 Gemini SQL:', sqlQuery);

    // Bảo mật: chỉ cho phép SELECT
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed', sql: sqlQuery });
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
