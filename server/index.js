const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- 1. NEW IMPORTS ---
const authRoutes = require('./routes/auth'); // Import the Authentication routes
const Ticket = require('./models/Ticket'); // Use a dedicated Model file (See Step 4 below)

const app = express();

// Middleware
app.use(cors(
    {
        // IMPORTANT: Update this to your deployed FRONTEND URL (e.g., https://student-help-desk-client-xxxx.vercel.app)
        // Note: I removed the trailing space after .vercel.app
        origin: ["https://student-help-desk-api.vercel.app/"], 
        methods: ["POST", "GET", "PUT", "DELETE"], // Added methods for full CRUD support
        credentials: true
    }
));

// server/index.js (Check this part)

// ...
app.use(express.json());

// Enable CORS for all origins, which is standard for MERN during development
const corsOptions = {
    origin: '*', // Allows all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
// ...

// app.use(express.json());

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log(err));

// --- 2. INTEGRATE AUTH ROUTES ---
// All authentication (register/login) will be accessed via the /auth endpoint
// app.use('/auth', authRoutes);


// --- 3. TICKET ROUTES (Now requiring the imported model) ---

// Root check (useful for Vercel health check)
app.get('/', (req, res) => {
    res.json({ message: "Student Help Desk API Operational" });
});

// GET all tickets (Will later be protected for Admin)
app.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ date: -1 }); // Sort by newest first
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new ticket (Student functionality)
app.post('/createTicket', async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NOTE: You will add more routes here like /tickets/:id/resolve (Admin)


// Vercel Requirement: Export the app for serverless use
if (require.main === module) {
    app.listen(3001, () => console.log("Server ready on port 3001."));
}

module.exports = app;

// server/index.js

// ... (existing routes)

// PUT /tickets/:id/resolve (Admin functionality)
app.put('/tickets/:id/resolve', async (req, res) => {
    try {
        const ticketId = req.params.id;
        
        // Find the ticket and update its status
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status: 'Resolved' },
            { new: true } // Return the updated document
        );

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        
        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// ... (Vercel export)