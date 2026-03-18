const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_ID = process.env.JSONBIN_ID;

async function readData() {
  if (!JSONBIN_ID || !JSONBIN_KEY) return { entries: [] };
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY },
    });
    if (!res.ok) return { entries: [] };
    const json = await res.json();
    return json.record || { entries: [] };
  } catch {
    return { entries: [] };
  }
}

async function writeData(data) {
  if (!JSONBIN_ID || !JSONBIN_KEY) return;
  await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
    },
    body: JSON.stringify(data),
  });
}

module.exports = { readData, writeData };
