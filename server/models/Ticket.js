const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    studentName: { type: String, required: true },
    issue: { type: String, required: true },
    status: { 
        type: String, 
        default: 'Open', 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'] 
    },
    adminRemark: { type: String, default: "" }
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

module.exports = mongoose.model('Ticket', TicketSchema);