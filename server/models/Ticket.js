const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // This makes sure no "orphaned" tickets are created
    },
    studentName: String,
    issue: { type: String, required: true },
    status: { type: String, default: 'Open' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);