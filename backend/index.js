const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

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
const from = Math.floor(new Date('2024-01-01').getTime() / 1000);
const to = Math.floor(new Date().getTime() / 1000); // now

finnhubClient.stockCandles("AAPL", "D", from, to, (error, data, response) => {
  if (error) {
    console.error("Candle error:", error);
  } else {
    console.log("Historical candles:", data);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});