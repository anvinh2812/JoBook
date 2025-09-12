const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
  let { full_name, email, password, account_type, bio, code, address } = req.body;

    // Normalize and validate account type
    const allowedTypes = ['candidate', 'company'];
    if (!allowedTypes.includes(account_type)) {
      account_type = 'candidate';
    }
    if (account_type === 'admin') {
      return res.status(403).json({ message: 'Cannot self-register as admin' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // If company account, require accepted company by code and set company_id
    let companyId = null;
    if (account_type === 'company') {
      if (!code) {
        return res.status(400).json({ message: 'code is required for company accounts' });
      }
      const companyRes = await pool.query(
        'SELECT id, status FROM companies WHERE code = $1',
        [code]
      );
      if (companyRes.rows.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy công ty với mã công ty này. Vui lòng đăng ký công ty trước.' });
      }
      const company = companyRes.rows[0];
      if (company.status !== 'accepted') {
        return res.status(400).json({ message: 'Công ty chưa được duyệt. Vui lòng chờ admin phê duyệt.' });
      }
      companyId = company.id;
    }

    // Build dynamic insert to include company_id when present
  const fields = ['full_name', 'email', 'password_hash', 'account_type', 'bio', 'address'];
  const values = [full_name, email, password_hash, account_type, bio || '', address || null];
    if (companyId) {
      fields.push('company_id');
      values.push(companyId);
    }
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders.join(', ')})
  RETURNING id, full_name, email, account_type, bio, address, company_id, created_at`,
      values
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
  { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
  account_type: user.account_type,
  bio: user.bio,
  address: user.address,
  company_id: user.company_id || null,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, full_name, email, password_hash, account_type, bio, address, avatar_url, company_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
  account_type: user.account_type,
  bio: user.bio,
  address: user.address,
  avatar_url: user.avatar_url,
  company_id: user.company_id || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, account_type, bio, address, avatar_url, created_at, company_id FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
