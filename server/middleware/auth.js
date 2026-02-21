const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Check both cookie and Authorization header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, isAdmin }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Optional auth — attaches user if token exists, but doesn't block
const optionalAuth = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (token) {
        try {
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
