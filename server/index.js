const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const xss = require('xss');
require('dotenv').config();

const { protect } = require('./middleware/authMiddleware');
const Ticket = require('./models/Ticket');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
    origin: 'https://student-help-desk-nine.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

app.use(express.json());

app.use('/auth', authRoutes);

app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;
        if (!studentName || !issue) return res.status(400).json({ msg: "Missing fields" });

        const newTicket = await Ticket.create({
            studentName: xss(studentName),
            issue: xss(issue),
            user: req.user.id 
        });
        res.status(201).json(newTicket);
    } catch (err) {
        res.status(500).json({ error: "Server Error: Could not create ticket" });
    }
});

app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

module.exports = app;