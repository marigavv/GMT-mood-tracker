const { readData } = require('./_jsonbin');

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = await readData();
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

  const allDates = new Set(entries.map(e => e.date));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  while (allDates.has(check.toISOString().split('T')[0])) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  return res.json({
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
};
