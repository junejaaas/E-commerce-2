const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const adminReviewController = require('../controllers/adminReview.controller');

const router = express.Router();

// All admin review routes are admin-only
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));

router.get('/', adminReviewController.getAllReviews);
router.patch('/:id/approve', adminReviewController.approveReview);
router.patch('/:id/reject', adminReviewController.rejectReview);
router.delete('/:id', adminReviewController.deleteReview);
router.patch('/:id/highlight', adminReviewController.highlightReview);

module.exports = router;
