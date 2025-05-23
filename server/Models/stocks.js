const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockSymbol: {
        type: String,
        required: true
    },
    stockPrice: {
        type: Number,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true
    },
    boughtAt: {
        type: Date,
        default: Date.now
    }
});

const Holding = mongoose.model('Holding', holdingSchema);
module.exports = Holding;