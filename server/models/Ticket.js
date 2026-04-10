// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    issue: { type: String, required: true },
    status: { 
        type: String, 
        default: 'Open', 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'] 
    },
    priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium'},
    adminRemark: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
}, { 
    timestamps: true // This adds 'createdAt' and 'updatedAt' automatically
});

module.exports = mongoose.model('Ticket', TicketSchema);

// // models/Ticket.js
// const mongoose = require('mongoose');

// const TicketSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     studentName: { type: String, required: true },
//     issue: { type: String, required: true },
//     status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] },
//     adminRemark: { type: String, default: "" }
// }, { timestamps: true });

// module.exports = mongoose.model('Ticket', TicketSchema);