const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/feedback - Submit feedback (authenticated users)
router.post('/', auth, async (req, res) => {
    try {
        const { rating, message } = req.body;

        if (!rating || !message) {
            return res.status(400).json({ error: 'Rating and message are required' });
        }

        const feedback = await Feedback.create({
            userId: req.user.id,
            rating,
            message
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/feedback - Get all feedback (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, rating, resolved } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (rating) query.rating = parseInt(rating);
        if (resolved !== undefined) query.isResolved = resolved === 'true';

        const [feedbacks, total] = await Promise.all([
            Feedback.find(query)
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Feedback.countDocuments(query)
        ]);

        res.json({
            feedbacks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/feedback/:id/reply - Reply to feedback (admin only)
router.patch('/:id/reply', adminAuth, async (req, res) => {
    try {
        const { reply } = req.body;
        
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { reply, isResolved: true },
            { new: true }
        );

        if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

        res.json({ message: 'Reply sent successfully', feedback });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/feedback/:id/resolve - Mark as resolved (admin only)
router.patch('/:id/resolve', adminAuth, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { isResolved: true },
            { new: true }
        );

        if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

        res.json({ message: 'Feedback marked as resolved', feedback });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
