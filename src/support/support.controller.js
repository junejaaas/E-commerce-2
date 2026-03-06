const catchAsync = require('../utils/catchAsync');
const supportService = require('./support.service');

const createTicket = catchAsync(async (req, res) => {
    const ticket = await supportService.createTicket(req.user.id, req.body);
    res.status(201).json({
        status: 'success',
        data: { ticket }
    });
});

const getUserTickets = catchAsync(async (req, res) => {
    const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10
    };
    const result = await supportService.getUserTickets(req.user.id, options);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getTicketDetails = catchAsync(async (req, res) => {
    const ticket = await supportService.getTicketDetails(req.params.ticketId, req.user.id, req.user.role);
    res.status(200).json({
        status: 'success',
        data: { ticket }
    });
});

const sendMessage = catchAsync(async (req, res) => {
    const message = await supportService.addMessage(
        req.params.ticketId,
        req.user.id,
        req.user.role === 'user' ? 'user' : 'support',
        req.body
    );
    res.status(201).json({
        status: 'success',
        data: { message }
    });
});

const getAllTickets = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10
    };

    const result = await supportService.getAllTickets(filter, options);
    res.status(200).json({
        status: 'success',
        ...result
    });
});

const updateTicketStatus = catchAsync(async (req, res) => {
    const ticket = await supportService.updateTicketStatus(req.params.ticketId, req.body.status);
    res.status(200).json({
        status: 'success',
        data: { ticket }
    });
});

module.exports = {
    createTicket,
    getUserTickets,
    getTicketDetails,
    sendMessage,
    getAllTickets,
    updateTicketStatus
};
