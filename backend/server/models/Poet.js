const mongoose = require('mongoose');

const poetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nameRoman: { type: String, required: true },
    nameUrdu: { type: String },
    takhallus: { type: String },
    slug: { type: String, unique: true },
    bio: { type: String },
    imageUrl: { type: String },
    city: { type: String },
    country: { type: String },
    dateOfBirth: { type: Date },
    isPublished: { type: Boolean, default: false },
    // Stats
    followersCount: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug from nameRoman before saving
poetSchema.pre('save', function (next) {
    if (this.isModified('nameRoman') && !this.slug) {
        this.slug = this.nameRoman
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Poet', poetSchema);
