const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const reviewValidation = require('../validations/review.validation');
const reviewController = require('../controllers/review.controller');

// Enable mergeParams to access productId from parent router
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewController.getReviews)
    .post(
        authMiddleware.protect,
        validate(reviewValidation.createReview),
        reviewController.createReview
    );

router
    .route('/:id')
    .delete(
        authMiddleware.protect,
        validate(reviewValidation.deleteReview),
        reviewController.deleteReview
    );

module.exports = router;
