const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    // Link the ticket to a specific User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    studentName: { 
        type: String, 
        required: true 
    },
    issue: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'Open', 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'] 
    },
    // UPGRADE: Admin communication field
    adminRemark: { 
        type: String, 
        default: "" 
    },
    // UPGRADE: Auto-tracking dates
    date: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware to automatically update the 'updatedAt' field on every save
TicketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Ticket', TicketSchema);