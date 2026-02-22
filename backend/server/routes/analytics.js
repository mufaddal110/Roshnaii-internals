const express = require('express');
const User = require('../models/User');
const Poet = require('../models/Poet');
const Poetry = require('../models/Poetry');
const LoginHistory = require('../models/LoginHistory');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(adminAuth);

// GET /api/analytics/dashboard - Main dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalPoets,
            totalPublishedPoems,
            totalPendingPoems,
            loggedInUsersToday,
            loggedInPoetsToday,
            mostLovedPoem,
            mostFavoritedPoem
        ] = await Promise.all([
            User.countDocuments(),
            Poet.countDocuments({ isPublished: true }),
            Poetry.countDocuments({ isPublished: true }),
            Poetry.countDocuments({ isPublished: false }),
            LoginHistory.distinct('userId', { loginTime: { $gte: today } }).then(ids => ids.length),
            LoginHistory.aggregate([
                { $match: { loginTime: { $gte: today } } },
                { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                { $unwind: '$user' },
                { $lookup: { from: 'poets', localField: 'user._id', foreignField: 'userId', as: 'poet' } },
                { $match: { 'poet.0': { $exists: true } } },
                { $group: { _id: '$userId' } },
                { $count: 'count' }
            ]).then(result => result[0]?.count || 0),
            Poetry.findOne({ isPublished: true }).sort({ likesCount: -1 }).populate('poetId', 'nameRoman nameUrdu'),
            Poetry.aggregate([
                { $match: { isPublished: true } },
                { $lookup: { from: 'savedpoetries', localField: '_id', foreignField: 'poetryId', as: 'saves' } },
                { $addFields: { savesCount: { $size: '$saves' } } },
                { $sort: { savesCount: -1 } },
                { $limit: 1 },
                { $lookup: { from: 'poets', localField: 'poetId', foreignField: '_id', as: 'poet' } },
                { $unwind: { path: '$poet', preserveNullAndEmptyArrays: true } }
            ]).then(result => result[0])
        ]);

        res.json({
            totalUsers,
            totalPoets,
            totalPublishedPoems,
            totalPendingPoems,
            loggedInUsersToday,
            loggedInPoetsToday,
            mostLovedPoem: mostLovedPoem ? {
                id: mostLovedPoem._id,
                title: mostLovedPoem.titleUrdu || mostLovedPoem.titleRoman,
                poet: mostLovedPoem.poetId?.nameRoman,
                likes: mostLovedPoem.likesCount
            } : null,
            mostFavoritedPoem: mostFavoritedPoem ? {
                id: mostFavoritedPoem._id,
                title: mostFavoritedPoem.titleUrdu || mostFavoritedPoem.titleRoman,
                poet: mostFavoritedPoem.poet?.nameRoman,
                favorites: mostFavoritedPoem.savesCount
            } : null
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/analytics/user-growth - User growth over time
router.get('/user-growth', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(userGrowth.map(item => ({ date: item._id, users: item.count })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/analytics/poems-published - Poems published per day
router.get('/poems-published', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const poemsPublished = await Poetry.aggregate([
            { $match: { createdAt: { $gte: startDate }, isPublished: true } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(poemsPublished.map(item => ({ date: item._id, poems: item.count })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/analytics/user-poet-ratio
router.get('/user-poet-ratio', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPoets = await Poet.countDocuments();
        const regularUsers = totalUsers - totalPoets;

        res.json([
            { name: 'Regular Users', value: regularUsers },
            { name: 'Poets', value: totalPoets }
        ]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/analytics/recent-activity
router.get('/recent-activity', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const recentPoetry = await Poetry.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) / 2)
            .populate('poetId', 'nameRoman')
            .populate('userId', 'fullName');

        const recentLogins = await LoginHistory.find()
            .sort({ loginTime: -1 })
            .limit(parseInt(limit) / 2)
            .populate('userId', 'fullName email');

        const activities = [
            ...recentPoetry.map(p => ({
                type: 'poetry',
                action: p.isPublished ? 'published' : 'submitted',
                user: p.userId?.fullName || 'Unknown',
                poet: p.poetId?.nameRoman,
                title: p.titleUrdu || p.titleRoman,
                timestamp: p.createdAt
            })),
            ...recentLogins.map(l => ({
                type: 'login',
                action: 'logged in',
                user: l.userId?.fullName || 'Unknown',
                email: l.userId?.email,
                timestamp: l.loginTime
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, parseInt(limit));

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/analytics/top-poems
router.get('/top-poems', async (req, res) => {
    try {
        const { type = 'loved', limit = 10 } = req.query;

        if (type === 'loved') {
            const topPoems = await Poetry.find({ isPublished: true })
                .sort({ likesCount: -1 })
                .limit(parseInt(limit))
                .populate('poetId', 'nameRoman nameUrdu imageUrl');

            res.json(topPoems.map(p => ({
                id: p._id,
                title: p.titleUrdu || p.titleRoman,
                poet: p.poetId?.nameRoman,
                likes: p.likesCount,
                ratings: p.ratingsCount,
                avgRating: p.averageRating
            })));
        } else if (type === 'favorited') {
            const topPoems = await Poetry.aggregate([
                { $match: { isPublished: true } },
                { $lookup: { from: 'savedpoetries', localField: '_id', foreignField: 'poetryId', as: 'saves' } },
                { $addFields: { savesCount: { $size: '$saves' } } },
                { $sort: { savesCount: -1 } },
                { $limit: parseInt(limit) },
                { $lookup: { from: 'poets', localField: 'poetId', foreignField: '_id', as: 'poet' } },
                { $unwind: { path: '$poet', preserveNullAndEmptyArrays: true } }
            ]);

            res.json(topPoems.map(p => ({
                id: p._id,
                title: p.titleUrdu || p.titleRoman,
                poet: p.poet?.nameRoman,
                favorites: p.savesCount,
                likes: p.likesCount
            })));
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
