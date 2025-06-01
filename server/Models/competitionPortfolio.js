const mongoose = require('mongoose');

const competitionPortfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    competitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    stocks: [{
        symbol: String,
        quantity: Number,
        purchasePrice: Number,
        purchaseDate: Date,
        currentValue: Number
    }],
    cashBalance: {
        type: Number,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Create a compound index to ensure a user has only one portfolio per competition
competitionPortfolioSchema.index({ userId: 1, competitionId: 1 }, { unique: true });

const CompetitionPortfolio = mongoose.model('CompetitionPortfolio', competitionPortfolioSchema);

module.exports = CompetitionPortfolio;
