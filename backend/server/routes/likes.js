const express = require('express');
const Like = require('../models/Like');
const Poetry = require('../models/Poetry');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/likes — get user's liked poetry
router.get('/', async (req, res) => {
    try {
        const likes = await Like.find({ userId: req.user.id })
            .populate({
                path: 'poetryId',
                populate: [
                    { path: 'poetId', select: 'nameRoman nameUrdu imageUrl slug' },
                    { path: 'genreId', select: 'name slug' }
                ]
            });
        res.json(likes.map(l => ({
            id: l._id,
            poetryId: l.poetryId._id,
            poetry: l.poetryId
        })));
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/likes — like a poem
router.post('/', async (req, res) => {
    try {
        const { poetryId } = req.body;
        if (!poetryId) return res.status(400).json({ error: 'Poetry ID required.' });

        // Check if poetry exists
        const poetry = await Poetry.findById(poetryId);
        if (!poetry) return res.status(404).json({ error: 'Poetry not found.' });

        // Create like
        await Like.create({ userId: req.user.id, poetryId });

        // Increment like count
        await Poetry.findByIdAndUpdate(poetryId, { $inc: { likesCount: 1 } });

        res.status(201).json({ message: 'Liked successfully.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ message: 'Already liked.' });
        }
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/likes/:poetryId — unlike a poem
router.delete('/:poetryId', async (req, res) => {
    try {
        const result = await Like.deleteOne({
            userId: req.user.id,
            poetryId: req.params.poetryId,
        });

        if (result.deletedCount > 0) {
            // Decrement like count
            await Poetry.findByIdAndUpdate(req.params.poetryId, { $inc: { likesCount: -1 } });
        }

        res.json({ message: 'Unliked successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/likes/check/:poetryId — check if user liked a poem
router.get('/check/:poetryId', async (req, res) => {
    try {
        const like = await Like.findOne({
            userId: req.user.id,
            poetryId: req.params.poetryId,
        });
        res.json({ isLiked: !!like });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
