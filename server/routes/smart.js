const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { extractTokens, buildLikeParams, computeScore } = require('../utils/smartCriteria');

const router = express.Router();

// Smart search endpoint
// Body: { query: string }
// If user is candidate -> return company posts (find_candidate)
// If user is company -> return candidate posts (find_job)
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'Thiếu nội dung tìm kiếm' });
    }

    const user = req.user;
    const tokens = extractTokens(query);
    const patterns = buildLikeParams(tokens);

    // Determine target post type
    const targetPostType = user.account_type === 'candidate' ? 'find_candidate' : 'find_job';

    // Build SQL to fetch candidates or recruiters' posts
    // We search across title, description, author's bio as context
    let where = `p.post_type = $1`;
    const params = [targetPostType];

    if (patterns.length > 0) {
      const likeConds = patterns.map((_, i) => `(
          p.title ILIKE $${params.length + i + 1}
          OR p.description ILIKE $${params.length + i + 1}
          OR u.bio ILIKE $${params.length + i + 1}
        )`);
      where += ` AND (${likeConds.join(' OR ')})`;
      params.push(...patterns);
    }

    // For company posts, still respect expiry rule in presentation; we'll mark in response
    const sql = `
      SELECT 
        p.*, u.full_name as author_name, u.account_type as author_type, u.avatar_url as author_avatar,
        c.file_url as cv_file_url,
        CASE 
          WHEN p.post_type = 'find_candidate' AND p.created_at < (CURRENT_TIMESTAMP - INTERVAL '10 days') THEN true
          ELSE false
        END AS is_expired
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN cvs c ON p.attached_cv_id = c.id
      WHERE ${where}
      ORDER BY p.created_at DESC
      LIMIT 200
    `;

    const result = await pool.query(sql, params);

    // Score each item with simple heuristic
    const enriched = result.rows.map(row => {
      const text = `${row.title || ''}\n${row.description || ''}\n${row.author_name || ''}\n${row.author_type || ''}`;
      const score = computeScore(text, tokens);
      return { ...row, _score: score };
    })
    // sort by score desc then newest
    .sort((a, b) => (b._score - a._score) || (new Date(b.created_at) - new Date(a.created_at)));

    res.json({ items: enriched, tokens });
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
