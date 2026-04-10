const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
require('dotenv').config();

const authRoutes = require('./routes/auth'); 
const Ticket = require('./models/Ticket'); 
const { protect, adminOnly } = require('./middleware/authMiddleware');

const app = express();

// 1. CORS - Updated to allow your specific Vercel frontend
app.use(cors({
    origin: 'https://student-help-desk-nine.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

app.use(express.json());

// 2. DATABASE
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 3. ROUTES
app.use('/auth', authRoutes);

// Get Tickets (Filtered by user role)
app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Updated Create Ticket Route
app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;

        // 1. Safety Check: If middleware failed to attach user, stop here
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "User identification failed. Please re-login." });
        }

        // 2. Data Validation
        if (!studentName || !issue) {
            return res.status(400).json({ msg: "Please provide both name and issue details." });
        }

        // 3. Create using the .create() method (more stable than 'new Ticket')
        const newTicket = await Ticket.create({
            studentName: xss(studentName),
            issue: xss(issue),
            user: req.user.id 
        });

        res.status(201).json(newTicket);
    } catch (err) {
        console.error("Critical Backend Error:", err.message);
        res.status(500).json({ error: "Server error during ticket creation." });
    }
});
// Resolve Ticket (Admin Only)
app.put('/tickets/:id/resolve', protect, adminOnly, async (req, res) => {
    try {
        const { remark } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: 'Resolved', adminRemark: xss(remark || "Resolved by Admin") },
            { new: true }
        );
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Ticket
app.delete('/tickets/:id', protect, async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ msg: "Ticket deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;