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
  // Include role token highlights. Previously we skipped role highlights when CV and post
  // appeared to belong to different role families to avoid misleading marks (e.g.,
  // highlighting "mobile" for a web CV). That caused some expected highlights to be
  // omitted (e.g. "Mobile" in titles). Keep role highlights but rely on the overall
  // ranking logic to penalize cross-domain matches instead of hiding highlights.
  roleMatch.forEach(r => terms.add(r));
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

    // Prepare a lightweight posts summary for the LLM prompt to avoid sending full objects
    // postsLite includes only id, title, company, and short description to keep prompt size manageable
    const postsLite = posts.map(p => ({
      id: p.id,
      title: p.title,
      company: (p.company_name || ''),
      type: p.post_type || 'unknown',
      short: ((p.title || '') + ' - ' + (p.description || '')).slice(0, 500)
    }));

  // Use Gemini to summarize CV and rank posts (Pro/Pro-Exp for better quality; fall back to flash if set)
  const model = genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL, generationConfig });
  // Load prompt text from external file to avoid embedding large template literals here
  let systemHint = '';
  try {
    systemHint = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'recommendations_prompt.txt'), 'utf8');
  } catch (e) {
    console.warn('Failed to load recommendations prompt, falling back to compact default', e?.message);
    systemHint = 'You are a job recommendation assistant. Summarize CV and score posts. Return JSON {summary, scores}.';
  }

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
      // Normalize highlights from Gemini if provided: ensure array of short, lowercase, deduped tokens
      scores = scores.map(s => {
        const out = { ...s };
        if (Array.isArray(s.highlights)) {
          try {
            const norm = Array.from(new Set(s.highlights
              .map(h => (String(h || '')).trim().toLowerCase())
              .filter(h => h.length >= 2 && h.length <= 80)
            ));
            out.highlights = norm.slice(0, 12);
          } catch {
            out.highlights = [];
          }
        }
        return out;
      });
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

    // Merge scores back to posts, apply small heuristics, title-based boosting, and sort
    const scoreMap = new Map(scores.map(s => [s.post_id, s]));
    const ranked = posts
      .map(p => {
        let sc = scoreMap.get(p.id)?.score ?? 0;
        let rs = scoreMap.get(p.id)?.reason || '';
        const cvBase = (cv.name + ' ' + cvText + ' ' + (user.bio || ''));
        const postText = ((p.title || '') + ' ' + (p.description || ''));
        const famCV = detectRoleFamily(cvBase);
        const famPost = detectRoleFamily(postText);
        // Title-based boosting: if the post title contains tokens from CV name or primary roles,
        // give a small but meaningful boost so a 'web dev' CV surfaces posts titled 'web'/'website'.
        try {
          const cvNameTokens = Array.from(new Set((cv.name || '').toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean)));
          const cvRoleTokens = Array.from(extractRoles(cvBase));
          const title = (p.title || '').toLowerCase();
          // exact token match in title gives stronger boost
          let titleBoost = 0;
          for (const t of cvNameTokens) if (t && title.includes(t)) titleBoost += 8;
          for (const r of cvRoleTokens) if (r && title.includes(r)) titleBoost += 10;
          // Cap the title boost to avoid overwhelming other signals
          titleBoost = Math.min(30, titleBoost);
          sc += titleBoost;
          if (titleBoost > 0) {
            rs = rs ? rs + ' | ' : '';
            rs += `Tiêu đề bài viết khớp với CV (boost +${titleBoost})`;
          }
        } catch (_) {
          // noop
        }
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
        // Prefer highlights suggested by Gemini (if present in scores), otherwise fallback
        const llmEntry = scoreMap.get(p.id) || {};
        let highlights = Array.isArray(llmEntry.highlights) && llmEntry.highlights.length > 0
          ? llmEntry.highlights
          : buildHighlightTerms(cvBase, postText);
        // Ensure final normalization/dedupe and safe length
        highlights = Array.from(new Set((highlights || []).map(h => (String(h || '')).trim()))).filter(h => h.length >= 1);
        // If CV and post role families differ, remove role tokens from highlights to avoid misleading highlights
        try {
          const famCVbase = detectRoleFamily(cvBase);
          const famPostbase = detectRoleFamily(postText);
          if (famCVbase && famPostbase && famCVbase !== famPostbase) {
            const roleSet = extractRoles(postText); // tokens present in post
            // Filter out tokens that are role tokens (intersection with ROLE_TOKENS normalized)
            highlights = highlights.filter(h => !roleSet.has(h.toLowerCase()));
          }
        } catch (_) {
          // noop
        }
        highlights = highlights.slice(0, 12);

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
