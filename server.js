const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const fsp = fs.promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TRADES_FILE = path.join(DATA_DIR, 'trades.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data dir and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, JSON.stringify({ trades: [] }, null, 2));

// Helper functions
async function readTrades() {
  const raw = await fsp.readFile(TRADES_FILE, 'utf8');
  return JSON.parse(raw).trades || [];
}
async function writeTrades(trades) {
  await fsp.writeFile(TRADES_FILE, JSON.stringify({ trades }, null, 2));
}

// Example API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/strategies', (req, res) => {
  // Return mock strategies - adapt to your real data source
  res.json({
    strategies: [
      { id: 1, name: 'Mean Reversion', description: 'Sample mean reversion strategy' },
      { id: 2, name: 'Breakout', description: 'Sample breakout strategy' }
    ]
  });
});

app.get('/api/performance', (req, res) => {
  // Return mock performance metrics
  res.json({
    performance: {
      totalTrades: 120,
      winRate: 0.58,
      profit: 3420.50,
      timeframe: 'M15'
    }
  });
});

// Trades persistence endpoints
app.get('/api/trades', async (req, res) => {
  try {
    const trades = await readTrades();
    res.json({ trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read trades' });
  }
});

app.post('/api/trades', async (req, res) => {
  try {
    const trade = req.body;
    if (!trade || typeof trade !== 'object') {
      return res.status(400).json({ error: 'Invalid trade payload' });
    }
    const trades = await readTrades();
    trade.id = Date.now();
    trade.createdAt = new Date().toISOString();
    trades.push(trade);
    await writeTrades(trades);
    res.json({ success: true, trade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

app.delete('/api/trades/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    let trades = await readTrades();
    const before = trades.length;
    trades = trades.filter(t => Number(t.id) !== id);
    await writeTrades(trades);
    res.json({ success: true, removed: before - trades.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

app.post('/api/submit-trade', async (req, res) => {
  const trade = req.body;
  console.log('Received trade:', trade);
  // For backward compatibility, also persist to trades store
  try {
    const trades = await readTrades();
    trade.id = trade.id || Date.now();
    trade.createdAt = new Date().toISOString();
    trades.push(trade);
    await writeTrades(trades);
    res.json({ success: true, received: trade, id: trade.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to persist trade' });
  }
});

// Fallback - serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});