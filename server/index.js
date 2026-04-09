const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss'); // ADDED: Protection against malicious scripts
require('dotenv').config();

const authRoutes = require('./routes/auth'); 
const Ticket = require('./models/Ticket'); 
const { protect, adminOnly } = require('./middleware/authMiddleware');

const app = express();

// --- SECURITY: Rate Limiting ---
const apiLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { msg: "Too many requests, please try again later." }
});
app.use('/auth/', apiLimiter);

// --- CONFIGURATION ---
const FRONTEND_URL = 'https://student-help-desk-nine.vercel.app'; 

// --- MIDDLEWARE ---
app.use(express.json());

const corsOptions = {
    origin: FRONTEND_URL, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

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

// 1. GET Tickets (Filtered by Role)
app.get('/tickets', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };
        const tickets = await Ticket.find(query).sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST new ticket (UPGRADED WITH XSS PROTECTION)
app.post('/createTicket', protect, async (req, res) => {
    try {
        const { studentName, issue } = req.body;
        
        if (!studentName || !issue) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        // XSS Cleaning: Prevents hackers from injecting <script> tags
        const cleanName = xss(studentName);
        const cleanIssue = xss(issue);

        const newTicket = await Ticket.create({
            studentName: cleanName,
            issue: cleanIssue,
            user: req.user.id 
        });
        
        res.status(201).json(newTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. DELETE a ticket (Ownership Check)
app.delete('/tickets/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid ID format' });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Forbidden: You do not own this ticket' });
        }

        await Ticket.findByIdAndDelete(id);
        res.json({ msg: 'Ticket deleted successfully', id });
    } catch (err) {
        res.status(500).json({ error: 'Server error during deletion' });
    }
});

// 4. PUT resolve ticket (Admin Only with Remarks)
app.put('/tickets/:id/resolve', protect, adminOnly, async (req, res) => {
    try {
        const { remark } = req.body; 
        
        // Also clean the admin's remark for safety
        const cleanRemark = xss(remark);

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Resolved',
                adminRemark: cleanRemark || "Issue has been addressed by the technical team.",
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Server error while resolving ticket' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}.`));
}

module.exports = app;