const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Ticket must belong to a user'],
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject for the ticket'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: {
            values: ["order", "payment", "delivery", "account", "refund", "other"],
            message: 'Category is either: order, payment, delivery, account, refund or other'
        }
    },
    status: {
        type: String,
        enum: {
            values: ["open", "pending", "resolved", "closed"],
            message: 'Status is either: open, pending, resolved or closed'
        },
        default: "open"
    },
    priority: {
        type: String,
        enum: {
            values: ["low", "medium", "high"],
            message: 'Priority is either: low, medium or high'
        },
        default: "medium"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for messages
supportTicketSchema.virtual('messages', {
    ref: 'SupportMessage',
    foreignField: 'ticketId',
    localField: '_id'
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
