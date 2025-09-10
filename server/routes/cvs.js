// server/routes/cvs.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const pool    = require('../config/database');
const authenticateToken = require('../middleware/auth');


const resolveUploadPath = (fileUrl) => {
  // bỏ mọi dấu "/" ở đầu để tránh path.join bị nuốt prefix
  const rel = (fileUrl || '').replace(/^\/+/, '');
  return path.join(__dirname, '..', rel);
};

const router = express.Router();

// Thư mục lưu thực tế trên máy chủ
const UPLOAD_ROOT = path.join(__dirname, '../uploads/cvs');

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
      cb(null, UPLOAD_ROOT);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const ext  = path.extname((file.originalname || '').toLowerCase()) || '.pdf';
    const base = req.user?.id ? `u${req.user.id}-` : '';
    cb(null, `${base}${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    (file.originalname && file.originalname.toLowerCase().endsWith('.pdf'))
  ) return cb(null, true);
  cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// List CVs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cvs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ cvs: rows });
  } catch (e) {
    console.error('Get CVs error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload
router.post('/upload', authenticateToken, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (req.user.account_type !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can upload CVs' });
    }
    const file_url = `/uploads/cvs/${req.file.filename}`; // URL public để FE tải
    const { rows } = await pool.query(
      'INSERT INTO cvs (user_id, file_url) VALUES ($1, $2) RETURNING *',
      [req.user.id, file_url]
    );
    res.status(201).json({ message: 'CV uploaded successfully', cv: rows[0] });
  } catch (e) {
    console.error('Upload CV error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE cvs SET is_active = NOT is_active WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'CV not found' });
    res.json({ cv: rows[0] });
  } catch (e) {
    console.error('Toggle CV error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete (xóa file thật)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM cvs WHERE id = $1 AND user_id = $2 RETURNING file_url',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'CV not found' });

    const filename = path.basename(rows[0].file_url || '');
    if (filename) {
      const absPath = path.join(UPLOAD_ROOT, filename);
      if (absPath.startsWith(UPLOAD_ROOT) && fs.existsSync(absPath)) {
        try { fs.unlinkSync(absPath); } catch (err) { console.warn('unlink failed:', err.message); }
      }
    }
    res.json({ message: 'CV deleted successfully' });
  } catch (e) {
    console.error('Delete CV error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Trả file (tuỳ chọn, vì đã public qua Nginx)
router.get('/:id/file', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT file_url FROM cvs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'CV not found' });

    const filename = path.basename(rows[0].file_url || '');
    const absPath  = path.join(UPLOAD_ROOT, filename);
    if (!absPath.startsWith(UPLOAD_ROOT) || !fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(absPath);
  } catch (e) {
    console.error('Get CV file error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
