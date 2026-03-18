const { readData, writeData } = require('../_jsonbin');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const data = await readData();
    data.entries = data.entries.filter(e => e.id !== id);
    await writeData(data);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
