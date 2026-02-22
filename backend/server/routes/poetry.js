const express = require('express');
const Poetry = require('../models/Poetry');
const Poet = require('../models/Poet');
const Genre = require('../models/Genre');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/poetry — list published poetry
router.get('/', async (req, res) => {
    try {
        const { limit = 20, poetId, genreId, sinf, sort = 'recent' } = req.query;

        const filter = { isPublished: true };
        if (poetId) filter.poetId = poetId;
        if (genreId) filter.genreId = genreId;

        // If sinf slug is passed, resolve to genreId
        if (sinf) {
            const genre = await Genre.findOne({ slug: sinf });
            if (genre) filter.genreId = genre._id;
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // default: recent
        if (sort === 'popular') sortOption = { likesCount: -1, createdAt: -1 };
        if (sort === 'rated') sortOption = { averageRating: -1, ratingsCount: -1, createdAt: -1 };

        const poetry = await Poetry.find(filter)
            .populate('poetId', 'nameRoman nameUrdu imageUrl slug')
            .populate('genreId', 'name slug')
            .sort(sortOption)
            .limit(parseInt(limit));

        // Transform to match frontend expectations
        const result = poetry.map(p => ({
            id: p._id,
            title_urdu: p.titleUrdu,
            title_roman: p.titleRoman,
            content_urdu: p.contentUrdu,
            content_roman: p.contentRoman,
            audio_url: p.audioUrl,
            is_published: p.isPublished,
            created_at: p.createdAt,
            poet_id: p.poetId?._id,
            genre_id: p.genreId?._id,
            likes_count: p.likesCount,
            ratings_count: p.ratingsCount,
            average_rating: p.averageRating,
            poets: p.poetId ? {
                name_roman: p.poetId.nameRoman,
                name_urdu: p.poetId.nameUrdu,
                image_url: p.poetId.imageUrl,
                slug: p.poetId.slug,
            } : null,
            poet: p.poetId ? {
                name_roman: p.poetId.nameRoman,
                name_urdu: p.poetId.nameUrdu,
                image_url: p.poetId.imageUrl,
                slug: p.poetId.slug,
                id: p.poetId._id,
            } : null,
            sinf: p.genreId ? {
                name: p.genreId.name,
                slug: p.genreId.slug,
                id: p.genreId._id,
            } : null,
        }));

        res.json(result);
    } catch (err) {
        console.error('Fetch poetry error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/poetry/:id — single poem
router.get('/:id', async (req, res) => {
    try {
        const poem = await Poetry.findById(req.params.id)
            .populate('poetId')
            .populate('genreId');

        if (!poem) return res.status(404).json({ error: 'Poetry not found.' });

        res.json({
            id: poem._id,
            title_urdu: poem.titleUrdu,
            title_roman: poem.titleRoman,
            content_urdu: poem.contentUrdu,
            content_roman: poem.contentRoman,
            audio_url: poem.audioUrl,
            is_published: poem.isPublished,
            created_at: poem.createdAt,
            poet_id: poem.poetId?._id,
            genre_id: poem.genreId?._id,
            likes_count: poem.likesCount,
            ratings_count: poem.ratingsCount,
            average_rating: poem.averageRating,
            poet: poem.poetId ? {
                id: poem.poetId._id,
                name_roman: poem.poetId.nameRoman,
                name_urdu: poem.poetId.nameUrdu,
                image_url: poem.poetId.imageUrl,
                slug: poem.poetId.slug,
                takhallus: poem.poetId.takhallus,
            } : null,
            sinf: poem.genreId ? {
                id: poem.genreId._id,
                name: poem.genreId.name,
                slug: poem.genreId.slug,
            } : null,
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/poetry — submit new poetry (requires auth)
router.post('/', auth, async (req, res) => {
    try {
        const {
            poetId, genreId, titleUrdu, titleRoman,
            contentUrdu, contentRoman, audioUrl
        } = req.body;

        if (!poetId || !genreId) {
            return res.status(400).json({ error: 'Poet ID and genre are required.' });
        }

        const poetry = await Poetry.create({
            poetId,
            userId: req.user.id,
            genreId,
            titleUrdu: titleUrdu || '',
            titleRoman: titleRoman || '',
            contentUrdu: contentUrdu || '',
            contentRoman: contentRoman || '',
            audioUrl: audioUrl || null,
            isPublished: false,
        });

        res.status(201).json({ id: poetry._id, message: 'Poetry submitted for review.' });
    } catch (err) {
        console.error('Submit poetry error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
