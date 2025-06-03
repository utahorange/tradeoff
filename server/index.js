// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Holding = require("./Models/stocks");
const PortfolioSnapshot = require("./Models/portfolioSnapshot");
const FriendRequest = require("./Models/friendRequest");
const userRoutes = require("./routes/userRoutes");
const Competition = require("./Models/competition");
const CompetitionParticipant = require("./Models/competitionParticipant");
const CompetitionPortfolio = require("./Models/competitionPortfolio");
const User = require("./Models/user");
const profilePictureRoutes = require("./routes/profilePictureRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRoutes);
// app.use('/api/user', userRoutes);
app.use("/api/profile-picture", profilePictureRoutes);

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

console.log(`Finnhub API Key: ${FINNHUB_API_KEY}`);

// Add this logging function near the top of the file, after the imports
const logDatabaseQuery = (operation, collection, details = "") => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] Database ${operation} on ${collection} ${details}`
  );
};

// Add this after your imports and before the finnhubGet function
const stockPriceCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

// Enhanced finnhubGet function with caching
async function finnhubGet(endpoint, params = {}) {
  try {
    // Create cache key from endpoint and params
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;

    // Check if we have cached data
    const cachedData = stockPriceCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      const timestamp = new Date().toISOString();
      console.log(
        `[${timestamp}] FINNHUB CACHE HIT: ${endpoint} with params:`,
        JSON.stringify(params)
      );
      return cachedData.data;
    }

    // Log every Finnhub API call
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] FINNHUB API CALL: ${endpoint} with params:`,
      JSON.stringify(params)
    );

    const response = await axios.get(`${FINNHUB_BASE_URL}/${endpoint}`, {
      params: { ...params, token: FINNHUB_API_KEY },
    });

    console.log(`[${timestamp}] FINNHUB API RESPONSE: ${endpoint} - SUCCESS`);

    // Store in cache
    stockPriceCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] FINNHUB API ERROR: ${endpoint} - ${err.message}`
    );
    throw err;
  }
}

// Add cache cleanup function to prevent memory leaks
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of stockPriceCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      stockPriceCache.delete(key);
      console.log(`Cache cleaned up: ${key}`);
    }
  }
};

// Clean up cache every 10 minutes
setInterval(cleanupCache, 600000);

// get quote for present time
app.get("/api/quote/:symbol", async (req, res) => {
  try {
    const data = await finnhubGet("quote", { symbol: req.params.symbol });
    // Finnhub quote endpoint returns: c (current price), h (high), l (low), o (open), pc (previous close)
    const quote = {
      symbol: req.params.symbol,
      currentPrice: data.c,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      priceChange: data.c - data.pc,
      percentChange: (((data.c - data.pc) / data.pc) * 100).toFixed(2),
    };
    res.json(quote);
  } catch (error) {
    console.error("Quote error:", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// company profile
app.get("/api/profile/:symbol", async (req, res) => {
  try {
    const data = await finnhubGet("stock/profile2", {
      symbol: req.params.symbol,
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// prices over time (daily, weekly, minute, etc.)
app.get("/api/candles/:symbol", async (req, res) => {
  try {
    const { resolution, from, to } = req.query;

    if (!resolution || !from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters: resolution, from, to",
      });
    }

    const data = await finnhubGet("stock/candle", {
      symbol: req.params.symbol,
      resolution,
      from,
      to,
    });

    res.json(data);
  } catch (err) {
    console.error("Error in /api/candles:", err.message); // <-- log the actual error
    res
      .status(500)
      .json({ error: "Failed to fetch candles", message: err.message });
  }
});

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 10000,
    required: true,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Authentication Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      balance: 1000,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Protected route middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No authentication token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

// Competition Routes
// Create a new competition
app.post("/api/competitions", auth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, initialCash, visibility } =
      req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const competition = new Competition({
      name,
      host: user.username,
      details: description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      startingCash: initialCash,
      visibility,
      createdBy: user._id,
    });

    await competition.save();

    // Create a participant record for the host
    const participant = new CompetitionParticipant({
      userId: user._id,
      competitionId: competition._id,
      accountValue: initialCash,
      todayChange: 0,
      overallChange: 0,
    });

    await participant.save();

    // Create an initial portfolio for the host
    const portfolio = new CompetitionPortfolio({
      userId: user._id,
      competitionId: competition._id,
      cashBalance: initialCash,
      stocks: [],
    });

    await portfolio.save();

    res.status(201).json({
      message: "Competition created successfully",
      competition: {
        id: competition._id,
        name: competition.name,
        host: competition.host,
        details: competition.details,
        startDate: competition.startDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        endDate: competition.endDate
          ? competition.endDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "No End",
        players: 1,
        startingCash: competition.startingCash,
        locked: competition.locked,
        visibility: competition.visibility,
      },
    });
  } catch (error) {
    console.error("Error creating competition:", error);
    res.status(500).json({ message: "Error creating competition" });
  }
});

// Get all competitions
app.get("/api/competitions", auth, async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.json(competitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ message: "Error fetching competitions" });
  }
});

// Get competitions the current user is participating in
app.get("/api/competitions/my-games", auth, async (req, res) => {
  try {
    // Find all participant records for this user
    const participantRecords = await CompetitionParticipant.find({
      userId: req.user._id,
    });
    const competitionIds = participantRecords.map((p) => p.competitionId);
    // Find competitions by these IDs
    const competitions = await Competition.find({
      _id: { $in: competitionIds },
    });
    // Format for frontend
    const formatted = competitions.map((c) => ({
      id: c._id,
      name: c.name,
      host: c.host,
      details: c.details,
      startDate: c.startDate
        ? new Date(c.startDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      endDate: c.endDate
        ? new Date(c.endDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "No End",
      players: c.players,
      startingCash: c.startingCash,
      locked: c.locked,
      visibility: c.visibility,
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching my games:", error);
    res.status(500).json({ message: "Error fetching my games" });
  }
});

// Get competitions the current user can join (not already joined)
app.get("/api/competitions/available", auth, async (req, res) => {
  try {
    // Find all participant records for this user
    const participantRecords = await CompetitionParticipant.find({
      userId: req.user._id,
    });
    const joinedIds = participantRecords.map((p) => p.competitionId.toString());
    // Find competitions not joined by this user
    const competitions = await Competition.find({ _id: { $nin: joinedIds } });
    // Format for frontend
    const formatted = competitions.map((c) => ({
      id: c._id,
      name: c.name,
      host: c.host,
      details: c.details,
      startDate: c.startDate
        ? new Date(c.startDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      endDate: c.endDate
        ? new Date(c.endDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "No End",
      players: c.players,
      startingCash: c.startingCash,
      locked: c.locked,
      visibility: c.visibility,
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching available games:", error);
    res.status(500).json({ message: "Error fetching available games" });
  }
});

// Leave a competition (move this above the details route)
app.post("/api/competitions/:competitionId/leave", auth, async (req, res) => {
  try {
    const { competitionId } = req.params;
    console.log(
      "[LEAVE COMPETITION] competitionId:",
      competitionId,
      "userId:",
      req.user._id
    );

    // Verify the competition exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      console.log(
        "[LEAVE COMPETITION] Competition not found for id:",
        competitionId
      );
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is the host
    if (competition.createdBy.toString() === req.user._id.toString()) {
      console.log(
        "[LEAVE COMPETITION] User is host, cannot leave:",
        req.user._id
      );
      return res
        .status(400)
        .json({ message: "Host cannot leave their own competition" });
    }

    // Remove participant record
    const participantResult = await CompetitionParticipant.deleteOne({
      userId: req.user._id,
      competitionId: competitionId,
    });
    console.log(
      "[LEAVE COMPETITION] Participant delete result:",
      participantResult
    );

    if (participantResult.deletedCount === 0) {
      console.log(
        "[LEAVE COMPETITION] No participant record found for user:",
        req.user._id,
        "competition:",
        competitionId
      );
      return res
        .status(404)
        .json({ message: "You are not a participant in this competition" });
    }

    // Remove competition portfolio
    const portfolioResult = await CompetitionPortfolio.deleteOne({
      userId: req.user._id,
      competitionId: competitionId,
    });
    console.log(
      "[LEAVE COMPETITION] Portfolio delete result:",
      portfolioResult
    );

    res.json({ message: "Successfully left the competition" });
  } catch (error) {
    console.error("Error leaving competition:", error);
    res.status(500).json({ message: "Error leaving competition" });
  }
});

// Get competition details
app.get("/api/competitions/:competitionId", auth, async (req, res) => {
  try {
    const { competitionId } = req.params;
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Format dates for display
    const startDateFormatted = new Date(
      competition.startDate
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const endDateFormatted = competition.endDate
      ? new Date(competition.endDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "No End";

    res.json({
      ...competition.toObject(),
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      initialCash: competition.startingCash,
    });
  } catch (error) {
    console.error("Error fetching competition details:", error);
    res.status(500).json({ message: "Error fetching competition details" });
  }
});

// Get competition snapshots
app.get(
  "/api/competitions/:competitionId/snapshots",
  auth,
  async (req, res) => {
    try {
      const { competitionId } = req.params;

      // Verify the competition exists
      const competition = await Competition.findById(competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }

      // Get all participants in this competition
      const participants = await CompetitionParticipant.find({
        competitionId,
      }).populate("userId", "username");

      // Get snapshots for each participant
      const snapshotsData = await Promise.all(
        participants.map(async (participant) => {
          // Get portfolio snapshots for this participant
          const snapshots = await PortfolioSnapshot.find({
            competitionId,
            type: "competition",
            "holdings.userId": participant.userId._id,
          })
            .sort({ timestamp: 1 })
            .select("timestamp totalValue");

          // Format snapshots for the graph
          const formattedSnapshots = snapshots.map((snapshot) => ({
            date: snapshot.timestamp.toISOString(),
            value: snapshot.totalValue,
          }));

          return {
            username: participant.userId.username,
            isCurrentUser:
              participant.userId._id.toString() === req.user._id.toString(),
            snapshots: formattedSnapshots,
          };
        })
      );

      res.json(snapshotsData);
    } catch (error) {
      console.error("Error fetching competition snapshots:", error);
      res.status(500).json({ message: "Error fetching competition snapshots" });
    }
  }
);

// Protected route example
app.get("/api/profile", auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// Search users endpoint
app.get("/api/users/search", auth, async (req, res) => {
  try {
    const searchTerm = req.query.username || "";
    if (searchTerm.length < 2) {
      return res
        .status(400)
        .json({ message: "Search term must be at least 2 characters long" });
    }

    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
      _id: { $ne: req.user._id }, // Exclude the current user
    }).select("username _id");

    res.json({ users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users" });
  }
});

// Send friend request
app.post("/api/friends/request", auth, async (req, res) => {
  try {
    const { receiverId } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    // Check if they're already friends
    if (req.user.friends.includes(receiverId)) {
      return res.status(400).json({ message: "Users are already friends" });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: req.user._id,
      receiver: receiverId,
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ message: "Error sending friend request" });
  }
});

// Get pending friend requests
app.get("/api/friends/requests", auth, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "username");

    res.json({ requests });
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ message: "Error fetching friend requests" });
  }
});

// Respond to friend request
app.post("/api/friends/respond", auth, async (req, res) => {
  try {
    const { requestId, accept } = req.body;

    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (accept) {
      // Add each user to the other's friends list
      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: request.receiver },
      });
      await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { friends: request.sender },
      });
      request.status = "accepted";
    } else {
      request.status = "rejected";
    }

    await request.save();
    res.json({ message: `Friend request ${accept ? "accepted" : "rejected"}` });
  } catch (error) {
    console.error("Respond to friend request error:", error);
    res.status(500).json({ message: "Error responding to friend request" });
  }
});

// Get friend list
app.get("/api/friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "username"
    );
    res.json({ friends: user.friends });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ message: "Error fetching friends list" });
  }
});

// Update the holdings endpoint to create a snapshot when holdings change
app.post("/api/holdings", auth, async (req, res) => {
  try {
    const { stockSymbol, stockPrice, stockQuantity, action } = req.body;
    logDatabaseQuery("READ", "User", `Finding user by ID: ${req.user._id}`);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactionAmount = stockPrice * stockQuantity;

    if (action === "buy") {
      if (user.balance < transactionAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      user.balance -= transactionAmount;
      logDatabaseQuery(
        "CREATE",
        "Holding",
        `Creating new holding for ${stockSymbol}`
      );
      const holding = new Holding({
        user: req.user._id,
        stockSymbol,
        stockPrice,
        stockQuantity,
      });
      await holding.save();
    } else if (action === "sell") {
      logDatabaseQuery(
        "READ",
        "Holding",
        `Finding holdings for ${stockSymbol}`
      );
      // Get all holdings for this stock symbol, sorted by purchase date (FIFO)
      const holdings = await Holding.find({
        user: req.user._id,
        stockSymbol: stockSymbol,
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
          logDatabaseQuery(
            "DELETE",
            "Holding",
            `Deleting holding ${holding._id}`
          );
          await Holding.deleteOne({ _id: holding._id });
        } else {
          // Update the holding with remaining quantity
          logDatabaseQuery(
            "UPDATE",
            "Holding",
            `Updating quantity for holding ${holding._id}`
          );
          holding.stockQuantity -= quantityToSell;
          await holding.save();
        }

        remainingToSell -= quantityToSell;
      }

      if (remainingToSell > 0) {
        return res.status(400).json({ message: "Insufficient stocks to sell" });
      }

      user.balance += totalSaleAmount;
    }

    logDatabaseQuery("UPDATE", "User", `Updating balance for user ${user._id}`);
    await user.save();

    // Create a new portfolio snapshot
    logDatabaseQuery(
      "READ",
      "Holding",
      `Getting all holdings for user ${req.user._id}`
    );
    const holdings = await Holding.find({ user: req.user._id });
    const totalValue = holdings.reduce(
      (sum, h) => sum + h.stockPrice * h.stockQuantity,
      0
    );

    logDatabaseQuery(
      "CREATE",
      "PortfolioSnapshot",
      `Creating new snapshot for user ${req.user._id}`
    );
    const snapshot = new PortfolioSnapshot({
      user: req.user._id,
      totalValue,
      holdings: holdings.map((h) => ({
        symbol: h.stockSymbol,
        quantity: h.stockQuantity,
        price: h.stockPrice,
        value: h.stockPrice * h.stockQuantity,
      })),
      cashBalance: user.balance,
    });
    await snapshot.save();

    res.status(201).json({
      message: `${action === "buy" ? "Bought" : "Sold"} stocks successfully`,
      balance: user.balance,
      totalValue,
    });
  } catch (error) {
    console.error("Add holding error:", error);
    res.status(500).json({ message: "Error processing transaction" });
  }
});

// Get all holdings for the logged-in user
app.get("/api/holdings", auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    res.json({ holdings });
  } catch (error) {
    console.error("Get holdings error:", error);
    res.status(500).json({ message: "Error fetching holdings" });
  }
});

// Get portfolio history
app.get("/api/portfolio/history", auth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    let startDate = new Date();

    switch (timeframe) {
      case "1D":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "1W":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "1M":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "1Y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "ALL":
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to 1 week
    }

    const snapshots = await PortfolioSnapshot.find({
      user: req.user._id,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    res.json({ snapshots });
  } catch (error) {
    console.error("Get portfolio history error:", error);
    res.status(500).json({ message: "Error fetching portfolio history" });
  }
});
// Balance endpoint
app.get("/api/balance", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ balance: user.balance });
});

// Update prices for all holdings
app.post("/api/holdings/update-prices", auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    const uniqueSymbols = [...new Set(holdings.map((h) => h.stockSymbol))];

    // Fetch current prices for all symbols
    const updates = await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        const data = await finnhubGet("quote", { symbol });
        return {
          symbol,
          currentPrice: data.c,
        };
      })
    );

    // Update holdings with new prices
    for (const update of updates) {
      await Holding.updateMany(
        { user: req.user._id, stockSymbol: update.symbol },
        { $set: { stockPrice: update.currentPrice } }
      );
    }

    // Create new portfolio snapshot
    const updatedHoldings = await Holding.find({ user: req.user._id });
    const totalValue = updatedHoldings.reduce(
      (sum, h) => sum + h.stockPrice * h.stockQuantity,
      0
    );

    const snapshot = new PortfolioSnapshot({
      user: req.user._id,
      totalValue,
      holdings: updatedHoldings.map((h) => ({
        symbol: h.stockSymbol,
        quantity: h.stockQuantity,
        price: h.stockPrice,
        value: h.stockPrice * h.stockQuantity,
      })),
      cashBalance: 10000, // TODO: Replace with actual user balance
    });
    await snapshot.save();

    res.json({
      message: "Prices updated successfully",
      holdings: updatedHoldings,
    });
  } catch (error) {
    console.error("Update prices error:", error);
    res.status(500).json({ message: "Error updating prices" });
  }
});

// Get current portfolio value
app.get("/api/portfolio/current", auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    const totalValue = holdings.reduce(
      (sum, h) => sum + h.stockPrice * h.stockQuantity,
      0
    );

    // Get the latest snapshot for additional context
    const latestSnapshot = await PortfolioSnapshot.findOne({
      user: req.user._id,
    }).sort({ timestamp: -1 });

    res.json({
      totalValue,
      holdings: holdings.map((h) => ({
        symbol: h.stockSymbol,
        quantity: h.stockQuantity,
        price: h.stockPrice,
        value: h.stockPrice * h.stockQuantity,
      })),
      previousValue: latestSnapshot ? latestSnapshot.totalValue : totalValue,
    });
  } catch (error) {
    console.error("Get current portfolio error:", error);
    res.status(500).json({ message: "Error fetching current portfolio" });
  }
});

// Get current portfolio value with real-time prices
app.get("/api/portfolio/current-value", auth, async (req, res) => {
  console.log("Getting current portfolio value");
  try {
    logDatabaseQuery("READ", "User", `Finding user by ID: ${req.user._id}`);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logDatabaseQuery(
      "READ",
      "Holding",
      `Getting all holdings for user ${req.user._id}`
    );
    const holdings = await Holding.find({ user: req.user._id });
    let totalValue = 0;
    const holdingsWithCurrentPrice = [];

    for (const holding of holdings) {
      try {
        const quote = await finnhubGet("quote", {
          symbol: holding.stockSymbol,
        });
        const currentPrice = quote.c;
        const value = currentPrice * holding.stockQuantity;
        totalValue += value;

        holdingsWithCurrentPrice.push({
          symbol: holding.stockSymbol,
          quantity: holding.stockQuantity,
          purchasePrice: holding.stockPrice,
          currentPrice: currentPrice,
          value: value,
          change:
            ((currentPrice - holding.stockPrice) / holding.stockPrice) * 100,
        });
      } catch (error) {
        console.error(
          `Error fetching price for ${holding.stockSymbol}:`,
          error
        );
      }
    }

    res.json({
      totalValue: totalValue + user.balance,
      holdings: holdingsWithCurrentPrice,
      cashBalance: user.balance,
    });
  } catch (error) {
    console.error("Get current portfolio value error:", error);
    res.status(500).json({ message: "Error fetching current portfolio value" });
  }
});

// Get leaderboard for a competition
app.get(
  "/api/competitions/:competitionId/leaderboard",
  auth,
  async (req, res) => {
    try {
      const { competitionId } = req.params;
      // Find all participants for this competition
      const participants = await CompetitionParticipant.find({
        competitionId,
      }).populate("userId", "username");
      // Sort by accountValue descending
      const sorted = participants.sort(
        (a, b) => b.accountValue - a.accountValue
      );
      // Format for frontend
      const leaderboard = sorted.map((p, idx) => ({
        rank: idx + 1,
        username: p.userId.username,
        accountValue: p.accountValue,
        todayChange: p.todayChange,
        overallChange: p.overallChange,
        isCurrentUser: p.userId._id.toString() === req.user._id.toString(),
      }));
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  }
);
// Stock search endpoint
app.get("/api/stocks/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const data = await finnhubGet("search", { q: query });

    // Format the response to include only necessary data
    const results = data.result.map((stock) => ({
      symbol: stock.symbol,
      description: stock.description,
      type: stock.type,
      primaryExchange: stock.primaryExchange,
    }));

    res.json(results);
  } catch (error) {
    console.error("Stock search error:", error);
    res.status(500).json({ error: "Failed to search stocks" });
  }
});

// Get detailed stock information
app.get("/api/stocks/:symbol", auth, async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get quote data
    const quoteData = await finnhubGet("quote", { symbol });

    // Get company profile
    const profileData = await finnhubGet("stock/profile2", { symbol });

    // Combine the data
    const stockData = {
      symbol: symbol,
      description: profileData.name,
      price: quoteData.c,
      change: ((quoteData.c - quoteData.pc) / quoteData.pc) * 100,
      marketCap: profileData.marketCapitalization,
      volume: quoteData.t,
      weekHigh52: profileData.weekHigh52,
      weekLow52: profileData.weekLow52,
      industry: profileData.finnhubIndustry,
      exchange: profileData.exchange,
    };

    res.json(stockData);
  } catch (error) {
    console.error("Stock detail error:", error);
    res.status(500).json({ error: "Failed to fetch stock details" });
  }
});

// // app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8080;
app.use("/api/profile-picture", profilePictureRoutes);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
