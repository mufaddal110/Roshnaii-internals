const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poetryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poetry', required: true },
}, { timestamps: true });

// Ensure a user can only like a poem once
likeSchema.index({ userId: 1, poetryId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
