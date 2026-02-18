const mongoose = require('mongoose');

const savedPoetrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poetryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poetry', required: true },
}, { timestamps: true });

savedPoetrySchema.index({ userId: 1, poetryId: 1 }, { unique: true });

module.exports = mongoose.model('SavedPoetry', savedPoetrySchema);
