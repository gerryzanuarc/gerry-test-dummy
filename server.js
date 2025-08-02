const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// =========================================
// Middleware
// =========================================

// Parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Intentionally vulnerable CORS misconfiguration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // VULN: Allow all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// =========================================
// Routes
// =========================================

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Login form (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login handler (POST) - no CSRF protection
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`[LOGIN ATTEMPT] Username: ${username}, Password: ${password}`);
  res.send(`Welcome, ${username || 'guest'}! (⚠️ No CSRF protection used)`);
});

// Reflected XSS endpoint
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.send(`
    <html>
      <head><title>Search</title></head>
      <body>
        <h1>Search result for: ${query}</h1>
        <p>Try injecting something like: <code>?q=&lt;script&gt;alert(1)&lt;/script&gt;</code></p>
      </body>
    </html>
  `);
});

// =========================================
// Stored XSS: Comment Feature
// =========================================

// In-memory comment storage (no sanitization)
const comments = [];

// Comment form (GET)
app.get('/comment', (req, res) => {
  const commentsHtml = comments.map(c => `<p>${c}</p>`).join('');
  res.send(`
    <html>
      <head><title>Comments</title></head>
      <body>
        <h1>Leave a comment</h1>
        <form method="POST" action="/comment">
          <input type="text" name="comment" placeholder="Write something..." />
          <button type="submit">Post</button>
        </form>
        <hr/>
        <h2>All Comments</h2>
        ${commentsHtml}
        <p>Try submitting: <code>&lt;script&gt;alert('stored')&lt;/script&gt;</code></p>
      </body>
    </html>
  `);
});
// Simulasi SQL Injection (vulnerable)
app.get('/product', (req, res) => {
  const id = req.query.id;

  // Tanpa validasi/sanitasi input
  const fakeDb = {
    1: 'Laptop ASUS ROG',
    2: 'iPhone 13 Pro',
    3: 'Xiaomi Mi Band 6',
  };

  const product = fakeDb[id];

  if (product) {
    res.send(`Product ID ${id}: ${product}`);
  } else {
    res.send(`No product found for ID ${id}`);
  }

  console.log(`[SQLI Sim] Queried ID: ${id}`);
});
// Save comment (POST) - no sanitization
app.post('/comment', (req, res) => {
  const { comment } = req.body;
  comments.push(comment); // VULN: No filtering or escaping
  res.redirect('/comment');
});

// =========================================
// Start Server
// =========================================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});