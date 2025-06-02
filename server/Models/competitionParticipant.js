const mongoose = require('mongoose');

const competitionParticipantSchema = new mongoose.Schema({
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
    accountValue: {
        type: Number,
        required: true
    },
    todayChange: {
        type: Number,
        default: 0
    },
    overallChange: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a compound index to ensure a user can only join a competition once
competitionParticipantSchema.index({ userId: 1, competitionId: 1 }, { unique: true });

const CompetitionParticipant = mongoose.model('CompetitionParticipant', competitionParticipantSchema);

module.exports = CompetitionParticipant;
