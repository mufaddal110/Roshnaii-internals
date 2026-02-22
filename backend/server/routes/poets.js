const express = require('express');
const Poet = require('../models/Poet');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/poets — list published poets
router.get('/', async (req, res) => {
    try {
        const { limit = 50, sort = 'recent' } = req.query;
        
        // Determine sort order
        let sortOption = { createdAt: -1 }; // default: recent
        if (sort === 'popular') sortOption = { followersCount: -1, createdAt: -1 };
        
        const poets = await Poet.find({ isPublished: true })
            .sort(sortOption)
            .limit(parseInt(limit));
        res.json(poets);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/poets/:slug — single poet by slug or id
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        let poet;

        // Try by slug first, then by _id
        poet = await Poet.findOne({ slug });
        if (!poet && slug.match(/^[0-9a-fA-F]{24}$/)) {
            poet = await Poet.findById(slug);
        }

        if (!poet) return res.status(404).json({ error: 'Poet not found.' });
        res.json(poet);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/poets — create poet profile (requires auth)
router.post('/', auth, async (req, res) => {
    try {
        const existing = await Poet.findOne({ userId: req.user.id });
        if (existing) {
            return res.status(400).json({ error: 'You already have a poet profile.' });
        }

        const {
            nameRoman, nameUrdu, takhallus, bio,
            imageUrl, city, country, dateOfBirth
        } = req.body;

        if (!nameRoman) {
            return res.status(400).json({ error: 'Name (Roman) is required.' });
        }

        const poet = await Poet.create({
            userId: req.user.id,
            nameRoman,
            nameUrdu,
            takhallus,
            bio,
            imageUrl,
            city,
            country,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        });

        res.status(201).json(poet);
    } catch (err) {
        console.error('Create poet error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
