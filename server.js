const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data dir and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades: [] }, null, 2));

// Simple helpers
function readTrades() {
  const raw = fs.readFileSync(TRADES_FILE, 'utf8');
  return JSON.parse(raw || '{"trades":[]}').trades || [];
}
function writeTrades(trades) {
  fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades }, null, 2));
}

// API endpoints (local)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), env: 'local' });
});

app.get('/api/trades', (req, res) => {
  try {
    const trades = readTrades();
    res.json({ trades });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read trades' });
  }
});

app.post('/api/trades', (req, res) => {
  try {
    const payload = req.body || {};
    const trades = readTrades();
    const trade = Object.assign({}, payload, { id: Date.now(), createdAt: new Date().toISOString() });
    trades.push(trade);
    writeTrades(trades);
    res.status(201).json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

app.delete('/api/trades/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    let trades = readTrades();
    const before = trades.length;
    trades = trades.filter(t => Number(t.id) !== id);
    writeTrades(trades);
    res.json({ success: true, removed: before - trades.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Fallback to index.html for client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});