const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades: [] }, null, 2));
}

module.exports = async (req, res) => {
  ensureData();
  const method = req.method.toUpperCase();
  try {
    if (method === 'GET') {
      const raw = fs.readFileSync(TRADES_FILE, 'utf8');
      const obj = JSON.parse(raw || '{"trades":[]}');
      return res.status(200).json(obj);
    } else if (method === 'POST') {
      const body = req.body || {};
      if (typeof body !== 'object') return res.status(400).json({ error: 'Invalid payload' });
      const raw = fs.readFileSync(TRADES_FILE, 'utf8');
      const obj = JSON.parse(raw || '{"trades":[]}');
      const trades = obj.trades || [];
      const trade = Object.assign({}, body, { id: Date.now(), createdAt: new Date().toISOString() });
      trades.push(trade);
      fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades }, null, 2));
      return res.status(201).json({ success: true, trade });
    } else if (method === 'DELETE') {
      // expecting /api/trades?id=123 or /api/trades/123
      const url = req.url || '';
      const queryId = (req.query && req.query.id) || null;
      let id = queryId ? Number(queryId) : null;
      // try path based id: /api/trades/123
      const parts = url.split('/');
      const last = parts[parts.length-1];
      if (!id && last && /^\d+$/.test(last)) id = Number(last);
      const raw = fs.readFileSync(TRADES_FILE, 'utf8');
      const obj = JSON.parse(raw || '{"trades":[]}');
      let trades = obj.trades || [];
      const before = trades.length;
      trades = trades.filter(t => Number(t.id) !== Number(id));
      fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades }, null, 2));
      return res.status(200).json({ success: true, removed: before - trades.length });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};