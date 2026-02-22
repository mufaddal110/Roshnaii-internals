const express = require('express');
const Poetry = require('../models/Poetry');
const Poet = require('../models/Poet');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin auth
router.use(adminAuth);

// GET /api/admin/poetry
router.get('/poetry', async (req, res) => {
    try {
        const poetry = await Poetry.find()
            .populate('poetId', 'nameRoman nameUrdu')
            .populate('genreId', 'name slug')
            .sort({ isPublished: 1, createdAt: -1 });

        const result = poetry.map(p => ({
            id: p._id,
            title_urdu: p.titleUrdu,
            title_roman: p.titleRoman,
            content_urdu: p.contentUrdu,
            audio_url: p.audioUrl,
            is_published: p.isPublished,
            created_at: p.createdAt,
            poet: p.poetId ? { name_roman: p.poetId.nameRoman, name_urdu: p.poetId.nameUrdu } : null,
            sinf: p.genreId ? { name: p.genreId.name } : null,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/admin/poets
router.get('/poets', async (req, res) => {
    try {
        const poets = await Poet.find()
            .sort({ isPublished: 1, nameRoman: 1 });

        const result = poets.map(p => ({
            id: p._id,
            name_roman: p.nameRoman,
            name_urdu: p.nameUrdu,
            takhallus: p.takhallus,
            image_url: p.imageUrl,
            is_published: p.isPublished,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// PATCH /api/admin/:table/:id/publish — toggle publish
router.patch('/:table/:id/publish', async (req, res) => {
    try {
        const { table, id } = req.params;
        const Model = table === 'poetry' ? Poetry : Poet;

        const item = await Model.findById(id);
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        item.isPublished = !item.isPublished;
        await item.save();

        res.json({ is_published: item.isPublished });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/admin/:table/:id
router.delete('/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        const Model = table === 'poetry' ? Poetry : Poet;

        await Model.findByIdAndDelete(id);
        res.json({ message: 'Deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
