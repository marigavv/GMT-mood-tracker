const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();
const DATA_FILE = path.join(__dirname, '../data/moods.json');

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'i', 'me', 'my', 'we', 'our', 'it', 'its', 'this',
  'that', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'not', 'no', 'so', 'as', 'if', 'then', 'than', 'very', 'just',
  'from', 'up', 'out', 'about', 'into', 'through', 'during', 'before',
  'after', 'all', 'also', 'more', 'some', 'what', 'which', 'who', 'when',
  'where', 'how', 'there', 'their', 'they', 'them', 'he', 'she', 'his',
  'her', 'him', 'you', 'your', 'got', 'get', 'like', 'feel', 'felt',
  'day', 'today', 'really', 'much', 'now', 'still', 'even', 'back', 'going',
  'went', 'good', 'bad', 'time', 'too', 'make', 'made', 'can', 'one',
  'two', 'new', 'well', 'know', 'think', 'want', 'need', 'said', 'see'
]);

function readData() {
  if (!fs.existsSync(DATA_FILE)) return { entries: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { entries: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /api/moods — all entries
router.get('/', (req, res) => {
  const data = readData();
  res.json(data.entries);
});

// GET /api/moods/summary/weekly — must come BEFORE /:id
router.get('/summary/weekly', (req, res) => {
  const data = readData();
  const entries = data.entries;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const weekEntries = entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= weekAgo && d <= today;
  });

  const avgMood =
    weekEntries.length > 0
      ? Math.round((weekEntries.reduce((s, e) => s + e.rating, 0) / weekEntries.length) * 10) / 10
      : 0;

  const avgSentiment =
    weekEntries.length > 0
      ? Math.round((weekEntries.reduce((s, e) => s + e.sentiment.score, 0) / weekEntries.length) * 10) / 10
      : 0;

  const wordCount = {};
  weekEntries.forEach(e => {
    const words = (e.note || '')
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
  });

  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Calculate streak (consecutive days ending today)
  const allDates = new Set(entries.map(e => e.date));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  while (allDates.has(check.toISOString().split('T')[0])) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  res.json({
    period: {
      start: weekAgo.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    entries: weekEntries,
    avgMood,
    avgSentiment,
    topWords,
    streak,
    totalEntries: entries.length,
  });
});

// POST /api/moods — create / replace entry for that date
router.post('/', (req, res) => {
  const { rating, note, date } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const analysis = sentiment.analyze(note || '');

  const entry = {
    id: uuidv4(),
    date: date || new Date().toISOString().split('T')[0],
    rating: parseInt(rating),
    note: note || '',
    sentiment: {
      score: analysis.score,
      comparative: analysis.comparative,
      positive: analysis.positive,
      negative: analysis.negative,
    },
    createdAt: new Date().toISOString(),
  };

  const data = readData();
  const existingIdx = data.entries.findIndex(e => e.date === entry.date);
  if (existingIdx >= 0) {
    data.entries[existingIdx] = entry;
  } else {
    data.entries.push(entry);
  }

  data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  writeData(data);
  res.json(entry);
});

// DELETE /api/moods/:id
router.delete('/:id', (req, res) => {
  const data = readData();
  data.entries = data.entries.filter(e => e.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

module.exports = router;
