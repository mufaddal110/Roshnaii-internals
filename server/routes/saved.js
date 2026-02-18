const express = require('express');
const SavedPoetry = require('../models/SavedPoetry');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/saved — get user's saved poetry
router.get('/', async (req, res) => {
    try {
        const saved = await SavedPoetry.find({ userId: req.user.id });
        res.json(saved.map(s => ({ id: s._id, poetry_id: s.poetryId })));
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/saved — save a poem
router.post('/', async (req, res) => {
    try {
        const { poetryId } = req.body;
        if (!poetryId) return res.status(400).json({ error: 'Poetry ID required.' });

        await SavedPoetry.create({ userId: req.user.id, poetryId });
        res.status(201).json({ message: 'Saved.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ message: 'Already saved.' });
        }
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/saved/:poetryId — unsave a poem
router.delete('/:poetryId', async (req, res) => {
    try {
        await SavedPoetry.deleteOne({
            userId: req.user.id,
            poetryId: req.params.poetryId,
        });
        res.json({ message: 'Removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
