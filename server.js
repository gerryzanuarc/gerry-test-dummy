const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware untuk parsing body dari form
app.use(express.urlencoded({ extended: true }));

// Serve static HTML dari folder public/
app.use(express.static(path.join(__dirname, 'public')));

// Basic route ke index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route login form (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route login (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`[LOGIN ATTEMPT] Username: ${username}, Password: ${password}`);
  res.send(`Welcome, ${username || 'guest'}! (⚠️ No CSRF protection used)`);
});

// CORS Misconfiguration - sengaja dibuat rentan
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // intentionally vulnerable
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});