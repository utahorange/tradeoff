const mongoose = require('mongoose');

const portfolioSnapshotSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    totalValue: {
        type: Number,
        required: true
    },
    holdings: [{
        symbol: String,
        quantity: Number,
        price: Number,
        value: Number
    }],
    cashBalance: {
        type: Number,
        required: true
    }
});

const PortfolioSnapshot = mongoose.model('PortfolioSnapshot', portfolioSnapshotSchema);

module.exports = PortfolioSnapshot; 