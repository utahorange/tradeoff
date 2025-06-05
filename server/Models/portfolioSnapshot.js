const mongoose = require("mongoose");

const portfolioSnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competition",
    default: null,
  },
  type: {
    type: String,
    enum: ["personal", "competition"],
    default: "personal",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  holdings: [
    {
      symbol: String,
      quantity: Number,
      price: Number,
      value: Number,
    },
  ],
  cashBalance: {
    type: Number,
    required: true,
  },
});

const PortfolioSnapshot = mongoose.model(
  "PortfolioSnapshot",
  portfolioSnapshotSchema
);

module.exports = PortfolioSnapshot;
