const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Tự động load file .env theo NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: path.join(__dirname, envFile) });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (nếu deploy client build ở đây)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/cvs', require('./routes/cvs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/follows', require('./routes/follows'));

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'JoBook API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ở cổng ${PORT} (env: ${process.env.NODE_ENV})`);
});
