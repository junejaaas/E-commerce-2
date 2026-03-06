const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportTicket',
        required: [true, 'Message must belong to a ticket'],
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a sender'],
    },
    senderRole: {
        type: String,
        enum: ["user", "support"],
        required: true
    },
    message: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true
    },
    attachments: [String]
}, {
    timestamps: true
});

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);

module.exports = SupportMessage;
