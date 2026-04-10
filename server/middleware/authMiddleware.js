const express = require('express');
const xss = require('xss');
const Ticket = require('./models/Ticket');
// IMPORT MUST LOOK LIKE THIS:
const { protect, adminOnly } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

// ... (CORS and other setup)

// THE POST ROUTE
app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;

        // 1. Check if middleware successfully attached user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Authentication failed. No user ID." });
        }

        // 2. Create the ticket
        const newTicket = await Ticket.create({
            studentName: xss(studentName),
            issue: xss(issue),
            user: req.user.id // This ID comes from the JWT payload
        });

        res.status(201).json(newTicket);
    } catch (err) {
        console.error("Backend Create Error:", err.message);
        res.status(500).json({ error: "Failed to create ticket" });
    }
});

module.exports = app;