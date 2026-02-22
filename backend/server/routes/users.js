const express = require('express');
const User = require('../models/User');
const Poet = require('../models/Poet');
const LoginHistory = require('../models/LoginHistory');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(adminAuth);

// GET /api/users - Get all users with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = 'all' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        if (role === 'admin') {
            query.isAdmin = true;
        } else if (role === 'poet') {
            const poetUserIds = await Poet.distinct('userId');
            query._id = { $in: poetUserIds };
        } else if (role === 'user') {
            const poetUserIds = await Poet.distinct('userId');
            query._id = { $nin: poetUserIds };
            query.isAdmin = false;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        // Get poet info for users who are poets
        const userIds = users.map(u => u._id);
        const poets = await Poet.find({ userId: { $in: userIds } });
        const poetMap = {};
        poets.forEach(p => {
            poetMap[p.userId.toString()] = p;
        });

        // Get last login
        const lastLogins = await LoginHistory.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $sort: { loginTime: -1 } },
            { $group: { _id: '$userId', lastLogin: { $first: '$loginTime' } } }
        ]);
        const loginMap = {};
        lastLogins.forEach(l => {
            loginMap[l._id.toString()] = l.lastLogin;
        });

        const result = users.map(u => ({
            id: u._id,
            email: u.email,
            fullName: u.fullName,
            username: u.username,
            isAdmin: u.isAdmin,
            isVerified: u.isVerified,
            isBlocked: u.isBlocked || false,
            createdAt: u.createdAt,
            lastLogin: loginMap[u._id.toString()] || null,
            poet: poetMap[u._id.toString()] ? {
                id: poetMap[u._id.toString()]._id,
                nameRoman: poetMap[u._id.toString()].nameRoman,
                isPublished: poetMap[u._id.toString()].isPublished
            } : null
        }));

        res.json({
            users: result,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/:id - Get single user details
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const poet = await Poet.findOne({ userId: user._id });
        const loginHistory = await LoginHistory.find({ userId: user._id })
            .sort({ loginTime: -1 })
            .limit(10);

        res.json({
            ...user.toObject(),
            poet,
            loginHistory
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/users/:id/block - Block/Unblock user
router.patch('/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ 
            message: user.isBlocked ? 'User blocked' : 'User unblocked',
            isBlocked: user.isBlocked 
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.isAdmin) {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        // Delete associated poet profile if exists
        await Poet.deleteOne({ userId: user._id });
        
        // Delete login history
        await LoginHistory.deleteMany({ userId: user._id });

        await user.deleteOne();

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
