const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const supportController = require('./support.controller');
const supportValidation = require('./support.validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// USER ROUTES
router.post(
    '/tickets',
    validate(supportValidation.createTicket),
    supportController.createTicket
);

router.get('/tickets', supportController.getUserTickets);

router.get('/tickets/:ticketId', supportController.getTicketDetails);

router.post(
    '/tickets/:ticketId/messages',
    validate(supportValidation.sendMessage),
    supportController.sendMessage
);

// SUPPORT / ADMIN ROUTES
// Note: These will be mounted under /admin/support in app.js or handled here with role check
// For simplicity and following the prompt, we'll keep them here but they will be accessed via different paths in app.js if needed, 
// or we can just apply authorize middleware.

router.get(
    '/admin/tickets',
    authorize('admin', 'support'),
    supportController.getAllTickets
);

router.post(
    '/admin/tickets/:ticketId/messages',
    authorize('admin', 'support'),
    validate(supportValidation.sendMessage),
    supportController.sendMessage
);

router.patch(
    '/admin/tickets/:ticketId',
    authorize('admin', 'support'),
    validate(supportValidation.updateStatus),
    supportController.updateTicketStatus
);

module.exports = router;
