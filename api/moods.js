const { v4: uuidv4 } = require('uuid');
const Sentiment = require('sentiment');
const { readData, writeData } = require('./_jsonbin');

const sentiment = new Sentiment();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const data = await readData();
    return res.json(data.entries);
  }

  if (req.method === 'POST') {
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

    const data = await readData();
    const existingIdx = data.entries.findIndex(e => e.date === entry.date);
    if (existingIdx >= 0) {
      data.entries[existingIdx] = entry;
    } else {
      data.entries.push(entry);
    }
    data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    await writeData(data);
    return res.json(entry);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
