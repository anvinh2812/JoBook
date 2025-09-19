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
- address (TEXT)

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
4. Mặc định thêm LIMIT 50 nếu người dùng không yêu cầu đếm (COUNT) hoặc không chỉ định LIMIT.
5. Tìm kiếm tiếng Việt dùng ILIKE với ký tự wildcard %, tách cụm từ thành nhiều điều kiện AND khi phù hợp. Không dùng extension lạ.
6. Chỉ truy vấn các bảng: users, cvs, posts, applications, follows, companies.
7. Chỉ sử dụng các cột tồn tại trong schema; không bịa ra cột mới (ví dụ: ngày_sinh, năm_kinh_nghiệm nếu không có cột riêng). Khi người dùng hỏi về thông tin không có cột riêng, hãy tìm trong trường 'bio' với từ khóa phù hợp.
8. LUÔN bao gồm các định danh chính trong SELECT để client có thể điều hướng:
  - Với users: phải có users.id (và users.full_name khi phù hợp).
  - Với posts: phải có posts.id và posts.user_id AS author_id.
  - Với joins liên quan tới users hoặc posts, đảm bảo các cột trên vẫn nằm trong SELECT.
9. Khi người dùng muốn tìm theo nội dung bài viết, hãy tìm trong CẢ title và description (dùng ILIKE). Với cụm như "trên X năm", có thể dùng regex ~* để khớp các biến thể (ví dụ: 'trên 2 năm', '>= 2 năm', '2+ năm', 'ít nhất 2 năm'). Nếu không chắc, ưu tiên ILIKE với vài biến thể từ khóa.
7. Các cột thường dùng khi SELECT:
   - users: id, full_name, email, address, bio, avatar_url, account_type, company_id, created_at, updated_at
   - companies: id, name, address, status, email, code, created_at, updated_at
   - cvs: id, name, user_id, file_url, is_active, created_at
   - posts: id, user_id, company_id, post_type, title, description, attached_cv_id, created_at
   - applications: id, post_id, cv_id, applicant_id, status, created_at
   - follows: follower_id, following_id, created_at

Ví dụ đầu vào tiếng Việt và SQL mong muốn:
- "tìm 'vinh'" =>
  SELECT id, full_name, email, address, bio FROM users WHERE full_name ILIKE '%vinh%' LIMIT 50;

- "tìm người ở hà nội" =>
  SELECT id, full_name, email, address FROM users WHERE address ILIKE '%hà nội%' LIMIT 50;

- "tìm người ở thanh xuân" =>
  SELECT id, full_name, email, address FROM users WHERE address ILIKE '%thanh xuân%' LIMIT 50;

- "tìm người ở thanh xuân - hà nội" =>
  SELECT id, full_name, email, address FROM users WHERE address ILIKE '%thanh xuân%' AND address ILIKE '%hà nội%' LIMIT 50;

- "tìm user email gmail" =>
  SELECT id, full_name, email, address FROM users WHERE email ILIKE '%gmail.com%' LIMIT 50;

- "tìm người bio có java hoặc 3 năm kinh nghiệm" =>
  SELECT id, full_name, email, bio FROM users WHERE bio ILIKE '%java%' OR bio ILIKE '%3 năm%' LIMIT 50;

- "tìm người có ngày sinh 1999 (trong bio)" =>
  SELECT id, full_name, email, bio FROM users WHERE bio ILIKE '%1999%' OR bio ILIKE '%sinh năm 1999%' LIMIT 50;

- "tìm người có kỹ năng python trong bio" =>
  SELECT id, full_name, email, bio FROM users WHERE bio ILIKE '%python%' LIMIT 50;

- "đếm số người ở hà nội" =>
  SELECT COUNT(*) AS total FROM users WHERE address ILIKE '%hà nội%';

- "công ty đã được duyệt" =>
  SELECT id, name, address, status, email, code FROM companies WHERE status = 'accepted' LIMIT 50;

- "bài đăng tìm việc" =>
  SELECT id, user_id, company_id, post_type, title, description, attached_cv_id, created_at FROM posts WHERE post_type = 'find_job' LIMIT 50;

- "bài đăng của công ty vng" =>
  SELECT p.id, p.user_id AS author_id, p.title, p.description, p.created_at, c.name AS company_name
  FROM posts p JOIN companies c ON p.company_id = c.id
  WHERE c.name ILIKE '%vng%'
  LIMIT 50;

- "tìm bài viết có nội dung 'kinh nghiệm trên 2 năm'" =>
  SELECT p.id, p.user_id AS author_id, p.title, p.description, p.created_at
  FROM posts p
  WHERE (
    p.title ILIKE '%trên 2 năm%' OR p.description ILIKE '%trên 2 năm%'
    OR p.title ILIKE '%2 năm%' OR p.description ILIKE '%2 năm%'
    OR p.title ILIKE '%2+ năm%' OR p.description ILIKE '%2+ năm%'
    OR p.title ILIKE '%ít nhất 2 năm%' OR p.description ILIKE '%ít nhất 2 năm%'
  )
  LIMIT 50;

- "CV của user vinh" =>
  SELECT u.id AS user_id, cv.id, cv.name, cv.file_url, cv.is_active, cv.created_at
  FROM cvs cv JOIN users u ON cv.user_id = u.id
  WHERE u.full_name ILIKE '%vinh%'
  LIMIT 50;

- "ứng tuyển đang pending" =>
  SELECT id, post_id, cv_id, applicant_id, status, created_at FROM applications WHERE status = 'pending' LIMIT 50;

- "người thuộc công ty abc" =>
  SELECT u.id, u.full_name, u.email, u.address
  FROM users u JOIN companies c ON u.company_id = c.id
  WHERE c.name ILIKE '%abc%'
  LIMIT 50;
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

    // Các bảng được phép dùng trong câu lệnh
    const ALLOWED_TABLES = ['users', 'cvs', 'posts', 'applications', 'follows', 'companies'];
    const FORBIDDEN_PATTERNS = [/information_schema/i, /pg_catalog/i, /pg_/i];

    // Loại bỏ dấu chấm phẩy cuối câu
    sqlQuery = sqlQuery.replace(/;\s*$/g, '');

    // Không cho phép nhiều câu lệnh trong truy vấn
    if (sqlQuery.includes(';')) {
      return res.json({
        response: 'Truy vấn không hợp lệ.',
        sql: sqlQuery
      });
    }

    // Không chứa các pattern cấm
    if (FORBIDDEN_PATTERNS.some((re) => re.test(sqlQuery))) {
      return res.json({
        response: 'Truy vấn không hợp lệ.',
        sql: sqlQuery
      });
    }

    // Kiểm tra tên bảng trong FROM/JOIN nằm trong danh sách cho phép
    const tableNames = [];
    const fromMatch = sqlQuery.match(/\bfrom\s+([a-zA-Z_][a-zA-Z0-9_\.]*)(?:\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*)?/i);
    if (fromMatch) {
      tableNames.push(fromMatch[1].split('.').pop());
    }
    const joinRegex = /\bjoin\s+([a-zA-Z_][a-zA-Z0-9_\.]*)(?:\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*)?/ig;
    let jm;
    while ((jm = joinRegex.exec(sqlQuery)) !== null) {
      tableNames.push(jm[1].split('.').pop());
    }
    if (tableNames.length && tableNames.some(t => !ALLOWED_TABLES.includes(t))) {
      return res.json({
        response: 'Truy vấn tham chiếu bảng không được phép.',
        sql: sqlQuery
      });
    }

    // Thêm LIMIT 50 nếu không có LIMIT và không phải COUNT
    const hasLimit = /\blimit\s+\d+/i.test(sqlQuery);
    const isCountOnly = /^\s*select\s+count\s*\(/i.test(sqlQuery);
    if (!hasLimit && !isCountOnly) {
      sqlQuery = `${sqlQuery} LIMIT 50`;
    }

    // Cố gắng bổ sung các định danh cần thiết vào SELECT để tạo link (nếu có users/posts)
    const maybeAugmentSelectWithIds = (q) => {
      if (isCountOnly) return q; // Không đụng vào COUNT
      const m = q.match(/^\s*select\s+([\s\S]+?)\s+from\s+([\s\S]+)$/i);
      if (!m) return q;
      let selectList = m[1];
      const rest = m[2];

      const findAlias = (table) => {
        // Tìm alias của bảng trong FROM/JOIN
        const re = new RegExp(`\\b(?:from|join)\\s+${table}(?:\\s+as)?\\s+([a-zA-Z_][a-zA-Z0-9_]*)`, 'i');
        const m1 = rest.match(re);
        if (m1 && m1[1]) return m1[1];
        // nếu xuất hiện mà không có alias, dùng tên bảng
        const re2 = new RegExp(`\\b(?:from|join)\\s+${table}(?![a-zA-Z0-9_])`, 'i');
        if (re2.test(rest)) return table; 
        return null;
      };

      const ensureSelectHas = (piece) => {
        // thêm phần tử nếu chưa tồn tại nguyên văn
        if (!new RegExp(`(^|,|\\s)${piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\s|,|$)`, 'i').test(selectList)) {
          selectList = `${selectList}, ${piece}`;
        }
      };

      const usersAlias = findAlias('users');
      if (usersAlias) {
        ensureSelectHas(`${usersAlias}.id`);
        // full_name giúp đặt label đẹp
        ensureSelectHas(`${usersAlias}.full_name`);
      }

      const postsAlias = findAlias('posts');
      if (postsAlias) {
        ensureSelectHas(`${postsAlias}.id`);
        // cần user_id để xây link post
        ensureSelectHas(`${postsAlias}.user_id AS author_id`);
        // để hiển thị nhãn link dễ đọc
        ensureSelectHas(`${postsAlias}.title`);
        ensureSelectHas(`${postsAlias}.description`);
      }

      return q.replace(/^\s*select\s+[\s\S]+?\s+from\s+/i, `SELECT ${selectList} FROM `);
    };

    sqlQuery = maybeAugmentSelectWithIds(sqlQuery);

    // B2. Thực thi SQL
    const dbResult = await pool.query(sqlQuery);
    const rows = dbResult.rows;

    // B3. Tạo danh sách đường link điều hướng hữu ích từ dữ liệu
    const buildLinks = (items = []) => {
      const isId = (v) =>
        (typeof v === 'number' && Number.isFinite(v)) ||
        (typeof v === 'string' && /^\d+$/.test(v));

      const toNum = (v) => (typeof v === 'string' ? parseInt(v, 10) : v);

      const links = [];
      const take = Math.min(items.length, 20);
      for (let i = 0; i < take; i++) {
        const r = items[i] || {};
        const hasUserHints =
          'full_name' in r || 'email' in r || 'address' in r || 'account_type' in r || 'bio' in r;

        // Link tới trang cá nhân user
        let userId = null;
        if (hasUserHints && isId(r.id)) userId = toNum(r.id);
        if (!userId && isId(r.user_id)) userId = toNum(r.user_id);
        if (!userId && isId(r.applicant_id)) userId = toNum(r.applicant_id);
        if (!userId && isId(r.follower_id)) userId = toNum(r.follower_id);
        if (!userId && isId(r.following_id)) userId = toNum(r.following_id);
        if (!userId && isId(r.reviewed_by_user_id)) userId = toNum(r.reviewed_by_user_id);
        if (!userId && isId(r.author_id)) userId = toNum(r.author_id);

        if (userId) {
          const label = r.full_name ? `Trang của ${r.full_name}` : `Trang của người dùng #${userId}`;
          links.push({ type: 'user', href: `/users/${userId}`, label });
        }

        // Link tới bài viết: ưu tiên khi có dấu hiệu bảng posts
        const isPostLike = 'post_type' in r || 'title' in r || 'attached_cv_id' in r;
        let postId = null;
        if (isPostLike && isId(r.id)) postId = toNum(r.id);
        if (!postId && isId(r.post_id)) postId = toNum(r.post_id);
        // tác giả bài viết
        const authorId = isId(r.user_id) ? toNum(r.user_id) : (isId(r.author_id) ? toNum(r.author_id) : userId);
        if (postId && authorId) {
          const title = r.title ? r.title : `Bài viết #${postId}`;
          // Không có route /posts/:id, điều hướng qua trang user với query post
          links.push({ type: 'post', href: `/users/${authorId}?post=${postId}`, label: `Bài viết: ${title}` });
        }
      }
      // Loại trùng bằng key href+label
      const seen = new Set();
      return links.filter(l => {
        const k = `${l.type}|${l.href}|${l.label}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).slice(0, 20);
    };

  const searchIntent = /\b(tìm|tim|search|find)\b/i.test(prompt || '');
  const links = searchIntent && !isCountOnly ? buildLinks(rows) : [];

    // B4. Nhờ Gemini trả lời tự nhiên dựa trên dữ liệu DB
    const answerPrompt = `
Người dùng hỏi: "${prompt}"
Dữ liệu từ database:
${JSON.stringify(rows, null, 2)}

Hãy trả lời tự nhiên, ngắn gọn, dễ hiểu bằng tiếng Việt.
    `;

  const answerResult = await model.generateContent(answerPrompt);
  const answerText = answerResult.response.candidates[0].content.parts[0].text;

  return res.json({ response: answerText, sql: sqlQuery, data: rows, links });
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
