const mongoose = require("mongoose");

const portfolioSnapshotSchema = new mongoose.Schema({
  // For regular portfolio snapshots
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return !this.competitionId; // Required only if not a competition snapshot
    },
  },
  // For competition portfolio snapshots
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competition",
    required: function () {
      return !this.user; // Required only if not a regular portfolio snapshot
    },
  },
  // Type of snapshot to distinguish between competition and regular portfolio
  type: {
    type: String,
    enum: ["regular", "competition"],
    required: true,
    default: "regular",
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

// Create compound indexes for efficient querying
portfolioSnapshotSchema.index({ user: 1, timestamp: -1 }); // For regular portfolio snapshots
portfolioSnapshotSchema.index({ competitionId: 1, timestamp: -1 }); // For competition snapshots

// Add a validation to ensure either user or competitionId is present
portfolioSnapshotSchema.pre("save", function (next) {
  if (!this.user && !this.competitionId) {
    next(new Error("Either user or competitionId must be present"));
  }
  if (this.user && this.competitionId) {
    next(new Error("Cannot have both user and competitionId"));
  }
  next();
});

const PortfolioSnapshot = mongoose.model(
  "PortfolioSnapshot",
  portfolioSnapshotSchema
);

module.exports = PortfolioSnapshot;
