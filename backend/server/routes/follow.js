const express = require('express');
const Follow = require('../models/Follow');
const Poet = require('../models/Poet');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/follow — get user's followed poets
router.get('/', async (req, res) => {
    try {
        const follows = await Follow.find({ userId: req.user.id })
            .populate('poetId', 'nameRoman nameUrdu imageUrl slug');
        res.json(follows.map(f => ({
            id: f._id,
            poetId: f.poetId._id,
            poet: f.poetId
        })));
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/follow — follow a poet
router.post('/', async (req, res) => {
    try {
        const { poetId } = req.body;
        if (!poetId) return res.status(400).json({ error: 'Poet ID required.' });

        // Check if poet exists
        const poet = await Poet.findById(poetId);
        if (!poet) return res.status(404).json({ error: 'Poet not found.' });

        // Create follow
        await Follow.create({ userId: req.user.id, poetId });

        // Increment follower count
        await Poet.findByIdAndUpdate(poetId, { $inc: { followersCount: 1 } });

        res.status(201).json({ message: 'Followed successfully.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ message: 'Already following.' });
        }
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/follow/:poetId — unfollow a poet
router.delete('/:poetId', async (req, res) => {
    try {
        const result = await Follow.deleteOne({
            userId: req.user.id,
            poetId: req.params.poetId,
        });

        if (result.deletedCount > 0) {
            // Decrement follower count
            await Poet.findByIdAndUpdate(req.params.poetId, { $inc: { followersCount: -1 } });
        }

        res.json({ message: 'Unfollowed successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/follow/check/:poetId — check if user follows a poet
router.get('/check/:poetId', async (req, res) => {
    try {
        const follow = await Follow.findOne({
            userId: req.user.id,
            poetId: req.params.poetId,
        });
        res.json({ isFollowing: !!follow });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
