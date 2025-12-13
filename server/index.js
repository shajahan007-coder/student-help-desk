const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors(
    {
        origin: ["https://your-frontend-domain.vercel.app"], // You will update this later after deploying frontend
        methods: ["POST", "GET"],
        credentials: true
    }
));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Schema
const TicketSchema = new mongoose.Schema({
    studentName: String,
    issue: String,
    status: { type: String, default: 'Open' },
    date: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// Routes
app.get('/', (req, res) => {
    res.json("Hello");
})

app.get('/tickets', async (req, res) => {
    const tickets = await Ticket.find();
    res.json(tickets);
});

app.post('/createTicket', async (req, res) => {
    const ticket = await Ticket.create(req.body);
    res.json(ticket);
});

// Vercel Requirement: Export the app for serverless use
// We do NOT use app.listen() here for production, only for local dev
if (require.main === module) {
    app.listen(3001, () => console.log("Server ready on port 3001."));
}

module.exports = app;