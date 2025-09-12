const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const BASE_PORT = Number(process.env.PORT) || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/cvs', require('./routes/cvs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/companies', require('./routes/companies'));


// Gemini routes
app.use('/api/gemini', require('./routes/gemini'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server with auto port fallback when in use
const startServer = (port, attempts = 0) => {
  const server = app
    .listen(port, () => {
      console.log(`Server running on port ${port}`);
    })
    .on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attempts < 5) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        startServer(nextPort, attempts + 1);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  return server;
};

startServer(BASE_PORT);
