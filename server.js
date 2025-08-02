const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static HTML
app.use(express.static(path.join(__dirname, 'public')));

// Basic root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Example CORS misconfiguration (optional)
app.use((req, res, next) => {
  // Example vulnerable CORS config
  res.setHeader('Access-Control-Allow-Origin', '*'); // <-- intentionally vulnerable
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
