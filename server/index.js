const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 8000;

const cors = require('cors');
app.use(cors());

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

console.log(`Finnhub API Key: ${FINNHUB_API_KEY}`);

// general utility function to make GET requests to Finnhub
async function finnhubGet(endpoint, params = {}) {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/${endpoint}`, {
      params: { ...params, token: FINNHUB_API_KEY },
    });
    return response.data;
  } catch (err) {
    console.error(`Error calling ${endpoint}:`, err.message);
    throw err;
  }
}

// get quote for present time
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const data = await finnhubGet('quote', { symbol: req.params.symbol });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// company profile
app.get('/api/profile/:symbol', async (req, res) => {
  try {
    const data = await finnhubGet('stock/profile2', { symbol: req.params.symbol });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// prices over time (daily, weekly, minute, etc.)
app.get('/api/candles/:symbol', async (req, res) => {
    try {
      const { resolution, from, to } = req.query;
  
      if (!resolution || !from || !to) {
        return res.status(400).json({ error: 'Missing required query parameters: resolution, from, to' });
      }
  
      const data = await finnhubGet('stock/candle', {
        symbol: req.params.symbol,
        resolution,
        from,
        to,
      });
  
      res.json(data);
    } catch (err) {
      console.error('Error in /api/candles:', err.message);  // <-- log the actual error
      res.status(500).json({ error: 'Failed to fetch candles', message: err.message });
    }
  });
  
  

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});