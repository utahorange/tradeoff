// // server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Holding = require('./Models/stocks');
const PortfolioSnapshot = require('./Models/portfolioSnapshot');
const FriendRequest = require('./Models/friendRequest');
require('dotenv').config();
// const config = require('./config');
// const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
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
    // Finnhub quote endpoint returns: c (current price), h (high), l (low), o (open), pc (previous close)
    const quote = {
      symbol: req.params.symbol,
      currentPrice: data.c,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      priceChange: data.c - data.pc,
      percentChange: ((data.c - data.pc) / data.pc * 100).toFixed(2)
    };
    res.json(quote);
  } catch (error) {
    console.error('Quote error:', error);
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
  


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 1000,
        required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Authentication Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            balance: 1000
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Protected route middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Protected route example
app.get('/api/profile', auth, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

// Search users endpoint
app.get('/api/users/search', auth, async (req, res) => {
    try {
        const searchTerm = req.query.username || '';
        if (searchTerm.length < 2) {
            return res.status(400).json({ message: 'Search term must be at least 2 characters long' });
        }

        const users = await User.find({
            username: { $regex: searchTerm, $options: 'i' },
            _id: { $ne: req.user._id } // Exclude the current user
        }).select('username _id');

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Error searching users' });
    }
});

// Send friend request
app.post('/api/friends/request', auth, async (req, res) => {
    try {
        const { receiverId } = req.body;
        
        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists' });
        }

        // Check if they're already friends
        if (req.user.friends.includes(receiverId)) {
            return res.status(400).json({ message: 'Users are already friends' });
        }

        // Create new friend request
        const friendRequest = new FriendRequest({
            sender: req.user._id,
            receiver: receiverId
        });

        await friendRequest.save();
        res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ message: 'Error sending friend request' });
    }
});

// Get pending friend requests
app.get('/api/friends/requests', auth, async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user._id,
            status: 'pending'
        }).populate('sender', 'username');

        res.json({ requests });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({ message: 'Error fetching friend requests' });
    }
});

// Respond to friend request
app.post('/api/friends/respond', auth, async (req, res) => {
    try {
        const { requestId, accept } = req.body;
        
        const request = await FriendRequest.findOne({
            _id: requestId,
            receiver: req.user._id,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (accept) {
            // Add each user to the other's friends list
            await User.findByIdAndUpdate(request.sender, {
                $addToSet: { friends: request.receiver }
            });
            await User.findByIdAndUpdate(request.receiver, {
                $addToSet: { friends: request.sender }
            });
            request.status = 'accepted';
        } else {
            request.status = 'rejected';
        }

        await request.save();
        res.json({ message: `Friend request ${accept ? 'accepted' : 'rejected'}` });
    } catch (error) {
        console.error('Respond to friend request error:', error);
        res.status(500).json({ message: 'Error responding to friend request' });
    }
});

// Get friend list
app.get('/api/friends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username');
        res.json({ friends: user.friends });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Error fetching friends list' });
    }
});

// Update the holdings endpoint to create a snapshot when holdings change
app.post('/api/holdings', auth, async (req, res) => {
    try {
        const { stockSymbol, stockPrice, stockQuantity, action } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const transactionAmount = stockPrice * stockQuantity;

        if (action === 'buy') {
            if (user.balance < transactionAmount) {
                return res.status(400).json({ message: 'Insufficient funds' });
            }
            user.balance -= transactionAmount;
            const holding = new Holding({
                    user: req.user._id,
                    stockSymbol,
                    stockPrice,
                    stockQuantity
                });
                await holding.save();
        }
        else if (action === 'sell') {
            // Get all holdings for this stock symbol, sorted by purchase date (FIFO)
            const holdings = await Holding.find({
                user: req.user._id,
                stockSymbol: stockSymbol
            }).sort({ boughtAt: 1 });

            let remainingToSell = stockQuantity;
            let totalSaleAmount = 0;

            for (const holding of holdings) {
                if (remainingToSell <= 0) break;

                const quantityToSell = Math.min(remainingToSell, holding.stockQuantity);
                const saleAmount = quantityToSell * stockPrice;
                totalSaleAmount += saleAmount;

                if (quantityToSell === holding.stockQuantity) {
                    // Delete the holding if we're selling all of it
                    await Holding.deleteOne({ _id: holding._id });
                } else {
                    // Update the holding with remaining quantity
                    holding.stockQuantity -= quantityToSell;
                    await holding.save();
                }

                remainingToSell -= quantityToSell;
            }

            if (remainingToSell > 0) {
                return res.status(400).json({ message: 'Insufficient stocks to sell' });
            }

            user.balance += totalSaleAmount;
        }

        await user.save();

        // Create a new portfolio snapshot
        const holdings = await Holding.find({ user: req.user._id });
        const totalValue = holdings.reduce((sum, h) => sum + (h.stockPrice * h.stockQuantity), 0);
        
        const snapshot = new PortfolioSnapshot({
            user: req.user._id,
            totalValue,
            holdings: holdings.map(h => ({
                symbol: h.stockSymbol,
                quantity: h.stockQuantity,
                price: h.stockPrice,
                value: h.stockPrice * h.stockQuantity
            })),
            cashBalance: user.balance
        });
        await snapshot.save();

        res.status(201).json({ 
            message: `${action === 'buy' ? 'Bought' : 'Sold'} stocks successfully`,
            balance: user.balance,
            totalValue
        });
    } catch (error) {
        console.error('Add holding error:', error);
        res.status(500).json({ message: 'Error processing transaction' });
    }
});

// Get all holdings for the logged-in user
app.get('/api/holdings', auth, async (req, res) => {
    try {
        const holdings = await Holding.find({ user: req.user._id });
        res.json({ holdings });
    } catch (error) {
        console.error('Get holdings error:', error);
        res.status(500).json({ message: 'Error fetching holdings' });
    }
});

// Get portfolio history
app.get('/api/portfolio/history', auth, async (req, res) => {
    try {
        const { timeframe } = req.query; 
        let startDate = new Date();

        switch(timeframe) {
            case '1D':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '1W':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '1M':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '1Y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'ALL':
                startDate = new Date(0); // Beginning of time
                break;
            default:
                startDate.setDate(startDate.getDate() - 7); // Default to 1 week
        }

        const snapshots = await PortfolioSnapshot.find({
            user: req.user._id,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });

        res.json({ snapshots });
    } catch (error) {
        console.error('Get portfolio history error:', error);
        res.status(500).json({ message: 'Error fetching portfolio history' });
    }
});
// Balance endpoint
app.get('/api/balance', auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ balance: user.balance });
});

// Update prices for all holdings
app.post('/api/holdings/update-prices', auth, async (req, res) => {
    try {
        const holdings = await Holding.find({ user: req.user._id });
        const uniqueSymbols = [...new Set(holdings.map(h => h.stockSymbol))];
        
        // Fetch current prices for all symbols
        const updates = await Promise.all(uniqueSymbols.map(async (symbol) => {
            const data = await finnhubGet('quote', { symbol });
            return {
                symbol,
                currentPrice: data.c
            };
        }));

        // Update holdings with new prices
        for (const update of updates) {
            await Holding.updateMany(
                { user: req.user._id, stockSymbol: update.symbol },
                { $set: { stockPrice: update.currentPrice } }
            );
        }

        // Create new portfolio snapshot
        const updatedHoldings = await Holding.find({ user: req.user._id });
        const totalValue = updatedHoldings.reduce((sum, h) => sum + (h.stockPrice * h.stockQuantity), 0);
        
        const snapshot = new PortfolioSnapshot({
            user: req.user._id,
            totalValue,
            holdings: updatedHoldings.map(h => ({
                symbol: h.stockSymbol,
                quantity: h.stockQuantity,
                price: h.stockPrice,
                value: h.stockPrice * h.stockQuantity
            })),
            cashBalance: 10000 // TODO: Replace with actual user balance
        });
        await snapshot.save();

        res.json({
            message: 'Prices updated successfully',
            holdings: updatedHoldings
        });
    } catch (error) {
        console.error('Update prices error:', error);
        res.status(500).json({ message: 'Error updating prices' });
    }
});

// Get current portfolio value
app.get('/api/portfolio/current', auth, async (req, res) => {
    try {
        const holdings = await Holding.find({ user: req.user._id });
        const totalValue = holdings.reduce((sum, h) => sum + (h.stockPrice * h.stockQuantity), 0);
        
        // Get the latest snapshot for additional context
        const latestSnapshot = await PortfolioSnapshot.findOne({ user: req.user._id })
            .sort({ timestamp: -1 });

        res.json({
            totalValue,
            holdings: holdings.map(h => ({
                symbol: h.stockSymbol,
                quantity: h.stockQuantity,
                price: h.stockPrice,
                value: h.stockPrice * h.stockQuantity
            })),
            previousValue: latestSnapshot ? latestSnapshot.totalValue : totalValue
        });
    } catch (error) {
        console.error('Get current portfolio error:', error);
        res.status(500).json({ message: 'Error fetching current portfolio' });
    }
});

// Get current portfolio value with real-time prices
app.get('/api/portfolio/current-value', auth, async (req, res) => {
    console.log('Getting current portfolio value');
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const holdings = await Holding.find({ user: req.user._id });
        let totalValue = 0;
        const holdingsWithCurrentPrice = [];

        for (const holding of holdings) {
            try {
                const quote = await finnhubGet('quote', { symbol: holding.stockSymbol });
                const currentPrice = quote.c;
                const value = currentPrice * holding.stockQuantity;
                totalValue += value;

                holdingsWithCurrentPrice.push({
                    symbol: holding.stockSymbol,
                    quantity: holding.stockQuantity,
                    purchasePrice: holding.stockPrice,
                    currentPrice: currentPrice,
                    value: value,
                    change: ((currentPrice - holding.stockPrice) / holding.stockPrice) * 100
                });
            } catch (error) {
                console.error(`Error fetching price for ${holding.stockSymbol}:`, error);
            }
        }

        res.json({
            totalValue: totalValue + user.balance,
            holdings: holdingsWithCurrentPrice,
            cashBalance: user.balance
        });
    } catch (error) {
        console.error('Get current portfolio value error:', error);
        res.status(500).json({ message: 'Error fetching current portfolio value' });
    }
});

// Stock search endpoint
app.get('/api/stocks/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const data = await finnhubGet('search', { q: query });
        
        // Format the response to include only necessary data
        const results = data.result.map(stock => ({
            symbol: stock.symbol,
            description: stock.description,
            type: stock.type,
            primaryExchange: stock.primaryExchange
        }));

        res.json(results);
    } catch (error) {
        console.error('Stock search error:', error);
        res.status(500).json({ error: 'Failed to search stocks' });
    }
});

// Get detailed stock information
app.get('/api/stocks/:symbol', auth, async (req, res) => {
    try {
        const { symbol } = req.params;
        
        // Get quote data
        const quoteData = await finnhubGet('quote', { symbol });
        
        // Get company profile
        const profileData = await finnhubGet('stock/profile2', { symbol });

        // Combine the data
        const stockData = {
            symbol: symbol,
            description: profileData.name,
            price: quoteData.c,
            change: ((quoteData.c - quoteData.pc) / quoteData.pc * 100),
            marketCap: profileData.marketCapitalization,
            volume: quoteData.t,
            weekHigh52: profileData.weekHigh52,
            weekLow52: profileData.weekLow52,
            industry: profileData.finnhubIndustry,
            exchange: profileData.exchange
        };

        res.json(stockData);
    } catch (error) {
        console.error('Stock detail error:', error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

// // app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));