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

// 1. MANUAL CORS HANDLER (Ensures Vercel always sends correct headers)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Respond immediately to Browser Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).send(); 
    }
    next();
});

// 2. Standard CORS Middleware for Axios compatibility
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
}));

// --- SECURITY: Rate Limiting ---
const apiLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { msg: "Too many requests, please try again later." }
});
app.use('/auth/', apiLimiter);

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- ROUTES ---
app.get('/', (req, res) => {
    res.json({ message: "API Operational", status: "Active" });
});

app.use('/auth', authRoutes);

// --- TICKET LOGIC ---
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

// Vercel requires exporting the app
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
}