const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- SECRET VALIDATION ---
// This ensures the server doesn't crash if the .env variable is missing
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}

// --- /auth/register ---
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword, role: role || 'student' });
        await user.save();

        const payload = { 
            user: { 
                id: user._id, 
                role: user.role 
            } 
        };

        // Safety check before signing
        if (!JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error: Missing Secret" });
        }

        jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { id: user._id, email: user.email, role: user.role } 
            });
        });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- /auth/login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 3. Create Token
        const payload = { 
            user: { 
                id: user._id, 
                role: user.role 
            } 
        };

        if (!JWT_SECRET) {
            console.error("Login failed: JWT_SECRET missing");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { id: user._id, email: user.email, role: user.role } 
            });
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Database or Server Error" });
    }
});

module.exports = router;