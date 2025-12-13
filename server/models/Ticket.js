const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    studentName: String,
    issue: String,
    status: { type: String, default: 'Open' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);