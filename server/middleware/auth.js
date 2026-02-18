const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, isAdmin }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Optional auth — attaches user if token exists, but doesn't block
const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        try {
            const token = header.split(' ')[1];
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // Token invalid, continue without user
        }
    }
    next();
};

const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
};

module.exports = { auth, optionalAuth, adminAuth };
