const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// NEW: libs để parse
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Helper: build path an toàn tới PDF + TXT
function resolveCVPaths(file_url) {
  const uploadsRoot = path.join(__dirname, '../uploads');
  const pdfBase = path.basename(file_url); // ví dụ: cv-123.pdf
  const baseNoExt = pdfBase.replace(path.extname(pdfBase), '');
  const pdfPath = path.join(uploadsRoot, 'cvs', pdfBase);
  const txtPath = path.join(uploadsRoot, 'cvs', `${baseNoExt}.txt`);
  return { pdfPath, txtPath };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/cvs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = (
      file.originalname
        .normalize('NFC')            
        .replace(/\s+/g, '_')       
        .replace(/[^\p{L}\p{N}._-]/gu, '') || 'cv'
    );
    const uniqueSuffix = Date.now();
    cb(null, `cv-${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // ACCEPT PDF (bắt buộc) + DOCX (tuỳ chọn)
  const ok =
    file.mimetype === 'application/pdf' ||
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ok) cb(null, true);
  else cb(new Error('Only PDF or DOCX files are allowed'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // PDF/DOCX tối đa 5MB (tuỳ bạn)
    fieldSize: 10 * 1024 * 1024, // text field nếu client vẫn gửi thêm
    fields: 20,
  },
});

// Get user's CVs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cvs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ cvs: result.rows });
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- CORE CHANGE: Upload + server tự trích xuất text ----------
router.post('/upload', authenticateToken, (req, res) => {
  upload.single('cv')(req, res, async (err) => {
    try {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Kích thước CV vượt quá 5MB' });
        }
        return res.status(400).json({ message: err.message || 'Tải lên CV thất bại' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Không có tệp CV được tải lên' });
      }

      if (req.user.account_type !== 'candidate') {
        return res.status(403).json({ message: 'Chỉ ứng viên mới được tải lên CV' });
      }

      const file_url = `/uploads/cvs/${req.file.filename}`;
      let rawName = req.body?.name || path.parse(req.file.originalname).name || 'CV';
      try {
        rawName = Buffer.from(rawName, 'latin1').toString('utf8');
      } catch (e) {
        // ignore
      }
      const name = rawName.substring(0, 150);

      // 1) LƯU FILE GỐC đã được multer ghi xuống req.file.path
      const savedPath = req.file.path; // tuyệt đối
      const ext = path.extname(savedPath).toLowerCase();

      // 2) TỰ TRÍCH XUẤT TEXT Ở SERVER (ưu tiên server-parse)
      let extractedText = '';

      try {
        if (ext === '.pdf') {
          const buffer = fs.readFileSync(savedPath);
          const pdfData = await pdfParse(buffer);
          extractedText = (pdfData.text || '').trim();
        } else if (ext === '.docx') {
          const result = await mammoth.extractRawText({ path: savedPath });
          extractedText = (result.value || '').trim();
        }
      } catch (parseErr) {
        console.warn('⚠️ Parse server-side failed, will fallback to client text if provided:', parseErr?.message || parseErr);
      }

      // 3) FALLBACK: nếu server-parse thất bại và client có gửi text → dùng client text
      if (!extractedText && req.body?.text) {
        extractedText = String(req.body.text || '').trim();
      }

      // 4) LƯU TEXT THÀNH .TXT (nếu có text)
      try {
        if (extractedText) {
          const txtName = path.parse(req.file.filename).name + '.txt';
          const txtPath = path.join(__dirname, '../uploads/cvs', txtName);
          fs.writeFileSync(txtPath, extractedText, { encoding: 'utf8' });
        } else {
          console.warn('⚠️ Không có text để lưu sidecar (.txt). PDF vẫn được lưu bình thường.');
        }
      } catch (e) {
        console.warn('⚠️ Failed to save CV sidecar text:', e?.message || e);
      }

      // 5) GHI DB
      const result = await pool.query(
        'INSERT INTO cvs (user_id, file_url, name, is_active) VALUES ($1, $2, $3, true) RETURNING *',
        [req.user.id, file_url, name]
      );

      return res.status(201).json({
        message: 'Tải lên CV thành công',
        cv: result.rows[0],
      });
    } catch (error) {
      console.error('Upload CV error:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  });
});

// Toggle CV active status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE cvs SET is_active = NOT is_active WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.json({ cv: result.rows[0] });
  } catch (error) {
    console.error('Toggle CV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete CV (xóa cả .pdf & .txt)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cvs WHERE id = $1 AND user_id = $2 RETURNING file_url',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }

    const { pdfPath, txtPath } = resolveCVPaths(result.rows[0].file_url);
    [pdfPath, txtPath].forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rename CV
router.patch('/:id/name', authenticateToken, async (req, res) => {
  try {
    if (req.user.account_type !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can rename CVs' });
    }
    const { name } = req.body;
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (trimmed.length > 150) {
      return res.status(400).json({ message: 'Name is too long (max 150 characters)' });
    }
    const result = await pool.query(
      'UPDATE cvs SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [trimmed, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.json({ message: 'CV renamed successfully', cv: result.rows[0] });
  } catch (error) {
    console.error('Rename CV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get CV file (PDF/DOCX)
router.get('/:id/file', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_url FROM cvs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }

    const { pdfPath } = resolveCVPaths(result.rows[0].file_url);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set content-type theo đuôi
    const ext = path.extname(pdfPath).toLowerCase();
    res.setHeader(
      'Content-Type',
      ext === '.pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.sendFile(pdfPath);
  } catch (error) {
    console.error('Get CV file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get CV text (parse trực tiếp, không cần .txt)
router.get('/:id/text', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_url, user_id FROM cvs WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const uploadsRoot = path.join(__dirname, '../uploads/cvs');
    const filePath = path.join(uploadsRoot, path.basename(result.rows[0].file_url));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    let text = '';

    // ✅ Ưu tiên đọc sidecar .txt nếu có
    const txtPath = path.join(
      uploadsRoot,
      path.parse(filePath).name + '.txt'
    );
    if (fs.existsSync(txtPath)) {
      try {
        const sidecar = fs.readFileSync(txtPath, 'utf8').trim();
        if (sidecar) {
          return res.json({ text: sidecar });
        }
      } catch (err) {
        console.error('Read sidecar error:', err);
      }
    }

    // ❌ fallback parse PDF/DOCX
    const ext = path.extname(filePath).toLowerCase();
    try {
      if (ext === '.pdf') {
        const buffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(buffer);
        text = (pdfData.text || '').trim();
      } else if (ext === '.docx') {
        const docxData = await mammoth.extractRawText({ path: filePath });
        text = (docxData.value || '').trim();
      }
    } catch (e) {
      console.error('Parse error:', e);
    }

    if (!text) {
      return res.status(404).json({ message: 'Cannot extract CV text' });
    }

    res.json({ text });
  } catch (error) {
    console.error('Get CV text error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
