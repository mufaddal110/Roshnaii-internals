const mongoose = require('mongoose');

const poetrySchema = new mongoose.Schema({
    poetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poet', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    genreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true },
    titleUrdu: { type: String },
    titleRoman: { type: String },
    contentUrdu: { type: String },
    contentRoman: { type: String },
    audioUrl: { type: String },
    isPublished: { type: Boolean, default: false },
    // Stats (will be calculated from Like and Rating models)
    likesCount: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Poetry', poetrySchema);
