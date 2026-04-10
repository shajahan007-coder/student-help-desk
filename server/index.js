const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const xss = require('xss');
require('dotenv').config();

// 1. IMPORT ROUTES AND MIDDLEWARE
const authRoutes = require('./routes/auth'); 
const Ticket = require('./models/Ticket'); 
const { protect, adminOnly } = require('./middleware/authMiddleware');

const app = express();

// 2. MIDDLEWARE CONFIGURATION
app.use(cors({
    origin: 'https://student-help-desk-nine.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));
app.use(express.json());

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// 4. ROUTES
app.use('/auth', authRoutes);

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

// Create Ticket
app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Authentication data missing. Log in again." });
        }

        if (!studentName || !issue) {
            return res.status(400).json({ msg: "Name and issue are required." });
        }

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

// Resolve Ticket
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

// 5. EXPORT FOR VERCEL
module.exports = app;

// 6. LOCAL PORT (Only runs if file is executed directly)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
}