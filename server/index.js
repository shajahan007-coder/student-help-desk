// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); 
const Ticket = require('./models/Ticket'); 
const { protect, adminOnly } = require('./middleware/authMiddleware');

const app = express();

// --- CONFIGURATION ---
const FRONTEND_URL = 'https://student-help-desk-nine.vercel.app'; 

// --- MIDDLEWARE ---
app.use(express.json());

const corsOptions = {
    origin: FRONTEND_URL, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.json({ message: "Student Help Desk API Operational" });
});

app.use('/auth', authRoutes);

// --- TICKET ROUTES (SECURED) ---

// 1. GET Tickets 
// Logic: Admins see ALL, Students see only THEIR OWN
app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... (Keep your imports and database connection as they are)

// --- TICKET ROUTES (SECURED) ---

// 2. POST new ticket - FIXED LOGIC
// server/index.js

app.post('/createTicket', protect, async (req, res) => {
    try {
        console.log("User from middleware:", req.user); // DEBUG: Check your console!

        const newTicket = await Ticket.create({
            studentName: req.body.studentName,
            issue: req.body.issue,
            // Use req.user.id because your middleware sets req.user = decoded.user
            user: req.user.id 
        });
        
        res.json(newTicket);
    } catch (err) {
        console.error("Final Submit Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ... (Keep the rest of your routes)

// 3. DELETE a ticket (Ownership Loophole Fixed)
app.delete('/tickets/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid ID format' });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

        // --- OWNERSHIP CHECK ---
        // If the user is NOT an admin AND the ticket doesn't belong to them, block it.
        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Action forbidden: You can only delete your own tickets.' });
        }

        await Ticket.findByIdAndDelete(id);
        res.json({ msg: 'Ticket deleted successfully', id });
    } catch (err) {
        res.status(500).json({ error: 'Server error during deletion' });
    }
});

// 4. PUT resolve ticket (Admin Only)
app.put('/tickets/:id/resolve', protect, adminOnly, async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: 'Resolved' },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// --- VERCEL EXPORT ---
if (require.main === module) {
    const PORT = 5000;
    app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}.`));
}

module.exports = app;