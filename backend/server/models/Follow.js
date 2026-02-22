const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poet', required: true },
}, { timestamps: true });

// Ensure a user can only follow a poet once
followSchema.index({ userId: 1, poetId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
