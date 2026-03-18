const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const moodRoutes = require('./routes/moods');

const app = express();
const PORT = 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dataFile = path.join(dataDir, 'moods.json');
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ entries: [] }, null, 2));
}

app.use(cors());
app.use(express.json());

app.use('/api/moods', moodRoutes);

// Alias used by the Vercel serverless function path /api/summary
app.get('/api/summary', (req, res) => {
  req.url = '/summary/weekly';
  moodRoutes(req, res, () => {});
});

app.listen(PORT, () => {
  console.log(`\n🟢 Mood Tracker Server running at http://localhost:${PORT}\n`);
});
