const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// Tracking endpoint (publicly accessible)
router.post('/track', dashboardController.trackVisit);

// Only admins can access dashboard statistics
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
