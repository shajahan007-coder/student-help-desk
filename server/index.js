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

// --- CONFIGURATION ---
const FRONTEND_URL = 'https://student-help-desk-nine.vercel.app'; 

// --- MIDDLEWARE ---
app.use(express.json());

// 1. EXTRA CORS SAFETY: Handing the Preflight OPTIONS request manually
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // If it's a preflight request, respond immediately with 204
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// 2. Standard CORS Middleware
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

// --- SECURITY: Rate Limiting ---
const apiLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { msg: "Too many requests, please try again later." }
});
app.use('/auth/', apiLimiter);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

app.get('/', (req, res) => {
    res.json({ 
        message: "Student Help Desk API Operational",
        status: "Active",
        timestamp: new Date()
    });
});

app.use('/auth', authRoutes);

// --- TICKET ROUTES (SECURED) ---

app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
        res.status(500).json({ error: err.message });
    }
});

app.delete('/tickets/:id', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Forbidden' });
        }

        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/tickets/:id/resolve', protect, adminOnly, async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Resolved',
                adminRemark: xss(req.body.remark) || "Issue has been addressed.",
                updatedAt: Date.now()
            },
            { new: true }
        );
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}.`));
}

module.exports = app;