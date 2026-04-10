const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Payload structure must match auth.js: { user: { id: ... } }
        req.user = decoded.user; 
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        res.status(401).json({ msg: 'Invalid token' });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};