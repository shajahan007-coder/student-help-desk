const jwt = require('jsonwebtoken');

// Export explicitly as a function
exports.protect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // This must match your signing payload in auth.js
        req.user = decoded.user; 

        // CRITICAL: Check if next is a function before calling it
        if (typeof next === 'function') {
            next();
        } else {
            console.error("Middleware signature error: 'next' is not a function.");
            return res.status(500).json({ msg: "Internal Middleware Error" });
        }
    } catch (err) {
        console.error("JWT Verify Error:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        if (typeof next === 'function') next();
    } else {
        res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};