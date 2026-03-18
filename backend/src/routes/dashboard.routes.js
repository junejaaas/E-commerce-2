const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// Only admins can access dashboard endpoints
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
