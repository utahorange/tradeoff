const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null, // For competitions with "No End"
  },
  players: {
    type: Number,
    default: 0,
  },
  startingCash: {
    type: Number,
    required: true,
    default: 100000,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Competition = mongoose.model("Competition", competitionSchema);

// Note: PortfolioSnapshots are now associated with competitions via the PortfolioSnapshot model's competitionId field.
// To fetch all snapshots for a competition, query PortfolioSnapshot with { competitionId: this._id }
