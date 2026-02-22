const express = require('express');
const Rating = require('../models/Rating');
const Poetry = require('../models/Poetry');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/ratings — get user's ratings
router.get('/', async (req, res) => {
    try {
        const ratings = await Rating.find({ userId: req.user.id })
            .populate({
                path: 'poetryId',
                populate: [
                    { path: 'poetId', select: 'nameRoman nameUrdu imageUrl slug' },
                    { path: 'genreId', select: 'name slug' }
                ]
            });
        res.json(ratings.map(r => ({
            id: r._id,
            poetryId: r.poetryId._id,
            rating: r.rating,
            poetry: r.poetryId
        })));
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/ratings — rate a poem (or update existing rating)
router.post('/', async (req, res) => {
    try {
        const { poetryId, rating } = req.body;
        
        if (!poetryId || !rating) {
            return res.status(400).json({ error: 'Poetry ID and rating are required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        // Check if poetry exists
        const poetry = await Poetry.findById(poetryId);
        if (!poetry) return res.status(404).json({ error: 'Poetry not found.' });

        // Check if user already rated
        const existingRating = await Rating.findOne({ userId: req.user.id, poetryId });

        if (existingRating) {
            // Update existing rating
            const oldRating = existingRating.rating;
            existingRating.rating = rating;
            await existingRating.save();

            // Recalculate average
            await updatePoetryRating(poetryId);

            return res.json({ message: 'Rating updated successfully.' });
        } else {
            // Create new rating
            await Rating.create({ userId: req.user.id, poetryId, rating });

            // Update poetry stats
            await Poetry.findByIdAndUpdate(poetryId, { $inc: { ratingsCount: 1 } });
            await updatePoetryRating(poetryId);

            return res.status(201).json({ message: 'Rated successfully.' });
        }
    } catch (err) {
        console.error('Rating error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/ratings/:poetryId — remove rating
router.delete('/:poetryId', async (req, res) => {
    try {
        const result = await Rating.deleteOne({
            userId: req.user.id,
            poetryId: req.params.poetryId,
        });

        if (result.deletedCount > 0) {
            // Update poetry stats
            await Poetry.findByIdAndUpdate(req.params.poetryId, { $inc: { ratingsCount: -1 } });
            await updatePoetryRating(req.params.poetryId);
        }

        res.json({ message: 'Rating removed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/ratings/check/:poetryId — get user's rating for a poem
router.get('/check/:poetryId', async (req, res) => {
    try {
        const rating = await Rating.findOne({
            userId: req.user.id,
            poetryId: req.params.poetryId,
        });
        res.json({ rating: rating ? rating.rating : null });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Helper function to update poetry average rating
async function updatePoetryRating(poetryId) {
    const ratings = await Rating.find({ poetryId });
    if (ratings.length === 0) {
        await Poetry.findByIdAndUpdate(poetryId, { averageRating: 0 });
    } else {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / ratings.length;
        await Poetry.findByIdAndUpdate(poetryId, { averageRating: average });
    }
}

module.exports = router;
