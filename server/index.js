const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const xss = require('xss');
require('dotenv').config();

// IMPORT: Destructure the functions from the middleware file
const { protect, adminOnly } = require('./middleware/authMiddleware');
const Ticket = require('./models/Ticket');
const authRoutes = require('./routes/auth');

const app = express();

// MIDDLEWARE
app.use(cors({
    origin: 'https://student-help-desk-nine.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));
app.use(express.json());

// ROUTES
app.use('/auth', authRoutes);

// Create Ticket Route
// Note: We use 'protect' as middleware, and (req, res) for the controller
app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;

        // 1. Validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "User context lost. Please log in again." });
        }

        if (!studentName || !issue) {
            return res.status(400).json({ msg: "Both name and issue are required." });
        }

        // 2. Database Operation
        const newTicket = await Ticket.create({
            studentName: xss(studentName),
            issue: xss(issue),
            user: req.user.id 
        });

        return res.status(201).json(newTicket);

    } catch (err) {
        // This block will now capture the real error instead of the 'next' crash
        console.error("Ticket Creation Error:", err.message);
        return res.status(500).json({ error: "Failed to save ticket to database." });
    }
});

// Get Tickets
app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DATABASE & EXPORT
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

module.exports = app;