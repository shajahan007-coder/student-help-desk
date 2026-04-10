// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const xss = require('xss');
require('dotenv').config();

const { protect, adminOnly } = require('./middleware/authMiddleware');
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

// 1. Create Ticket (Student)
app.post('/createTicket', protect, async (req, res) => {
    try {
        // Add 'priority' to the destructuring list below:
        const { studentName, issue, priority } = req.body; 

        const newTicket = await Ticket.create({
            studentName: xss(studentName),
            issue: xss(issue),
            priority: priority, // Pass the priority received from frontend
            user: req.user.id 
        });
        
        res.status(201).json(newTicket);
    } catch (err) {
        console.error("Creation Error:", err.message);
        res.status(500).json({ error: "Ticket creation failed" });
    }
});

// 2. Get Tickets (Admin sees all, Student sees own)
app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Resolve Ticket (Admin Only) - This fixes the "extra action" issue
app.put('/tickets/:id/resolve', protect, adminOnly, async (req, res) => {
    try {
        const { remark } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Resolved', 
                adminRemark: xss(remark || "Resolved by Admin") 
            },
            { new: true } // returns the updated document
        );
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: "Resolve failed" });
    }
});

// 4. Delete Ticket (Student/Admin)
app.delete('/tickets/:id', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

        // Ensure user owns ticket OR is admin
        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: "User not authorized" });
        }

        await ticket.deleteOne();
        res.json({ msg: "Ticket deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Server & DB Ready'))
    .catch(err => console.error(err));

module.exports = app;

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const xss = require('xss');
// require('dotenv').config();

// // Critical: Destructure functions from exports
// const { protect, adminOnly } = require('./middleware/authMiddleware');
// const Ticket = require('./models/Ticket');
// const authRoutes = require('./routes/auth');

// const app = express();

// app.use(cors({
//     origin: 'https://student-help-desk-nine.vercel.app',
//     credentials: true
// }));
// app.use(express.json());

// app.use('/auth', authRoutes);

// // CREATE TICKET
// app.post('/createTicket', protect, async (req, res) => {
//     try {
//         const { studentName, issue } = req.body;
//         if (!studentName || !issue) return res.status(400).json({ msg: "Missing fields" });

//         // req.user.id is populated by protect middleware
//         const newTicket = await Ticket.create({
//             studentName: xss(studentName),
//             issue: xss(issue),
//             user: req.user.id 
//         });
//         res.status(201).json(newTicket);
//     } catch (err) {
//         console.error("Ticket Create Error:", err.message);
//         res.status(500).json({ error: "Could not create ticket" });
//     }
// });

// // GET TICKETS
// app.get('/tickets', protect, async (req, res) => {
//     try {
//         const query = req.user.role === 'admin' ? {} : { user: req.user.id };
//         const tickets = await Ticket.find(query).sort({ createdAt: -1 });
//         res.json(tickets);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB Error:', err));

// module.exports = app;