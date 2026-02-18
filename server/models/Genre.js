const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String },
}, { timestamps: true });

genreSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Genre', genreSchema);
