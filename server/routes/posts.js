const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all posts (with user info and following status)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.account_type as author_type,
        u.avatar_url as author_avatar,
        co.name as company_name,
        co.logo_url as company_logo_url,
        co.tax_code as company_tax_code,
  c.name as cv_name,
        c.file_url as cv_file_url,
        CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END as is_following_author,
        CASE 
          WHEN p.post_type = 'find_candidate' 
            THEN (
              p.start_at IS NOT NULL AND p.end_at IS NOT NULL AND 
              (CURRENT_TIMESTAMP < p.start_at OR CURRENT_TIMESTAMP > p.end_at)
            )
          ELSE false
        END AS is_expired
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN companies co ON p.company_id = co.id
      LEFT JOIN cvs c ON p.attached_cv_id = c.id
      LEFT JOIN follows f ON f.following_id = p.user_id AND f.follower_id = $1
    `;
    
    const params = [req.user.id];
    const conditions = [];
    if (type) {
      conditions.push(`p.post_type = $${params.length + 1}`);
      params.push(type);
    }
    if (start_date) {
      conditions.push(`p.created_at >= $${params.length + 1}::date`);
      params.push(start_date);
    }
    if (end_date) {
      // less than next day to include the full end date
      conditions.push(`p.created_at < ($${params.length + 1}::date + INTERVAL '1 day')`);
      params.push(end_date);
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += ` ORDER BY 
      -- Non-expired posts first (for recruitment posts, based on start/end period)
      CASE 
        WHEN p.post_type = 'find_candidate' AND (p.start_at IS NOT NULL AND p.end_at IS NOT NULL) AND (CURRENT_TIMESTAMP < p.start_at OR CURRENT_TIMESTAMP > p.end_at) THEN 1
        ELSE 0
      END ASC,
      -- Then priority for following authors
      CASE WHEN f.follower_id IS NOT NULL THEN 0 ELSE 1 END,
      -- Newest first within the same group
      p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    
    let query = `
      SELECT 
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
              (CURRENT_TIMESTAMP < p.start_at OR CURRENT_TIMESTAMP > p.end_at)
            )
          ELSE false
        END AS is_expired
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN companies co ON p.company_id = co.id
      LEFT JOIN cvs c ON p.attached_cv_id = c.id
      WHERE p.user_id = $1
    `;
    
    const params = [userId];
    
    if (type) {
      query += ` AND p.post_type = $2`;
      params.push(type);
    }
    
    query += ` ORDER BY 
      CASE 
        WHEN p.post_type = 'find_candidate' AND (p.start_at IS NOT NULL AND p.end_at IS NOT NULL) AND (CURRENT_TIMESTAMP < p.start_at OR CURRENT_TIMESTAMP > p.end_at) THEN 1
        ELSE 0
      END ASC,
      p.created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
  const { post_type, title, description, attached_cv_id, start_at, end_at } = req.body;
    
    // Validate post type with account type
    if (post_type === 'find_job' && req.user.account_type !== 'candidate') {
      return res.status(400).json({ message: 'Only candidates can create find_job posts' });
    }
    
  if (post_type === 'find_candidate' && req.user.account_type !== 'company') {
      return res.status(400).json({ message: 'Only companies can create find_candidate posts' });
    }
    
    // Normalize attached_cv_id to integer or null
    const attachedId = (attached_cv_id === undefined || attached_cv_id === null || attached_cv_id === '')
      ? null
      : parseInt(attached_cv_id, 10);

    if (attached_cv_id !== undefined && attached_cv_id !== null && attached_cv_id !== '' && Number.isNaN(attachedId)) {
      return res.status(400).json({ message: 'Invalid CV id' });
    }

    // For find_job posts, attached_cv_id is required and must belong to the user
    if (post_type === 'find_job' && !attachedId) {
      return res.status(400).json({ message: 'CV is required for job seeking posts' });
    }
    if (post_type === 'find_job' && attachedId) {
      const cvCheck = await pool.query('SELECT id FROM cvs WHERE id = $1 AND user_id = $2', [attachedId, req.user.id]);
      if (cvCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Selected CV is invalid' });
      }
    }
    
    // Auto attach company_id for recruitment posts
    let insertQuery = 'INSERT INTO posts (user_id, post_type, title, description, attached_cv_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    let params = [req.user.id, post_type, title, description, attachedId];
    if (post_type === 'find_candidate') {
      if (!req.user.company_id) {
        return res.status(400).json({ message: 'Your account is not linked to a company' });
      }
      // start_at is the moment the post is created (server time). User only selects end_at.
      if (start_at) {
        return res.status(400).json({ message: 'Không thể tự đặt ngày bắt đầu. Ngày bắt đầu sẽ tính từ lúc đăng.' });
      }
      if (!end_at) {
        return res.status(400).json({ message: 'Vui lòng chọn ngày kết thúc' });
      }
      const now = new Date();
      const endDate = new Date(end_at);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Thời gian không hợp lệ' });
      }
      if (endDate <= now) {
        return res.status(400).json({ message: 'Ngày kết thúc phải sau thời điểm hiện tại' });
      }

      // Use CURRENT_TIMESTAMP for start_at
      insertQuery = 'INSERT INTO posts (user_id, post_type, title, description, attached_cv_id, company_id, start_at, end_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7) RETURNING *';
      params = [req.user.id, post_type, title, description, attachedId, req.user.company_id, end_at];
    }

    const result = await pool.query(insertQuery, params);
    
    res.status(201).json({ post: result.rows[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
  const { title, description, attached_cv_id, start_at, end_at } = req.body;
    const postId = req.params.id;
    
    // Check if user owns the post
    const checkResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [postId, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or not authorized' });
    }
    
  const post = checkResult.rows[0];
    
    // Normalize attached_cv_id to integer or null
    const attachedId = (attached_cv_id === undefined || attached_cv_id === null || attached_cv_id === '')
      ? null
      : parseInt(attached_cv_id, 10);

    if (Number.isNaN(attachedId)) {
      return res.status(400).json({ message: 'Invalid CV id' });
    }

    // For find_job posts, attached_cv_id is required and must belong to the user
    if (post.post_type === 'find_job' && !attachedId) {
      return res.status(400).json({ message: 'CV is required for job seeking posts' });
    }
    if (post.post_type === 'find_job' && attachedId) {
      const cvCheck = await pool.query('SELECT id FROM cvs WHERE id = $1 AND user_id = $2', [attachedId, req.user.id]);
      if (cvCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Selected CV is invalid' });
      }
    }
    
    // Base update (without period change)
    let updateQuery = 'UPDATE posts SET title = $1, description = $2, attached_cv_id = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
    let updateParams = [title, description, attachedId, postId, req.user.id];

    // Companies can only adjust end_at; start_at is fixed at creation time
    if (post.post_type === 'find_candidate') {
      if (start_at) {
        return res.status(400).json({ message: 'Không thể sửa ngày bắt đầu' });
      }
      if (end_at) {
        const endDate = new Date(end_at);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Thời gian không hợp lệ' });
        }
        const startDate = new Date(post.start_at);
        if (endDate <= startDate) {
          return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
        }
        updateQuery = 'UPDATE posts SET title = $1, description = $2, attached_cv_id = $3, end_at = $6 WHERE id = $4 AND user_id = $5 RETURNING *';
        updateParams = [title, description, attachedId, postId, req.user.id, end_at];
      }
    }

    const result = await pool.query(updateQuery, updateParams);
    
    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
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
              (CURRENT_TIMESTAMP < p.start_at OR CURRENT_TIMESTAMP > p.end_at)
            )
          ELSE false
        END AS is_expired
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN companies co ON p.company_id = co.id
      LEFT JOIN cvs c ON p.attached_cv_id = c.id
      WHERE p.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or not authorized' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
