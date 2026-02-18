const express = require('express');
const Genre = require('../models/Genre');

const router = express.Router();

// GET /api/genres
router.get('/', async (req, res) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        // Transform to match frontend (id, name, slug)
        const result = genres.map(g => ({
            id: g._id,
            name: g.name,
            slug: g.slug,
            description: g.description,
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/genres/:slug
router.get('/:slug', async (req, res) => {
    try {
        const genre = await Genre.findOne({ slug: req.params.slug });
        if (!genre) return res.status(404).json({ error: 'Genre not found.' });
        res.json({
            id: genre._id,
            name: genre.name,
            slug: genre.slug,
            description: genre.description,
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
