const SupportTicket = require('./support.model');
const SupportMessage = require('./supportMessage.model');
const AppError = require('../utils/AppError');

/**
 * Create a new support ticket
 */
const createTicket = async (userId, ticketData) => {
    const ticket = await SupportTicket.create({
        userId,
        ...ticketData
    });
    return ticket;
};

/**
 * Get all tickets for a specific user with pagination
 */
const getUserTickets = async (userId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await SupportTicket.countDocuments({ userId });

    return {
        tickets,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get ticket details with messages
 */
const getTicketDetails = async (ticketId, userId, role) => {
    const ticket = await SupportTicket.findById(ticketId).populate('messages');

    if (!ticket) {
        throw new AppError('Ticket not found', 404);
    }

    // Only allow owner or support/admin to view
    if (role === 'user' && ticket.userId.toString() !== userId.toString()) {
        throw new AppError('You do not have permission to view this ticket', 403);
    }

    return ticket;
};

/**
 * Add a message to a ticket
 */
const addMessage = async (ticketId, senderId, senderRole, messageData) => {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
        throw new AppError('Ticket not found', 404);
    }

    if (ticket.status === 'closed') {
        throw new AppError('Cannot add messages to a closed ticket', 400);
    }

    // If user is sending message, verify ownership
    if (senderRole === 'user' && ticket.userId.toString() !== senderId.toString()) {
        throw new AppError('You do not have permission to message in this ticket', 403);
    }

    const message = await SupportMessage.create({
        ticketId,
        senderId,
        senderRole,
        ...messageData
    });

    // Update ticket updatedAt timestamp
    ticket.updatedAt = Date.now();
    await ticket.save();

    return message;
};

/**
 * Get all tickets (Admin/Support)
 */
const getAllTickets = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(filter)
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await SupportTicket.countDocuments(filter);

    return {
        tickets,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (ticketId, status) => {
    const ticket = await SupportTicket.findByIdAndUpdate(
        ticketId,
        { status },
        { new: true, runValidators: true }
    );

    if (!ticket) {
        throw new AppError('Ticket not found', 404);
    }

    return ticket;
};

module.exports = {
    createTicket,
    getUserTickets,
    getTicketDetails,
    addMessage,
    getAllTickets,
    updateTicketStatus
};
