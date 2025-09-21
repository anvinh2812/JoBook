const express = require('express');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-pro-exp-02-05';
const generationConfig = {
  temperature: 0.3,
  topK: 32,
  topP: 0.9,
  maxOutputTokens: 2048,
};

// ---------- Matching helpers (fallback + enrichment) ----------
const ROLE_TOKENS = [
  'backend','front-end','frontend','fullstack','full-stack','web','web developer','software engineer','mobile','ios','android','devops','qa','tester','data','ml','ai','dl','embedded','firmware','security','sre','site reliability','game','unity','unreal','blockchain','web3'
];
const TECH_TOKENS = [
  // languages
  'javascript','typescript','python','java','c#','csharp','c++','cpp','php','go','golang','ruby','kotlin','swift','rust','scala','dart',
  // frameworks/libs/platforms
  'react','angular','vue','svelte','nextjs','next.js','nuxt','nuxtjs','nestjs','nest.js','node','nodejs','express','spring','spring boot','.net','dotnet','asp.net','django','flask','fastapi','laravel','symfony','rails','ruby on rails','quarkus','micronaut',
  // devops/cloud/db
  'docker','kubernetes','k8s','aws','azure','gcp','firebase','vercel','cloudflare','linux','git','jira',
  'mysql','postgres','postgresql','mariadb','sqlite','oracle','sqlserver','mongodb','redis','elasticsearch','kafka','rabbitmq',
  // apis
  'rest','graphql','grpc',
];

const DEGREE_LEVELS = [
  { level: 3, patterns: [/phd|tiến\s*sĩ|doctorate/i] },
  { level: 2, patterns: [/master|thạc\s*sĩ|msc/i] },
  { level: 1, patterns: [/bachelor|cử\s*nhân|đại\s*học|kỹ\s*sư|engineer|bsc/i] },
];

const EN_WORD_LEVELS = [
  { lvl: 4, patterns: [/fluent|native|professional|proficient/i] },
  { lvl: 3, patterns: [/advanced|upper[-\s]?intermediate/i] },
  { lvl: 2, patterns: [/intermediate|good/i] },
  { lvl: 1, patterns: [/basic|elementary/i] },
];

function textToLower(s) { return (s || '').toLowerCase(); }

function extractRoles(t) {
  const res = new Set();
  const tt = textToLower(t);
  for (const tok of ROLE_TOKENS) if (tt.includes(tok)) res.add(tok);
  return res;
}

function extractTech(t) {
  const res = new Set();
  const tt = textToLower(t).replace(/c\+\+/g, 'cpp').replace(/c#/g, 'csharp');
  for (const tok of TECH_TOKENS) {
    const needle = tok
      .replace(/c\+\+/g, 'cpp')
      .replace(/c#/g, 'csharp')
      .toLowerCase();
    if (tt.includes(needle)) res.add(needle);
  }
  return res;
}

function extractYears(t) {
  const tt = textToLower(t);
  let max = 0;
  const re = /(\d{1,2})\s*(\+)?\s*(năm|years?)(?:\s+(kinh\s*nghiệm|of\s+experience))?/gi;
  let m;
  while ((m = re.exec(tt))) {
    const n = parseInt(m[1], 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return max; // 0 if not found
}

function extractDegreeLevel(t) {
  const tt = t || '';
  for (const d of DEGREE_LEVELS) for (const p of d.patterns) if (p.test(tt)) return d.level;
  return 0;
}

function englishWordLevel(t) {
  for (const e of EN_WORD_LEVELS) for (const p of e.patterns) if (p.test(t)) return e.lvl;
  return 0;
}

function extractEnglishLevel(t) {
  const tt = t || '';
  // IELTS
  const ieltsMatch = tt.match(/ielts\s*(\d(?:\.\d)?)/i);
  if (ieltsMatch) {
    const band = parseFloat(ieltsMatch[1]);
    if (!isNaN(band)) {
      if (band >= 7.5) return 4; if (band >= 6.5) return 3; if (band >= 5) return 2; return 1;
    }
  }
  // TOEIC
  const toeicMatch = tt.match(/toeic\s*(\d{3})/i);
  if (toeicMatch) {
    const sc = parseInt(toeicMatch[1], 10);
    if (!isNaN(sc)) {
      if (sc >= 850) return 4; if (sc >= 700) return 3; if (sc >= 450) return 2; return 1;
    }
  }
  // Words
  const wordLvl = englishWordLevel(tt);
  if (wordLvl) return wordLvl;
  // Generic English mentions imply requirement but unknown level; return 0 for level
  return 0;
}

function hasEnglishRequirement(t) {
  const tt = textToLower(t);
  return /english|tiếng\s*anh|ielts|toeic/.test(tt);
}

function degreeRequirementLevel(t) { return extractDegreeLevel(t); }

// Role family detection for domain alignment
const ROLE_FAMILIES = [
  { fam: 'web', keys: ['web','frontend','front-end','backend','fullstack','full-stack','react','angular','vue','nextjs','next.js','node','nodejs','express','.net','asp.net','spring','django','laravel'] },
  { fam: 'embedded', keys: ['embedded','firmware','rtos','mcu','stm32','nrf52','freertos','bare metal'] },
  { fam: 'mobile', keys: ['mobile','ios','android','swift','kotlin','react native','flutter'] },
  { fam: 'data-ai', keys: ['data','ml','machine learning','ai','deep learning','dl','pytorch','tensorflow'] },
  { fam: 'devops', keys: ['devops','sre','site reliability','kubernetes','k8s','ci/cd'] },
  { fam: 'security', keys: ['security','pentest','appsec','infosec'] },
  { fam: 'qa', keys: ['qa','tester','testing','automation test'] },
  { fam: 'game', keys: ['game','unity','unreal'] },
  { fam: 'blockchain', keys: ['blockchain','web3','solidity'] },
];

function detectRoleFamily(t) {
  const tt = textToLower(t);
  const found = [];
  for (const f of ROLE_FAMILIES) {
    for (const k of f.keys) {
      if (tt.includes(k)) { found.push({ fam: f.fam, key: k }); break; }
    }
  }
  // Pick first by priority in ROLE_FAMILIES list
  return found[0]?.fam || null;
}

function buildHighlightTerms(cvBase, postText) {
  const terms = new Set();
  const famCV = detectRoleFamily(cvBase);
  const famPost = detectRoleFamily(postText);
  // roles and techs intersection
  const roleMatch = Array.from(extractRoles(cvBase)).filter(r => extractRoles(postText).has(r));
  const techMatch = Array.from(extractTech(cvBase)).filter(t => extractTech(postText).has(t));
  // If cross-domain, skip role token highlights to avoid misleading marks (e.g., highlighting "mobile" for a web CV)
  if (!(famCV && famPost && famCV !== famPost)) {
    roleMatch.forEach(r => terms.add(r));
  }
  // Always allow tech matches — they are useful even across domains but keep count modest via overall slice below
  techMatch.forEach(t => terms.add(t));
  // education keywords in post
  if (degreeRequirementLevel(postText) > 0) {
    ['đại học','cử nhân','kỹ sư','bachelor','bsc','thạc sĩ','master','msc','tiến sĩ','phd'].forEach(k => {
      if (postText.toLowerCase().includes(k)) terms.add(k);
    });
  }
  // english
  if (hasEnglishRequirement(postText)) {
    ['english','tiếng anh','ielts','toeic','fluent','advanced','intermediate','basic'].forEach(k => {
      if (postText.toLowerCase().includes(k)) terms.add(k);
    });
  }
  // years requirement highlight
  const postYears = extractYears(postText);
  if (postYears) {
    terms.add(`${postYears} năm`);
    terms.add(`${postYears}+ năm`);
    terms.add(`${postYears} years`);
    terms.add(`${postYears}+ years`);
  }
  // Limit and return array
  return Array.from(terms).filter(s => (s && s.trim().length >= 2)).slice(0, 12);
}

// Helper: safe slice
const truncate = (str, max = 4000) => {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + `\n... (đã cắt bớt, tổng ${str.length} ký tự)`;
};

// GET /api/recommendations?cvId=:id
// Returns: { cv: {...}, cvSummary: string, posts: [ ...ranked... ] }
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.account_type !== 'candidate') {
      return res.status(403).json({ message: 'Chỉ ứng viên mới dùng tính năng gợi ý.' });
    }

    const cvId = parseInt(req.query.cvId, 10);
    if (!cvId || Number.isNaN(cvId)) {
      return res.status(400).json({ message: 'Thiếu hoặc sai cvId' });
    }

    // Ensure CV belongs to the user
    const cvResult = await pool.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, req.user.id]);
    if (cvResult.rows.length === 0) {
      return res.status(404).json({ message: 'CV không tồn tại hoặc không thuộc về bạn' });
    }
    const cv = cvResult.rows[0];

    // Read CV PDF text
    const filePath = path.join(__dirname, '..', cv.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Không tìm thấy file CV' });
    }

    // Prefer plain text sidecar (saved during upload) to avoid parsing image-based PDFs.
    let cvText = '';
    try {
      const base = path.parse(filePath).name; // cv-123-... (no ext)
      const txtPath = path.join(path.dirname(filePath), base + '.txt');
      if (fs.existsSync(txtPath)) {
        cvText = fs.readFileSync(txtPath, { encoding: 'utf8' }).replace(/\s+$/g, '').trim();
      } else {
        // Parse PDF (best-effort)
        const data = await pdfParse(fs.readFileSync(filePath));
        cvText = (data.text || '').replace(/\s+$/g, '').trim();
      }
    } catch (e) {
      console.warn('CV text extraction failed, fallback to empty text', e?.message);
      cvText = '';
    }

    // Fetch candidate profile (for extra context)
    const userRes = await pool.query('SELECT id, full_name, email, address, bio FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0] || {};

    // Fetch active recruitment posts (find_candidate) + latest others for context
    const postsRes = await pool.query(
      `SELECT 
        p.*,
        u.full_name as author_name,
        u.account_type as author_type,
        u.avatar_url as author_avatar,
        co.name as company_name,
        co.logo_url as company_logo_url,
        co.tax_code as company_tax_code,
        c.name as cv_name,
        c.file_url as cv_file_url,
        CASE 
          WHEN p.post_type = 'find_candidate' 
            THEN (
              p.start_at IS NOT NULL AND p.end_at IS NOT NULL AND 
              (CURRENT_TIMESTAMP > p.end_at)
            )
          ELSE false
        END AS is_expired
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN companies co ON p.company_id = co.id
      LEFT JOIN cvs c ON p.attached_cv_id = c.id
      ORDER BY 
        CASE 
          WHEN p.post_type = 'find_candidate' AND (p.start_at IS NOT NULL AND p.end_at IS NOT NULL) AND (CURRENT_TIMESTAMP > p.end_at) THEN 1
          ELSE 0
        END ASC,
        p.created_at DESC
      LIMIT 200`
    );
    const posts = postsRes.rows;

  // Use Gemini to summarize CV and rank posts (Pro/Pro-Exp for better quality; fall back to flash if set)
  const model = genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL, generationConfig });

    const systemHint = `Bạn là trợ lý gợi ý việc làm. Dựa vào nội dung CV và hồ sơ ứng viên, hãy:
1) Tóm tắt CV ngắn gọn (3-6 gạch đầu dòng) nêu bật kỹ năng, kinh nghiệm, vị trí mong muốn (nếu thấy), công nghệ chính, cấp độ.
2) Đọc kỹ nội dung từng bài đăng tuyển dụng (đặc biệt post_type='find_candidate'). Đánh giá độ phù hợp so với CV theo thang 0-100.
  - ƯU TIÊN THEO THỨ TỰ: (a) Vị trí/cấp độ (Intern/Junior/Mid/Senior/Lead), (b) Ngôn ngữ/kỹ thuật & framework chính, (c) Số năm kinh nghiệm yêu cầu, (d) Học vấn (BSc/MSc/PhD), (e) Trình độ tiếng Anh.
  - Các tiêu chí khác (lĩnh vực sản phẩm, địa điểm/remote) là phụ.
  - Phạt điểm mạnh cho bài đăng đã hết hạn (is_expired=true) hoặc không liên quan.
  - Nếu lĩnh vực/bộ phận (role family) KHÔNG trùng (ví dụ: CV định hướng Web nhưng bài thuộc Embedded/Firmware), HÃY GIỚI HẠN điểm TỐI ĐA ở mức 40-50, và nêu rõ lý do khác lĩnh vực.
  - Nêu rõ lý do (reason) 1-2 câu, chỉ dựa trên chi tiết thực sự có trong CV và bài đăng, ưu tiên đề cập các mục ở trên (ví dụ: vị trí, kỹ thuật, năm kinh nghiệm, học vấn, tiếng Anh), và nhấn mạnh khác lĩnh vực nếu có.
3) Trả về JSON THUẦN với schema chính xác:
  { "summary": string,
    "scores": Array<{ "post_id": number, "score": number, "reason": string }> }
Không kèm markdown, không bọc bằng \`\`\`.
Nếu dữ liệu thiếu, hãy ước lượng cẩn trọng và ghi rõ trong reason.`;

    const postsLite = posts.map(p => ({
      id: p.id,
      post_type: p.post_type,
      title: p.title,
      description: p.description,
      company_name: p.company_name || '',
      start_at: p.start_at,
      end_at: p.end_at,
      is_expired: p.is_expired
    }));

    const gemPrompt = `CV name: ${cv.name}\nỨng viên: ${user.full_name || ''} - ${user.email || ''}\nĐịa chỉ: ${user.address || ''}\nBio: ${truncate(user.bio || '', 1000)}\n\n--- Trích nội dung CV (có thể đã cắt bớt) ---\n${truncate(cvText, 8000)}\n\n--- Danh sách bài đăng (chỉ thông tin quan trọng) ---\n${truncate(JSON.stringify(postsLite), 8000)}\n`;

    let cvSummary = '';
    let scores = [];
    try {
      const resp = await model.generateContent(systemHint + "\n\n" + gemPrompt);
      const raw = resp.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      // Try direct JSON parse; if fails, attempt to extract substring between first { and last }
      let json;
      try {
        json = JSON.parse(cleaned);
      } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          json = JSON.parse(cleaned.slice(start, end + 1));
        } else {
          throw new Error('Invalid JSON output');
        }
      }
      cvSummary = String(json.summary || '').trim();
      scores = Array.isArray(json.scores) ? json.scores : [];
    } catch (e) {
      console.error('Gemini ranking failed:', e?.message);
      // Fallback: naive keyword score by overlap of keywords
  const base = (cv.name + ' ' + cvText + ' ' + (user.bio || '')).toLowerCase();
      const kw = Array.from(new Set(base.match(/[a-zA-ZÀ-ỹ0-9+#\.\-]{2,}/g) || [])).slice(0, 200);
      const levelDefs = [
        { label: 'Intern/Thực tập', re: /(intern|thực\s*tập|fresher)/i },
        { label: 'Junior', re: /(junior|jr\b)/i },
        { label: 'Middle', re: /(middle|mid\b)/i },
        { label: 'Senior', re: /(senior|sr\b)/i },
        { label: 'Lead', re: /(lead|leader|principal)/i },
      ];
      scores = posts.map(p => {
        const postText = ((p.title || '') + ' ' + (p.description || '')).toLowerCase();
        // Priority extract from CV and post
  const cvRoles = extractRoles(base);
        const postRoles = extractRoles(postText);
        const cvTech = extractTech(base);
        const postTech = extractTech(postText);
        const cvYears = extractYears(cvText + ' ' + (user.bio || ''));
        const postYears = extractYears(postText);
        const cvDegree = extractDegreeLevel(cvText + ' ' + (user.bio || ''));
        const postDegreeReq = degreeRequirementLevel(postText);
        const cvEN = extractEnglishLevel(cvText + ' ' + (user.bio || ''));
        const postENReq = hasEnglishRequirement(postText) ? Math.max(1, englishWordLevel(postText)) : 0;

        // Matches
        const roleMatch = Array.from(cvRoles).filter(r => postRoles.has(r));
        const techMatch = Array.from(cvTech).filter(t => postTech.has(t));
        const yearsOk = postYears ? (cvYears >= postYears) : null; // null means no requirement
        const degreeOk = postDegreeReq ? (cvDegree >= postDegreeReq) : null;
        const enOk = postENReq ? (cvEN >= postENReq) : null;

        // Scoring (weights reflect priority order)
        let score = 0;
        // Position/role: strong weight
        if (roleMatch.length) score += Math.min(40, roleMatch.length * 20);
        // Tech: medium weight, cap at 30
        if (techMatch.length) score += Math.min(30, techMatch.length * 6);
        // Years: 0/10 if required; 5 if no requirement but years>0
        if (yearsOk === true) score += 10; else if (yearsOk === null) score += (cvYears > 0 ? 5 : 0);
        // Degree: 0/10 if required; 5 if no requirement but has any degree
        if (degreeOk === true) score += 10; else if (degreeOk === null) score += (cvDegree > 0 ? 5 : 0);
        // English: 0/10 if required; 5 if mentioned but not strictly required
        if (enOk === true) score += 10; else if (enOk === null) score += (cvEN > 0 ? 5 : 0);

        // Role family alignment
        const famCV = detectRoleFamily(base);
        const famPost = detectRoleFamily(postText);
        if (famCV && famPost && famCV !== famPost) {
          // cap score at 50 for different domains
          score = Math.min(score, 50);
        }

        score = Math.max(0, Math.min(100, Math.round(score)));

        // Reason string (ordered by priority)
        const parts = [];
  if (roleMatch.length) parts.push(`Vị trí phù hợp: ${roleMatch.join(', ')}`);
        if (techMatch.length) parts.push(`Ngôn ngữ/kỹ thuật khớp: ${techMatch.slice(0,6).join(', ')}`);
        if (postYears) parts.push(`Kinh nghiệm: yêu cầu ${postYears}+ năm, CV ${cvYears} năm`);
        if (postDegreeReq) parts.push(`Học vấn: yêu cầu cấp ${postDegreeReq}, CV cấp ${cvDegree}`);
        if (postENReq) parts.push(`Tiếng Anh: yêu cầu cấp ${postENReq}, CV cấp ${cvEN}`);
  if (famCV && famPost && famCV !== famPost) parts.push(`Khác lĩnh vực: CV ${famCV} vs bài ${famPost} (giới hạn điểm)`);
        if (!parts.length) parts.push('Có một số trùng khớp giữa CV và bài đăng');

        return { post_id: p.id, score, reason: parts.join('; ') };
      });
      cvSummary = 'Không tạo được tóm tắt bằng Gemini. Hiển thị gợi ý theo phương pháp dự phòng.';
    }

    // Merge scores back to posts, apply small heuristics, and sort
    const scoreMap = new Map(scores.map(s => [s.post_id, s]));
    const ranked = posts
      .map(p => {
        let sc = scoreMap.get(p.id)?.score ?? 0;
        let rs = scoreMap.get(p.id)?.reason || '';
        const cvBase = (cv.name + ' ' + cvText + ' ' + (user.bio || ''));
        const postText = ((p.title || '') + ' ' + (p.description || ''));
        const famCV = detectRoleFamily(cvBase);
        const famPost = detectRoleFamily(postText);
        // If LLM returned empty reason, enrich with simple matcher
        if (!rs) {
          const cvRoles = extractRoles(cvBase);
          const postRoles = extractRoles(postText);
          const cvTech = extractTech(cvBase);
          const postTech = extractTech(postText);
          const cvYears = extractYears(cvBase);
          const postYears = extractYears(postText);
          const cvDegree = extractDegreeLevel(cvBase);
          const postDegreeReq = degreeRequirementLevel(postText);
          const cvEN = extractEnglishLevel(cvBase);
          const postENReq = hasEnglishRequirement(postText) ? Math.max(1, englishWordLevel(postText)) : 0;

          const roleMatch = Array.from(cvRoles).filter(r => postRoles.has(r));
          const techMatch = Array.from(cvTech).filter(t => postTech.has(t));

          const parts = [];
          if (roleMatch.length) parts.push(`Vị trí phù hợp: ${roleMatch.join(', ')}`);
          if (techMatch.length) parts.push(`Ngôn ngữ/kỹ thuật khớp: ${techMatch.slice(0,6).join(', ')}`);
          if (postYears) parts.push(`Kinh nghiệm: yêu cầu ${postYears}+ năm, CV ${cvYears} năm`);
          if (postDegreeReq) parts.push(`Học vấn: yêu cầu cấp ${postDegreeReq}, CV cấp ${cvDegree}`);
          if (postENReq) parts.push(`Tiếng Anh: yêu cầu cấp ${postENReq}, CV cấp ${cvEN}`);
          rs = parts.join('; ');
        }
        // Heuristics
        if (p.post_type === 'find_candidate') sc += 5; // slight boost for recruitment posts
        // Penalize cross-domain even with LLM scores
        if (famCV && famPost && famCV !== famPost) {
          sc = Math.min(sc, 50);
          rs = rs ? rs + ' | ' : '';
          rs += `Khác lĩnh vực: CV ${famCV} vs bài ${famPost} (giới hạn điểm)`;
        }
        if (p.is_expired) {
          sc = Math.max(0, sc - 25);
          rs = rs ? rs + ' | ' : '';
          rs += 'Bài đăng đã hết hạn -> trừ điểm';
        }
        sc = Math.max(0, Math.min(100, Math.round(sc)));
        const highlights = buildHighlightTerms(cvBase, postText);
        return { ...p, relevance: sc, reason: rs, highlights };
      })
      .sort((a, b) => (b.relevance - a.relevance));

  res.json({ cv, cvSummary, cvText, posts: ranked });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo gợi ý' });
  }
});

module.exports = router;
