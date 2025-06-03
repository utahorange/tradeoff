const mongoose = require('mongoose');

const stockPriceCacheSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 60 // Expires after 60 seconds
    }
});

module.exports = mongoose.model('StockPriceCache', stockPriceCacheSchema); 