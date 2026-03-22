const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const customerController = require('../controllers/customer.controller');

const router = express.Router();

// All customer management routes are admin-only
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id/status', customerController.toggleBlockStatus);
router.patch('/:id/reset-password', customerController.adminResetPassword);

module.exports = router;
