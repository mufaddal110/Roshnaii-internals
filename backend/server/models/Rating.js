const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poetryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poetry', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// Ensure a user can only rate a poem once
ratingSchema.index({ userId: 1, poetryId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
